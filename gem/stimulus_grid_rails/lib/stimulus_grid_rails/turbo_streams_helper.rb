module StimulusGridRails
  # Custom Turbo Stream actions (RAILS.md §1) — generates <turbo-stream> tags
  # whose `action=` is one of: cell, cell-attr, cell-confirm, cell-revert,
  # cell-conflict, row-insert-sorted, row-remove, aggregate, bulk.
  #
  # The matching client-side StreamActions live in
  # app/assets/javascripts/stimulus_grid_rails/stream_actions.js.
  #
  # Use directly:
  #   render turbo_stream: StimulusGridRails::TurboStreams.cell(
  #     grid: "athletes", row_id: athlete.id, column: :age,
  #     value: athlete.age, optimistic_id: params[:optimistic_id],
  #   )
  module TurboStreams
    module_function

    # Update one cell — value rendered inline as the cell's textContent.
    # `optimistic_id` is echoed back so the originating client can suppress
    # its own broadcast.
    def cell(grid:, row_id:, column:, value:, optimistic_id: nil)
      tag("cell", grid: grid, row_id: row_id, column: column,
                  optimistic_id: optimistic_id) do
        # Plain HTML — the StreamAction handler reads this as the new cell content.
        ERB::Util.html_escape(value.to_s)
      end
    end

    # Set an attribute on a cell (e.g. data-dirty="false").
    def cell_attr(grid:, row_id:, column:, attr:, value:)
      tag("cell-attr", grid: grid, row_id: row_id, column: column,
                       attr: attr, value: value)
    end

    # Clear pending/optimistic state on a cell after a successful save.
    def cell_confirm(grid:, row_id:, column:, value:, optimistic_id:)
      tag("cell-confirm", grid: grid, row_id: row_id, column: column,
                          optimistic_id: optimistic_id) do
        ERB::Util.html_escape(value.to_s)
      end
    end

    # Restore prior server value + render inline error.
    def cell_revert(grid:, row_id:, column:, value:, errors:, optimistic_id:)
      tag("cell-revert", grid: grid, row_id: row_id, column: column,
                         optimistic_id: optimistic_id,
                         errors: errors.to_json) do
        ERB::Util.html_escape(value.to_s)
      end
    end

    # Conflict — server value differs from client base value.
    def cell_conflict(grid:, row_id:, column:, server_value:, client_value:, optimistic_id:)
      tag("cell-conflict", grid: grid, row_id: row_id, column: column,
                           optimistic_id: optimistic_id,
                           server_value: server_value, client_value: client_value)
    end

    # Insert a row, respecting the client's current sort order.
    # `payload` is the rendered <tr>...</tr> HTML.
    def row_insert_sorted(grid:, row_id:, payload:)
      tag("row-insert-sorted", grid: grid, row_id: row_id) { payload }
    end

    # Remove a row by id.
    def row_remove(grid:, row_id:)
      tag("row-remove", grid: grid, row_id: row_id)
    end

    # Update a footer aggregate (sum/avg/count/etc.).
    def aggregate(grid:, column:, kind:, value:)
      tag("aggregate", grid: grid, column: column, kind: kind) do
        ERB::Util.html_escape(value.to_s)
      end
    end

    # Atomic batched stream — wraps N inner streams so the client applies them
    # in a single DOM reflow. Pass an array of already-built turbo-stream
    # strings (other helpers return strings).
    def bulk(grid:, streams:)
      inner = streams.join
      tag("bulk", grid: grid) { inner }
    end

    # Per-user editing indicator on a cell.
    def presence(grid:, row_id:, column:, user_id:, user_label:, active:)
      tag("presence", grid: grid, row_id: row_id, column: column,
                      user_id: user_id, user_label: user_label,
                      active: active.to_s)
    end

    # Internal — build a <turbo-stream> element. Keys with nil values are
    # dropped. Block content becomes the <template> payload.
    def tag(action, **attrs)
      attrs[:action] = action
      kept = attrs.compact
      attr_str = kept.map { |k, v| %(#{k.to_s.tr("_", "-")}="#{ERB::Util.html_escape(v)}") }.join(" ")
      payload = block_given? ? yield : nil
      template = payload ? "<template>#{payload}</template>" : ""
      %(<turbo-stream #{attr_str}>#{template}</turbo-stream>)
    end
  end
end
