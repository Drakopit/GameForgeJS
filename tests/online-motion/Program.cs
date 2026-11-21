using GameForge.Online;
using System.Text.Json;

// Deterministic offline harness. No debug endpoints or test commands in the game server.
var rules = GameRules.Load(args[0]);
var world = new WorldMap(rules);
var player = new PlayerState("Parity", 0, rules);
using var fixture = JsonDocument.Parse(File.ReadAllText(args[1]));
var frames = new List<object>();
foreach (var command in fixture.RootElement.EnumerateArray())
{
    var input = JsonSerializer.Deserialize<InputCommand>(command.GetRawText(), Wire.Json)!;
    MovementSimulation.Step(player, world, input, 1d / rules.TickRate);
    frames.Add(player.Snapshot());
}
Console.WriteLine(JsonSerializer.Serialize(frames, Wire.Json));
