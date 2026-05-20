require "test_helper"

class HistoryEndpointTest < ActionDispatch::IntegrationTest
  setup do
    @base = StimulusGridRails.mount_path
    @a = create_athlete(age: 25)
  end

  # Make an edit through the cells endpoint so a real audit is recorded.
  def edit_age(to)
    patch "#{@base}/athletes/#{@a.id}/cells/age", as: :json, params: { value: to }
  end

  test "undo reverts the last edit and marks the audit undone" do
    edit_age(40)
    assert_equal 40, @a.reload.age

    post "#{@base}/athletes/undo"
    assert_response :success
    assert_equal 25, @a.reload.age
    assert StimulusGridRails::Audit.order(:id).last.undone
  end

  test "redo re-applies the undone edit" do
    edit_age(40)
    post "#{@base}/athletes/undo"
    assert_equal 25, @a.reload.age

    post "#{@base}/athletes/redo"
    assert_response :success
    assert_equal 40, @a.reload.age
    refute StimulusGridRails::Audit.order(:id).last.undone
  end

  test "undo with nothing to undo returns no content" do
    post "#{@base}/athletes/undo"
    assert_response :no_content
  end

  test "undo skips audits whose row was deleted" do
    StimulusGridRails::Audit.create!(resource: "athletes", row_id: "9999999",
      column: "age", prior_value: "1", new_value: "2", user_id: nil, undone: false)
    post "#{@base}/athletes/undo"
    assert_response :no_content                       # nothing applicable
    assert StimulusGridRails::Audit.last.undone        # stale audit marked so it won't block
  end
end
