class CreateBigRows < ActiveRecord::Migration[7.2]
  def change
    create_table :big_rows do |t|
      t.string  :name
      t.string  :category
      t.integer :amount, default: 0, null: false
      t.string  :status
      t.date    :created_on
      t.integer :lock_version, default: 0, null: false

      t.timestamps
    end
    add_index :big_rows, :category
    add_index :big_rows, :status
    add_index :big_rows, :amount
  end
end
