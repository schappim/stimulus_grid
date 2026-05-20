require "test_helper"

class StimulusGridRails::ConfigurationTest < ActiveSupport::TestCase
  setup do
    @orig_parent = StimulusGridRails.parent_controller
    @orig_mount  = StimulusGridRails.mount_path
  end

  teardown do
    StimulusGridRails.parent_controller = @orig_parent
    StimulusGridRails.mount_path = @orig_mount
  end

  test "parent_controller defaults to ApplicationController and is settable" do
    assert_equal "ApplicationController", StimulusGridRails.parent_controller
    StimulusGridRails.parent_controller = "Admin::BaseController"
    assert_equal "Admin::BaseController", StimulusGridRails.parent_controller
  end

  test "this demo configures mount_path to /admin/grids" do
    # The demo's initializer namespaces the engine to prove mount_path works.
    assert_equal "/admin/grids", StimulusGridRails.mount_path
  end

  test "mount_path setter strips trailing slashes" do
    StimulusGridRails.mount_path = "/admin/grids/"
    assert_equal "/admin/grids", StimulusGridRails.mount_path
    StimulusGridRails.mount_path = "/x///"
    assert_equal "/x", StimulusGridRails.mount_path
  end

  test "streamables_for is tenant-token + grid token (no tenant here)" do
    assert_nil StimulusGridRails.tenant_stream_token
    assert_equal ["sgr-grid:athletes"], StimulusGridRails.streamables_for("athletes")
    assert_equal ["sgr-grid:athletes", "view:1"],
                 StimulusGridRails.streamables_for("athletes", "view:1")
  end

  test "registry resolves a known resource and raises for unknown" do
    assert_equal AthleteGrid, StimulusGridRails.lookup_grid("athletes")
    assert_raises(ArgumentError) { StimulusGridRails.lookup_grid("nope") }
  end
end
