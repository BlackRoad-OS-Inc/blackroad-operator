FROM denoland/deno:1.41.0
WORKDIR /app
COPY . .
RUN deno cache main.ts 2>/dev/null || deno cache mod.ts 2>/dev/null || true
ENV PORT=3000
EXPOSE 3000
CMD ["deno", "run", "--allow-all", "main.ts"]
