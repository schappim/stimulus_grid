class FileRecordsController < ApplicationController
  def index
    @grid = FileRecordGrid.new(user: nil)
    @file_records = FileRecord.with_attached_attachments.order(:id)
  end
end
