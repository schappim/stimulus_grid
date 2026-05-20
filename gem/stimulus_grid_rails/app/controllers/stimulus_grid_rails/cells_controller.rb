require_dependency "stimulus_grid_rails/turbo_streams_helper"

module StimulusGridRails
  # Single cell-mutation endpoint — RAILS.md §8.
  #
  # PATCH /grids/:resource/:row_id/cells/:column
  #   body:    { "value": <new value>, "optimistic_id": "...", "lock_version": N? }
  #   headers: X-Optimistic-Id: <echoed back so client suppresses self-broadcast>
  #
  # Returns a turbo-stream response containing either cell-confirm or
  # cell-revert. Also broadcasts the same delta to other subscribers via
  # Turbo::StreamsChannel.
  #
  # Controller stays thin (~30 lines) — Grid subclasses do all the work.
  class CellsController < ::ActionController::Base
    protect_from_forgery with: :exception
    skip_before_action :verify_authenticity_token, if: -> { request.format.symbol == :json }

    def update
      grid_class = StimulusGridRails.lookup_grid(params[:resource])
      grid       = grid_class.new(user: current_grid_user)
      column     = grid_class.resolve_column!(params[:column])
      row        = grid_class.model_class.find(params[:row_id])

      unless column.editable_for?(row, current_grid_user)
        head :forbidden and return
      end

      raw_value          = params[:value]
      optimistic_id      = params[:optimistic_id] || request.headers["X-Optimistic-Id"]
      sent_lock_version  = params[:lock_version]

      # Concurrency check — RAILS.md §13 version-checked strategy.
      if column.concurrency == :version_checked &&
         sent_lock_version.present? &&
         row.respond_to?(:lock_version) &&
         sent_lock_version.to_i != row.lock_version
        render plain: TurboStreams.cell_conflict(
                 grid: params[:resource], row_id: row.id, column: column.name,
                 server_value: grid.cell_value(row, column),
                 client_value: raw_value,
                 optimistic_id: optimistic_id,
               ),
               content_type: "text/vnd.turbo-stream.html"
        return
      end

      value, coerce_err = column.coerce(raw_value)
      if coerce_err
        render_revert(grid, row, column, [coerce_err], optimistic_id)
        return
      end

      ok, errors, mutations = grid.apply_cell!(row, column, value)

      if ok
        # Broadcast the same cell + any cascaded computed cells to subscribers,
        # tagging with optimistic_id so the originating client suppresses its
        # own echo.
        broadcast_mutations(grid, params[:resource], mutations, optimistic_id)
        render plain: build_response_stream(params[:resource], mutations, optimistic_id),
               content_type: "text/vnd.turbo-stream.html"
      else
        render_revert(grid, row, column, errors, optimistic_id)
      end
    end

    def bulk
      grid_class = StimulusGridRails.lookup_grid(params[:resource])
      grid       = grid_class.new(user: current_grid_user)
      mutations  = []
      errors     = {}

      params.require(:mutations).each do |m|
        column = grid_class.resolve_column!(m[:column])
        row    = grid_class.model_class.find(m[:row_id])
        next errors[m[:row_id]] = ["forbidden"] unless column.editable_for?(row, current_grid_user)

        value, err = column.coerce(m[:value])
        if err
          errors[[m[:row_id], m[:column]]] = [err]
          next
        end

        ok, errs, ms = grid.apply_cell!(row, column, value)
        if ok
          mutations.concat(ms)
        else
          errors[[m[:row_id], m[:column]]] = errs
        end
      end

      streams = mutations.map do |row_id, col, val, _opts|
        TurboStreams.cell_confirm(
          grid: params[:resource], row_id: row_id, column: col,
          value: val, optimistic_id: params[:optimistic_id],
        )
      end
      bulk_stream = TurboStreams.bulk(grid: params[:resource], streams: streams)
      render plain: bulk_stream, content_type: "text/vnd.turbo-stream.html"
    end

    private

    def render_revert(grid, row, column, errors, optimistic_id)
      render plain: TurboStreams.cell_revert(
               grid: params[:resource], row_id: row.id, column: column.name,
               value: grid.cell_value(row, column),
               errors: errors,
               optimistic_id: optimistic_id,
             ),
             content_type: "text/vnd.turbo-stream.html",
             status: :unprocessable_entity
    end

    def build_response_stream(resource, mutations, optimistic_id)
      streams = mutations.map.with_index do |(row_id, col, val, _opts), i|
        # First mutation is the originating one — confirm it. Subsequent
        # mutations are cascade results — push as regular `cell` updates.
        if i.zero?
          TurboStreams.cell_confirm(
            grid: resource, row_id: row_id, column: col,
            value: val, optimistic_id: optimistic_id,
          )
        else
          TurboStreams.cell(
            grid: resource, row_id: row_id, column: col,
            value: val, optimistic_id: optimistic_id,
          )
        end
      end
      if streams.length > 1
        TurboStreams.bulk(grid: resource, streams: streams)
      else
        streams.first
      end
    end

    def broadcast_mutations(grid, resource, mutations, optimistic_id)
      # Each row's Active Record model is expected to have included
      # StimulusGridRails::Broadcastable, which exposes
      # `broadcast_cell_to(stream, ...)`. If not, no-op.
      stream = grid.stream_name_for(current_grid_user) || resource
      mutations.each do |row_id, col, val, _opts|
        message = TurboStreams.cell(
          grid: resource, row_id: row_id, column: col,
          value: val, optimistic_id: optimistic_id,
        )
        ::Turbo::StreamsChannel.broadcast_stream_to(stream, content: message)
      end
    end

    # Override in host app via prepend if you want non-`current_user` users.
    def current_grid_user
      return current_user if respond_to?(:current_user)
      nil
    end
  end
end
