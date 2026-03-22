# This file contains all the fundamental utilities that do not rely on any other file.
import os
import logging
import importlib.util
from typing import Dict


class RelativePathFormatter(logging.Formatter):
    def format(self, record):
        # record.pathname is the full system path
        path = record.pathname

        # Look for 'src' and keep everything after it
        if "src" in path:
            # Splits at 'src', takes the last part, and removes leading slashes
            record.custom_path = "gameboy_worlds" + path.split("gameboy_worlds")[-1]
        else:
            # Fallback to just the filename if 'src' isn't found
            record.custom_path = record.filename

        return super().format(record)


def get_logger(
    level: int = logging.INFO, filename: str = None, add_console: bool = True
) -> logging.Logger:
    """
    Sets up and returns a logger with specified configurations.
    Args:
        level (int, optional): Logging level. Defaults to logging.INFO.
        filename (str, optional): If provided, logs will be written to this file. Defaults to None.
        add_console (bool, optional): If True, logs will also be printed to the console. Defaults to True.
    Returns:
        logging.Logger: Configured logger instance.
    """
    fmt_str = "%(asctime)s, [%(levelname)s, %(custom_path)s:%(lineno)d] %(message)s"
    logging.basicConfig(format=fmt_str)
    logger = logging.getLogger("GameBoyWorlds-Server")
    if add_console:
        logger.handlers.clear()
        console_handler = logging.StreamHandler()
        log_formatter = RelativePathFormatter(fmt_str)
        console_handler.setFormatter(log_formatter)
        logger.addHandler(console_handler)
    if filename is not None:
        file_handler = logging.FileHandler(filename, mode="a")
        log_formatter = RelativePathFormatter(fmt_str)
        file_handler.setFormatter(log_formatter)
        logger.addHandler(file_handler)
    if level is not None:
        logger.setLevel(level)
        logger.propagate = False
    return logger


def meta_dict_to_str(
    meta_dict: dict,
    *,
    print_mode: bool = False,
    n_indents: int = 1,
    skip_write_timestamp: bool = True,
) -> str:
    """
    Converts a metadata dictionary to a string representation.
    Args:
        meta_dict (dict): The metadata dictionary to convert.
        print_mode (bool, optional): If True, formats the string for printing with indentation. Defaults to False.
        n_indents (int, optional): Number of indentation levels for print mode. Defaults to 1.
        skip_write_timestamp (bool, optional): If True, skips the 'write_timestamp' key in non-print mode. Defaults to True.
    Returns:
        str: String representation of the metadata dictionary.
    """
    keys = list(meta_dict.keys())
    # error out if None is a key
    if None in keys:
        raise ValueError("None cannot be a key in meta_dict")
    keys.sort()
    meta_str = ""
    for key in keys:
        if print_mode:
            indent = "\t" * n_indents
            element = meta_dict[key]
            element_str = None
            if isinstance(element, dict):
                element_str = "\n" + meta_dict_to_str(
                    element, print_mode=True, n_indents=n_indents + 1
                )
            else:
                element_str = str(element)
            meta_str += f"{indent}{key}: {element_str}\n"
        else:
            if skip_write_timestamp and key == "write_timestamp":
                continue
            meta_str += f"{key.lower().strip()}_{str(meta_dict[key]).lower().strip()}"
    return meta_str


def logger_print_dict(logger: logging.Logger, meta_dict: dict, n_indents: int = 1):
    """
    Logs the string representation of a metadata dictionary using the provided logger.
    Args:
        logger (logging.Logger): The logger to use for logging.
        meta_dict (dict): The metadata dictionary to log.
        n_indents (int, optional): Number of indentation levels for formatting. Defaults to 1.
    """
    meta_dict_str = meta_dict_to_str(
        meta_dict, print_mode=True, n_indents=n_indents, skip_write_timestamp=False
    )
    logger.info(meta_dict_str)


def file_makedir(file_path: str):
    """
    Ensures that the directory for the given file path exists. If not, it creates the necessary directories.
    Args:
        file_path (str): The file path for which to ensure the directory exists.
    """
    dirname = os.path.dirname(file_path)
    if dirname != "" and not os.path.exists(dirname):
        os.makedirs(dirname)
    return


def module_installed(name: str) -> bool:
    """
    Checks if a module with the given name is installed.
    Args:
        name (str): The name of the module to check.
    Returns:
        bool: True if the module is installed, False otherwise.
    """
    spec = importlib.util.find_spec(name)
    return spec is not None


def check_optional_installs(warn=False) -> Dict[str, bool]:
    """
    Check for installs of optional modules

    Args:
        warn: whether to log a warning if not found.

    Returns:
        optionals (dict): a dictionary where keys are optional config modes, and values are whether the packages required for basic imports are installed.
        This does not check internal requirements (e.g. `einops` may be needed for some models, etc.)
    """
    config_imports = {
        "vlm": ["transformers", "torch", "accelerate", "openai"],
    }
    if warn:
        logger = get_logger()
    configs = {}
    for config in config_imports:
        not_importable = []
        for module in config_imports[config]:
            if not module_installed(module):
                not_importable.append(module)
        if len(not_importable) > 0 and warn:
            logger.warning(
                f'Unable to find imports for the following modules of the {config} setting: {not_importable}. Some features will not be enabled.\nTo fix this, run `uv pip install -e ".[{config}]"` in the GameBoyWorlds repo.'
            )
        configs[config] = len(not_importable) == 0
    return configs
