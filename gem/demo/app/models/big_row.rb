class BigRow < ApplicationRecord
  include StimulusGridRails::Broadcastable
  broadcasts_grid BigRowGrid
  self.locking_column = :lock_version

  validates :name, presence: true
  validates :amount, numericality: true
end
