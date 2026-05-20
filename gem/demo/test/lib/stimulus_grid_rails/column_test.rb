require "test_helper"

class StimulusGridRails::ColumnTest < ActiveSupport::TestCase
  Column = StimulusGridRails::Column
  TABLE  = Athlete.arel_table

  def col(name, **opts) = Column.new(name, **opts)

  # ---- coercion ----

  test "coerce by type, including bigint" do
    assert_equal [+"x", nil],            col(:s, type: :string).coerce("x")
    assert_equal [5, nil],               col(:i, type: :integer).coerce("5")
    assert_equal [9_223_372_036_854_775_807, nil],
                 col(:b, type: :bigint).coerce("9223372036854775807")
    assert_equal [BigDecimal("1.5"), nil], col(:d, type: :decimal).coerce("1.5")
    assert_equal [true, nil],            col(:bool, type: :boolean).coerce("true")
    assert_equal [false, nil],           col(:bool, type: :boolean).coerce("0")
    assert_equal [Date.new(2024, 1, 2), nil], col(:dt, type: :date).coerce("2024-01-02")
  end

  test "coerce returns an error for invalid input" do
    value, err = col(:i, type: :integer).coerce("not-a-number")
    assert_nil value
    assert_match(/invalid integer/, err)
  end

  # ---- validation ----

  test "validate runs lambdas and collects string errors" do
    c = col(:age, type: :integer, validate: ->(v, _r) { "too small" if v < 10 })
    assert_equal [], c.validate(20, nil)
    assert_equal ["too small"], c.validate(5, nil)
  end

  # ---- editability (RAILS.md §17) ----

  test "editable_for? handles bool and lambda(row, user)" do
    assert col(:x, type: :string, editable: true).editable_for?(nil, nil)
    refute col(:x, type: :string).editable_for?(nil, nil)
    lambda_col = col(:x, type: :string, editable: ->(_row, user) { user == :admin })
    assert lambda_col.editable_for?(nil, :admin)
    refute lambda_col.editable_for?(nil, :guest)
  end

  test "editable_static? only true for the literal true (drives data-editable on render)" do
    assert col(:x, type: :string, editable: true).editable_static?
    refute col(:x, type: :string, editable: ->(_r, _u) { true }).editable_static?
  end

  # ---- searchability ----

  test "searchable defaults on for text-ish, off for numeric/date/computed/underscore" do
    assert col(:name, type: :string).searchable?
    assert col(:sport, type: :enum).searchable?
    refute col(:age, type: :integer).searchable?
    refute col(:when, type: :date).searchable?
    refute col(:total, type: :integer, computed: true).searchable?
    refute col(:_actions, type: :string).searchable?
    assert col(:age, type: :integer, searchable: true).searchable?   # opt-in
  end

  # ---- predicates ----

  test "search_predicate is nil when not searchable, else a case-insensitive LIKE" do
    assert_nil col(:age, type: :integer).search_predicate(TABLE, "x")
    sql = col(:athlete, type: :string).search_predicate(TABLE, "PHelps").to_sql
    assert_match(/LOWER/i, sql)
    assert_match(/LIKE/i, sql)
    assert_includes sql, "phelps"   # term lowercased
  end

  test "filter_predicate builds type-appropriate SQL" do
    text = col(:athlete, type: :string).filter_predicate(TABLE, { "type" => "contains", "value" => "ph" })
    assert_match(/LIKE/i, text.to_sql)

    gte = col(:gold, type: :integer).filter_predicate(TABLE, { "type" => "greaterThanOrEqual", "value" => "5" })
    assert_includes gte.to_sql, ">= 5"

    rng = col(:age, type: :integer).filter_predicate(TABLE, { "type" => "inRange", "value" => "10", "value2" => "20" })
    assert_match(/BETWEEN 10 AND 20/i, rng.to_sql)

    assert_nil col(:total, type: :integer, computed: true).filter_predicate(TABLE, { "type" => "equals", "value" => "1" })
  end

  # ---- rendered attributes ----

  test "header_data_attrs reflect sortable/filterable/renderer/editor" do
    attrs = col(:sport, type: :enum, sortable: true, filterable: true,
                cell_renderer: "pill", cell_editor: "pick").header_data_attrs
    assert_equal "true", attrs["data-header-cell-sortable-value"]
    assert_equal "pill", attrs["data-header-cell-cell-renderer-value"]
    assert_equal "pick", attrs["data-header-cell-cell-editor-value"]

    plain = col(:x, type: :string, sortable: false, filterable: false).header_data_attrs
    assert_equal "false", plain["data-header-cell-sortable-value"]
    refute plain.key?("data-header-cell-filter-value")
  end

  test "client_data_attrs emit data-editable only when editable for this row/user" do
    yes = col(:x, type: :string, editable: true).client_data_attrs(nil, nil)
    assert_equal "true", yes["data-editable"]
    no = col(:x, type: :string, editable: false).client_data_attrs(nil, nil)
    refute no.key?("data-editable")
  end
end
