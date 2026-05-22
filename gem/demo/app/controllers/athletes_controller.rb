class AthletesController < ApplicationController
  def index
    @grid = AthleteGrid.new(user: nil)
    @athletes = Athlete.order(:id)
  end

  # Client-side row grouping + aggregation demo (no server round-trip).
  def grouping
    @athletes = Athlete.order(:country, :athlete)
  end
end
