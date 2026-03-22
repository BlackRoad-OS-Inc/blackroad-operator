# Copilot Instructions

## Project Overview
This is a minimal ASP.NET Core 9.0 web application using the new minimal hosting model. The project follows modern .NET conventions with implicit usings, nullable reference types enabled, and a streamlined Program.cs structure.

## Architecture
- **Single-file startup**: `Program.cs` contains the entire application configuration using minimal APIs
- **Configuration-based**: Uses standard ASP.NET Core configuration with `appsettings.json` and environment-specific overrides
- **Minimal API pattern**: Endpoints are defined directly in `Program.cs` using `app.MapGet()` and similar methods

## Key Files & Structure
- `WebApplication1.csproj`: .NET 9.0 web SDK project with nullable reference types and implicit usings enabled
- `Program.cs`: Main application entry point with minimal hosting model - add new endpoints here
- `Properties/launchSettings.json`: Defines development profiles (HTTP on :5280, HTTPS on :7290)
- `appsettings.json` + `appsettings.Development.json`: Standard ASP.NET Core configuration pattern

## Development Workflows

### Running the Application
```bash
# From solution root
dotnet run --project WebApplication1

# Copilot instructions for this repository

This repo is a minimal ASP.NET Core 9.0 web app using the minimal hosting model. Keep changes small and follow the existing minimal-API pattern in `Program.cs`.

Quick facts
- Target: .NET 9 (net9.0) — see `WebApplication1/WebApplication1.csproj`
- Single entry: `WebApplication1/Program.cs` (use MapGet/MapPost etc.)
- Dev URLs: HTTP http://localhost:5280, HTTPS https://localhost:7290 (see `Properties/launchSettings.json`)

When to edit which file
- Add endpoints and light middleware in `Program.cs`.
- App-wide settings go in `appsettings.json`; environment overrides in `appsettings.Development.json`.
- Project-level settings (nullable/implicit usings) are in the .csproj.

Small contract for AI edits
- Inputs: small code changes (add endpoint, DI registration, config key)
- Outputs: edited C# files (usually `Program.cs`) and optionally `appsettings*.json` or `WebApplication1.csproj`
- Error modes: avoid breaking build; preserve implicit usings and nullable context

Concrete examples
- Add simple GET endpoint (place near existing MapGet in `Program.cs`):

	app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

- Register a simple service and use it in an endpoint:

	builder.Services.AddSingleton<IMyService, MyService>();
	app.MapGet("/api/value", (IMyService svc) => svc.GetValue());

Files to inspect when changing behavior
- `WebApplication1/Program.cs` — main program
- `WebApplication1/WebApplication1.csproj` — target framework, nullable/implicit usings
- `WebApplication1/Properties/launchSettings.json` — dev urls and environment
- `appsettings.json` / `appsettings.Development.json` — configuration

Build & run (what I verified locally from the repo layout)
```bash
# from repo root
dotnet build
dotnet run --project WebApplication1
```

Notes & gotchas discovered in this repo
- Minimal template: all app wiring lives in `Program.cs`. Don't introduce Startup/Host classes unless necessary.
- Nullable reference types are enabled; prefer explicit null handling and use `?` where appropriate.
- Implicit usings are enabled — don't add unnecessary using statements.

If something is unclear
- Tell me which conventions you want enforced (naming, error handling, logging format) and I will update these instructions.

Next steps I can take
- Add a short README with run/build snippets and common troubleshooting (ports, certificate for HTTPS).
- Add a small sample endpoint and unit test harness if you want examples to build on.
