class AthleteGrid < StimulusGridRails::Grid
  resource :athletes
  model    Athlete

  # All connected users share one stream — every browser tab receives every
  # edit. Multi-tenant apps would scope by team / user / view.
  stream_name { |_user| "athletes" }

  column :athlete, type: :string,  editable: true, width: 220, pinned: :left
  column :country, type: :string,  editable: true, width: 160
  column :sport,   type: :enum,    editable: true, width: 160,
                   enum_values: ["Swimming", "Cycling", "Gymnastics", "Athletics",
                                 "Boxing", "Diving", "Fencing", "Rowing", "Wrestling"]
  column :age,     type: :integer, editable: true, width: 80,
                   concurrency: :version_checked,
                   validate: ->(v, _r) { "must be between 10 and 80" unless (10..80).cover?(v.to_i) }
  column :date,    type: :date,    editable: true, width: 130
  column :gold,    type: :integer, editable: true, width: 70
  column :silver,  type: :integer, editable: true, width: 70
  column :bronze,  type: :integer, editable: true, width: 70

  # Computed column — RAILS.md §12. Server determines the cascade; the client
  # never recomputes. On any edit to gold/silver/bronze the server replays
  # compute_total and broadcasts the updated cell as part of the same bulk
  # stream that confirms the original edit.
  column :total,   type: :integer, computed: true, depends_on: %i[gold silver bronze],
                   editable: false, width: 70, header: "Total"

  # Action column — a client-side renderer (template id "sgr-row-actions")
  # supplies a per-row delete button. Not a model attribute, so name starts
  # with "_" (skipped by row_to_h) and it's non-sortable / non-filterable.
  column :_actions, type: :string, editable: false, sortable: false,
                    filterable: false, width: 56, header: "", pinned: :right,
                    cell_renderer: "sgr-row-actions"

  def compute_total(row)
    row.gold.to_i + row.silver.to_i + row.bronze.to_i
  end

  # Defaults for a row created via the "+ Add athlete" button (RAILS.md §14).
  def new_row_defaults
    { athlete: "New athlete", country: "—", sport: "Swimming",
      age: 20, date: Date.current, gold: 0, silver: 0, bronze: 0 }
  end
end
