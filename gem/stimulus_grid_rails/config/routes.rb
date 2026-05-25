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

  # Attachments — upload + remove on an :attachments column. The cells
  # endpoint handles scalar values; multipart file uploads and per-blob
  # detachments live here so the wire shape stays clean.
  post   "/:resource/:row_id/attachments/:column",
         to: "attachments#create",
         as: :attachments,
         constraints: { row_id: /[^\/]+/, column: /[^\/]+/ }
  delete "/:resource/:row_id/attachments/:column/:attachment_id",
         to: "attachments#destroy",
         as: :attachment,
         constraints: { row_id: /[^\/]+/, column: /[^\/]+/, attachment_id: /[^\/]+/ }
end
