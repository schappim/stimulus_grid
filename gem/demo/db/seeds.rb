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
