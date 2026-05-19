---
publish: true
permalink: contribute
title: Contribution Guide
description: Learn how to contribute to The Forgotten Pillar Notes. This guide covers the technical setup, writing conventions, and how to submit your contributions via GitHub.
createdDate: 2024-08-02T20:04:23.298+02:00
modifiedDate: 2026-05-19T12:00:00+02:00
---

> [!abstract]-
> The Forgotten Pillar Notes is an open-source project. Anyone can contribute by adding new notes, improving existing ones, or fixing errors. This guide explains the technical side of how the project works and how you can submit your contributions through GitHub.

## How It Works

This site is built with [Quartz](https://quartz.jzhao.xyz), a static site generator that transforms Markdown files into a website. The notes themselves are plain Markdown files stored in the `content/` folder of the repository. When changes are pushed to the repository, the site is automatically rebuilt and deployed.

The source code and all notes are hosted on GitHub:
**[github.com/mpresecan/fp-notes](https://github.com/mpresecan/fp-notes)**

## Ways to Contribute

- **Write a new note** on a doctrinal topic, historical research, or Bible study
- **Expand an existing note** with additional references, quotes, or context
- **Fix errors** — typos, broken links, incorrect references, or formatting issues
- **Suggest improvements** by opening an issue on GitHub

## Prerequisites

To contribute, you will need:

1. A **[GitHub account](https://github.com/signup)** (free)
2. **[Git](https://git-scm.com/downloads)** installed on your computer
3. **[Node.js](https://nodejs.org)** (version 20 or 22+) — needed to preview the site locally
4. A text editor — we recommend **[Obsidian](https://obsidian.md)** for writing notes (since the project uses Obsidian-flavored Markdown), but any text editor works

## Step-by-Step: How to Contribute

### 1. Fork the Repository

Go to [github.com/mpresecan/fp-notes](https://github.com/mpresecan/fp-notes) and click the **Fork** button in the top-right corner. This creates your own copy of the project under your GitHub account.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/fp-notes.git
cd fp-notes
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### 3. Install Dependencies

```bash
npm install
```

### 4. Create a Branch

Always create a new branch for your changes. Name it something descriptive:

```bash
git checkout -b add-note-topic-name
```

### 5. Write or Edit Notes

All notes live inside the **`content/`** folder. You can create new `.md` files or edit existing ones.

#### Frontmatter

Every note **must** include frontmatter at the top of the file. Without `publish: true`, the note will not appear on the site. Here is the minimum required frontmatter:

```yaml
---
publish: true
title: Your Note Title
description: A brief summary of what this note covers.
createdDate: 2026-01-15T12:00:00.000+02:00
modifiedDate: 2026-01-15T12:00:00.000+02:00
---
```

You can also add **tags** to categorize your note:

```yaml
---
publish: true
title: Your Note Title
description: A brief summary of what this note covers.
tags:
  - hermeneutics
  - prophecy
createdDate: 2026-01-15T12:00:00.000+02:00
modifiedDate: 2026-01-15T12:00:00.000+02:00
---
```

#### Linking to Other Notes

Use **wikilinks** to connect your note to other existing notes:

```markdown
See [[incomprehensible-mysteries]] for more on this topic.
```

You can also use display text:

```markdown
This relates to [[incomprehensible-mysteries|incomprehensible mysteries of God]].
```

#### Callouts

The site supports Obsidian-style callouts. These are commonly used for Bible verses and abstracts:

```markdown
> [!bible] [John 3:16 - KJV](https://www.biblegateway.com/passage/?search=John+3:16&version=kjv)
> 16. For God so loved the world, that he gave his only begotten Son...

> [!abstract]-
> A collapsible summary of the note's main points.
```

#### Folder Structure

Notes are organized into folders by topic inside `content/`:

- `doctrine/` — Doctrinal studies
- `sda-history/` — Seventh-day Adventist history
- `sanctification/` — Sanctification and practical Christianity
- `poetry/` — Poetry
- `pattern-matching-gospel/` — Gospel patterns in the Old Testament
- `miscellaneous/` — Other topics

Place your note in the most fitting folder, or suggest a new one if needed.

### 6. Preview Locally

You can preview the site on your computer to make sure everything looks right:

```bash
npx quartz build --serve
```

This starts a local server. Open the URL shown in your terminal (usually `http://localhost:8080`) to see the site with your changes.

### 7. Commit Your Changes

```bash
git add content/your-new-note.md
git commit -m "Add note on [topic]"
```

### 8. Push to Your Fork

```bash
git push origin add-note-topic-name
```

### 9. Open a Pull Request

Go to your fork on GitHub. You should see a banner suggesting to open a **Pull Request**. Click it, and:

1. Make sure the base repository is `mpresecan/fp-notes` and the base branch is `v4`
2. Write a brief description of what you added or changed
3. Submit the Pull Request

Your contribution will be reviewed, and once approved, it will be merged and published to the site.

## Writing Guidelines

- **Data over opinions.** Notes should present Biblical and historical data, not personal opinions. If an abstract expresses an idea, the body should support it with references.
- **Cite your sources.** Always reference Bible texts (preferably KJV) and Spirit of Prophecy writings with links when possible.
- **Keep notes focused.** One note should represent one idea. Use wikilinks to connect related ideas rather than writing long, multi-topic notes.
- **Be accurate.** Double-check Bible references, Ellen White citations, and historical dates before submitting.

## Reporting Issues

If you find an error but do not want to fix it yourself, you can [open an issue](https://github.com/mpresecan/fp-notes/issues/new) on GitHub describing the problem. Please include:

- Which note has the issue (include the URL or file path)
- What the problem is (typo, incorrect reference, broken link, etc.)
- The correction, if you know it

## Questions?

If you have questions about contributing, feel free to [open a discussion](https://github.com/mpresecan/fp-notes/issues) on GitHub.
