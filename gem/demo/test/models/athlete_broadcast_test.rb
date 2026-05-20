require "test_helper"

# after_*_commit callbacks don't fire under transactional tests (the test
# transaction never commits), so this class runs without them and cleans up
# manually.
class AthleteBroadcastTest < ActiveSupport::TestCase
  include ActionCable::TestHelper

  self.use_transactional_tests = false

  setup do
    # broadcast_stream_to targets stream_name_from(streamables), so capture there.
    @stream = Turbo::StreamsChannel.send(
      :stream_name_from, StimulusGridRails.streamables_for("athletes")
    )
  end

  teardown { Athlete.delete_all }

  test "create broadcasts row-insert-sorted to the grid stream" do
    messages = capture_broadcasts(@stream) { create_athlete(athlete: "New") }
    assert_equal 1, messages.size
    assert_includes messages.first, 'action="row-insert-sorted"'
    assert_includes messages.first, "New"
  end

  test "update broadcasts a cell action for each changed registered column" do
    athlete = create_athlete(age: 25)
    messages = capture_broadcasts(@stream) { athlete.update!(age: 26) }
    assert messages.any? { |m| m.include?('action="cell"') && m.include?('column="age"') }
  end

  test "update cascades the computed total when a dependency changes" do
    athlete = create_athlete(gold: 1, silver: 0, bronze: 0)
    messages = capture_broadcasts(@stream) { athlete.update!(gold: 5) }
    assert messages.any? { |m| m.include?('column="gold"') }
    assert messages.any? { |m| m.include?('column="total"') && m.include?("<template>5</template>") }
  end

  test "the optimistic id is carried into the broadcast when set" do
    athlete = create_athlete(age: 25)
    messages = capture_broadcasts(@stream) do
      athlete._sgr_optimistic_id = "op-42"
      athlete.update!(age: 27)
    end
    assert messages.any? { |m| m.include?('optimistic-id="op-42"') }
  end

  test "destroy broadcasts row-remove" do
    athlete = create_athlete
    messages = capture_broadcasts(@stream) { athlete.destroy }
    assert_equal 1, messages.size
    assert_includes messages.first, 'action="row-remove"'
  end
end
