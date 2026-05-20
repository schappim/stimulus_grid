class Athlete < ApplicationRecord
  include StimulusGridRails::Broadcastable

  # All edits broadcast to subscribers of the "athletes" stream. The grid
  # view renders <%= turbo_stream_from "athletes" %> so every connected tab
  # receives cell updates.
  broadcasts_grid AthleteGrid, stream: ->(_athlete) { "athletes" }

  # Optimistic-locking column. Used when a column declares
  # `concurrency: :version_checked` (e.g. :age in AthleteGrid below).
  self.locking_column = :lock_version

  validates :athlete, presence: true
  validates :gold, :silver, :bronze, numericality: { greater_than_or_equal_to: 0 }
end
