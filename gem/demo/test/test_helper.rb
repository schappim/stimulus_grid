ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel? Off — the gem registry + ActsAsTenant-style globals
    # are process-level, and the suite is small.
    self.use_transactional_tests = true

    # Build a valid Athlete without fixtures.
    def create_athlete(**attrs)
      Athlete.create!({
        athlete: "Tester", country: "Australia", sport: "Swimming",
        age: 25, date: Date.new(2024, 1, 1), gold: 1, silver: 0, bronze: 0,
      }.merge(attrs))
    end
  end
end
