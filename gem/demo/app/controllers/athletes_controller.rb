class AthletesController < ApplicationController
  def index
    @grid = AthleteGrid.new(user: nil)
    @athletes = Athlete.order(:id)
  end
end
