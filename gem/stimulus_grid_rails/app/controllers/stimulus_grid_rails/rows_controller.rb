require_dependency "stimulus_grid_rails/turbo_streams_helper"

module StimulusGridRails
  # Row create/destroy — RAILS.md §14 (create) and §15 (delete).
  #
  #   POST   /grids/:resource/rows              → create
  #   DELETE /grids/:resource/rows/bulk         → destroy_bulk (ids[])
  #   DELETE /grids/:resource/rows/:row_id      → destroy
  #
  # Create persists with the grid's `new_row_defaults` (merged with any client
  # `attributes`), then returns + broadcasts a `row-insert-sorted` carrying the
  # new row as JSON. Destroy relies on the model's after_destroy_commit
  # broadcast (Broadcastable) for other tabs, and returns a `row-remove` to the
  # originator for instant feedback.
  class RowsController < ::ActionController::Base
    protect_from_forgery with: :exception
    skip_before_action :verify_authenticity_token, if: -> { request.format.symbol == :json }

    # GET /grids/:resource/rows.json?q=<term>&filters=<json>
    # Server-side global search + per-column filtering (RAILS.md §21). Returns
    # the matching rows as the JSON shape the client grid consumes via setRowData.
    MAX_ROWS = 5_000

    def index
      grid_class = StimulusGridRails.lookup_grid(params[:resource])
      grid       = grid_class.new(user: current_grid_user)

      relation = grid.search_and_filter(
        grid.scope(current_grid_user),
        q: params[:q],
        filters: parse_filters,
      )
      total = relation.count
      rows  = relation.limit(MAX_ROWS).map { |r| grid.row_to_h(r) }

      render json: { rows: rows, total: total, limited: total > MAX_ROWS }
    end

    def create
      grid_class = StimulusGridRails.lookup_grid(params[:resource])
      grid       = grid_class.new(user: current_grid_user)
      row        = grid.build_new_row(create_attributes)

      if row.save
        payload = grid.row_to_json(row)
        stream  = TurboStreams.row_insert_sorted(
          grid: params[:resource], row_id: grid.row_id(row), payload: payload,
        )
        # Broadcast to other tabs. The originator gets the same stream as the
        # POST response and applies it; row-insert-sorted is idempotent by id,
        # so the broadcast echo is a no-op there.
        ::Turbo::StreamsChannel.broadcast_stream_to(
          grid.stream_name_for(current_grid_user), content: stream,
        )
        render plain: stream, content_type: "text/vnd.turbo-stream.html"
      else
        render json: { errors: row.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      grid_class = StimulusGridRails.lookup_grid(params[:resource])
      grid       = grid_class.new(user: current_grid_user)
      row        = grid_class.model_class.find(params[:row_id])
      row.destroy   # after_destroy_commit broadcasts row-remove to every subscriber

      render plain: TurboStreams.row_remove(grid: params[:resource], row_id: params[:row_id]),
             content_type: "text/vnd.turbo-stream.html"
    end

    def destroy_bulk
      grid_class = StimulusGridRails.lookup_grid(params[:resource])
      params.require(:ids)
      rows = grid_class.model_class.where(id: params[:ids])
      removed = rows.map(&:id)
      rows.each(&:destroy)   # each fires its own row-remove broadcast

      streams = removed.map { |id| TurboStreams.row_remove(grid: params[:resource], row_id: id) }
      render plain: TurboStreams.bulk(grid: params[:resource], streams: streams),
             content_type: "text/vnd.turbo-stream.html"
    end

    private

    def create_attributes
      raw = params[:attributes]
      return {} if raw.blank?
      raw.respond_to?(:to_unsafe_h) ? raw.to_unsafe_h : raw.to_h
    end

    # `filters` arrives as a JSON string (query param) or a nested hash.
    def parse_filters
      raw = params[:filters]
      return {} if raw.blank?
      if raw.is_a?(String)
        JSON.parse(raw)
      elsif raw.respond_to?(:to_unsafe_h)
        raw.to_unsafe_h
      else
        raw.to_h
      end
    rescue JSON::ParserError
      {}
    end

    def current_grid_user
      return current_user if respond_to?(:current_user)
      nil
    end
  end
end
