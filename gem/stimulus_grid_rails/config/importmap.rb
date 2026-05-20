# Importmap pins exposed to host apps. Loaded by the engine initializer.
#
# The host app's bin/importmap.rb pins are merged on top of these, so a host
# can override any pin by re-declaring it.
pin "stimulus_grid",       to: "stimulus_grid.js",       preload: true
pin "stimulus_grid_rails", to: "stimulus_grid_rails.js", preload: true
