## What does this PR do?

<!-- One sentence summary -->

## Checklist

- [ ] Full files returned — no partial snippets unless explicitly agreed
- [ ] No `console.log` — all logging via `logger.ts`
- [ ] No `any` — strict TypeScript throughout (bridging raw WS data is the only exception)
- [ ] No new libraries introduced (unless explicitly agreed)
- [ ] WS message types are `snake_case` strings
- [ ] Zustand actions are verb-prefixed camelCase (`setMyId`, `registerPlayer`)
- [ ] File names are `kebab-case.ts` / `PascalCase.tsx`
- [ ] `CONTEXT.md` updated if architecture, file structure, or open tasks changed

## Does this change the WS protocol?

- [ ] No
- [ ] Yes — `PROTOCOL.md` in `mmo-shared` updated to match

## Does this require changes in `mmo-server` or `mmo-shared`?

- [ ] No
- [ ] Yes — follow-up tasks added to the relevant repo's `CONTEXT.md` open tasks
