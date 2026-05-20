class BigRowsController < ApplicationController
  PAGE_SIZE = 50

  def index
    @grid  = BigRowGrid.new(user: nil)
    @total = BigRow.count
    # Render only the first page; the grid fetches the rest as windows.
    @rows  = BigRow.order(:id).limit(PAGE_SIZE)
  end
end
