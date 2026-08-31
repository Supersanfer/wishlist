## What does this change?

<!-- One or two sentences. What problem does it solve? -->

## Checks

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm run test:db`

## If it touches the database

- [ ] New migration, no edits to applied ones
- [ ] RLS enabled and policies in the same migration
- [ ] Cases added to `supabase/tests/rls.test.mjs`
