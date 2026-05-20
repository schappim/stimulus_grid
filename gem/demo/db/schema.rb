# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_20_013735) do
  create_table "athletes", force: :cascade do |t|
    t.string "athlete"
    t.string "country"
    t.string "sport"
    t.integer "age"
    t.date "date"
    t.integer "gold", default: 0, null: false
    t.integer "silver", default: 0, null: false
    t.integer "bronze", default: 0, null: false
    t.integer "lock_version", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["country"], name: "index_athletes_on_country"
    t.index ["sport"], name: "index_athletes_on_sport"
  end

  create_table "stimulus_grid_audits", force: :cascade do |t|
    t.string "resource", null: false
    t.string "row_id", null: false
    t.string "column", null: false
    t.text "prior_value"
    t.text "new_value"
    t.string "user_id"
    t.boolean "undone", default: false, null: false
    t.datetime "undone_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["resource", "user_id", "undone", "created_at"], name: "idx_sgr_audits_undo"
  end
end
