Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # ActionCable channel for live Turbo Stream broadcasts.
  mount ActionCable.server => "/cable"

  # The gem's endpoints, mounted at the configured path (see
  # config/initializers/stimulus_grid_rails.rb — this demo namespaces them under
  # /admin/grids to show the mount path is configurable).
  mount StimulusGridRails::Engine => StimulusGridRails.mount_path, as: :stimulus_grid_rails

  resources :athletes, only: %i[index] do
    get :grouping, on: :collection
  end
  resources :big_rows, only: %i[index]
  resources :file_records, only: %i[index]

  root "athletes#index"
end
