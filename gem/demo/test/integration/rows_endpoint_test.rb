require "test_helper"

class RowsEndpointTest < ActionDispatch::IntegrationTest
  setup do
    @base = StimulusGridRails.mount_path
    @phelps = create_athlete(athlete: "Michael Phelps", gold: 8)
    @other  = create_athlete(athlete: "Other", gold: 2)
  end

  test "index returns matching rows as JSON for a global search" do
    get "#{@base}/athletes/rows", params: { q: "phelps" }, as: :json
    assert_response :success
    body = response.parsed_body
    assert_equal 1, body["total"]
    assert_equal ["Michael Phelps"], body["rows"].map { |r| r["athlete"] }
    assert_equal 8, body["rows"].first["total"]   # computed column included
  end

  test "index applies per-column filters" do
    get "#{@base}/athletes/rows", as: :json, params: {
      filters: { gold: { type: "greaterThanOrEqual", value: "5" } }.to_json,
    }
    assert_response :success
    assert_equal [@phelps.id], response.parsed_body["rows"].map { |r| r["id"] }
  end

  test "index returns a single window with page/page_size and the full total" do
    20.times { |i| create_athlete(athlete: "A#{format('%02d', i)}") }
    get "#{@base}/athletes/rows", as: :json, params: { page: 1, page_size: 10 }
    assert_response :success
    body = response.parsed_body
    assert_equal Athlete.count, body["total"]   # full count, not the window size
    assert_equal 1, body["page"]
    assert_equal 10, body["rows"].size
  end

  test "index sorts server-side" do
    get "#{@base}/athletes/rows", as: :json,
        params: { page: 0, page_size: 5, sort: [{ colId: "gold", sort: "desc" }].to_json }
    assert_response :success
    golds = response.parsed_body["rows"].map { |r| r["gold"] }
    assert_equal golds.sort.reverse, golds
  end

  test "create persists a row with new_row_defaults merged with attributes" do
    assert_difference -> { Athlete.count }, 1 do
      post "#{@base}/athletes/rows", as: :json, params: { attributes: { athlete: "Created" } }
    end
    assert_response :success
    row = Athlete.order(:id).last
    assert_equal "Created", row.athlete
    assert_equal "Swimming", row.sport   # from new_row_defaults
  end

  test "create returns 422 with errors for an invalid row" do
    assert_no_difference -> { Athlete.count } do
      post "#{@base}/athletes/rows", as: :json, params: { attributes: { athlete: "" } }
    end
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].present?
  end

  test "destroy removes a single row" do
    assert_difference -> { Athlete.count }, -1 do
      delete "#{@base}/athletes/rows/#{@other.id}"
    end
    assert_response :success
    refute Athlete.exists?(@other.id)
  end

  test "bulk destroy removes only the listed rows" do
    keep = create_athlete(athlete: "Keep")
    assert_difference -> { Athlete.count }, -2 do
      delete "#{@base}/athletes/rows/bulk", as: :json, params: { ids: [@phelps.id, @other.id] }
    end
    assert_response :success
    assert Athlete.exists?(keep.id)
    refute Athlete.exists?(@phelps.id)
  end
end
