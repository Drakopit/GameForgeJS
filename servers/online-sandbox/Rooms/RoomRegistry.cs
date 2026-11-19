using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text.Json;

namespace GameForge.Online;

public sealed class RoomRegistry(GameRules rules) : BackgroundService
{
    private readonly ConcurrentDictionary<string, Room> rooms = new();
    private readonly object creationGate = new();
    private int connections;
    public int Count => rooms.Count;
    public bool TryConnect()
    {
        if (Interlocked.Increment(ref connections) <= 256) return true;
        Interlocked.Decrement(ref connections); return false;
    }
    public void Disconnect() => Interlocked.Decrement(ref connections);
    public void Join(ClientConnection peer, JsonElement payload)
    {
        if (peer.Player is not null) { peer.Send("error", new { message = "A conexão já está em uma sala." }); return; }
        if (Wire.Number(payload, "protocol") != Wire.Protocol) { peer.Send("error", new { message = "Atualize o cliente: protocolo incompatível." }); return; }
        Room? room;
        if (Wire.Text(payload, "mode") == "create")
        {
            lock (creationGate)
            {
                if (rooms.Count >= 64) { peer.Send("error", new { message = "Servidor cheio. Tente novamente." }); return; }
                const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                do
                {
                    var code = new string(Enumerable.Range(0, 6).Select(_ => alphabet[RandomNumberGenerator.GetInt32(alphabet.Length)]).ToArray());
                    room = new Room(code, rules);
                } while (!rooms.TryAdd(room.Code, room));
            }
        }
        else if (!rooms.TryGetValue(Wire.Text(payload, "room").Trim().ToUpperInvariant(), out room))
        {
            peer.Send("error", new { message = "Sala não encontrada ou expirada." }); return;
        }
        room.Join(peer, payload);
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(1d / rules.TickRate));
        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
                foreach (var entry in rooms)
                {
                    entry.Value.Step(1d / rules.TickRate);
                    if (entry.Value.Expired) rooms.TryRemove(entry.Key, out _);
                }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
    }
}
