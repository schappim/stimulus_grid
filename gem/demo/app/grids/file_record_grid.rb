# A grid showcasing the :attachments column type. Each row owns a
# `has_many_attached :attachments` association (Active Storage); the
# JS `attachments` renderer reads it as a JSON array and displays an
# Airtable-style strip of thumbs + file chips with lightbox + popover
# editor.
class FileRecordGrid < StimulusGridRails::Grid
  resource :file_records
  model    FileRecord

  column :name,        type: :string, editable: true, width: 240, pinned: :left
  column :owner,       type: :string, editable: true, width: 160
  column :status,      type: :enum,   editable: true, width: 130,
                       enum_values: %w[draft in_progress in_review done]
  column :attachments, type: :attachments, editable: true, width: 320,
                       cell_renderer: "attachments-editable",
                       header: "Files"
  column :notes,       type: :text,   editable: true, width: 320

  def new_row_defaults
    { name: "New record", owner: "", status: "draft", notes: "" }
  end
end
