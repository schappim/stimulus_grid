// Entry point for the demo app, managed by importmap.
import "@hotwired/turbo-rails"
import { Application } from "@hotwired/stimulus"
import StimulusGrid from "stimulus_grid"
import StimulusGridRails from "stimulus_grid_rails"

const application = Application.start()
application.debug = false
window.Stimulus = application

// Register the base grid controllers (grid, header-cell, pagination, …)
StimulusGrid.start(application)
// Register the Rails sync layer (grid-sync, cell-editor) + Turbo Stream actions.
StimulusGridRails.start(application)
