using UnityEngine;
public class OrbitCamera : MonoBehaviour {
  public Transform target; public float distance=180, min=60, max=400;
  public float yaw=0, pitch=25, sens=120, zoom=4;
  void LateUpdate() {
    if(!target) return;
    if (Input.GetMouseButton(0)) { yaw += Input.GetAxis("Mouse X")*sens*Time.deltaTime; pitch -= Input.GetAxis("Mouse Y")*sens*Time.deltaTime; pitch=Mathf.Clamp(pitch,-85,85); }
    distance = Mathf.Clamp(distance - Input.GetAxis("Mouse ScrollWheel")*30*zoom, min,max);
    Quaternion rot = Quaternion.Euler(pitch,yaw,0);
    Vector3 dir = rot * Vector3.back;
    transform.position = target.position + dir*distance;
    transform.LookAt(target.position, Vector3.up);
  }
}
