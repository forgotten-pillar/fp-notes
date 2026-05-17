import test, { describe } from "node:test"
import assert from "node:assert"
import { formatBroadcastResponse } from "./broadcaster"

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
