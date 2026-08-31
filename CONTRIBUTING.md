# Contributing

This is a small, personal project — but issues and pull requests are welcome.

## Before you open a PR

```bash
npm run lint
npm run typecheck
npm run build
npm run test:db
```

CI runs exactly those four on every pull request. If they pass locally, they'll
pass there.

## Workflow

1. Fork the repository and create a branch: `git checkout -b my-change`.
2. Make the change.
3. Run the four commands above.
4. Open the pull request, explaining what problem it solves.

Small, focused pull requests get reviewed. Large rewrites probably won't.

## Touching the database

Everything about permissions lives in `supabase/migrations/`. Two rules:

- **Never edit a migration that has already been applied.** Add a new one with
  `npx supabase migration new <name>`.
- **Every new table gets RLS enabled and its policies in the same migration**
  that creates it. A table without RLS is a security bug, not a to-do.

If you change a policy, add a case to `supabase/tests/rls.test.mjs`. That suite
runs against a real PostgreSQL and needs no Docker, so there's no excuse.

Gift reservations are the delicate part: the owner of a wish must never be able
to discover one, through any route. Read
[`supabase/README.md`](supabase/README.md) before touching `gift_reservations`.

## Style

Match the surrounding code. There's no separate style guide: ESLint and the
existing files are the guide. The project ships with a design system in
`src/app/globals.css` — use its tokens instead of hard-coded colours or sizes.
