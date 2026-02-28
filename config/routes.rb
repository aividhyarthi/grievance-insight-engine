Rails.application.routes.draw do
  # API endpoints for the Medicine Scanner SPA
  namespace :api do
    post "analyze", to: "analyze#create"
    get  "health",  to: "analyze#health"
  end

  # Rails health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Root — serves public/index.html (static SPA) via ActionDispatch::Static
  # No explicit root route needed; Rails falls through to public/index.html automatically.
end
