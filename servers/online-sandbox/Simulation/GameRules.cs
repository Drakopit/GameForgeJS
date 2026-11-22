using System.Text.Json;
using System.Text.Json.Nodes;

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
    /// <summary>
    /// Loads world.rules.json plus the world layout scene (by default
    /// <c>../scenes/world.gfscene.json</c> relative to the rules file).
    /// </summary>
    public static GameRules Load(string path, string? scenePath = null)
    {
        var rules = JsonNode.Parse(File.ReadAllText(path))?.AsObject() ?? throw new InvalidDataException("World rules are missing.");
        scenePath ??= Path.Combine(Path.GetDirectoryName(path) ?? ".", "..", "scenes", "world.gfscene.json");
        if (File.Exists(scenePath)) WorldScene.Apply(rules, JsonNode.Parse(File.ReadAllText(scenePath))!.AsObject());
        return rules.Deserialize<GameRules>(Wire.Json) ?? throw new InvalidDataException("World rules are missing.");
    }
}
