require "active_support/concern"

module StimulusGridRails
  # Mixin for Active Record models that participate in a grid. Adds two
  # affordances:
  #
  #   - `broadcast_cell(grid:, column:, value: nil, optimistic_id: nil)` —
  #     pushes a cell delta to every subscriber of the model's stream name.
  #   - `after_update_commit` hook that auto-broadcasts changed cells for
  #     any column declared on the model's matching Grid (resolved via the
  #     `:grid` class option).
  #
  # Usage:
  #
  #     class Athlete < ApplicationRecord
  #       include StimulusGridRails::Broadcastable
  #       broadcasts_grid AthleteGrid, stream: ->(athlete) { "athletes" }
  #     end
  module Broadcastable
    extend ActiveSupport::Concern

    class_methods do
      # `auto_broadcast_updates:` — when true, every model update broadcasts
      # changed cells. Default false because grid edits flow through the cells
      # controller, which broadcasts with an optimistic_id so the originating
      # client can suppress its own echo (RAILS.md §4). Turn it on if you
      # mutate rows outside the grid (console, jobs, other controllers) and
      # want those changes to appear live.
      def broadcasts_grid(grid_class, stream:, auto_broadcast_updates: false)
        @stimulus_grid_class  = grid_class
        @stimulus_grid_stream = stream
        after_update_commit { broadcast_changed_grid_cells } if auto_broadcast_updates
        after_destroy_commit { broadcast_grid_row_removed }
      end

      def stimulus_grid_class;  @stimulus_grid_class;  end
      def stimulus_grid_stream; @stimulus_grid_stream; end
    end

    def broadcast_cell(column:, value: nil, optimistic_id: nil)
      grid_class = self.class.stimulus_grid_class
      stream     = self.class.stimulus_grid_stream.call(self)
      col        = grid_class.resolve_column!(column)
      v          = value.nil? ? send(col.name) : value
      message = StimulusGridRails::TurboStreams.cell(
        grid: grid_class.resource_name, row_id: id, column: col.name,
        value: v, optimistic_id: optimistic_id,
      )
      ::Turbo::StreamsChannel.broadcast_stream_to(stream, content: message)
    end

    def broadcast_changed_grid_cells
      return unless self.class.stimulus_grid_class
      grid_class = self.class.stimulus_grid_class
      columns    = grid_class.columns_registry || {}
      previous_changes.each_key do |col_name|
        col = columns[col_name.to_sym]
        next unless col
        broadcast_cell(column: col.name)
      end
    end

    def broadcast_grid_row_removed
      grid_class = self.class.stimulus_grid_class
      stream     = self.class.stimulus_grid_stream.call(self)
      message = StimulusGridRails::TurboStreams.row_remove(
        grid: grid_class.resource_name, row_id: id,
      )
      ::Turbo::StreamsChannel.broadcast_stream_to(stream, content: message)
    end
  end
end
