class FileRecord < ApplicationRecord
  include StimulusGridRails::Broadcastable

  # Live-sync every CRUD into the FileRecordGrid stream — opening this
  # page in two tabs and uploading in one shows the attachment land in
  # both via Turbo Stream.
  broadcasts_grid FileRecordGrid

  # Airtable-style multi-attachment column. Any blob type works; the JS
  # `attachments` renderer reads content_type to pick image previews vs
  # tinted file icons.
  has_many_attached :attachments

  validates :name, presence: true
end
