from typing import Dict, Type

from gameboy_worlds.interface.controller import Controller
from gameboy_worlds.interface.action import HighLevelAction
from gameboy_worlds.interface.legend_of_zelda.actions import (
    MoveAction,
    OpenInventoryAction,
    CloseInventoryAction,
    SkipDialogueAction,
    InteractAction,
    UseOtherInventoryItemAction,
)


class LegendOfZeldaStateWiseController(Controller):
    ACTIONS = [
        MoveAction,
        OpenInventoryAction,
        CloseInventoryAction,
        SkipDialogueAction,
        InteractAction,
        UseOtherInventoryItemAction,
    ]

    def string_to_high_level_action(self, input_str):
        text = input_str.lower().strip()
        if "(" not in text or ")" not in text:
            return None, None
        action_name = text.split("(")[0].strip()
        action_args_str = text.split("(")[1].split(")")[0].strip()
        if action_name == "openinventory":
            return OpenInventoryAction, {}
        if action_name == "closeinventory":
            return CloseInventoryAction, {}
        if action_name == "skipdialogue":
            return SkipDialogueAction, {}
        if action_name == "interact":
            return InteractAction, {}
        if action_name == "useotherinventoryitem":
            return UseOtherInventoryItemAction, {}
        if action_name == "move":
            parts = [
                x.strip()
                for x in action_args_str.replace(",", " ").split(" ")
                if x.strip()
            ]
            if len(parts) != 2:
                return None, None
            direction, steps_str = parts
            if (
                direction not in ["up", "down", "left", "right"]
                or not steps_str.isdigit()
            ):
                return None, None
            return MoveAction, {"direction": direction, "steps": int(steps_str)}
        return None, None

    def get_action_strings(
        self, return_all: bool = False
    ) -> Dict[Type[HighLevelAction], str]:
        free_roam_action_strings = {
            MoveAction: "move(<up/down/left/right> <steps>): Move in a direction for N steps.",
            OpenInventoryAction: "openinventory(): Open inventory.",
            InteractAction: "interact(): Interact using A button.",
            UseOtherInventoryItemAction: "useotherinventoryitem(): Use the secondary equipped item (B button).",
        }
        inventory_action_strings = {
            CloseInventoryAction: "closeinventory(): Close inventory.",
        }
        dialogue_action_strings = {
            SkipDialogueAction: "skipdialogue(): Progress dialogue.",
        }
        if return_all:
            return {
                **free_roam_action_strings,
                **inventory_action_strings,
                **dialogue_action_strings,
            }
        current_state = self._emulator.state_parser.get_agent_state(
            self._emulator.get_current_frame()
        )
        if current_state == "free_roam":
            return free_roam_action_strings
        if current_state == "in_inventory":
            return inventory_action_strings
        if current_state == "in_dialogue":
            return dialogue_action_strings
        if current_state in ["scene_transition", "in_cutscene"]:
            return {}
        return {
            **free_roam_action_strings,
            **inventory_action_strings,
            **dialogue_action_strings,
        }
