#!/usr/bin/env python3
"""Run production lifecycle logic on the host, without touching a device."""
import os
from pathlib import Path
import subprocess
import tempfile

node_dir = Path(__file__).resolve().parents[1]
arduino_json = node_dir / ".pio/libdeps/m5atoms3/ArduinoJson/src"
if not (arduino_json / "ArduinoJson.h").exists():
    raise SystemExit("ArduinoJson is missing; run `pio pkg install --project-dir node` first.")

with tempfile.TemporaryDirectory(prefix="anthos-host-tests-") as build_dir:
    executable = Path(build_dir) / "lifecycle"
    subprocess.run([
        os.environ.get("CXX", "c++"), "-std=c++17", "-Wall", "-Wextra", "-Werror",
        "-I", str(node_dir / "tests/host/stubs"),
        "-I", str(node_dir / "src"), "-I", str(arduino_json),
        str(node_dir / "tests/host/lifecycle.cpp"),
        *[str(node_dir / "src" / name) for name in [
            "NvsConfig.cpp", "AppConfig.cpp", "PowerPolicy.cpp",
            "SleepCoordinator.cpp", "DeviceResponseValidator.cpp",
        ]],
        "-o", str(executable),
    ], check=True)
    subprocess.run([str(executable)], check=True)
