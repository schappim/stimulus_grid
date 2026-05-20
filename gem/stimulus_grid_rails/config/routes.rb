StimulusGridRails::Engine.routes.draw do
  # Single cell mutation — RAILS.md §8.
  patch "/:resource/:row_id/cells/:column",
        to: "cells#update",
        as: :cell,
        constraints: { row_id: /[^\/]+/, column: /[^\/]+/ }

  # Bulk paste — RAILS.md §9 fill-down / bulk paste.
  post "/:resource/bulk", to: "cells#bulk", as: :bulk
end
