from typing import Optional, Dict, Any, List, Tuple

from gymnasium import spaces

from gameboy_worlds.emulation.pokemon.base_metrics import CorePokemonMetrics
from gameboy_worlds.utils import load_parameters, log_dict, log_info
from gameboy_worlds.emulation.pokemon.emulators import PokemonEmulator
from gameboy_worlds.emulation.pokemon.trackers import (
    PokemonRedStarterTracker,
    PokemonOCRTracker,
)
from gameboy_worlds.interface.environment import (
    DummyEnvironment,
    Environment,
    TestEnvironmentMixin,
    TrainEnvironmentMixin,
)
from gameboy_worlds.interface.controller import Controller

import gymnasium as gym
import numpy as np


class PokemonEnvironment(DummyEnvironment):
    """
    A basic Pokemon Environment.
    """

    REQUIRED_EMULATOR = PokemonEmulator
    REQUIRED_STATE_TRACKER = CorePokemonMetrics


class PokemonOCREnvironment(PokemonEnvironment):
    """
    A Pokemon Environment that includes OCR region captures and agent state.
    """

    REQUIRED_STATE_TRACKER = PokemonOCRTracker
    REQUIRED_EMULATOR = PokemonEmulator

    @staticmethod
    def override_emulator_kwargs(emulator_kwargs: dict) -> dict:
        Environment.override_state_tracker_class(
            emulator_kwargs, PokemonOCREnvironment.REQUIRED_STATE_TRACKER
        )
        return emulator_kwargs


class PokemonTestEnvironment(TestEnvironmentMixin, PokemonOCREnvironment):
    pass


class PokemonTrainEnvironment(TrainEnvironmentMixin, PokemonOCREnvironment):
    pass


class PokemonRedStarterChoiceEnvironment(PokemonOCREnvironment):
    """
    An environment which starts at the starter selection point in PokemonRed and terminates when the player selects a starter Pokemon.
    """

    REQUIRED_TRACKER = PokemonRedStarterTracker

    def override_emulator_kwargs(emulator_kwargs: dict) -> dict:
        """
        Override default emulator keyword arguments for this environment.
        """
        Environment.override_state_tracker_class(
            emulator_kwargs, PokemonRedStarterTracker
        )
        emulator_kwargs["init_state"] = "starter"
        return emulator_kwargs

    def determine_terminated(
        self,
        start_state,
        *,
        action=None,
        action_kwargs=None,
        transition_states=None,
        action_success=None,
    ) -> bool:
        super_terminated = super().determine_terminated(
            start_state=start_state,
            action=action,
            action_kwargs=action_kwargs,
            transition_states=transition_states,
            action_success=action_success,
        )
        if transition_states is None:
            return super_terminated
        states = transition_states
        for state in states:
            starter_chosen = state["pokemon_red_starter"]["current_starter"]
            if starter_chosen is not None:
                return True
        return super_terminated


class PokemonRedChooseCharmanderEnvironment(PokemonRedStarterChoiceEnvironment):
    """
    Reward the agent for choosing Charmander as quickly as possible.
    """

    STEP_WISE_REWARD = False

    def determine_reward(
        self,
        start_state,
        *,
        action=None,
        action_kwargs=None,
        transition_states=None,
        action_success=None,
    ) -> float:
        """
        Reward the agent for choosing Charmander as quickly as possible.
        """
        from gameboy_worlds.interface.action import LowLevelAction, LowLevelActions

        if transition_states is None:
            return 0.0
        current_state = transition_states[-1]
        starter_chosen = current_state["pokemon_red_starter"]["current_starter"]
        n_steps = current_state["core"]["steps"]
        if starter_chosen is None:
            if action == LowLevelAction and self.STEP_WISE_REWARD:
                if "low_level_action" in action_kwargs:
                    # reward for pressing A, penalty for pressing anything else
                    low_level_action = action_kwargs["low_level_action"]
                    if low_level_action == LowLevelActions.PRESS_BUTTON_A:
                        return 0.5
                    else:
                        return -0.1
            if n_steps >= self._emulator.max_steps - 2:  # some safety
                return -1.0  # Penalty for not choosing a starter within max steps
            else:
                return 0.0
        step_bonus = min(0.25 / (n_steps + 1), 0.5)
        if starter_chosen == "charmander":
            return 0.5 + step_bonus
        else:
            return (
                0.25 + step_bonus
            )  # Penalty for choosing the wrong starter. For now, just less reward.


class PokemonRedChooseCharmanderEasyEnvironment(PokemonRedChooseCharmanderEnvironment):
    def override_emulator_kwargs(emulator_kwargs: dict) -> dict:
        """
        Override default emulator keyword arguments for this environment.
        """
        Environment.override_state_tracker_class(
            emulator_kwargs, PokemonRedStarterTracker
        )
        emulator_kwargs["init_state"] = "test_starter_easy"
        return emulator_kwargs


class PokemonRedChooseCharmanderHardEnvironment(PokemonRedChooseCharmanderEnvironment):
    def override_emulator_kwargs(emulator_kwargs: dict) -> dict:
        """
        Override default emulator keyword arguments for this environment.
        """
        Environment.override_state_tracker_class(
            emulator_kwargs, PokemonRedStarterTracker
        )
        emulator_kwargs["init_state"] = "test_starter_hard"
        return emulator_kwargs
