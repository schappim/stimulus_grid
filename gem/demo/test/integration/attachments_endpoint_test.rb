require "test_helper"

# End-to-end checks for the engine's AttachmentsController against the demo's
# FileRecord model (has_many_attached :attachments). Covers happy-path upload,
# multi-file upload, single-file remove, and the JSON shape the JS renderer
# expects.
class AttachmentsEndpointTest < ActionDispatch::IntegrationTest
  setup do
    @rec  = FileRecord.create!(name: "Test record", status: "draft")
    @base = StimulusGridRails.mount_path
  end

  def make_upload(filename, body, content_type)
    # Stash the tempfile on the instance so it isn't GC-closed before the
    # request actually consumes it (Rack::Test reads the path lazily).
    @_uploads ||= []
    t = Tempfile.new([File.basename(filename, ".*"), File.extname(filename)])
    t.binmode; t.write(body); t.rewind
    @_uploads << t
    Rack::Test::UploadedFile.new(t.path, content_type, original_filename: filename)
  end

  def upload_one(filename: "hello.txt", body: "hello", content_type: "text/plain")
    post "#{@base}/file_records/#{@rec.id}/attachments/attachments",
         params: { "files[]" => [make_upload(filename, body, content_type)] }
  end

  test "upload attaches the file and returns the JSON payload" do
    assert_difference -> { ActiveStorage::Attachment.count }, 1 do
      upload_one
    end
    assert_response :success
    json = JSON.parse(response.body)
    assert_kind_of Array, json["attachments"]
    assert_equal 1, json["attachments"].length
    att = json["attachments"].first
    %w[id filename url content_type byte_size signed_id].each do |k|
      assert att.key?(k), "missing key #{k} in #{att.inspect}"
    end
    assert_equal "hello.txt", att["filename"]
    assert_equal "text/plain", att["content_type"]
    assert_equal 5, att["byte_size"]
  end

  test "upload accepts multiple files in one request" do
    f1 = make_upload("a.txt", "a", "text/plain")
    f2 = make_upload("b.txt", "bb", "text/plain")
    assert_difference -> { ActiveStorage::Attachment.count }, 2 do
      post "#{@base}/file_records/#{@rec.id}/attachments/attachments",
           params: { "files[]" => [f1, f2] }
    end
    assert_response :success
    payload = JSON.parse(response.body)["attachments"]
    assert_equal 2, payload.length
    assert_equal %w[a.txt b.txt].sort, payload.map { |a| a["filename"] }.sort
  end

  test "image content type round-trips to a thumb_url" do
    file = make_upload("x.svg", "<svg xmlns='http://www.w3.org/2000/svg'/>", "image/svg+xml")
    post "#{@base}/file_records/#{@rec.id}/attachments/attachments",
         params: { "files[]" => [file] }
    assert_response :success
    att = JSON.parse(response.body)["attachments"].first
    assert_equal "image/svg+xml", att["content_type"]
    assert att["thumb_url"].present?, "image attachments should expose a thumb_url"
  end

  test "destroy removes the attachment and returns the updated payload" do
    upload_one(filename: "doomed.txt")
    att_id = JSON.parse(response.body)["attachments"].first["id"]
    assert_difference -> { ActiveStorage::Attachment.count }, -1 do
      delete "#{@base}/file_records/#{@rec.id}/attachments/attachments/#{att_id}"
    end
    assert_response :success
    assert_equal [], JSON.parse(response.body)["attachments"]
  end

  test "destroy is a no-op for an unknown attachment id" do
    upload_one
    assert_no_difference -> { ActiveStorage::Attachment.count } do
      delete "#{@base}/file_records/#{@rec.id}/attachments/attachments/999999"
    end
    assert_response :success
    assert_equal 1, JSON.parse(response.body)["attachments"].length
  end

  test "upload to a missing record returns 404 instead of crashing" do
    f = make_upload("x.txt", "x", "text/plain")
    post "#{@base}/file_records/999999/attachments/attachments",
         params: { "files[]" => [f] }
    assert_response :not_found
  end
end
