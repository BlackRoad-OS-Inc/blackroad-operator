using UnityEngine;
public static class GeoUtils {
  // lat,lon in degrees; radius in units (default 100)
  public static Vector3 LatLonToXYZ(float latDeg, float lonDeg, float radius=100f) {
    float lat = Mathf.Deg2Rad * latDeg;
    float lon = Mathf.Deg2Rad * lonDeg;
    float x = radius * Mathf.Cos(lat) * Mathf.Cos(lon);
    float y = radius * Mathf.Sin(lat);
    float z = radius * Mathf.Cos(lat) * Mathf.Sin(lon);
    return new Vector3(x,y,z);
  }
  public static Quaternion TangentRotation(float latDeg, float lonDeg) {
    Vector3 pos = LatLonToXYZ(latDeg, lonDeg);
    return Quaternion.LookRotation(pos.normalized, Vector3.up);
  }
}
