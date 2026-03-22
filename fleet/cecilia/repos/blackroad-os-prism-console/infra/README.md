# Infra notes

Minimal deployment hints for Prism Console. Extend this with platform-specific modules as the console grows.

- Dockerfile is built for Node.js 20 and Next.js standalone output.
- Railway config (`railway.toml`) sets the web service and defaults to port 3000.
- Environment template lives in `../prisma-console.env.example`.
