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
        Rails.logger.info "[Api::AnalyzeController] Raw response (first 300): #{raw_text.first(300)}"

        # Strip markdown code fences if Claude wrapped the JSON (common for non-English responses)
        cleaned = raw_text.gsub(/\A\s*```(?:json)?\s*\n?/, "").gsub(/\n?\s*```\s*\z/, "").strip

        json_match = cleaned.match(/\{[\s\S]*\}/)
        unless json_match
          Rails.logger.error "[Api::AnalyzeController] No JSON found. Raw: #{raw_text.first(400)}"
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
        You are a helpful medicine information assistant for common people in India.
        Look at this medicine image carefully — it could be a tablet, syrup, capsule, cream, injection, or drops.

        Your job:
        1. Read all visible text on the label or packaging.
        2. Identify the medicine from its label, colour, shape, and packaging.
        3. Use your knowledge to fill in anything not visible on the label.

        VERY IMPORTANT — Language and style rules:
        - Respond ENTIRELY in #{language}. Every single field must be in #{language} only.
        - Use SIMPLE, EVERYDAY words that an ordinary person with no medical background can understand.
        - NO medical jargon or complicated terms. If a technical word is needed, explain it in brackets.
        - Write short, clear sentences. Like you are explaining to a family member.
        - For English: use plain Indian English — simple words, friendly tone, easy to read.

        Return ONLY a valid JSON object with exactly these keys. No text outside the JSON:
        {
          "name": "Medicine brand name and its common/generic name",
          "type": "What form it is — tablet / syrup / capsule / cream / drops / injection / etc.",
          "use": "What this medicine is for — explain simply what problem it helps with",
          "ingredients": "Main ingredient(s) and how much is in each tablet/dose if shown",
          "dosage": "How much to take, how many times a day, and for how long — in simple words",
          "sideEffects": "Common things that may happen after taking this — explain simply, do not scare",
          "warnings": "Who should be careful or avoid this medicine, and important things to watch out for",
          "storage": "Where and how to keep this medicine safe at home"
        }

        If you cannot identify the medicine, return the JSON with "name" set to a phrase in #{language}
        meaning "Medicine not clear — please scan again in good light" and leave other fields empty.
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
