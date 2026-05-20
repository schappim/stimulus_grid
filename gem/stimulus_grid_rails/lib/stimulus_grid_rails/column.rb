module StimulusGridRails
  # One column on a Grid. Captures everything the server needs to authorise,
  # coerce, validate, and broadcast changes for this field — plus everything
  # the client needs to choose an editor and render a cell.
  #
  # Created via the `column` DSL inside an ApplicationGrid subclass; not
  # instantiated directly. See StimulusGridRails::Grid for usage.
  class Column
    TYPES = %i[string text integer bigint decimal money boolean enum date datetime reference].freeze

    attr_reader :name, :type, :editor, :editor_config, :enum_values, :concurrency,
                :depends_on, :validators, :header, :width, :pinned, :cell_renderer

    def initialize(name, type:, editable: false, editor: nil, editor_config: {},
                   enum_values: nil, concurrency: :last_write_wins,
                   computed: false, depends_on: [], validate: nil,
                   header: nil, width: nil, pinned: nil, cell_renderer: nil,
                   sortable: true, filterable: true, searchable: nil)
      raise ArgumentError, "Unknown column type #{type.inspect}" unless TYPES.include?(type)
      @name          = name.to_sym
      @type          = type
      @editable      = editable                       # may be `true`, `false`, or a Proc(row, user)
      @editor        = editor || default_editor_for(type)
      @editor_config = editor_config
      @enum_values   = enum_values
      @concurrency   = concurrency
      @computed      = computed
      @depends_on    = Array(depends_on)
      @validators    = Array(validate)
      @header        = header || name.to_s.humanize
      @width         = width
      @pinned        = pinned
      @cell_renderer = cell_renderer
      @sortable      = sortable
      @filterable    = filterable
      # Global search defaults to text-ish columns; numeric/date/boolean opt in.
      @searchable    = searchable.nil? ? %i[string text enum reference].include?(type) : searchable
    end

    # Per-row, per-user editable check. RAILS.md §17 — server re-evaluates on
    # every PATCH (never trust the client's data-editable attribute).
    def editable_for?(row, user)
      case @editable
      when true, false then @editable
      when Proc then !!@editable.call(row, user)
      else !!@editable
      end
    end

    def editable_static?
      @editable == true
    end

    def computed?  = @computed
    def cascades?  = !@depends_on.empty?

    # Coerce a string value (from a form submission) to this column's Ruby type.
    # Returns [value, error] — error is a string if coercion failed.
    def coerce(raw)
      case @type
      when :string, :text, :enum, :reference then [raw.to_s, nil]
      when :integer, :bigint
        Integer(raw.to_s, 10).then { |i| [i, nil] }
      when :decimal, :money
        [BigDecimal(raw.to_s), nil]
      when :boolean
        [%w[1 true yes on t].include?(raw.to_s.downcase), nil]
      when :date
        [Date.parse(raw.to_s), nil]
      when :datetime
        [Time.zone.parse(raw.to_s), nil]
      else
        [raw, nil]
      end
    rescue ArgumentError, TypeError => e
      [nil, "invalid #{@type}: #{e.message}"]
    end

    def searchable? = @searchable && !@computed && !name.to_s.start_with?("_")

    # Arel predicate for the global search term, or nil if this column doesn't
    # participate. Case-insensitive contains over the column's text. Computed
    # and action columns never match (no DB column to query).
    def search_predicate(arel_table, term)
      return nil unless searchable?
      pattern = "%#{like_escape(term.to_s.downcase)}%"
      arel_table[@name].lower.matches(pattern)
    end

    # Arel predicate for a per-column filter. `criteria` mirrors the client
    # filterModel shape: { "type" => op, "value" => v, "value2" => v2 }.
    # Returns nil for computed/unknown columns or unparseable values.
    def filter_predicate(arel_table, criteria)
      return nil if @computed || name.to_s.start_with?("_")
      col = arel_table[@name]
      op  = (criteria["type"] || criteria[:type]).to_s
      raw = criteria["value"]  || criteria[:value]
      raw2 = criteria["value2"] || criteria[:value2]

      case @type
      when :string, :text, :enum, :reference
        text_predicate(col, op, raw.to_s)
      when :integer, :bigint, :decimal, :money
        numeric_predicate(col, op, raw, raw2)
      when :date, :datetime
        date_predicate(col, op, raw, raw2)
      when :boolean
        v, err = coerce(raw)
        err ? nil : col.eq(v)
      end
    end

    # Run client-defined validators. Returns Array of error strings.
    def validate(value, row)
      @validators.flat_map do |v|
        result = v.call(value, row)
        case result
        when nil, true then []
        when String    then [result]
        when Array     then result
        else [result.to_s]
        end
      end
    end

    # Serialized into the rendered cell's data-* attributes so the client-side
    # editor controller can mount the right editor with the right config.
    def client_data_attrs(row, user)
      attrs = {
        "data-col-id" => name,
        "data-editor" => @editor,
      }
      attrs["data-editable"] = "true" if editable_for?(row, user)
      attrs["data-enum-values"] = JSON.generate(@enum_values) if @enum_values
      attrs["data-editor-config"] = JSON.generate(@editor_config) unless @editor_config.empty?
      attrs
    end

    # Serialized into the column's <th> so header_cell_controller picks it up.
    def header_data_attrs
      {
        "data-controller" => "header-cell",
        "data-header-cell-field-value" => name,
        "data-header-cell-type-value" => header_cell_type,
        "data-header-cell-sortable-value" => @sortable.to_s,
        "data-header-cell-filter-value" => (@filterable ? filter_type_for_client : nil),
        "data-header-cell-editable-value" => editable_static?.to_s,
        "data-header-cell-pinned-value" => @pinned,
        "data-header-cell-width-value" => @width,
        "data-header-cell-cell-renderer-value" => @cell_renderer,
      }.compact
    end

    private

    # Escape LIKE wildcards so a literal % or _ in the search term isn't treated
    # as a pattern. Arel still quotes the value, so this is only about semantics.
    def like_escape(str)
      str.gsub(/[\\%_]/) { |c| "\\#{c}" }
    end

    def text_predicate(col, op, val)
      lc = col.lower
      v  = val.downcase
      case op
      when "equals"     then lc.eq(v)
      when "notEqual"   then lc.not_eq(v)
      when "startsWith" then lc.matches("#{like_escape(v)}%")
      when "endsWith"   then lc.matches("%#{like_escape(v)}")
      when "blank"      then col.eq(nil).or(col.eq(""))
      when "notBlank"   then col.not_eq(nil).and(col.not_eq(""))
      else                   lc.matches("%#{like_escape(v)}%")   # contains (default)
      end
    end

    def numeric_predicate(col, op, raw, raw2)
      v, err = coerce(raw)
      return nil if err
      case op
      when "greaterThan"        then col.gt(v)
      when "greaterThanOrEqual" then col.gteq(v)
      when "lessThan"           then col.lt(v)
      when "lessThanOrEqual"    then col.lteq(v)
      when "notEqual"           then col.not_eq(v)
      when "inRange"
        v2, e2 = coerce(raw2)
        e2 ? col.gteq(v) : col.between(v..v2)
      else col.eq(v)
      end
    end

    def date_predicate(col, op, raw, raw2)
      v, err = coerce(raw)
      return nil if err
      case op
      when "greaterThan" then col.gt(v)
      when "lessThan"    then col.lt(v)
      when "notEqual"    then col.not_eq(v)
      when "inRange"
        v2, e2 = coerce(raw2)
        e2 ? col.gteq(v) : col.between(v..v2)
      else col.eq(v)
      end
    end

    def default_editor_for(t)
      case t
      when :string, :text, :reference then "text"
      when :integer, :bigint, :decimal, :money then "number"
      when :boolean                   then "checkbox"
      when :enum                      then "select"
      when :date                      then "date"
      when :datetime                  then "datetime-local"
      else "text"
      end
    end

    def header_cell_type
      case @type
      when :integer, :bigint, :decimal, :money then "number"
      when :date, :datetime           then "date"
      when :boolean                   then "boolean"
      else "text"
      end
    end

    def filter_type_for_client
      case @type
      when :integer, :bigint, :decimal, :money then "number"
      when :date, :datetime           then "date"
      when :boolean                   then "boolean"
      else "text"
      end
    end
  end
end
