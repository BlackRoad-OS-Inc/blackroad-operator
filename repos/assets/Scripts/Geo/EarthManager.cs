using UnityEngine;
public class EarthManager : MonoBehaviour {
  public float radius=100f; public Texture2D earthTexture; public float rotationDegPerSec=0.5f;
  GameObject earth;
  void Start(){
    earth = GameObject.CreatePrimitive(PrimitiveType.Sphere);
    earth.name="Earth"; earth.transform.SetParent(transform,false);
    earth.transform.localScale = Vector3.one * radius * 2f;
    var mr = earth.GetComponent<MeshRenderer>();
    var mat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
    if(earthTexture) mat.mainTexture = earthTexture;
    mr.sharedMaterial = mat;
  }
  void Update(){ if(earth) earth.transform.Rotate(Vector3.up, rotationDegPerSec * Time.deltaTime, Space.World); }
  public GameObject AddMarker(string name, float lat, float lon, Color c, float size=1.5f){
    var m = GameObject.CreatePrimitive(PrimitiveType.Sphere); m.name = name;
    m.transform.SetParent(transform,false);
    m.transform.localScale = Vector3.one * size;
    var p = GeoUtils.LatLonToXYZ(lat, lon, radius+size);
    m.transform.position = p;
    var r = m.GetComponent<Renderer>(); r.sharedMaterial = new Material(Shader.Find("Universal Render Pipeline/Lit")) { color = c };
    return m;
  }
}
