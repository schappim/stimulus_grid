# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true

# stimulus_grid and stimulus_grid_rails are pinned by the engine's
# config/importmap.rb (merged automatically), so no pins are needed here.
