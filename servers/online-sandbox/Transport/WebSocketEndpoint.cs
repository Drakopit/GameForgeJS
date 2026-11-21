using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace GameForge.Online;

public static class WebSocketEndpoint
{
    public static async Task Handle(HttpContext http)
    {
        if (!http.WebSockets.IsWebSocketRequest) { http.Response.StatusCode = 400; return; }
        var origins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:3000;http://127.0.0.1:3000;https://drakopit.github.io").Split(';');
        var origin = http.Request.Headers.Origin.ToString();
        if (origin.Length > 0 && !origins.Contains(origin) && !origins.Contains("*")) { http.Response.StatusCode = 403; return; }
        var registry = http.RequestServices.GetRequiredService<RoomRegistry>();
        if (!registry.TryConnect()) { http.Response.StatusCode = 503; return; }
        try
        {
            await using var peer = new ClientConnection(await http.WebSockets.AcceptWebSocketAsync());
            var sending = peer.SendLoop();
            var buffer = new byte[Wire.MaxMessageBytes];
            try
            {
                while (peer.Alive && !http.RequestAborted.IsCancellationRequested)
                {
                    using var deadline = CancellationTokenSource.CreateLinkedTokenSource(http.RequestAborted);
                    deadline.CancelAfter(TimeSpan.FromSeconds(peer.Room is null ? 10 : 45));
                    var count = 0;
                    WebSocketReceiveResult frame;
                    do
                    {
                        frame = await peer.Socket.ReceiveAsync(new ArraySegment<byte>(buffer, count, buffer.Length - count), deadline.Token);
                        if (frame.MessageType == WebSocketMessageType.Close) return;
                        count += frame.Count;
                        if (frame.MessageType != WebSocketMessageType.Text || count >= buffer.Length || !peer.AllowMessage()) { peer.Abort(); return; }
                    } while (!frame.EndOfMessage);
                    try
                    {
                        using var document = JsonDocument.Parse(Encoding.UTF8.GetString(buffer, 0, count));
                        var root = document.RootElement;
                        if (!root.TryGetProperty("payload", out var payload) || payload.ValueKind != JsonValueKind.Object) continue;
                        var type = Wire.Text(root, "type");
                        if (type == "hello") registry.Join(peer, payload);
                        else if (type == "ping") peer.Send("pong", new { echo = Wire.Number(payload, "echo"), serverTime = Wire.Time });
                        else if (peer.Room is not null) peer.Room.Handle(peer, type, payload);
                        else peer.Send("error", new { message = "Entre em uma sala primeiro." });
                    }
                    catch (Exception error) when (error is JsonException or InvalidOperationException or FormatException or OverflowException)
                    {
                        peer.Send("error", new { message = "Mensagem inválida." });
                    }
                }
            }
            catch (Exception error) when (error is WebSocketException or OperationCanceledException) { }
            finally
            {
                peer.Room?.Disconnect(peer);
                peer.Abort();
                await sending;
            }
        }
        finally { registry.Disconnect(); }
    }
}
