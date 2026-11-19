using System.Text.Json;

namespace GameForge.Online;

public sealed class GameRules
{
    public int Version { get; init; }
    public int TickRate { get; init; }
    public int SnapshotRate { get; init; }
    public int Width { get; init; }
    public int Height { get; init; }
    public int TileSize { get; init; }
    public int GroundRow { get; init; }
    public double PlayerWidth { get; init; }
    public double PlayerHeight { get; init; }
    public double SpawnX { get; init; }
    public double SpawnY { get; init; }
    public double ActionReach { get; init; }
    public double ActionCooldown { get; init; }
    public int RequiredGems { get; init; }
    public JsonElement Movement { get; init; }
    public JsonElement Gap { get; init; }
    public JsonElement Beacon { get; init; }
    public JsonElement Platforms { get; init; }
    public JsonElement Crystals { get; init; }
    public double Move(string name) => Movement.GetProperty(name).GetDouble();
    public static GameRules Load(string path) => JsonSerializer.Deserialize<GameRules>(File.ReadAllText(path), Wire.Json)
        ?? throw new InvalidDataException("World rules are missing.");
}
