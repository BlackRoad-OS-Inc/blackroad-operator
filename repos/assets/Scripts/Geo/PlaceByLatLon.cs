using UnityEngine;
[ExecuteAlways]
public class PlaceByLatLon : MonoBehaviour {
  [Range(-90,90)] public float latitude;
  [Range(-180,180)] public float longitude;
  public float radius = 100f;
  void OnValidate(){ UpdatePos(); }
  void Reset(){ UpdatePos(); }
  void UpdatePos() {
    var p = GeoUtils.LatLonToXYZ(latitude, longitude, radius);
    transform.position = p;
    transform.rotation = Quaternion.LookRotation(p.normalized, Vector3.up);
  }
}
