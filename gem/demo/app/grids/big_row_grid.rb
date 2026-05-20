# A server-side-row-model grid over a large table (seeded with 50k rows). Only
# one page is ever rendered/loaded client-side; the grid fetches windows from
# rows#index as you paginate / sort / search.
class BigRowGrid < StimulusGridRails::Grid
  resource :big_rows
  model    BigRow

  column :name,       type: :string,  editable: true, width: 220, pinned: :left
  column :category,   type: :string,  editable: true, width: 160
  column :status,     type: :enum,    editable: true, width: 140,
                      enum_values: %w[open pending closed archived]
  column :amount,     type: :integer, editable: true, width: 120
  column :created_on, type: :date,    editable: true, width: 140

  def new_row_defaults
    { name: "New row", category: "General", status: "open",
      amount: 0, created_on: Date.current }
  end
end
