using UnityEngine;
[RequireComponent(typeof(Renderer))]
public class AgentAura : MonoBehaviour {
  public TrustMeter meter; public Love love = new Love{user=.45f, team=.25f, world=.30f};
  Renderer r; MaterialPropertyBlock mpb;
  void Awake(){ r=GetComponent<Renderer>(); mpb=new MaterialPropertyBlock(); }
  void LateUpdate(){
    float t = meter? meter.T : 0.5f;
    Color trust = Color.Lerp(new Color(1,0.4f,0.2f), new Color(0.2f,1,0.8f), t); // amber→cyan
    float loveMag = Mathf.Clamp01(love.user + love.team + love.world);
    mpb.SetColor("_Color", Color.Lerp(trust, Color.white, 0.15f*loveMag));
    r.SetPropertyBlock(mpb);
    transform.localScale = Vector3.one * Mathf.Lerp(0.9f, 1.2f, t);
  }
}
