namespace GameForge.Online;

public sealed record InputCommand(int Seq, double Axis, bool JumpPressed, bool JumpHeld);
