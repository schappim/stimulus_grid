module StimulusGridRails
  # Base for all gem controllers. Inherits the host's configured controller
  # (default ApplicationController) so Devise's authenticate_user! and
  # ActsAsTenant's set_current_tenant_through_filter run for grid endpoints
  # too — without that, these actions would execute unauthenticated and
  # outside any tenant scope, leaking rows across tenants.
  #
  # Configure with `StimulusGridRails.parent_controller = "ApplicationController"`.
  class BaseController < StimulusGridRails.parent_controller.constantize
    # Tokens are sent in the X-CSRF-Token header by the grid-sync controller, so
    # forgery protection stays on (inherited). Nothing is skipped.

    private

    def grid_for(resource)
      StimulusGridRails.lookup_grid(resource).new(user: current_grid_user)
    end

    # Scoped lookup — never a bare Model.find. Goes through grid.scope(user) so
    # ActsAsTenant (or a custom scope override) constrains what this user can
    # reach. A row outside the scope raises RecordNotFound, not a silent leak.
    def find_row!(grid, id)
      grid.scope(current_grid_user).find(id)
    end

    # Devise's current_user when present; nil otherwise.
    def current_grid_user
      respond_to?(:current_user) ? current_user : nil
    end

    def turbo_stream_render(body, status: :ok)
      render plain: body, content_type: "text/vnd.turbo-stream.html", status: status
    end

    # Record one undoable mutation (RAILS.md §16). No-op if the audit table
    # hasn't been installed, so undo/redo is opt-in via the migration.
    def record_audit(resource:, row_id:, column:, prior:, current:)
      return unless StimulusGridRails::Audit.available?
      StimulusGridRails::Audit.create!(
        resource:    resource.to_s,
        row_id:      row_id.to_s,
        column:      column.to_s,
        prior_value: prior.nil? ? nil : prior.to_s,
        new_value:   current.nil? ? nil : current.to_s,
        user_id:     current_grid_user&.id,
      )
    rescue => e
      Rails.logger.warn("[stimulus_grid_rails] audit insert failed: #{e.message}")
    end
  end
end
