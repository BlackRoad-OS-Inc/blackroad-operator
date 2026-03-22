import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure.query(() => ({ msg: "core ready" }))
});

export type AppRouter = typeof appRouter;
