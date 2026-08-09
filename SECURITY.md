# Security Policy

## Current Risk Surface (Phase 1)

Java-chan is, right now, a fully static, client-side app: React + Vite,
deployed to Vercel, with no backend, no database, and no user accounts.
Progress is stored entirely in the browser's `localStorage` and never
leaves the device. There's no PII collected, no payment flow, and no
server-side code to compromise.

That doesn't mean there's nothing to worry about. Realistic concerns at
this stage look more like:

- **Dependency vulnerabilities** — a compromised or vulnerable npm package
  pulled into the build.
- **XSS via lesson content** — this is why lesson prose is parsed into
  plain React children (`EmphasisText.jsx`, `emphasisParser.js`) rather
  than rendered with `dangerouslySetInnerHTML`. If you find a path where
  authored or user-influenced content ends up in the DOM unescaped,
  that's a real report.
- **Supply-chain issues in the build/deploy pipeline** (Vercel config,
  GitHub Actions if any get added later).

## Reporting a Vulnerability

Please **do not open a public GitHub issue** for a security concern.

Instead, use GitHub's private vulnerability reporting for this repo
([Security tab → "Report a vulnerability"](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan/security/advisories/new)),
or reach out directly through the
[Omega Mu Gamma Studio GitHub org](https://github.com/Omega-Mu-Gamma-Studio).

Include:
- What you found and where (file/line if you have it)
- Steps to reproduce
- What you think the actual impact is (a student's browser? the build
  pipeline? something else?)

This is a small student-run project, not a company with a dedicated
security team — we can't promise a bug bounty or a guaranteed SLA, but
we'll acknowledge reports promptly and credit you in the fix (unless you'd
rather stay anonymous).

## Phase 2 Note

Phase 2 (see `java-chan-schema-and-roadmap.md`) adds a real backend, user
accounts, and cross-device sync — a genuinely different risk surface
(auth, a database, an API). This policy will need a real rewrite once that
lands: session handling, data retention, and account-deletion requests
will all need actual answers instead of "there's no backend yet." Treat
this document as Phase 1-scoped and expect it to change.

## Supported Versions

Only the latest `main` branch is supported. This project doesn't maintain
long-term release branches at this stage.
