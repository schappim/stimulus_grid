StimulusGridRails::Engine.routes.draw do
  # Single cell mutation — RAILS.md §8.
  patch "/:resource/:row_id/cells/:column",
        to: "cells#update",
        as: :cell,
        constraints: { row_id: /[^\/]+/, column: /[^\/]+/ }

  # Bulk cell paste — RAILS.md §9 fill-down / bulk paste.
  post "/:resource/bulk", to: "cells#bulk", as: :bulk

  # Undo / redo — RAILS.md §16.
  post "/:resource/undo", to: "history#undo",        as: :undo
  post "/:resource/redo", to: "history#redo_change", as: :redo

  # Server-side search/filter — RAILS.md §21. Returns matching rows as JSON.
  get "/:resource/rows", to: "rows#index", as: :index_rows

  # Row create/destroy — RAILS.md §14/§15. `rows/bulk` must precede the
  # `:row_id` route so "bulk" isn't captured as an id.
  post   "/:resource/rows",         to: "rows#create",       as: :rows
  delete "/:resource/rows/bulk",    to: "rows#destroy_bulk",  as: :bulk_rows
  delete "/:resource/rows/:row_id", to: "rows#destroy",      as: :row,
         constraints: { row_id: /[^\/]+/ }
end
