using System.Text.Json;

namespace GameForge.Online;

public sealed class RoomActions
{
    private readonly Dictionary<string, double> chatTimes = [];
    public void Forget(string playerId) => chatTimes.Remove(playerId);
    public bool AllowChat(string playerId)
    {
        if (Wire.Time - chatTimes.GetValueOrDefault(playerId) < 500) return false;
        chatTimes[playerId] = Wire.Time; return true;
    }
    public (object Reply, object? WorldChange, bool Completed) Apply(PlayerState player, JsonElement payload, WorldMap world, IEnumerable<PlayerState> players, ref int charge)
    {
        var id = Wire.Number(payload, "id");
        if (player.ActionResults.TryGetValue(id, out var cached)) return (cached, null, false);
        var action = Wire.Text(payload, "kind");
        string? error = null;
        object? change = null;
        var completed = false;
        var rules = world.Rules;
        var x = Wire.Number(payload, "x", -1);
        var y = Wire.Number(payload, "y", -1);
        var targetX = action == "interact" ? Wire.Number(rules.Beacon, "x") : (x + 0.5) * rules.TileSize;
        var targetY = action == "interact" ? Wire.Number(rules.Beacon, "y") : (y + 0.5) * rules.TileSize;
        var dx = targetX - player.X - rules.PlayerWidth / 2;
        var dy = targetY - player.Y - rules.PlayerHeight / 2;
        if (id <= 0) error = "Ação inválida.";
        else if (Wire.Time < player.NextActionAt) error = "Aguarde a ferramenta recarregar.";
        else if (dx * dx + dy * dy > rules.ActionReach * rules.ActionReach) error = "Aproxime-se do alvo.";
        else if (action == "interact")
        {
            if (player.Gems == 0) error = "Colete cristais e traga ao farol.";
            else { var before = charge; charge += player.Gems; player.Gems = 0; completed = before < rules.RequiredGems && charge >= rules.RequiredGems; }
        }
        else if (!world.Inside(x, y) || x < 8) error = "Área inicial protegida.";
        else if (!world.Visible(player, x, y)) error = "O alvo está atrás de um bloco.";
        else if (action == "mine")
        {
            var material = world.Get(x, y);
            if (material is null) error = "Não há bloco nesse alvo.";
            else { player.Inventory[material]++; change = world.Set(x, y, "air"); }
        }
        else if (action == "place")
        {
            var material = Wire.Text(payload, "material");
            if (!WorldMap.Types.Contains(material) || player.Inventory.GetValueOrDefault(material) <= 0) error = "Sem material na mochila.";
            else if (world.Solid(x, y) || players.Any(candidate => world.Overlaps(candidate, x, y))) error = "Espaço ocupado.";
            else { player.Inventory[material]--; change = world.Set(x, y, material); }
        }
        else error = "Ferramenta desconhecida.";
        if (error is null)
        {
            player.NextActionAt = Wire.Time + rules.ActionCooldown * 1000;
            player.Action = action; player.ActionUntil = Wire.Time + 300;
        }
        object reply = new { id, kind = action, accepted = error is null, message = error ?? (action == "interact" ? "Cristais entregues!" : ""), inventory = new Dictionary<string, int>(player.Inventory), player.Gems, charge, revision = world.Revision };
        if (player.ActionResults.Count >= 256) player.ActionResults.Remove(player.ActionResults.Keys.First());
        player.ActionResults[id] = reply;
        return (reply, change, completed);
    }
}
