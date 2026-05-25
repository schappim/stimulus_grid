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

ActiveRecord::Schema[7.2].define(version: 2026_05_25_000002) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.integer "record_id", null: false
    t.integer "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.integer "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

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

  create_table "big_rows", force: :cascade do |t|
    t.string "name"
    t.string "category"
    t.integer "amount", default: 0, null: false
    t.string "status"
    t.date "created_on"
    t.integer "lock_version", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["amount"], name: "index_big_rows_on_amount"
    t.index ["category"], name: "index_big_rows_on_category"
    t.index ["status"], name: "index_big_rows_on_status"
  end

  create_table "file_records", force: :cascade do |t|
    t.string "name", null: false
    t.string "owner"
    t.string "status", default: "draft", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_file_records_on_status"
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
end
