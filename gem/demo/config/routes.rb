Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # ActionCable channel for live Turbo Stream broadcasts.
  mount ActionCable.server => "/cable"

  # The gem's mutation endpoints: /grids/athletes/:id/cells/:column etc.
  mount StimulusGridRails::Engine => "/grids", as: :stimulus_grid_rails

  resources :athletes, only: %i[index]

  root "athletes#index"
end
