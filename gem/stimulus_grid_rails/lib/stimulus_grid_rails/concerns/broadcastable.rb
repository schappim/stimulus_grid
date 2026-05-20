require "active_support/concern"

module StimulusGridRails
  # Mixin for Active Record models backing a grid. Once included and wired with
  # `broadcasts_grid`, every create / update / destroy AUTOMATICALLY broadcasts
  # the right Turbo Stream action to the grid's tenant-scoped stream — no manual
  # broadcast calls anywhere:
  #
  #   create  → row-insert-sorted   (the full row as JSON)
  #   update  → cell                (each changed registered column + any
  #                                   computed column whose deps changed)
  #   destroy → row-remove
  #
  # Usage:
  #
  #     class Athlete < ApplicationRecord
  #       include StimulusGridRails::Broadcastable
  #       broadcasts_grid AthleteGrid
  #     end
  #
  # Streams are tenant-scoped via StimulusGridRails.streamables_for, so with
  # ActsAsTenant a tenant's changes never reach another tenant's subscribers.
  module Broadcastable
    extend ActiveSupport::Concern

    included do
      # Set by the cells controller before a grid-driven save so the broadcast
      # carries the originating client's optimistic id (RAILS.md §4) and that
      # client suppresses its own echo. nil for changes made outside the grid
      # (console, jobs) — those broadcast to everyone with no suppression.
      attr_accessor :_sgr_optimistic_id
    end

    class_methods do
      def broadcasts_grid(grid_class)
        @stimulus_grid_class = grid_class
        after_create_commit  { stimulus_grid_broadcast_insert }
        after_update_commit  { stimulus_grid_broadcast_changes }
        after_destroy_commit { stimulus_grid_broadcast_remove }
      end

      def stimulus_grid_class
        @stimulus_grid_class
      end
    end

    def stimulus_grid_streamables
      StimulusGridRails.streamables_for(self.class.stimulus_grid_class.resource_name)
    end

    def stimulus_grid_broadcast_insert
      grid = self.class.stimulus_grid_class.new
      message = StimulusGridRails::TurboStreams.row_insert_sorted(
        grid: grid.class.resource_name, row_id: id, payload: grid.row_to_json(self),
      )
      stimulus_grid_broadcast(message)
    end

    def stimulus_grid_broadcast_changes
      grid_class = self.class.stimulus_grid_class
      grid       = grid_class.new
      registry   = grid_class.columns_registry || {}
      changed    = previous_changes.keys.map(&:to_sym)

      direct   = registry.values.select { |c| !c.computed? && !c.name.to_s.start_with?("_") && changed.include?(c.name) }
      computed = registry.values.select { |c| c.computed? && (c.depends_on & changed).any? }

      (direct + computed).each do |col|
        message = StimulusGridRails::TurboStreams.cell(
          grid: grid_class.resource_name, row_id: id, column: col.name,
          value: grid.cell_value(self, col), optimistic_id: _sgr_optimistic_id,
        )
        stimulus_grid_broadcast(message)
      end
    end

    def stimulus_grid_broadcast_remove
      grid_class = self.class.stimulus_grid_class
      message = StimulusGridRails::TurboStreams.row_remove(
        grid: grid_class.resource_name, row_id: id,
      )
      stimulus_grid_broadcast(message)
    end

    private

    def stimulus_grid_broadcast(message)
      ::Turbo::StreamsChannel.broadcast_stream_to(*stimulus_grid_streamables, content: message)
    end
  end
end
