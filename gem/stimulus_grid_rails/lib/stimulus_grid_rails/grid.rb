require "bigdecimal"
require "json"

module StimulusGridRails
  # Base class for declaring a server-side grid. RAILS.md §7 — one source of
  # truth per resource. All editor selection, auth, coercion, validation,
  # broadcasting flows through here.
  #
  # Subclass and declare:
  #
  #   class AthleteGrid < StimulusGridRails::Grid
  #     resource :athletes
  #     model    Athlete
  #     stream_name { |user| "athletes:#{user.id}" }
  #
  #     column :athlete,  type: :string,  editable: true, width: 200, pinned: :left
  #     column :country,  type: :string,  editable: ->(row, user) { user.admin? }
  #     column :age,      type: :integer, editable: true, validate: ->(v, _r) { "must be > 0" if v <= 0 }
  #     column :sport,    type: :enum,    editable: true, enum_values: %w[Swimming Cycling Gymnastics]
  #     column :date,     type: :date,    editable: true
  #     column :gold,     type: :integer, editable: true
  #     column :silver,   type: :integer, editable: true
  #     column :bronze,   type: :integer, editable: true
  #     column :total,    type: :integer, computed: true, depends_on: %i[gold silver bronze]
  #
  #     def compute_total(row) = row.gold + row.silver + row.bronze
  #   end
  class Grid
    class << self
      attr_reader :resource_name, :model_class, :columns_registry, :stream_block

      def resource(name)
        @resource_name = name.to_s
        StimulusGridRails.register_grid(@resource_name, self)
      end

      def model(klass)
        @model_class = klass
      end

      def stream_name(&block)
        @stream_block = block
      end

      def column(name, **opts)
        @columns_registry ||= {}
        @columns_registry[name.to_sym] = Column.new(name, **opts)
      end

      # Used by the controller after deserializing the URL.
      def resolve_column!(col_id)
        column = columns_registry[col_id.to_sym]
        raise ArgumentError, "Unknown column #{col_id} on #{name}" unless column
        column
      end
    end

    attr_reader :user

    def initialize(user: nil)
      @user = user
    end

    def columns
      self.class.columns_registry.values
    end

    def visible_columns_for(_row)
      columns
    end

    def stream_name_for(user)
      block = self.class.stream_block
      block ? block.call(user) : self.class.resource_name
    end

    # Called from the controller after a successful coercion + permission check.
    # Returns [success?, mutations_to_broadcast] where mutations is an array of
    # [row_id, col_id, value, opts]. For computed cascade, runs the dependent
    # column's compute_X methods and includes those too.
    def apply_cell!(row, column, value)
      errors = column.validate(value, row)
      return [false, errors, []] if errors.any?

      old_value = row.send(column.name)
      row.send("#{column.name}=", value)
      mutations = [[row_id(row), column.name.to_s, value, {}]]

      # Cascade — recompute every column declared as depending on this one.
      self.class.columns_registry.each_value do |c|
        next unless c.computed? && c.depends_on.include?(column.name)
        compute_method = "compute_#{c.name}"
        if respond_to?(compute_method)
          new_val = public_send(compute_method, row)
          row.send("#{c.name}=", new_val) if row.respond_to?("#{c.name}=")
          mutations << [row_id(row), c.name.to_s, new_val, {}]
        end
      end

      saved = row.respond_to?(:save) ? row.save : true
      if saved
        [true, [], mutations]
      else
        # Restore old value so the in-memory row doesn't carry the failed write.
        row.send("#{column.name}=", old_value)
        [false, Array(row.respond_to?(:errors) ? row.errors.full_messages : ["save failed"]), []]
      end
    end

    def row_id(row)
      row.respond_to?(:id) ? row.id : row[:id]
    end

    # ----- Row create/destroy support (RAILS.md §14/§15) -----

    # Default attributes for a freshly-created row. Override in subclasses.
    def new_row_defaults
      {}
    end

    # Build (unsaved) a new model instance merging defaults with caller overrides.
    def build_new_row(overrides = {})
      attrs = new_row_defaults.merge((overrides || {}).symbolize_keys)
      self.class.model_class.new(attrs)
    end

    # Serialize a row to the JSON shape the client grid expects: { id, <col>: <value>, … }
    # including computed columns. Used as the row-insert-sorted payload.
    def row_to_h(row)
      h = { "id" => row_id(row) }
      self.class.columns_registry.each_value do |col|
        next if col.name.to_s.start_with?("_")   # skip action/renderer-only columns
        h[col.name.to_s] = serialize_value(cell_value(row, col), col)
      end
      h
    end

    def row_to_json(row)
      JSON.generate(row_to_h(row))
    end

    def cell_value(row, column)
      if column.computed?
        method = "compute_#{column.name}"
        return respond_to?(method) ? public_send(method, row) : nil
      end
      row.respond_to?(column.name) ? row.send(column.name) : row[column.name]
    end

    # Renders the value into the DOM. Override per-column or per-type in
    # subclasses for richer renderers.
    def format_cell(row, column)
      v = cell_value(row, column)
      case column.type
      when :money   then ActiveSupport::NumberHelper.number_to_currency(v) rescue v.to_s
      when :date    then v.respond_to?(:to_date) ? v.to_date.iso8601 : v.to_s
      when :datetime then v.respond_to?(:iso8601) ? v.iso8601 : v.to_s
      when :boolean then v ? "✓" : ""
      else v.to_s
      end
    end

    # JSON-friendly value for row_to_h — numbers stay numeric, dates become
    # ISO strings, everything else stringifies sensibly.
    def serialize_value(v, column)
      case column.type
      when :integer        then v.to_i
      when :decimal, :money then v.to_f
      when :boolean        then !!v
      when :date           then v.respond_to?(:to_date) ? v.to_date.iso8601 : v
      when :datetime       then v.respond_to?(:iso8601) ? v.iso8601 : v
      else v
      end
    end
  end
end
