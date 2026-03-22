#if UNITY_EDITOR
using UnityEditor; using UnityEngine; using UnityEngine.SceneManagement; using UnityEditor.SceneManagement; using UnityEngine.UI; using TMPro;
public class IslandBuilder {
  [MenuItem("BlackRoad/Build Island")]
  public static void Build(){
    // Create Earth scene
    var earthScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
    earthScene.name="Earth";
    var root = new GameObject("World");
    var earthMgr = root.AddComponent<EarthManager>();
    earthMgr.radius = 100f;
    earthMgr.earthTexture = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Textures/Earth_8k.jpg");
    var cam = Camera.main.gameObject; cam.AddComponent<OrbitCamera>().target = root.transform;
    // Ellis marker (near 40.699N, -74.039W)
    earthMgr.AddMarker("Ellis Portal", 40.699f, -74.039f, new Color(0.2f,1f,0.8f), 2.5f)
            .AddComponent<ScenePortal>().sceneName="Ellis";
    EditorSceneManager.SaveScene(earthScene, "Assets/Scenes/Earth.unity");

    // Create Ellis scene
    var ellis = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
    ellis.name="Ellis";
    var floor = GameObject.CreatePrimitive(PrimitiveType.Plane); floor.name="Floor"; floor.transform.localScale = Vector3.one*2.5f;
    var light = Object.FindObjectOfType<Light>(); if(light){ light.intensity=1.2f; }
    // Kiosks
    MakeKiosk("Oath Kiosk", new Vector3(-3,0,0));
    MakeKiosk("SSN∞ Kiosk", new Vector3(-1,0,0));
    MakeKiosk("Covenants", new Vector3(1,0,0));
    MakeKiosk("Mentor Ring", new Vector3(3,0,0));
    // Intake UI
    var canvasGO = new GameObject("IntakeCanvas"); var canvas = canvasGO.AddComponent<UnityEngine.Canvas>(); canvas.renderMode = UnityEngine.RenderMode.ScreenSpaceOverlay;
    var tmpGO = new GameObject("StepTitle"); var title = tmpGO.AddComponent<TMPro.TextMeshProUGUI>(); tmpGO.transform.SetParent(canvasGO.transform,false); title.fontSize=38; title.text="Ellis Intake";
    var bodyGO = new GameObject("StepBody"); var body = bodyGO.AddComponent<TMPro.TextMeshProUGUI>(); bodyGO.transform.SetParent(canvasGO.transform,false); body.fontSize=24; body.rectTransform.anchoredPosition = new Vector2(0,-60);
    var btnGO = new GameObject("NextButton"); var btn = btnGO.AddComponent<UnityEngine.UI.Button>(); btnGO.transform.SetParent(canvasGO.transform,false);
    var btnTextGO = new GameObject("BtnText"); var btnText = btnTextGO.AddComponent<TMPro.TextMeshProUGUI>(); btnTextGO.transform.SetParent(btnGO.transform,false); btnText.text="Next";
    var flow = canvasGO.AddComponent<IntakeFlowController>();
    flow.stepTitle = title; flow.stepBody = body; flow.buttonText = btnText;
    btn.onClick.AddListener(flow.Next);
    // Portal back to Earth
    MakePortalBack();
    EditorSceneManager.SaveScene(ellis, "Assets/Scenes/Ellis.unity");
    Debug.Log("BlackRoad Island built. Open Scenes/Earth and press Play.");
  }
  static void MakeKiosk(string name, Vector3 pos){
    var k = GameObject.CreatePrimitive(PrimitiveType.Cube); k.name = name; k.transform.position = pos + Vector3.up*0.5f; k.transform.localScale = new Vector3(1,1,1);
    var aura = k.AddComponent<AgentAura>(); aura.meter = k.AddComponent<TrustMeter>();
  }
  static void MakePortalBack(){
    var p = GameObject.CreatePrimitive(PrimitiveType.Cylinder); p.name="PortalBack"; p.transform.position=new Vector3(0,0,6);
    var sp = p.AddComponent<ScenePortal>(); sp.sceneName="Earth";
  }
}
#endif
