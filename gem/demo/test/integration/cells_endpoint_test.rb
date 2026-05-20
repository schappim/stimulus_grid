require "test_helper"

class CellsEndpointTest < ActionDispatch::IntegrationTest
  setup do
    @a = create_athlete(age: 25, gold: 1, silver: 0, bronze: 0)
    @base = StimulusGridRails.mount_path   # "/admin/grids" in this demo
  end

  def patch_cell(column, value, **extra)
    patch "#{@base}/athletes/#{@a.id}/cells/#{column}",
          params: { value: value, optimistic_id: "op-1" }.merge(extra), as: :json
  end

  test "valid edit returns cell-confirm, persists, and records an audit" do
    assert_difference -> { StimulusGridRails::Audit.count }, 1 do
      patch_cell("age", 30)
    end
    assert_response :success
    assert_includes response.body, 'action="cell-confirm"'
    assert_includes response.body, 'column="age"'
    assert_equal 30, @a.reload.age

    audit = StimulusGridRails::Audit.order(:id).last
    assert_equal "30", audit.new_value
    assert_equal "25", audit.prior_value
  end

  test "invalid value returns 422 cell-revert and does not persist" do
    patch_cell("age", 999)
    assert_response :unprocessable_entity
    assert_includes response.body, 'action="cell-revert"'
    assert_includes response.body, "errors="
    assert_equal 25, @a.reload.age
  end

  test "non-editable column is forbidden" do
    patch_cell("total", 5)   # computed, editable: false
    assert_response :forbidden
    assert_equal 1, @a.reload.gold
  end

  test "editing a depends_on column cascades the computed column in the response" do
    patch_cell("gold", 10)
    assert_response :success
    assert_includes response.body, 'action="bulk"'
    assert_includes response.body, 'column="gold"'
    assert_includes response.body, 'column="total"'
    assert_equal 10, @a.reload.gold
  end

  test "stale lock_version on a version-checked column returns cell-conflict" do
    patch_cell("age", 40, lock_version: @a.lock_version + 5)
    assert_response :success
    assert_includes response.body, 'action="cell-conflict"'
    assert_equal 25, @a.reload.age   # not applied
  end

  test "bulk applies multiple cell mutations" do
    b = create_athlete(age: 22)
    post "#{@base}/athletes/bulk", as: :json, params: {
      optimistic_id: "op-b",
      mutations: [
        { row_id: @a.id, column: "age", value: 31 },
        { row_id: b.id,  column: "age", value: 33 },
      ],
    }
    assert_response :success
    assert_includes response.body, 'action="bulk"'
    assert_equal 31, @a.reload.age
    assert_equal 33, b.reload.age
  end
end
