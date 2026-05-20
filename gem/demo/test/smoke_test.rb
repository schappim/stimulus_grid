require "test_helper"

# Proves the test harness boots the app, the gem loaded, and the demo's grid is
# registered. Real coverage lives in the lib/ and integration/ tests.
class SmokeTest < ActiveSupport::TestCase
  test "app boots and the gem is loaded" do
    assert defined?(StimulusGridRails)
    assert_equal "ApplicationController", StimulusGridRails.parent_controller
  end

  test "AthleteGrid is registered and resolvable" do
    assert_equal AthleteGrid, StimulusGridRails.lookup_grid("athletes")
    assert_equal Athlete, AthleteGrid.model_class
  end

  test "athletes can be created in the test db" do
    a = create_athlete(athlete: "Smoke")
    assert a.persisted?
    assert_equal "Smoke", a.athlete
  end
end
