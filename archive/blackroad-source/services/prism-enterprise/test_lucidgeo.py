"""Integration tests for the LucidGeo FFI build.

Running these tests needs the LucidGeo toolchain and compiled foreign-function
interface libraries that are only produced in the internal build pipeline. The
CI workers used for pull requests do not have that toolchain installed, so we
document the limitation here and skip the suite until the artifacts are
available.
"""

import pytest

pytest.skip(
    "LucidGeo FFI toolchain is not installed on CI workers",
    allow_module_level=True,
)
