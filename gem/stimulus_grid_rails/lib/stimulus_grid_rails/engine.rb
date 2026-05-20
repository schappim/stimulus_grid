require "rails/engine"
require "turbo-rails"
require "stimulus-rails"
require "importmap-rails"

module StimulusGridRails
  class Engine < ::Rails::Engine
    isolate_namespace StimulusGridRails

    # Precompile the gem-shipped JS so the asset pipeline finds it.
    initializer "stimulus_grid_rails.assets" do |app|
      if app.config.respond_to?(:assets)
        app.config.assets.precompile += %w[
          stimulus_grid.js
          stimulus_grid_rails.js
          stimulus_grid.css
          stimulus_grid_rails.css
        ]
      end
    end

    # Make the gem's importmap manifest available to host apps.
    # The host app's bin/importmap.rb is *augmented* with our pins below; users
    # don't need to add `pin "stimulus_grid", ...` themselves.
    initializer "stimulus_grid_rails.importmap", before: "importmap" do |app|
      if app.config.respond_to?(:importmap)
        app.config.importmap.paths << Engine.root.join("config/importmap.rb")
        app.config.importmap.cache_sweepers << Engine.root.join("app/assets/javascripts")
      end
    end

    # Make the gem's view partials resolvable from host apps.
    initializer "stimulus_grid_rails.view_paths" do |app|
      ActiveSupport.on_load(:action_controller) do
        append_view_path StimulusGridRails::Engine.root.join("app/views")
      end
    end
  end
end
