# 02: Clear the shadowed Vite config

**Type:** task · AFK
**Blocked by:** none (can start immediately)
**Claimed by:** opencode
**Status:** closed

## Question

None. Pure housekeeping, but it will silently eat a change later.

## What to build

Vite reads the config the project actually intends to edit.

## The finding

Three files were git-tracked:

```
vite.config.ts      ← the one you edit
vite.config.js      ← the one Vite uses
vite.config.d.ts    ← stale build artefact
```

Vite's resolution order (`node_modules/vite/dist/node/chunks/logger.js`) is:

```js
["vite.config.js", "vite.config.mjs", "vite.config.ts",
 "vite.config.cjs", "vite.config.mts", "vite.config.cts"]
```

`vite.config.js` wins. `vite.config.ts` is **never read.**

They were equivalent in effect — both are `defineConfig({ plugins: [react()] })`, differing
only in whitespace — so nothing was broken. That is exactly what makes it dangerous: the day
someone adds a `server.proxy` or a `define` for the Sawa AI work, it will go into the `.ts`, Vite
will keep using the `.js`, and the change will silently do nothing.

The `.js` and `.d.ts` were emit artefacts from a `tsc -b` run against `tsconfig.node.json`, which
has `composite: true` and **no** `noEmit`, so it wrote next to its input.

**This was not theoretical — it happened during ticket 09.** Two `npm run build` runs each rewrote
both files in place. Content was byte-identical, so `git diff` showed nothing, but git's status
went from clean to ` M` purely on line endings. Any build dirtied the working tree.

## What changed

| File | Change |
|---|---|
| `vite.config.js` | deleted |
| `vite.config.d.ts` | deleted |
| `tsconfig.node.json` | `outDir` + `tsBuildInfoFile` pointed into `node_modules/.tmp/` |

### Why an outDir and not `noEmit`

The ticket suggested "`noEmit: true` (or an output dir)". `noEmit` does not work here:

```
tsconfig.json(20,18): error TS6310: Referenced project
'D:/Projects/Akilisawa/tsconfig.node.json' may not disable emit.
```

`tsconfig.node.json` is a *referenced* project (`tsconfig.json:20`), and TypeScript forbids
`noEmit` in a composite or referenced project. So the outDir branch is the only one of the two
available. Emit still happens — the project exists precisely to typecheck the config — but it now
lands in `node_modules/.tmp/vite-config/`, which is ignored.

## Acceptance criteria

- [x] `vite.config.js` deleted.
- [x] `vite.config.d.ts` deleted.
- [x] `tsconfig.node.json` cannot regenerate them — `outDir` set to
      `./node_modules/.tmp/vite-config`, `tsBuildInfoFile` to `./node_modules/.tmp/`.
      Verified with `tsc -b --force`: exit 0, neither file reappears in the source tree, and both
      artefacts appear in the outDir instead.
- [x] `npm run dev` starts clean and picks up `vite.config.ts`. Verified behaviourally rather than
      by inspection: added `server: { port: 4387, strictPort: true }` to `vite.config.ts`, started
      `npx vite` with no CLI arguments, and got HTTP 200 on **4387** with nothing on the default
      5173. The probe was then reverted. If Vite were still reading a `.js`, the port would have
      been 5173.
- [x] `npm run build` still passes, and leaves the source tree clean —
      `vite.config.js` and `vite.config.d.ts` both still absent afterwards.
- [x] Gap analysis Tier 7.8 ticked off (and Tier 7.13, which ticket 09 resolved in passing).

## Notes

Part of the "Tier 0.3–0.5 makes every portal build throwaway" cluster at
`IMPLEMENTATION-GAP-ANALYSIS.md:412`. Small, but it belongs before the Sawa AI build needs a
`server.proxy` to point `/api/sawa` at a locally-running handler.

That handler is ticket 11. Adding `server.proxy` to `vite.config.ts` before this ticket landed
would have produced a dev server that ignored the proxy and a confusing 404 instead.