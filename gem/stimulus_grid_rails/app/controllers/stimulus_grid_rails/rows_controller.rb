require_dependency "stimulus_grid_rails/turbo_streams_helper"

module StimulusGridRails
  # Row search / create / destroy — RAILS.md §14/§15/§21.
  #
  #   GET    /grids/:resource/rows?q=&filters=   → index (server-side search/filter, JSON)
  #   POST   /grids/:resource/rows               → create
  #   DELETE /grids/:resource/rows/bulk          → destroy_bulk (ids[])
  #   DELETE /grids/:resource/rows/:row_id       → destroy
  #
  # Create/destroy broadcast AUTOMATICALLY via the model's commit callbacks
  # (Broadcastable) — these actions just persist and return an empty 200; the
  # originating tab applies the change when the broadcast lands.
  class RowsController < BaseController
    MAX_ROWS = 5_000

    def index
      grid     = grid_for(params[:resource])
      relation = grid.search_and_filter(grid.scope(current_grid_user),
                                        q: params[:q], filters: parse_filters)
      total = relation.count
      rows  = relation.limit(MAX_ROWS).map { |r| grid.row_to_h(r) }
      render json: { rows: rows, total: total, limited: total > MAX_ROWS }
    end

    def create
      grid = grid_for(params[:resource])
      row  = grid.build_new_row(create_attributes)
      # Stamp the tenant if the host uses ActsAsTenant and the model is scoped —
      # otherwise a created row could escape the tenant. ActsAsTenant normally
      # sets this automatically when current_tenant is present.
      if row.save
        head :ok   # after_create_commit broadcasts row-insert-sorted to everyone
      else
        render json: { errors: row.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      grid = grid_for(params[:resource])
      find_row!(grid, params[:row_id]).destroy   # after_destroy_commit broadcasts row-remove
      head :ok
    end

    def destroy_bulk
      grid = grid_for(params[:resource])
      params.require(:ids)
      # Scoped where (not find) so ids outside the user's scope are simply
      # ignored rather than raising — each destroy fires its own broadcast.
      grid.scope(current_grid_user).where(id: params[:ids]).find_each(&:destroy)
      head :ok
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
  end
end
