using System.Text.Json;

namespace GameForge.Online;

public static class Wire
{
    public const int Protocol = 1;
    public const int MaxMessageBytes = 8192;
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    public static string Encode(string type, object payload) => JsonSerializer.Serialize(new { type, payload }, Json);
    public static string Text(JsonElement value, string key, string fallback = "") =>
        value.TryGetProperty(key, out var field) && field.ValueKind == JsonValueKind.String ? field.GetString() ?? fallback : fallback;
    public static int Number(JsonElement value, string key, int fallback = 0) =>
        value.TryGetProperty(key, out var field) && field.ValueKind == JsonValueKind.Number && field.TryGetInt32(out var number) ? number : fallback;
    public static string Normalize(string value, int length) =>
        string.Concat(string.Join(' ', value.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).EnumerateRunes().Take(length).Select(rune => rune.ToString()));
    public static double Time => System.Diagnostics.Stopwatch.GetTimestamp() * 1000d / System.Diagnostics.Stopwatch.Frequency;
}
