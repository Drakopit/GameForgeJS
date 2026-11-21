namespace GameForge.Online;

public sealed class WorldMap
{
    private readonly Dictionary<(int X, int Y), string> blocks = [];
    public static readonly string[] Types = ["dirt", "stone", "wood", "grass"];
    public int Revision { get; private set; }
    public GameRules Rules { get; }
    public WorldMap(GameRules rules)
    {
        Rules = rules;
        for (var x = 0; x < rules.Width; x++)
        {
            if (x >= Wire.Number(rules.Gap, "from") && x <= Wire.Number(rules.Gap, "to")) continue;
            for (var y = rules.GroundRow; y < rules.Height; y++) blocks[(x, y)] = y == rules.GroundRow ? "grass" : y < rules.Height - 2 ? "dirt" : "stone";
        }
        foreach (var platform in rules.Platforms.EnumerateArray())
            for (var x = Wire.Number(platform, "x"); x < Wire.Number(platform, "x") + Wire.Number(platform, "length"); x++)
                blocks[(x, Wire.Number(platform, "y"))] = Wire.Text(platform, "type");
    }
    public bool Solid(int x, int y) => blocks.ContainsKey((x, y));
    public string? Get(int x, int y) => blocks.GetValueOrDefault((x, y));
    public bool Inside(int x, int y) => x >= 0 && y >= 0 && x < Rules.Width && y < Rules.Height;
    public bool Overlaps(PlayerState player, int x, int y) => player.X < (x + 1) * Rules.TileSize && player.X + Rules.PlayerWidth > x * Rules.TileSize
        && player.Y < (y + 1) * Rules.TileSize && player.Y + Rules.PlayerHeight > y * Rules.TileSize;
    public bool Visible(PlayerState player, int targetX, int targetY)
    {
        var fromX = player.X + Rules.PlayerWidth / 2;
        var fromY = player.Y + Rules.PlayerHeight / 2;
        var dx = (targetX + 0.5) * Rules.TileSize - fromX;
        var dy = (targetY + 0.5) * Rules.TileSize - fromY;
        var steps = Math.Max(1, (int)Math.Ceiling(Math.Sqrt(dx * dx + dy * dy) / 8));
        for (var step = 1; step < steps; step++)
        {
            var x = (int)Math.Floor((fromX + dx * step / steps) / Rules.TileSize);
            var y = (int)Math.Floor((fromY + dy * step / steps) / Rules.TileSize);
            if ((x != targetX || y != targetY) && Solid(x, y)) return false;
        }
        return true;
    }
    public object Set(int x, int y, string type)
    {
        if (type == "air") blocks.Remove((x, y)); else blocks[(x, y)] = type;
        Revision++;
        return new { x, y, type, revision = Revision };
    }
    public object[] Snapshot() => blocks.Select(block => (object)new { x = block.Key.X, y = block.Key.Y, type = block.Value }).ToArray();
}
