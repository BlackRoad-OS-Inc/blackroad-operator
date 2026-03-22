# WebApplication1

Minimal ASP.NET Core 9.0 web app (Minimal API template).

Quick run

```bash
# From repository root
dotnet run --project WebApplication1

# Or from project directory
cd WebApplication1 && dotnet run
```

Build

```bash
dotnet build
```

Test (after tests are added)

```bash
dotnet test
```

Dev endpoints

- Root: `GET /` returns "Hello World!"
- Add new endpoints in `WebApplication1/Program.cs`

Dev URLs

- HTTP: http://localhost:5280
- HTTPS: https://localhost:7290

Notes

- Target framework: net9.0 (see `WebApplication1/WebApplication1.csproj`)
- Nullable reference types and implicit usings are enabled
- Keep changes minimal and prefer editing `Program.cs` for lightweight features
