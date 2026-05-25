class CreateFileRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :file_records do |t|
      t.string  :name,    null: false
      t.string  :owner
      t.string  :status,  default: "draft", null: false
      t.text    :notes

      t.timestamps
    end
    add_index :file_records, :status
  end
end
