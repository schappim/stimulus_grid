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
      attr_reader :resource_name, :model_class, :columns_registry

      def resource(name)
        @resource_name = name.to_s
        StimulusGridRails.register_grid(@resource_name, self)
      end

      def model(klass)
        @model_class = klass
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

    # ----- Server-side search / filter (RAILS.md §21) -----

    # The base relation a request may see. Override for per-user authorization
    # scoping (e.g. `model_class.where(team: user.team)`).
    def scope(_user = user)
      self.class.model_class.all
    end

    # Apply a global search term + per-column filters to a relation. `filters`
    # is { col_name => { "type" =>, "value" =>, "value2" => } } (the client
    # filterModel shape). Unknown columns and unparseable values are ignored.
    def search_and_filter(relation, q: nil, filters: {})
      relation = apply_search(relation, q)
      relation = apply_filters(relation, filters)
      relation
    end

    def apply_search(relation, q)
      return relation if q.blank?
      table = self.class.model_class.arel_table
      preds = columns.filter_map { |c| c.search_predicate(table, q) }
      return relation if preds.empty?
      relation.where(preds.reduce(:or))
    end

    def apply_filters(relation, filters)
      return relation if filters.blank?
      table = self.class.model_class.arel_table
      filters.each do |col_name, criteria|
        next if criteria.blank?
        col = self.class.columns_registry[col_name.to_sym]
        next unless col
        pred = col.filter_predicate(table, criteria)
        relation = relation.where(pred) if pred
      end
      relation
    end

    # Server-side sort (RAILS.md §21). `sort_model` is the client shape:
    # [{ "colId" =>, "sort" => "asc"|"desc" }, …]. Only real (non-computed,
    # non-underscore) columns that exist on the model are honored.
    def apply_sort(relation, sort_model)
      return relation if sort_model.blank?
      table  = self.class.model_class.arel_table
      names  = self.class.model_class.column_names
      orders = Array(sort_model).filter_map do |entry|
        col_id = (entry["colId"] || entry[:colId]).to_s
        col    = self.class.columns_registry[col_id.to_sym]
        next unless col && !col.computed? && !col_id.start_with?("_") && names.include?(col_id)
        dir = (entry["sort"] || entry[:sort]).to_s.downcase == "desc" ? :desc : :asc
        table[col_id.to_sym].public_send(dir)
      end
      orders.empty? ? relation : relation.reorder(*orders)
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
      when :multi_enum
        # The JS multiselect renderer reads an Array from the row data;
        # stash JSON in data-cell-value so it gets a real Array instead
        # of trying to parse text content.
        JSON.generate(Array(v))
      when :attachments
        # The JS attachments renderer expects an array of file objects on the
        # row's data, not innerHTML. Stash the JSON in data-value so the
        # client picks it up via the standard renderer pipeline.
        JSON.generate(attachments_payload(row, column))
      else v.to_s
      end
    end

    # JSON-friendly value for row_to_h — numbers stay numeric, dates become
    # ISO strings, attachments become the file-list shape the JS renderer
    # expects, everything else stringifies sensibly.
    def serialize_value(v, column)
      case column.type
      when :integer, :bigint then v.to_i
      when :decimal, :money then v.to_f
      when :boolean        then !!v
      when :date           then v.respond_to?(:to_date) ? v.to_date.iso8601 : v
      when :datetime       then v.respond_to?(:iso8601) ? v.iso8601 : v
      when :multi_enum     then Array(v).map(&:to_s)
      when :attachments    then attachments_payload_for_value(v)
      else v
      end
    end

    # Build the JSON shape the JS `attachments` renderer expects from a
    # `has_many_attached` association on the row. Each attachment becomes
    # `{ id, filename, url, content_type, byte_size, thumb_url?, preview_url?, signed_id }`.
    # Override in a subclass for non-Active-Storage backends (S3 presigned
    # URLs, etc.) or to add tighter URL controls.
    def attachments_payload(row, column)
      relation = if row.respond_to?(column.name)
                   row.public_send(column.name)
                 else
                   nil
                 end
      attachments_payload_for_value(relation)
    end

    # Same as attachments_payload but takes the relation/value directly —
    # used by serialize_value when JSON-ifying a row to the wire.
    def attachments_payload_for_value(value)
      return [] if value.blank?
      # Active Storage `attachments` association
      list = if value.respond_to?(:each) && value.respond_to?(:attached?)
               value.each.to_a
             elsif value.respond_to?(:attached?) && value.attached?
               [value]                        # has_one_attached
             else
               Array(value)
             end
      list.compact.map { |a| serialize_active_storage_attachment(a) }
    end

    # Per-attachment serializer. Falls through to the row hash shape if the
    # object isn't an Active Storage attachment (lets users pass plain
    # hashes through unchanged for testing / custom backends).
    def serialize_active_storage_attachment(att)
      return att if att.is_a?(Hash)
      blob = att.respond_to?(:blob) ? att.blob : nil
      attachment_id = att.respond_to?(:id) ? att.id : nil
      filename = blob&.filename&.to_s || att.try(:filename).to_s
      content_type = blob&.content_type || att.try(:content_type)
      byte_size = blob&.byte_size || att.try(:byte_size)
      url = attachment_url_for(att)
      thumb = image_attachment?(content_type, filename) ? attachment_url_for(att) : nil
      {
        id: attachment_id || (att.respond_to?(:signed_id) ? att.signed_id : SecureRandom.hex(6)),
        filename: filename,
        url: url,
        content_type: content_type,
        byte_size: byte_size,
        thumb_url: thumb,
        preview_url: thumb,
        signed_id: att.respond_to?(:signed_id) ? att.signed_id : nil,
      }
    end

    # Build a URL the browser can fetch. Defaults to Rails' built-in
    # blob route (Rails.application.routes.url_helpers.rails_blob_url).
    # Override in a subclass to use signed/expiring URLs or a CDN host.
    def attachment_url_for(att)
      return nil unless att.respond_to?(:signed_id)
      Rails.application.routes.url_helpers.rails_blob_path(att, only_path: true)
    rescue StandardError
      nil
    end

    def image_attachment?(content_type, filename)
      return true if content_type.to_s.start_with?("image/")
      ext = File.extname(filename.to_s).delete(".").downcase
      %w[png jpg jpeg gif webp avif svg bmp ico].include?(ext)
    end

    # Mutate the attachments association on `row` based on a list of
    # operations sent from the client:
    #   { attach: [<signed_id>, …], detach: [<attachment_id>, …] }
    # Returns the updated attachments_payload for broadcast.
    def apply_attachments!(row, column, ops)
      relation = row.public_send(column.name)
      attach_ids = Array(ops[:attach] || ops["attach"])
      detach_ids = Array(ops[:detach] || ops["detach"])

      # Detach by attachment id. Active Storage's `attachments` is the
      # ActiveStorage::Attachment join — destroy each row in scope.
      if detach_ids.any?
        relation.attachments.where(id: detach_ids).find_each(&:purge)
      end
      # Attach new blobs by signed_id (the client uploaded via direct-upload
      # or via our POST endpoint and we hand back the signed_id).
      attach_ids.each { |sid| relation.attach(sid) }
      row.reload if row.respond_to?(:reload)
      attachments_payload(row, column)
    end
  end
end
