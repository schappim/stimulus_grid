require_dependency "stimulus_grid_rails/turbo_streams_helper"

module StimulusGridRails
  # Attachment upload + remove for an :attachments column. The cells endpoint
  # handles scalar PATCH /value updates; multipart file uploads and per-blob
  # detachments live here so the wire shape stays clean and Active Storage's
  # has_many_attached fits naturally.
  #
  #   POST   /grids/:resource/:row_id/attachments/:column
  #     body: multipart with `files[]` — one or more uploaded files.
  #     OR    `{ signed_ids: [...] }` — when the client uploaded directly via
  #           ActiveStorage::DirectUploadsController and just needs to attach.
  #     returns: { attachments: <new payload>, optimistic_id: <echo> }
  #
  #   DELETE /grids/:resource/:row_id/attachments/:column/:attachment_id
  #     returns: { attachments: <new payload> }
  #
  # After every successful mutation the controller broadcasts a `cell` turbo
  # stream so every connected tab reconciles the cell automatically — the
  # originating tab gets the JSON response back synchronously.
  class AttachmentsController < BaseController
    def create
      grid   = grid_for(params[:resource])
      column = grid.class.resolve_column!(params[:column])
      row    = find_row!(grid, params[:row_id])

      head :forbidden and return unless column.editable_for?(row, current_grid_user)
      head :unprocessable_entity and return unless column.type == :attachments

      signed_ids = collect_signed_ids(row, column)
      payload = grid.apply_attachments!(row, column, attach: signed_ids)
      broadcast_cell(grid, row, column, payload)
      render json: { attachments: payload, optimistic_id: params[:optimistic_id] }
    rescue ActiveStorage::IntegrityError => e
      render json: { error: "upload integrity check failed: #{e.message}" }, status: :unprocessable_entity
    end

    def destroy
      grid   = grid_for(params[:resource])
      column = grid.class.resolve_column!(params[:column])
      row    = find_row!(grid, params[:row_id])

      head :forbidden and return unless column.editable_for?(row, current_grid_user)
      head :unprocessable_entity and return unless column.type == :attachments

      payload = grid.apply_attachments!(row, column, detach: [params[:attachment_id]])
      broadcast_cell(grid, row, column, payload)
      render json: { attachments: payload }
    end

    private

    # Accept either uploaded files (multipart) or already-signed ids (when the
    # client used Rails' direct-upload flow). Either way we end up with a list
    # of Active Storage signed_ids that apply_attachments! consumes.
    def collect_signed_ids(_row, _column)
      ids = Array(params[:signed_ids]).reject(&:blank?)
      # Rails parses `files[]` as `params[:files] => [file]`; some clients
      # send `files[][]` which lands as `[[file]]`. Flatten one level to
      # handle both shapes without losing per-file uploads.
      raw = params[:files] || params["files[]"] || []
      Array(raw).flatten(1).each do |file|
        next if file.blank?
        blob = ActiveStorage::Blob.create_and_upload!(
          io: upload_io_for(file),
          filename: file.respond_to?(:original_filename) ? file.original_filename : file.to_s,
          content_type: file.respond_to?(:content_type) ? file.content_type : nil,
        )
        ids << blob.signed_id
      end
      ids
    end

    # Coerce assorted upload wrappers (ActionDispatch::Http::UploadedFile in
    # production, Rack::Test::UploadedFile in integration tests, a raw File
    # / StringIO in unit tests) into something ActiveStorage::Blob accepts
    # (anything that responds to :rewind + :read).
    def upload_io_for(file)
      if file.respond_to?(:tempfile)
        file.tempfile
      elsif defined?(Rack::Test::UploadedFile) && file.is_a?(Rack::Test::UploadedFile)
        file.send(:tempfile)        # method_missing doesn't surface in respond_to?
      elsif file.respond_to?(:read) && file.respond_to?(:rewind)
        file
      else
        StringIO.new(file.respond_to?(:read) ? file.read : file.to_s)
      end
    end

    # Push the new attachments payload to every tab subscribed to the grid's
    # stream. Mirrors the cell-update broadcast that scalar edits trigger.
    def broadcast_cell(_grid, row, column, payload)
      stream = TurboStreams.cell(
        grid: params[:resource], row_id: row.id, column: column.name,
        value: payload.to_json,
      )
      Turbo::StreamsChannel.broadcast_stream_to(
        *StimulusGridRails.streamables_for(params[:resource]),
        content: stream,
      )
    rescue NameError, NoMethodError
      # Action Cable / Turbo not wired in this app — skip the broadcast,
      # the originating tab's JSON response still drives the update.
    end
  end
end
