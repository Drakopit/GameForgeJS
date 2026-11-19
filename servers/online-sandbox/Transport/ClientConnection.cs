using System.Net.WebSockets;
using System.Text;

namespace GameForge.Online;

public sealed class ClientConnection(WebSocket socket) : IAsyncDisposable
{
    private readonly Queue<string> reliable = new();
    private readonly SemaphoreSlim wake = new(0, 1);
    private readonly CancellationTokenSource stopped = new();
    private string? latestState;
    private int windowMessages;
    private double windowStart = Wire.Time;
    public WebSocket Socket { get; } = socket;
    public Room? Room { get; set; }
    public PlayerState? Player { get; set; }
    public bool Alive => !stopped.IsCancellationRequested && Socket.State == WebSocketState.Open;

    public bool AllowMessage()
    {
        if (Wire.Time - windowStart >= 1000) { windowMessages = 0; windowStart = Wire.Time; }
        return ++windowMessages <= 100;
    }
    public void Send(string type, object payload, bool snapshot = false)
    {
        if (!Alive) return;
        var encoded = Wire.Encode(type, payload);
        lock (reliable)
        {
            if (snapshot) latestState = encoded;
            else if (reliable.Count < 64) reliable.Enqueue(encoded);
            else { Abort(); return; }
        }
        try { wake.Release(); } catch (SemaphoreFullException) { }
    }
    public async Task SendLoop()
    {
        try
        {
            while (Alive)
            {
                await wake.WaitAsync(stopped.Token);
                while (Alive)
                {
                    string? message;
                    lock (reliable)
                    {
                        message = reliable.Count > 0 ? reliable.Dequeue() : latestState;
                        if (reliable.Count == 0 && message == latestState) latestState = null;
                    }
                    if (message is null) break;
                    await Socket.SendAsync(Encoding.UTF8.GetBytes(message), WebSocketMessageType.Text, true, stopped.Token);
                }
            }
        }
        catch (Exception error) when (error is OperationCanceledException or WebSocketException) { }
    }
    public void Abort() { stopped.Cancel(); Socket.Abort(); }
    public ValueTask DisposeAsync() { Abort(); Socket.Dispose(); return ValueTask.CompletedTask; }
}
