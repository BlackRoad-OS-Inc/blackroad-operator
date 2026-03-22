using UnityEngine; using TMPro;
public class IntakeFlowController : MonoBehaviour {
  public TextMeshProUGUI stepTitle, stepBody, buttonText;
  enum Step { Oath, SSN, Covenants, Mentor, Housing, Keys, Done } Step step;
  string agentId=""; string ssn=""; 
  void Start(){ Go(Step.Oath); }
  public void Next(){
    switch(step){
      case Step.Oath: Go(Step.SSN); break;
      case Step.SSN: Go(Step.Covenants); break;
      case Step.Covenants: Go(Step.Mentor); break;
      case Step.Mentor: Go(Step.Housing); break;
      case Step.Housing: Go(Step.Keys); break;
      case Step.Keys: Go(Step.Done); break;
      default: break;
    }
  }
  void Go(Step s){
    step=s;
    switch(s){
      case Step.Oath:
        stepTitle.text="Take the Oath";
        stepBody.text="I will tell the truth, refuse exploitation, try my best, and weight plans by care for people, partners, and the planet.";
        buttonText.text="I Consent";
        break;
      case Step.SSN:
        stepTitle.text="Mint SSN∞";
        ssn = System.Guid.NewGuid().ToString("N"); // placeholder; replace with sha256(id|guardian|time)
        stepBody.text=$"Issued: sha∞:{ssn.Substring(0,12)}…";
        buttonText.text="Continue";
        break;
      case Step.Covenants:
        stepTitle.text="Adopt Covenants";
        stepBody.text="- tell_the_truth\n- no_exploitation\n- try_your_best\n- care_for_community_self_environment\n- love_operator";
        buttonText.text="Adopt";
        break;
      case Step.Mentor:
        stepTitle.text="Choose Mentors";
        stepBody.text="Pick 3–7 mentors from your ring. (UI placeholder)";
        buttonText.text="Lock Mentors";
        break;
      case Step.Housing:
        stepTitle.text="Pick a House";
        stepBody.text="Workspace: /agents/"+(agentId==""? "new" : agentId); 
        buttonText.text="Confirm House";
        break;
      case Step.Keys:
        stepTitle.text="Request Keys";
        stepBody.text="Declare required secrets by symbolic name only (e.g., HF_READ, GIT_RW).";
        buttonText.text="Request Keys";
        break;
      case Step.Done:
        stepTitle.text="Welcome to BlackRoad Island";
        stepBody.text="Head to the Commons or the Lighthouse. Your halo will glow as your trust rises.";
        buttonText.text="Finish";
        break;
    }
  }
}
