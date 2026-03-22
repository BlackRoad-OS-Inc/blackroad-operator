import click
from gameboy_worlds import AVAILABLE_GAMES, get_available_init_states
from gameboy_worlds.utils import log_info, log_error
import pandas as pd


@click.command()
@click.option(
    "--game",
    type=click.Choice(AVAILABLE_GAMES),
    required=True,
    help="The game to list states for.",
)
def list_states(game):
    """Lists all available states for a given game."""
    states = get_available_init_states(game)
    if len(states) == 0:
        log_error(f"No available states found for game {game}.")
    state_dict = {"base": []}
    for state_name in states:
        if "_" in state_name:
            base_name = state_name.split("_")[0]
        else:
            base_name = "base"
        if base_name not in state_dict:
            state_dict[base_name] = []
        state_dict[base_name].append(state_name)
    for key in state_dict:
        state_dict[key].sort()
    format_str = f"Available states for game {game}:"
    for key in state_dict:
        format_str += f"\n  {key}:\n"
        for state_name in state_dict[key]:
            format_str += f"    - {state_name}\n"
    log_info(format_str)
    save_path = "tmp_state_list.csv"
    columns = ["name"]
    data = []
    for key in state_dict:
        for state_name in state_dict[key]:
            data.append([state_name])
    df = pd.DataFrame(data, columns=columns)
    df.to_csv(save_path, index=False)
    log_info(f"Saved state list to {save_path}")


if __name__ == "__main__":
    list_states()
