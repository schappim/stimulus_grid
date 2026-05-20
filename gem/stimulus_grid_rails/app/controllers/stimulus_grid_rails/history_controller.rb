require_dependency "stimulus_grid_rails/turbo_streams_helper"

module StimulusGridRails
  # Undo / redo — RAILS.md §16.
  #
  #   POST /grids/:resource/undo   → revert the user's last mutation
  #   POST /grids/:resource/redo   → re-apply the last undone mutation
  #
  # Each replays the prior/new value through grid.apply_cell!, so it goes
  # through the same save → validation → cascade → auto-broadcast path as a
  # normal edit. Scoped per current_user + resource. Audits whose row has since
  # been deleted are skipped (and marked) rather than failing the request.
  class HistoryController < BaseController
    SCAN_LIMIT = 50

    def undo
      step(Audit.undoable(params[:resource], current_grid_user&.id),
           value: :prior_value, undone: true)
    end

    # `redo` is a Ruby keyword, so the action is named redo_change.
    def redo_change
      step(Audit.redoable(params[:resource], current_grid_user&.id),
           value: :new_value, undone: false)
    end

    private

    def step(audits, value:, undone:)
      return head(:not_implemented) unless Audit.available?
      audits.limit(SCAN_LIMIT).each do |audit|
        applied = apply(audit, audit.public_send(value))
        # Mark the audit's new state regardless: applied → flip undone flag;
        # skipped (row gone) → also flip so it doesn't block the next one.
        audit.update!(undone: undone, undone_at: undone ? Time.current : nil)
        return head(:ok) if applied
      end
      head :no_content
    end

    def apply(audit, raw_value)
      grid   = grid_for(audit.resource)
      column = grid.class.resolve_column!(audit.column)
      row    = find_row!(grid, audit.row_id)
      value, err = column.coerce(raw_value)
      return false if err
      ok, = grid.apply_cell!(row, column, value)   # saves → after_update_commit auto-broadcasts
      ok
    rescue ActiveRecord::RecordNotFound, ArgumentError
      false
    end
  end
end
