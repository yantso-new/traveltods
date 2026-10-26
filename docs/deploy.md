# Deploying

The frontend (Next.js on Vercel) and the backend (Convex) must ship together, otherwise the
deployed UI can call Convex functions that don't exist yet (or no longer exist).

## Vercel build command

Set the Vercel **Build Command** to:

```
npx convex deploy --cmd 'pnpm build'
```

and set `CONVEX_DEPLOY_KEY` (production deploy key from the Convex dashboard) in the Vercel
project's environment variables. `convex deploy` pushes `convex/` to the production deployment,
sets `NEXT_PUBLIC_CONVEX_URL` for the build, then runs `pnpm build`.

`pnpm build:vercel` runs the same thing via npm script (`convex deploy --cmd 'next build'`).

## Notes

- Almost every Convex mutation/action is `internal*` and cannot be called from the browser.
  Run admin work with `npx convex run <module>:<function> '<json args>'`
  (add `--prod` only when you intend to hit production).
- `waitlist.join` and `viator.fetchActivities` are the only public mutation/action.
