import test, { describe } from "node:test"
import assert from "node:assert"
import { formatBroadcastResponse, pickBroadcastDescription } from "./broadcaster"

// Note: the age filter (MAX_BROADCAST_AGE_DAYS) is exercised end-to-end by the
// dry-run build verification, not by a unit test — mocking the full emit flow
// (content tree, ProcessedContent, ctx) would be more code than it's worth.

describe("pickBroadcastDescription", () => {
  test("returns fp-social-media when present and non-empty", () => {
    const out = pickBroadcastDescription(
      { "fp-social-media": "social tagline", description: "seo desc" },
      "auto preview",
    )
    assert.strictEqual(out, "social tagline")
  })

  test("returns description when fp-social-media missing", () => {
    const out = pickBroadcastDescription(
      { description: "seo desc" },
      "auto preview",
    )
    assert.strictEqual(out, "seo desc")
  })

  test("returns description when fp-social-media is whitespace-only", () => {
    const out = pickBroadcastDescription(
      { "fp-social-media": "   ", description: "seo desc" },
      "auto preview",
    )
    assert.strictEqual(out, "seo desc")
  })

  test("returns fallbackDescription when both frontmatter fields missing", () => {
    const out = pickBroadcastDescription({}, "auto preview")
    assert.strictEqual(out, "auto preview")
  })

  test("returns '' when everything is missing/empty", () => {
    assert.strictEqual(pickBroadcastDescription({}, ""), "")
    assert.strictEqual(pickBroadcastDescription({}, undefined), "")
    assert.strictEqual(
      pickBroadcastDescription({ "fp-social-media": "", description: "  " }, "   "),
      "",
    )
  })

  test("returns '' when frontmatter is undefined and no fallback", () => {
    assert.strictEqual(pickBroadcastDescription(undefined, undefined), "")
  })

  test("trims whitespace from the chosen value", () => {
    assert.strictEqual(
      pickBroadcastDescription({ "fp-social-media": "  social  " }, undefined),
      "social",
    )
    assert.strictEqual(
      pickBroadcastDescription({ description: "\n seo \t" }, undefined),
      "seo",
    )
    assert.strictEqual(pickBroadcastDescription(undefined, "  fallback  "), "fallback")
  })
})

describe("formatBroadcastResponse", () => {
  test("v1.1 happy path with sent, skipped and counts produces multi-line summary", () => {
    const out = formatBroadcastResponse({
      success: true,
      sent: ["a", "b"],
      skipped: ["c"],
      sentCount: 5,
      failedCount: 1,
      removedSubscriptions: 1,
    })
    assert.match(out, /^Broadcaster: POST succeeded$/m)
    assert.match(out, /^ {2}Sent \(2\): a, b$/m)
    assert.match(out, /^ {2}Skipped — already broadcast \(1\): c$/m)
    assert.match(out, /^ {2}Subscribers reached: 5, failed: 1, removed: 1$/m)
  })

  test("v1.1 all-skipped omits the Sent line", () => {
    const out = formatBroadcastResponse({
      success: true,
      sent: [],
      skipped: ["a"],
      sentCount: 0,
      failedCount: 0,
      removedSubscriptions: 0,
    })
    assert.match(out, /^Broadcaster: POST succeeded$/m)
    assert.match(out, /^ {2}Skipped — already broadcast \(1\): a$/m)
    assert.doesNotMatch(out, /^ {2}Sent /m)
    assert.match(out, /^ {2}Subscribers reached: 0, failed: 0, removed: 0$/m)
  })

  test("v1 fallback (no sent/skipped arrays) is a single-line summary", () => {
    const out = formatBroadcastResponse({
      success: true,
      sentCount: 10,
      failedCount: 0,
      removedSubscriptions: 0,
    })
    assert.strictEqual(out, "Broadcaster: POST succeeded — sent: 10, failed: 0, removed: 0")
  })

  test("null / non-object input returns the 'not parseable' message", () => {
    const expected = "Broadcaster: POST succeeded (response not parseable)"
    assert.strictEqual(formatBroadcastResponse(null), expected)
    assert.strictEqual(formatBroadcastResponse("some string"), expected)
  })
})
