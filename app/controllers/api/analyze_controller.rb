module Api
  class AnalyzeController < ApplicationController
    # The SPA sends JSON; skip the default Rails CSRF check for this API endpoint
    skip_before_action :verify_authenticity_token

    # POST /api/analyze
    # Body: { imageBase64: <data-url>, language: <string> }
    def create
      image_base64 = params[:imageBase64]
      language     = params[:language].presence || "English"

      unless image_base64.present?
        return render json: { success: false, error: "imageBase64 is required" }, status: :bad_request
      end

      unless ENV["ANTHROPIC_API_KEY"].present?
        return render json: {
          success: false,
          error: "ANTHROPIC_API_KEY is not configured on the server. Add it to your .env file."
        }, status: :internal_server_error
      end

      # Strip the data-URI prefix and detect MIME type
      media_type = image_base64.start_with?("data:image/png") ? "image/png" : "image/jpeg"
      base64_data = image_base64.sub(/\Adata:image\/\w+;base64,/, "")

      prompt = build_prompt(language)

      begin
        client  = Anthropic::Client.new(api_key: ENV["ANTHROPIC_API_KEY"])
        message = client.messages.create(
          model:      "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [
            {
              role:    "user",
              content: [
                {
                  type:   "image",
                  source: {
                    type:       "base64",
                    media_type: media_type,
                    data:       base64_data
                  }
                },
                { type: "text", text: prompt }
              ]
            }
          ]
        )

        raw_text = message.content.first.text.strip

        # Extract JSON from the response (Claude may wrap it in markdown fences)
        json_match = raw_text.match(/\{[\s\S]*\}/)
        unless json_match
          return render json: { success: false, error: "Could not parse medicine information from AI response." }
        end

        medicine_data = JSON.parse(json_match[0])

        # Optional: enrich with OpenFDA data (best-effort, English names)
        enrich_with_fda!(medicine_data)

        render json: { success: true, data: medicine_data }

      rescue Anthropic::Error => e
        Rails.logger.error "[Api::AnalyzeController] Anthropic error: #{e.message}"
        render json: { success: false, error: e.message }, status: :internal_server_error
      rescue JSON::ParserError => e
        Rails.logger.error "[Api::AnalyzeController] JSON parse error: #{e.message}"
        render json: { success: false, error: "Failed to parse AI response." }, status: :internal_server_error
      end
    end

    # GET /api/health
    def health
      render json: { status: "ok", timestamp: Time.now.utc.iso8601 }
    end

    private

    def build_prompt(language)
      <<~PROMPT
        You are a medical information assistant. Carefully examine this image of a medicine
        (tablet, syrup, capsule, cream, injection, drops, or other pharmaceutical product).

        Your job:
        1. Read all visible text on the label/packaging (brand name, generic name, composition, instructions, warnings, etc.).
        2. Identify the medicine from its appearance, colour, shape, and label.
        3. Use your medical knowledge to fill in any information not visible on the label.

        IMPORTANT: Respond ENTIRELY in #{language}. Every field must be written in #{language} —
        not in English (unless #{language} is English).

        Return ONLY a valid JSON object with exactly these keys. Do not include any text outside the JSON:
        {
          "name": "Brand name and generic/chemical name of the medicine",
          "type": "Form — tablet / syrup / capsule / injection / cream / drops / etc.",
          "use": "What this medicine is used to treat or its primary indication",
          "ingredients": "Active ingredient(s) with strength/amount if visible",
          "dosage": "Recommended dose, frequency, and duration (standard adult dose if not visible on label)",
          "sideEffects": "Common and notable side effects the patient should know about",
          "warnings": "Important warnings, contraindications, drug interactions, and special precautions",
          "storage": "How and where to store this medicine (temperature, light, moisture, etc.)"
        }

        If you cannot identify the medicine, still return the JSON but set "name" to a phrase
        in #{language} meaning "Medicine not identified — please scan again clearly" and leave
        other fields as empty strings.
      PROMPT
    end

    def enrich_with_fda!(medicine_data)
      return unless medicine_data["name"].present?

      first_word = URI.encode_www_form_component(medicine_data["name"].split.first.to_s)
      return if first_word.length <= 2

      uri      = URI("https://api.fda.gov/drug/label.json?search=openfda.brand_name:\"#{first_word}\"&limit=1")
      response = Net::HTTP.get_response(uri)

      if response.is_a?(Net::HTTPSuccess)
        fda_json = JSON.parse(response.body)
        if (result = fda_json.dig("results", 0))
          # Only attach if warnings field is empty — keep the translated data intact
          if medicine_data["warnings"].blank? && result["warnings"]&.first
            medicine_data["fdaNote"] = result["warnings"].first.to_s.truncate(500)
          end
        end
      end
    rescue StandardError => e
      # OpenFDA enrichment is optional — silently skip
      Rails.logger.warn "[Api::AnalyzeController] OpenFDA lookup failed: #{e.message}"
    end
  end
end
