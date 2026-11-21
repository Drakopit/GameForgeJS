namespace GameForge.Online;

public sealed class PlayerState(string name, int color, GameRules rules)
{
    public string Id { get; } = Guid.NewGuid().ToString("N");
    public string Token { get; } = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(24));
    public string Name { get; set; } = name;
    public int Color { get; set; } = color;
    public ClientConnection? Connection { get; set; }
    public Queue<InputCommand> Inputs { get; } = new();
    public Dictionary<string, int> Inventory { get; } = new() { ["wood"] = 12, ["dirt"] = 0, ["grass"] = 0, ["stone"] = 0 };
    public Dictionary<int, object> ActionResults { get; } = [];
    public int Gems { get; set; }
    public double X { get; set; } = rules.SpawnX;
    public double Y { get; set; } = rules.SpawnY;
    public double Vx { get; set; }
    public double Vy { get; set; }
    public bool Grounded { get; set; }
    public bool FacingRight { get; set; } = true;
    public double CoyoteRemaining { get; set; }
    public double BufferRemaining { get; set; }
    public bool JumpHeld { get; set; }
    public double Axis { get; set; }
    public int Ack { get; set; }
    public int LastReceived { get; set; }
    public int Spawn { get; set; }
    public double LastInputAt { get; set; } = Wire.Time;
    public double DisconnectedAt { get; set; }
    public double NextActionAt { get; set; }
    public string Action { get; set; } = "idle";
    public double ActionUntil { get; set; }
    public object Snapshot() => new { Id, Name, Color, X, Y, Vx, Vy, Grounded, FacingRight, Ack, Spawn,
        Axis, CoyoteRemaining, BufferRemaining, JumpHeld, Inventory, Gems, Action, connected = Connection is not null };
}
