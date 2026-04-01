Import("env")

from pathlib import Path


def parse_env_file(file_path):
    values = {}
    if not file_path.exists():
        return values

    for raw_line in file_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()

    return values


def quoted(value):
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'\\"{escaped}\\"'


project_dir = Path(env.subst("$PROJECT_DIR"))
workspace_env = project_dir.parent / ".env"
config = parse_env_file(workspace_env)

string_keys = [
    "ANTHOS_NODE_ID",
    "ANTHOS_PORT_MODE",
    "ANTHOS_WIFI_SSID",
    "ANTHOS_WIFI_PASSWORD",
    "ANTHOS_API_BASE_URL",
    "ANTHOS_ENABLE_ENV_SENSOR",
]

defines = []
for key in string_keys:
    if key in config:
        defines.append((key, quoted(config[key])))

if defines:
    env.Append(CPPDEFINES=defines)
