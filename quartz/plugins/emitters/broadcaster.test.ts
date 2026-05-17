import test, { describe } from "node:test"
import assert from "node:assert"
import { updateFrontmatter } from "./broadcaster"

describe("updateFrontmatter", () => {
  test("replaces boolean broadcast: true with an ISO timestamp", () => {
    const input = `---
title: Hello
broadcast: true
---
Body text here.
`
    const iso = "2026-05-17T10:00:00.000Z"
    const out = updateFrontmatter(input, "broadcast", iso)
    assert.match(out, /^---\n/)
    assert.match(out, /title: Hello/)
    assert.match(out, new RegExp(`broadcast: ${iso}`))
    assert.doesNotMatch(out, /broadcast: true/)
    assert.match(out, /Body text here\./)
  })

  test("returns content unchanged when there is no frontmatter at all", () => {
    const input = `# Just markdown

No frontmatter here.
`
    const out = updateFrontmatter(input, "broadcast", "2026-05-17T10:00:00.000Z")
    assert.strictEqual(out, input)
  })

  test("returns content unchanged when frontmatter has no targeted key", () => {
    const input = `---
title: Hello
tags:
  - foo
  - bar
---
Body
`
    const out = updateFrontmatter(input, "broadcast", "2026-05-17T10:00:00.000Z")
    assert.strictEqual(out, input)
  })

  test("only rewrites the targeted key when multiple keys exist", () => {
    const input = `---
title: Hello
tags:
  - foo
broadcast: true
publish: true
---
Body
`
    const iso = "2026-05-17T10:00:00.000Z"
    const out = updateFrontmatter(input, "broadcast", iso)
    assert.match(out, /title: Hello/)
    assert.match(out, /tags:\n {2}- foo/)
    assert.match(out, new RegExp(`broadcast: ${iso}`))
    assert.match(out, /publish: true/)
    assert.doesNotMatch(out, /broadcast: true/)
  })

  test("replaces an existing ISO broadcast value with a new ISO value", () => {
    const oldIso = "2026-01-01T00:00:00.000Z"
    const newIso = "2026-05-17T10:00:00.000Z"
    const input = `---
title: Hello
broadcast: ${oldIso}
---
Body
`
    const out = updateFrontmatter(input, "broadcast", newIso)
    assert.match(out, new RegExp(`broadcast: ${newIso}`))
    assert.doesNotMatch(out, new RegExp(oldIso))
  })
})
