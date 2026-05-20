class CreateAthletes < ActiveRecord::Migration[7.2]
  def change
    create_table :athletes do |t|
      t.string  :athlete
      t.string  :country
      t.string  :sport
      t.integer :age
      t.date    :date
      t.integer :gold,   default: 0, null: false
      t.integer :silver, default: 0, null: false
      t.integer :bronze, default: 0, null: false
      t.integer :lock_version, default: 0, null: false

      t.timestamps
    end
    add_index :athletes, :country
    add_index :athletes, :sport
  end
end
