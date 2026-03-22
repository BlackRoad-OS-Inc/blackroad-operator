using UnityEngine; using UnityEngine.SceneManagement;
public class ScenePortal : MonoBehaviour {
  public string sceneName;
  private void OnTriggerEnter(Collider other){
    if(other.CompareTag("Player")) SceneManager.LoadScene(sceneName, LoadSceneMode.Single);
  }
}
