using System.Text.Json.Nodes;

namespace GameForge.Online;

/// <summary>
/// Applies the world layout from <c>config/scenes/world.gfscene.json</c> (a
/// gameforgejs.scene document edited in the GameForgeJS Editor) to the rules.
/// Mirrors <c>examples/online-sandbox-2d/src/data/WorldScene.js</c>: platforms snap
/// to tiles, crystals and the beacon are their marker centres, and the spawn is
/// the player's top-left corner.
/// </summary>
public static class WorldScene
{
    public static void Apply(JsonObject rules, JsonObject scene)
    {
        var size = rules["tileSize"]!.GetValue<double>();
        var nodes = scene["nodes"]?.AsArray() ?? [];
        var platforms = new JsonArray();
        var crystals = new JsonArray();
        foreach (var item in nodes)
        {
            if (item is not JsonObject node) continue;
            var layer = node["layer"]?.GetValue<string>();
            var (x, y) = Position(node);
            var (width, height) = Size(node);
            switch (layer)
            {
                case "platforms":
                    var platform = new JsonObject
                    {
                        ["x"] = (int)Math.Round(x / size),
                        ["y"] = (int)Math.Round(y / size),
                        ["length"] = Math.Max(1, (int)Math.Round(width / size)),
                    };
                    Copy(Component(node, "Platform"), platform);
                    platforms.Add(platform);
                    break;
                case "crystals":
                    var crystal = new JsonObject();
                    Copy(Component(node, "Crystal"), crystal);
                    crystal["x"] = Number(x + width / 2);
                    crystal["y"] = Number(y + height / 2);
                    crystals.Add(crystal);
                    break;
            }
            var id = node["id"]?.GetValue<string>();
            if (id == "spawn") { rules["spawnX"] = Number(x); rules["spawnY"] = Number(y); }
            if (id == "beacon") rules["beacon"] = new JsonObject { ["x"] = Number(x + width / 2), ["y"] = Number(y + height / 2) };
        }
        rules["platforms"] = platforms;
        rules["crystals"] = crystals;
    }

    static (double X, double Y) Position(JsonObject node)
    {
        var position = node["transform"]?["position"]?.AsArray();
        return position is { Count: >= 2 } ? (position[0]!.GetValue<double>(), position[1]!.GetValue<double>()) : (0, 0);
    }

    static (double Width, double Height) Size(JsonObject node)
    {
        var size = node["size"]?.AsArray();
        return size is { Count: >= 2 } ? (size[0]?.GetValue<double>() ?? 0, size[1]?.GetValue<double>() ?? 0) : (0, 0);
    }

    static JsonObject? Component(JsonObject node, string name) => node["components"]?[name] as JsonObject;

    static void Copy(JsonObject? source, JsonObject target)
    {
        if (source is null) return;
        foreach (var (key, value) in source) target[key] = value?.DeepClone();
    }

    /// <summary>Whole numbers stay integers so the JSON matches hand-written rules.</summary>
    static JsonNode Number(double value) => value == Math.Floor(value) && Math.Abs(value) < int.MaxValue ? JsonValue.Create((int)value) : JsonValue.Create(value);
}
