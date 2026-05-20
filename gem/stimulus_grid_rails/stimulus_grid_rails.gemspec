require_relative "lib/stimulus_grid_rails/version"

Gem::Specification.new do |spec|
  spec.name        = "stimulus_grid_rails"
  spec.version     = StimulusGridRails::VERSION
  spec.authors     = ["Marcus Schappi"]
  spec.email       = ["marcus@schappi.com"]
  spec.homepage    = "https://github.com/schappim/stimulus_grid"
  spec.summary     = "Rails + Hotwire bindings for stimulus_grid — server-side column registry, custom Turbo Stream actions, optimistic cell updates."
  spec.description = "Brings the stimulus_grid data-grid into Rails as a first-class engine. Provides ApplicationGrid for declaring columns server-side; cell-grained Turbo Stream actions (cell, cell-confirm, cell-revert, row-insert-sorted, row-remove, bulk); a single PATCH endpoint for cell mutations with optimistic-id reconciliation; and importmap-pinnable JS for both the grid and the live-sync layer."
  spec.license     = "MIT"

  spec.required_ruby_version = ">= 3.0.0"

  spec.metadata["homepage_uri"]    = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/schappim/stimulus_grid"
  spec.metadata["changelog_uri"]   = "https://github.com/schappim/stimulus_grid/blob/main/gem/stimulus_grid_rails/CHANGELOG.md"

  spec.files = Dir[
    "{app,config,db,lib}/**/*",
    "MIT-LICENSE",
    "Rakefile",
    "README.md",
    "CHANGELOG.md"
  ]

  spec.add_dependency "rails",         ">= 7.0"
  spec.add_dependency "turbo-rails",   ">= 1.5"
  spec.add_dependency "stimulus-rails", ">= 1.3"
  spec.add_dependency "importmap-rails", ">= 1.2"
end
