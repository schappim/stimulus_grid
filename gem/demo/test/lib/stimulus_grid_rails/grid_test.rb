require "test_helper"

class StimulusGridRails::GridTest < ActiveSupport::TestCase
  setup do
    @grid = AthleteGrid.new
    @phelps = create_athlete(athlete: "Michael Phelps", country: "United States",
                             gold: 8, silver: 0, bronze: 0, age: 23)
    @other = create_athlete(athlete: "Other Person", country: "Australia",
                            gold: 2, silver: 1, bronze: 0, age: 30)
  end

  def column(name) = AthleteGrid.resolve_column!(name)

  test "apply_cell! persists a valid edit and returns the mutation" do
    ok, errors, mutations = @grid.apply_cell!(@phelps, column("age"), 24)
    assert ok
    assert_empty errors
    assert_equal [@phelps.id, "age", 24, {}], mutations.first
    assert_equal 24, @phelps.reload.age
  end

  test "apply_cell! rejects a column-validation failure without writing" do
    ok, errors, mutations = @grid.apply_cell!(@phelps, column("age"), 999)
    refute ok
    assert_includes errors.join, "between 10 and 80"
    assert_empty mutations
    assert_equal 23, @phelps.reload.age
  end

  test "apply_cell! rolls back the in-memory value on a model-validation failure" do
    ok, errors, = @grid.apply_cell!(@phelps, column("gold"), -1)  # model: gold >= 0
    refute ok
    assert errors.any?
    assert_equal 8, @phelps.gold              # restored in memory
    assert_equal 8, @phelps.reload.gold       # and not persisted
  end

  test "apply_cell! cascades computed columns (gold -> total)" do
    ok, _errors, mutations = @grid.apply_cell!(@phelps, column("gold"), 10)
    assert ok
    cols = mutations.map { |row_id, col, val, _| [col, val] }
    assert_includes cols, ["gold", 10]
    assert_includes cols, ["total", 10]       # 10 + 0 + 0
  end

  test "cell_value computes computed columns" do
    assert_equal 8, @grid.cell_value(@phelps, column("total"))   # 8 + 0 + 0
  end

  test "row_to_h includes id + data columns + computed, skips underscore columns" do
    h = @grid.row_to_h(@phelps)
    assert_equal @phelps.id, h["id"]
    assert_equal "Michael Phelps", h["athlete"]
    assert_equal 8, h["total"]
    refute h.key?("_actions")
    refute h.key?("_medals")
  end

  test "build_new_row merges new_row_defaults with overrides" do
    row = @grid.build_new_row(athlete: "Custom")
    assert_equal "Custom", row.athlete
    assert_equal "Swimming", row.sport     # from new_row_defaults
    refute row.persisted?
  end

  test "search_and_filter applies global search" do
    rel = @grid.search_and_filter(@grid.scope, q: "phelps")
    assert_equal [@phelps.id], rel.pluck(:id)
  end

  test "search_and_filter applies per-column filters" do
    rel = @grid.search_and_filter(@grid.scope,
            filters: { "gold" => { "type" => "greaterThanOrEqual", "value" => "5" } })
    assert_equal [@phelps.id], rel.pluck(:id)
  end

  test "scope defaults to all and can be overridden to restrict access" do
    assert_equal Athlete.count, @grid.scope.count
    restricted = Class.new(AthleteGrid) { def scope(_u = nil) = Athlete.where("1 = 0") }.new
    assert_equal 0, restricted.scope.count
  end
end
