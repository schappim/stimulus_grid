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

# File records — one seed row per fixture set so the attachments column
# has something to render on first load. Attaches generated SVG blobs +
# a couple of inline PDFs so the demo works fully offline.
if defined?(FileRecord)
  # destroy (not delete) so dependent ActiveStorage attachments / blobs get
  # purged with the record — delete_all leaves orphaned join rows that
  # re-bind to the next record reusing the same id.
  FileRecord.find_each(&:destroy)
  swatch_svg = ->(bg, fg, label) {
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>" \
      "<rect width='200' height='200' fill='#{bg}'/>" \
      "<text x='100' y='118' font-family='system-ui' font-size='72' font-weight='700' " \
      "fill='#{fg}' text-anchor='middle'>#{label}</text></svg>"
  }
  fake_pdf = "%PDF-1.4\n1 0 obj <<>> endobj\ntrailer <<>>\n%%EOF\n"

  seeds = [
    { name: "Brand refresh — phase 1", owner: "Marcus Chen", status: "in_review",
      notes: "Sign-off pending from creative.",
      files: [
        ["logo-mark.svg",          "image/svg+xml",   swatch_svg.call("#1e3a8a", "#fff", "L")],
        ["palette.svg",            "image/svg+xml",   swatch_svg.call("#fef3c7", "#92400e", "P")],
        ["brand-guidelines.pdf",   "application/pdf", fake_pdf],
      ] },
    { name: "Q3 reporting pack", owner: "Priya Patel", status: "in_progress",
      notes: "Final numbers from finance Friday.",
      files: [
        ["revenue.csv",            "text/csv",        "month,revenue\nJul,1240000\nAug,1402100\nSep,1574200\n"],
        ["narrative.txt",          "text/plain",      "Q3 came in 14% above plan."],
        ["chart-1.svg",            "image/svg+xml",   swatch_svg.call("#dcfce7", "#14532d", "↗")],
      ] },
    { name: "Holiday campaign assets", owner: "Tomás Vega", status: "done",
      notes: "All approved. Ready to ship.",
      files: [
        ["hero-1.svg", "image/svg+xml", swatch_svg.call("#fef3c7", "#7c2d12", "★")],
        ["hero-2.svg", "image/svg+xml", swatch_svg.call("#fce7f3", "#831843", "♥")],
        ["hero-3.svg", "image/svg+xml", swatch_svg.call("#dbeafe", "#1e3a8a", "✦")],
      ] },
    { name: "Engineering RFC — search", owner: "Lena Brooks", status: "in_review",
      notes: "Targets <50ms p99 across corpora.", files: [] },
    { name: "Customer onboarding deck", owner: "Astrid Hale", status: "draft",
      notes: "First draft. Needs voice-over.", files: [] },
  ]

  seeds.each do |s|
    rec = FileRecord.create!(name: s[:name], owner: s[:owner],
                             status: s[:status], notes: s[:notes])
    s[:files].each do |filename, ct, body|
      rec.attachments.attach(io: StringIO.new(body),
                             filename: filename, content_type: ct)
    end
  end
end
puts "Seeded #{FileRecord.count if defined?(FileRecord)} file_records." rescue nil
