require "json"

# Seed from the same Olympic-athletes dataset the static demos use.
source = Rails.root.join("..", "..", "demo", "data", "athletes.json")

valid_sports = %w[Swimming Cycling Gymnastics Athletics Boxing Diving Fencing Rowing Wrestling]

records =
  if File.exist?(source)
    JSON.parse(File.read(source))
  else
    [
      { "athlete" => "Michael Phelps",  "age" => 23, "country" => "United States", "sport" => "Swimming",   "date" => "2008-08-24", "gold" => 8, "silver" => 0, "bronze" => 0 },
      { "athlete" => "Larisa Latynina", "age" => 22, "country" => "Soviet Union",  "sport" => "Gymnastics", "date" => "1956-12-08", "gold" => 4, "silver" => 1, "bronze" => 1 },
      { "athlete" => "Usain Bolt",      "age" => 21, "country" => "Jamaica",       "sport" => "Athletics",  "date" => "2008-08-16", "gold" => 3, "silver" => 0, "bronze" => 0 },
    ]
  end

Athlete.delete_all
records.each do |r|
  Athlete.create!(
    athlete: r["athlete"],
    country: r["country"],
    sport:   valid_sports.include?(r["sport"]) ? r["sport"] : "Athletics",
    age:     r["age"].to_i.clamp(10, 80),
    date:    r["date"],
    gold:    r["gold"],
    silver:  r["silver"],
    bronze:  r["bronze"],
  )
end

puts "Seeded #{Athlete.count} athletes."

# Large table for the server-side row model demo. Seeded with insert_all in
# batches so 50k rows load in ~1s. Override the count with BIG_ROWS=100000.
big_count = (ENV["BIG_ROWS"] || 50_000).to_i
BigRow.delete_all
if big_count.positive?
  categories = %w[General Finance Ops Sales Support Engineering Legal Marketing]
  statuses   = %w[open pending closed archived]
  now = Time.current
  (0...big_count).each_slice(5_000) do |slice|
    rows = slice.map do |i|
      n = i + 1
      { name: "Record ##{n}", category: categories[n % categories.size],
        status: statuses[n % statuses.size], amount: (n * 37) % 10_000,
        created_on: Date.current - (n % 365), lock_version: 0,
        created_at: now, updated_at: now }
    end
    BigRow.insert_all(rows)
  end
end
puts "Seeded #{BigRow.count} big_rows."
