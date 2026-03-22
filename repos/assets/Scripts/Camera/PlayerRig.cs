using UnityEngine;
[RequireComponent(typeof(CharacterController))]
public class PlayerRig : MonoBehaviour {
  public float speed=6; CharacterController cc; void Awake(){ cc=GetComponent<CharacterController>(); }
  void Update(){
    float h=Input.GetAxisRaw("Horizontal"), v=Input.GetAxisRaw("Vertical");
    Vector3 move = (transform.right*h + transform.forward*v).normalized * speed;
    cc.SimpleMove(move);
  }
}
