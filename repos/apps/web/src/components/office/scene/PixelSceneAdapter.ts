import type { SceneAdapter, AgentInfo, BubbleType } from "./SceneAdapter";
import type { OfficeState } from "../engine/officeState";
import type { AgentStatus } from "@office/shared";

/**
 * Delegates SceneAdapter methods to the pixel-art OfficeState engine.
 */
export class PixelSceneAdapter implements SceneAdapter {
  private officeState: OfficeState;
  private stopLoop: (() => void) | null;

  constructor(officeState: OfficeState, stopLoop: (() => void) | null) {
    this.officeState = officeState;
    this.stopLoop = stopLoop;
  }

  addAgent(agentId: string, info: AgentInfo): void {
    this.officeState.addCharacter(
      agentId, info.name, info.palette, info.isExternal, info.label, info.labelColor,
    );
  }

  removeAgent(agentId: string): void {
    this.officeState.removeCharacter(agentId);
  }

  updateAgent(agentId: string, status: AgentStatus, bubble: BubbleType | null, keepSeat?: boolean): void {
    this.officeState.updateCharacterStatus(agentId, status, keepSeat);
    if (bubble) {
      this.officeState.showBubble(agentId, bubble);
    } else {
      this.officeState.clearBubble(agentId);
    }
  }

  showSpeechBubble(agentId: string, text: string): void {
    this.officeState.showSpeechBubble(agentId, text);
  }

  selectAgent(agentId: string | null): void {
    this.officeState.selectCharacter(agentId);
  }

  dispose(): void {
    this.stopLoop?.();
    this.stopLoop = null;
  }

  /** Pixel-specific: access the underlying OfficeState for editor operations */
  getOfficeState(): OfficeState {
    return this.officeState;
  }
}
