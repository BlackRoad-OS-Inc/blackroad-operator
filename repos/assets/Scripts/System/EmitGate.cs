using UnityEngine;
public static class EmitGate {
  // returns true if action can ship
  public static bool CanShip(bool inCovenant, float trust, float threshold=0.62f) => inCovenant && trust >= threshold;
}
