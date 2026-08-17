// Vercel serverless function entry point. Deliberately imports app.ts (the
// pure Express app, no .listen() call) rather than index.ts — Vercel binds
// the HTTP server itself, and index.ts's dotenv loading is unnecessary
// here since Vercel injects env vars directly into process.env.
//
// The [...path] filename is Vercel's catch-all routing convention: every
// request under /api/* is handled by this one function, and Express's own
// router (mounted at /api in app.ts) does the actual route matching from
// there — identical to how the traditional Node server handles routing.
export { default } from "../artifacts/api-server/src/app";
