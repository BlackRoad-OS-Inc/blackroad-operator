using UnityEngine; using UnityEngine.Networking; using System.Threading.Tasks;
public static class RegistryClient {
  public static string BaseUrl = "https://blackroad.network/api"; // change in inspector or via env
  public static async Task<string> Get(string path){
    using(var req = UnityWebRequest.Get($"{BaseUrl}{path}")) {
      var op = req.SendWebRequest(); while(!op.isDone) await System.Threading.Tasks.Task.Yield();
      return req.result==UnityWebRequest.Result.Success ? req.downloadHandler.text : "{}";
    }
  }
}
