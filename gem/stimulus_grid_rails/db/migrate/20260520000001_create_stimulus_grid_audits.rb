class CreateStimulusGridAudits < ActiveRecord::Migration[7.0]
  def change
    create_table :stimulus_grid_audits do |t|
      t.string   :resource,    null: false
      t.string   :row_id,      null: false
      t.string   :column,      null: false
      t.text     :prior_value
      t.text     :new_value
      t.string   :user_id
      t.boolean  :undone,      null: false, default: false
      t.datetime :undone_at

      t.timestamps
    end
    add_index :stimulus_grid_audits, %i[resource user_id undone created_at],
              name: "idx_sgr_audits_undo"
  end
end
