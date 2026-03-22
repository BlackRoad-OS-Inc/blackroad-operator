from gameboy_worlds import get_emulator, AVAILABLE_GAMES
import click


@click.command()
@click.option(
    "--game",
    type=click.Choice(AVAILABLE_GAMES),
    default="pokemon_red",
    help="Variant of the Pokemon game to emulate.",
)
@click.option(
    "--tracker_variant",
    type=str,
    default="default",
    help="Variant of the tracker to use.",
)
@click.option(
    "--init_state", type=str, default=None, help="Name of the initial state file"
)
def main(game, tracker_variant, init_state):
    env = get_emulator(
        game=game,
        init_state=init_state,
        headless=False,
        state_tracker_class=tracker_variant,
    )
    env._dev_play()


if __name__ == "__main__":
    main()
