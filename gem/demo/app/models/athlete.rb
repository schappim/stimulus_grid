class Athlete < ApplicationRecord
  include StimulusGridRails::Broadcastable

  # Every create / update / destroy automatically broadcasts the right Turbo
  # Stream action to the grid's tenant-scoped stream — no manual wiring. The
  # grid view subscribes to the matching stream.
  broadcasts_grid AthleteGrid

  # Optimistic-locking column. Used when a column declares
  # `concurrency: :version_checked` (e.g. :age in AthleteGrid below).
  self.locking_column = :lock_version

  validates :athlete, presence: true
  validates :gold, :silver, :bronze, numericality: { greater_than_or_equal_to: 0 }
end
