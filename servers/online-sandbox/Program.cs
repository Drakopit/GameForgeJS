using GameForge.Online;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton(GameRules.Load(Path.Combine(AppContext.BaseDirectory, "config", "world.rules.json")));
builder.Services.AddSingleton<RoomRegistry>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<RoomRegistry>());
var app = builder.Build();
app.UseWebSockets(new WebSocketOptions { KeepAliveInterval = TimeSpan.FromSeconds(15) });
app.MapGet("/health", (RoomRegistry rooms) => Results.Ok(new { status = "ok", protocol = 1, rooms = rooms.Count }));
app.Map("/ws", WebSocketEndpoint.Handle);
app.Run();
