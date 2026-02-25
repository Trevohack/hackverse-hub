

# How to Add Markdown Posts to Hackverse

Since this is a React SPA (not Astro SSR), there's no filesystem reading — posts live in a single file. Here's exactly how it works:

## Where to edit

**File:** `src/lib/posts.ts`

Scroll to the `markdownFiles` array (around line 100). Each post is an object with two fields:

```typescript
{
  path: "writeups/my-new-post",   // determines slug + type
  raw: `---
title: My Post Title
published: 2024-08-05
description: "Short description here"
tags: ["tag1", "tag2"]
category: Writeups
draft: false
---

Your markdown content here...
`
}
```

## Step-by-step to add a post

1. Open `src/lib/posts.ts` in the code editor
2. Find the `markdownFiles` array
3. Add a new object at the end — paste your entire `.md` content (frontmatter + body) inside the backtick template literal as the `raw` value
4. Set `path` to either `writeups/your-slug` or `blogs/your-slug` — this controls:
   - The URL: `/posts/writeups/your-slug`
   - The type filter on `/writeups` page

## Rules

| Path prefix | Type shown as | URL |
|---|---|---|
| `writeups/...` | Writeup | `/posts/writeups/...` |
| `blogs/...` | Blog | `/posts/blogs/...` |

- `draft: true` in frontmatter hides the post
- Images use standard markdown: `![](https://example.com/image.png)`
- Tags, category, reading time, and TOC are all auto-generated

## Limitation

Because Lovable runs React client-side only, you cannot drop `.md` files into a folder and have them appear. Every post must be pasted into the `markdownFiles` array. 

To get true filesystem-based posts (drop `.md` files on a VPS), you would need to either:
- **Port to Astro SSR** — the site's components and styles transfer directly
- **Add a tiny API server** alongside the SPA that reads `./posts/` and serves JSON

