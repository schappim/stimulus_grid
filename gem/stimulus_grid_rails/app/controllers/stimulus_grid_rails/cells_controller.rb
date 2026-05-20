require_dependency "stimulus_grid_rails/turbo_streams_helper"

module StimulusGridRails
  # Single cell-mutation endpoint — RAILS.md §8.
  #
  # PATCH /grids/:resource/:row_id/cells/:column
  #   body:    { "value": <new value>, "optimistic_id": "...", "lock_version": N? }
  #
  # The save fires the model's after_update_commit, which AUTOMATICALLY
  # broadcasts the changed cell(s) (RAILS.md §1/§4) — this controller does not
  # broadcast. It only returns the optimistic reconcile (cell-confirm or
  # cell-revert) directly to the originator and records an undo audit.
  class CellsController < BaseController
    def update
      grid    = grid_for(params[:resource])
      column  = grid.class.resolve_column!(params[:column])
      row     = find_row!(grid, params[:row_id])

      head :forbidden and return unless column.editable_for?(row, current_grid_user)

      raw_value     = params[:value]
      optimistic_id = params[:optimistic_id] || request.headers["X-Optimistic-Id"]
      lock_version  = params[:lock_version]

      if stale_version?(column, row, lock_version)
        turbo_stream_render(TurboStreams.cell_conflict(
          grid: params[:resource], row_id: row.id, column: column.name,
          server_value: grid.cell_value(row, column), client_value: raw_value,
          optimistic_id: optimistic_id,
        ))
        return
      end

      value, coerce_err = column.coerce(raw_value)
      return render_revert(grid, row, column, [coerce_err], optimistic_id) if coerce_err

      prior = grid.cell_value(row, column)
      row._sgr_optimistic_id = optimistic_id   # carried into the auto-broadcast
      ok, errors, mutations = grid.apply_cell!(row, column, value)

      if ok
        record_audit(resource: params[:resource], row_id: row.id, column: column.name,
                     prior: prior, current: value)
        turbo_stream_render(build_response_stream(params[:resource], mutations, optimistic_id))
      else
        render_revert(grid, row, column, errors, optimistic_id)
      end
    end

    def bulk
      grid      = grid_for(params[:resource])
      mutations = []

      params.require(:mutations).each do |m|
        column = grid.class.resolve_column!(m[:column])
        row    = find_row!(grid, m[:row_id])
        next unless column.editable_for?(row, current_grid_user)

        value, err = column.coerce(m[:value])
        next if err

        prior = grid.cell_value(row, column)
        row._sgr_optimistic_id = params[:optimistic_id]
        ok, _errs, ms = grid.apply_cell!(row, column, value)
        if ok
          record_audit(resource: params[:resource], row_id: row.id, column: column.name,
                       prior: prior, current: value)
          mutations.concat(ms)
        end
      end

      streams = mutations.map do |row_id, col, val, _opts|
        TurboStreams.cell_confirm(grid: params[:resource], row_id: row_id, column: col,
                                  value: val, optimistic_id: params[:optimistic_id])
      end
      turbo_stream_render(TurboStreams.bulk(grid: params[:resource], streams: streams))
    end

    private

    def stale_version?(column, row, lock_version)
      column.concurrency == :version_checked &&
        lock_version.present? &&
        row.respond_to?(:lock_version) &&
        lock_version.to_i != row.lock_version
    end

    def render_revert(grid, row, column, errors, optimistic_id)
      turbo_stream_render(
        TurboStreams.cell_revert(
          grid: params[:resource], row_id: row.id, column: column.name,
          value: grid.cell_value(row, column), errors: errors, optimistic_id: optimistic_id,
        ),
        status: :unprocessable_entity,
      )
    end

    # Originator response: confirm the edited cell, push cascaded computed cells
    # as plain `cell` updates. (Other clients get all of these via broadcast.)
    def build_response_stream(resource, mutations, optimistic_id)
      streams = mutations.map.with_index do |(row_id, col, val, _opts), i|
        if i.zero?
          TurboStreams.cell_confirm(grid: resource, row_id: row_id, column: col,
                                    value: val, optimistic_id: optimistic_id)
        else
          TurboStreams.cell(grid: resource, row_id: row_id, column: col,
                            value: val, optimistic_id: optimistic_id)
        end
      end
      streams.length > 1 ? TurboStreams.bulk(grid: resource, streams: streams) : streams.first
    end
  end
end
