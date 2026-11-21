using System.Text.Json;

namespace GameForge.Online;

public sealed class Room(string code, GameRules rules)
{
    private readonly object gate = new();
    private readonly Dictionary<string, PlayerState> players = [];
    private readonly HashSet<string> collected = [];
    private readonly WorldMap world = new(rules);
    private readonly RoomActions actions = new();
    private double lastActive = Wire.Time;
    private int tick;
    private int charge;
    public string Code { get; } = code;
    public bool Expired { get { lock (gate) return players.Count == 0 && Wire.Time - lastActive > 300000; } }

    public void Join(ClientConnection peer, JsonElement payload)
    {
        lock (gate)
        {
            var token = Wire.Text(payload, "resumeToken");
            var player = players.Values.FirstOrDefault(candidate => token.Length > 0 && candidate.Token == token);
            var resumed = player is not null;
            if (player is null)
            {
                if (players.Count >= 8) { peer.Send("error", new { message = "Sala cheia (8 jogadores)." }); return; }
                var name = Wire.Normalize(Wire.Text(payload, "name"), 20);
                player = new PlayerState(name.Length > 0 ? name : "Explorador", Math.Clamp(Wire.Number(payload, "color"), 0, 5), rules);
                players.Add(player.Id, player);
            }
            player.Connection?.Abort();
            player.Connection = peer; peer.Player = player; peer.Room = this;
            player.Inputs.Clear(); player.LastReceived = player.Ack; player.Axis = 0; player.JumpHeld = false;
            player.LastInputAt = lastActive = Wire.Time;
            SendBaseline(peer, resumed);
            Notice($"{player.Name} {(resumed ? "voltou" : "entrou")} na sala.");
        }
    }
    public void Disconnect(ClientConnection peer)
    {
        lock (gate)
        {
            var player = peer.Player;
            if (player?.Connection != peer) return;
            player.Connection = null; player.DisconnectedAt = Wire.Time;
            player.Axis = 0; player.JumpHeld = false; player.Inputs.Clear();
            Notice($"{player.Name} desconectou. Aguardando reconexão.");
        }
    }
    private void SendBaseline(ClientConnection peer, bool resumed) => peer.Send("joined", new {
        protocol = Wire.Protocol, room = Code, playerId = peer.Player!.Id, resumeToken = peer.Player.Token,
        resumed, serverTime = Wire.Time, tick, revision = world.Revision, blocks = world.Snapshot(),
        players = players.Values.Select(player => player.Snapshot()).ToArray(), collected = collected.ToArray(), charge
    });
    public void Handle(ClientConnection peer, string type, JsonElement payload)
    {
        lock (gate)
        {
            var player = peer.Player!;
            if (player.Connection != peer) return;
            switch (type)
            {
                case "inputs":
                    if (!payload.TryGetProperty("commands", out var commands) || commands.ValueKind != JsonValueKind.Array || commands.GetArrayLength() > 4) return;
                    foreach (var item in commands.EnumerateArray())
                    {
                        var seq = Wire.Number(item, "seq");
                        if (seq <= player.LastReceived || seq > 1000000000 || player.Inputs.Count >= 90) continue;
                        if (!item.TryGetProperty("axis", out var axisValue) || !axisValue.TryGetDouble(out var axis) || !double.IsFinite(axis) || Math.Abs(axis) > 1) continue;
                        var pressed = item.TryGetProperty("jumpPressed", out var jump) && jump.ValueKind == JsonValueKind.True;
                        var held = item.TryGetProperty("jumpHeld", out var hold) && hold.ValueKind == JsonValueKind.True;
                        player.Inputs.Enqueue(new InputCommand(seq, axis, pressed, held));
                        player.LastReceived = seq; player.LastInputAt = Wire.Time;
                    }
                    break;
                case "action":
                    var result = actions.Apply(player, payload, world, players.Values, ref charge);
                    peer.Send("action", result.Reply);
                    if (result.WorldChange is not null) Broadcast("world", result.WorldChange);
                    if (result.Completed) Notice("Farol restaurado! Continuem explorando e construindo juntos.");
                    break;
                case "chat":
                    var text = Wire.Normalize(Wire.Text(payload, "text"), 160);
                    if (text.Length > 0 && actions.AllowChat(player.Id)) Broadcast("chat", new { id = Guid.NewGuid(), playerId = player.Id, name = player.Name, text, system = false });
                    break;
                case "resync":
                    player.Inputs.Clear(); player.LastReceived = player.Ack;
                    SendBaseline(peer, true); break;
            }
        }
    }
    public void Step(double dt)
    {
        lock (gate)
        {
            tick++;
            foreach (var player in players.Values.ToArray())
            {
                if (player.Connection is null && Wire.Time - player.DisconnectedAt > 30000)
                {
                    players.Remove(player.Id); actions.Forget(player.Id); Notice($"{player.Name} saiu da sala."); continue;
                }
                if (Wire.Time - player.LastInputAt > 350) { player.Axis = 0; player.JumpHeld = false; player.Inputs.Clear(); }
                player.Inputs.TryDequeue(out var input);
                MovementSimulation.Step(player, world, input, dt);
                if (Wire.Time >= player.ActionUntil) player.Action = !player.Grounded ? "jump" : Math.Abs(player.Vx) > 1 ? "run" : "idle";
                foreach (var crystal in rules.Crystals.EnumerateArray())
                {
                    var id = Wire.Text(crystal, "id");
                    if (collected.Contains(id) || player.Connection is null) continue;
                    var dx = player.X + rules.PlayerWidth / 2 - Wire.Number(crystal, "x");
                    var dy = player.Y + rules.PlayerHeight / 2 - Wire.Number(crystal, "y");
                    if (dx * dx + dy * dy < 30 * 30)
                    {
                        collected.Add(id); player.Gems++;
                        Broadcast("pickup", new { id, playerId = player.Id });
                    }
                }
            }
            if (players.Values.Any(player => player.Connection is not null)) lastActive = Wire.Time;
            if (tick % (rules.TickRate / rules.SnapshotRate) == 0)
                Broadcast("state", new { tick, serverTime = Wire.Time, revision = world.Revision, charge,
                    players = players.Values.Select(player => player.Snapshot()).ToArray() }, true);
        }
    }
    private void Notice(string text) => Broadcast("chat", new { id = Guid.NewGuid(), name = "Sistema", text, system = true });
    private void Broadcast(string type, object payload, bool snapshot = false)
    {
        foreach (var player in players.Values) player.Connection?.Send(type, payload, snapshot);
    }
}
