module StimulusGridRails
  # One undoable cell mutation (RAILS.md §16). Recorded per successful cell
  # commit; undo/redo replay the inverse/forward value as a normal mutation so
  # validations re-run, cascades cascade, and broadcasts fire. Scoped per
  # user + resource (not global).
  #
  # Install the table with the migration shipped in the gem (or copy it):
  #   rails stimulus_grid_rails:install:migrations && rails db:migrate
  class Audit < ActiveRecord::Base
    self.table_name = "stimulus_grid_audits"

    # True once the table is installed. Auditing (and undo/redo) is a no-op
    # until then, so the rest of the gem works without the migration.
    def self.available?
      table_exists?
    rescue ActiveRecord::ActiveRecordError
      false
    end

    # Most-recent not-yet-undone mutation for this user + resource.
    def self.undoable(resource, user_id)
      where(resource: resource.to_s, user_id: user_id, undone: false)
        .order(created_at: :desc, id: :desc)
    end

    # Most-recently-undone mutation, ready to redo.
    def self.redoable(resource, user_id)
      where(resource: resource.to_s, user_id: user_id, undone: true)
        .order(undone_at: :desc, id: :desc)
    end
  end
end
