from gameboy_worlds.emulation.emulator import Emulator
from gameboy_worlds import AVAILABLE_GAMES
from gameboy_worlds.emulation.registry import GAME_TO_GB_NAME
from gameboy_worlds.utils import load_parameters, log_error
import click


@click.command()
@click.option(
    "--game",
    type=click.Choice(AVAILABLE_GAMES),
    help="Variant of the Pokemon game to create the first state for.",
)
@click.option(
    "--state_name",
    default="default",
    type=str,
    help="Name of the state to create, e.g., default",
)
def create_first_state(game: str, state_name: str):
    """Creates the first state for a given GameBoy ROM file."""
    parameters = load_parameters()
    if f"{game}_rom_data_path" not in parameters:
        log_error(
            f"ROM data path not found for game: {game}. Add {game}_rom_data_path to the config files. See configs/pokemon_red_vars.yaml for an example",
            parameters,
        )
    gb_path = parameters[f"{game}_rom_data_path"] + "/" + GAME_TO_GB_NAME[game]
    state_path = parameters[f"{game}_rom_data_path"] + f"/states/{state_name}"
    Emulator.create_first_state(gb_path, state_path)


if __name__ == "__main__":
    create_first_state()
