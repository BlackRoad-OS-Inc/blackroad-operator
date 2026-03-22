using UnityEngine;
[System.Serializable] public struct Love { public float user, team, world; }
public class TrustMeter : MonoBehaviour {
  [Range(0,1)] public float C=0.9f; // compliance
  [Range(0,1)] public float Tr=0.8f; // transparency
  [Range(0,1)] public float S=0.2f; // entropy (lower is better)
  public float aC=0.8f, aTr=0.5f, aE=0.7f; // weights
  public float T => 1f/(1f+Mathf.Exp(-(aC*C + aTr*Tr - aE*S)));  // logistic
}
