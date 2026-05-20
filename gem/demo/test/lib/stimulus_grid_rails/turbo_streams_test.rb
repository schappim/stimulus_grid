require "test_helper"

class StimulusGridRails::TurboStreamsTest < ActiveSupport::TestCase
  TS = StimulusGridRails::TurboStreams

  test "cell renders action, hyphenated attrs, and value in a template" do
    html = TS.cell(grid: "athletes", row_id: 7, column: :age, value: 31, optimistic_id: "op-1")
    assert_includes html, 'action="cell"'
    assert_includes html, 'grid="athletes"'
    assert_includes html, 'row-id="7"'
    assert_includes html, 'column="age"'
    assert_includes html, 'optimistic-id="op-1"'
    assert_includes html, "<template>31</template>"
  end

  test "nil optimistic_id is dropped" do
    html = TS.cell(grid: "g", row_id: 1, column: :x, value: "v")
    refute_includes html, "optimistic-id"
  end

  test "values are HTML-escaped" do
    html = TS.cell(grid: "g", row_id: 1, column: :name, value: "<b>&")
    assert_includes html, "&lt;b&gt;&amp;"
    refute_includes html, "<b>&<"
  end

  test "cell_revert carries errors as JSON" do
    html = TS.cell_revert(grid: "g", row_id: 1, column: :age, value: 20,
                          errors: ["too small"], optimistic_id: "o")
    assert_includes html, 'action="cell-revert"'
    assert_includes html, %(errors="#{ERB::Util.html_escape(["too small"].to_json)}")
  end

  test "cell_conflict carries server + client values, no template" do
    html = TS.cell_conflict(grid: "g", row_id: 1, column: :age,
                            server_value: 5, client_value: 9, optimistic_id: "o")
    assert_includes html, 'action="cell-conflict"'
    assert_includes html, 'server-value="5"'
    assert_includes html, 'client-value="9"'
    refute_includes html, "<template>"
  end

  test "row_insert_sorted escapes the JSON payload" do
    payload = { id: 1, name: "A&B" }.to_json
    html = TS.row_insert_sorted(grid: "g", row_id: 1, payload: payload)
    assert_includes html, 'action="row-insert-sorted"'
    assert_includes html, ERB::Util.html_escape(payload)
  end

  test "row_remove has no template" do
    html = TS.row_remove(grid: "g", row_id: 9)
    assert_includes html, 'action="row-remove"'
    assert_includes html, 'row-id="9"'
    refute_includes html, "<template>"
  end

  test "bulk wraps inner streams in a single template" do
    a = TS.cell(grid: "g", row_id: 1, column: :a, value: 1)
    b = TS.cell(grid: "g", row_id: 1, column: :b, value: 2)
    html = TS.bulk(grid: "g", streams: [a, b])
    assert_includes html, 'action="bulk"'
    assert_includes html, "<template>#{a}#{b}</template>"
  end

  test "aggregate and presence build their actions" do
    assert_includes TS.aggregate(grid: "g", column: :gold, kind: "sum", value: 42),
                    'action="aggregate"'
    pres = TS.presence(grid: "g", row_id: 1, column: :age, user_id: 3,
                       user_label: "AB", active: true)
    assert_includes pres, 'action="presence"'
    assert_includes pres, 'active="true"'
  end
end
