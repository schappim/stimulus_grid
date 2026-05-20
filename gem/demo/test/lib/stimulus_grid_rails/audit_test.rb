require "test_helper"

class StimulusGridRails::AuditTest < ActiveSupport::TestCase
  Audit = StimulusGridRails::Audit

  def audit(**attrs)
    Audit.create!({ resource: "athletes", row_id: "1", column: "age",
                    prior_value: "10", new_value: "20", user_id: nil,
                    undone: false }.merge(attrs))
  end

  test "available? is true once the table exists" do
    assert Audit.available?
  end

  test "undoable returns not-undone rows for the resource+user, newest first" do
    old = audit(created_at: 2.minutes.ago)
    recent = audit(created_at: 1.minute.ago)
    audit(undone: true)                          # excluded (already undone)
    audit(resource: "others")                    # excluded (other resource)
    audit(user_id: "99")                         # excluded (other user)

    result = Audit.undoable("athletes", nil).to_a
    assert_equal [recent.id, old.id], result.map(&:id)
  end

  test "redoable returns undone rows, most-recently-undone first" do
    first  = audit(undone: true, undone_at: 2.minutes.ago)
    second = audit(undone: true, undone_at: 1.minute.ago)
    audit(undone: false)                         # excluded (not undone)

    result = Audit.redoable("athletes", nil).to_a
    assert_equal [second.id, first.id], result.map(&:id)
  end

  test "scoping separates users" do
    mine   = audit(user_id: "7")
    audit(user_id: "8")
    assert_equal [mine.id], Audit.undoable("athletes", "7").pluck(:id)
  end
end
