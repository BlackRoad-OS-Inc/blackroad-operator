var builder = WebApplication.CreateBuilder(args);

// Example: register a tiny sample service (used in example endpoints/tests)
builder.Services.AddSingleton<IMyService, MyService>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

// Simple health endpoint used by tests and local checks
app.MapGet("/api/health", () => Results.Json(new { status = "ok" }));

// Example endpoint that uses DI to resolve a service
app.MapGet("/api/value", (IMyService svc) => Results.Ok(svc.GetValue()));

app.Run();

// Sample service and interface kept at the bottom of Program.cs for simplicity in this small project
public interface IMyService
{
    string GetValue();
}

public class MyService : IMyService
{
    public string GetValue() => "sample-value";
}

// Expose Program type for integration tests (WebApplicationFactory<T> requires a type)
public partial class Program { }
