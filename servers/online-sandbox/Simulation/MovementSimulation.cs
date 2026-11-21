namespace GameForge.Online;

// Mirrors PlatformerController + TilePlatformerWorld at the shared fixed step.
public static class MovementSimulation
{
    public static void Step(PlayerState player, WorldMap world, InputCommand? input, double dt)
    {
        var rules = world.Rules;
        var pressed = input?.JumpPressed == true;
        if (input is not null)
        {
            player.Axis = input.Axis; player.JumpHeld = input.JumpHeld; player.Ack = input.Seq;
        }
        player.CoyoteRemaining = player.Grounded ? rules.Move("coyoteTime") : Math.Max(0, player.CoyoteRemaining - dt);
        player.BufferRemaining = pressed ? rules.Move("jumpBufferTime") : Math.Max(0, player.BufferRemaining - dt);
        var requested = pressed || player.BufferRemaining > 0;
        if (requested && (player.Grounded || player.CoyoteRemaining > 0)) { Jump(player, rules); requested = false; }
        var target = player.Axis * rules.Move("speed");
        var amount = (player.Axis == 0 ? rules.Move("deceleration") : rules.Move("acceleration")) * dt;
        player.Vx += Math.Sign(target - player.Vx) * Math.Min(Math.Abs(target - player.Vx), amount);
        CutJump(player, rules);
        player.Vy = Math.Min(rules.Move("maxFallSpeed"), player.Vy + rules.Move("gravity") * dt);
        if (player.Axis != 0) player.FacingRight = player.Axis > 0;
        var steps = Math.Max(1, (int)Math.Ceiling(Math.Max(Math.Abs(player.Vx), Math.Abs(player.Vy)) * dt / (rules.TileSize / 2d)));
        for (var step = 0; step < steps; step++)
        {
            player.X += player.Vx * dt / steps; Resolve(player, world, true);
            player.Y += player.Vy * dt / steps; player.Grounded = false; Resolve(player, world, false);
            player.X = Math.Clamp(player.X, 0, rules.Width * rules.TileSize - rules.PlayerWidth);
        }
        player.Grounded = player.Vy >= 0 && Supported(player, world);
        if (player.Grounded) player.Vy = 0;
        if (player.X <= 0 && player.Vx < 0 || player.X >= rules.Width * rules.TileSize - rules.PlayerWidth && player.Vx > 0) player.Vx = 0;
        if (requested && player.Grounded) Jump(player, rules);
        if (player.Y > rules.Height * rules.TileSize + 128)
        {
            player.X = rules.SpawnX; player.Y = rules.SpawnY; player.Vx = player.Vy = 0;
            player.Grounded = false; player.CoyoteRemaining = player.BufferRemaining = 0; player.Spawn++;
        }
    }
    private static void Jump(PlayerState player, GameRules rules)
    {
        player.Vy = -rules.Move("jumpSpeed"); player.Grounded = false;
        player.CoyoteRemaining = player.BufferRemaining = 0; CutJump(player, rules);
    }
    private static void CutJump(PlayerState player, GameRules rules)
    {
        if (!player.JumpHeld) player.Vy = Math.Max(player.Vy, -rules.Move("jumpSpeed") * rules.Move("jumpCutRatio"));
    }
    private static bool Supported(PlayerState player, WorldMap world)
    {
        var size = world.Rules.TileSize;
        var bottom = player.Y + world.Rules.PlayerHeight;
        var row = (int)Math.Round(bottom / size);
        if (Math.Abs(bottom - row * size) >= 0.01) return false;
        for (var x = (int)Math.Floor(player.X / size); x <= (int)Math.Floor((player.X + world.Rules.PlayerWidth - 0.000001) / size); x++)
            if (world.Solid(x, row)) return true;
        return false;
    }
    private static void Resolve(PlayerState player, WorldMap world, bool horizontal)
    {
        var rules = world.Rules;
        var size = rules.TileSize;
        var velocity = horizontal ? player.Vx : player.Vy;
        if (velocity == 0) return;
        var minX = Math.Max(0, (int)Math.Floor(player.X / size) - 1);
        var maxX = Math.Min(rules.Width - 1, (int)Math.Floor((player.X + rules.PlayerWidth) / size) + 1);
        var minY = Math.Max(0, (int)Math.Floor(player.Y / size) - 1);
        var maxY = Math.Min(rules.Height - 1, (int)Math.Floor((player.Y + rules.PlayerHeight) / size) + 1);
        for (var y = minY; y <= maxY; y++) for (var x = minX; x <= maxX; x++)
        {
            if (!world.Solid(x, y) || !world.Overlaps(player, x, y)) continue;
            if (horizontal) { player.X = velocity > 0 ? x * size - rules.PlayerWidth : (x + 1) * size; player.Vx = 0; }
            else { player.Y = velocity > 0 ? y * size - rules.PlayerHeight : (y + 1) * size; player.Vy = 0; if (velocity > 0) player.Grounded = true; }
        }
    }
}
