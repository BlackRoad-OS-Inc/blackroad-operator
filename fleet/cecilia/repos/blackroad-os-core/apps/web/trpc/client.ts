import { createTRPCNext } from "@trpc/next";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../src/trpc/router";

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL || "/api/trpc",
          headers() {
            return {
              "x-client-version": "1.0.0",
            };
          },
        }),
      ],
    };
  },
  ssr: false
});
