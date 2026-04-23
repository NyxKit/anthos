# Data Model: Docker Integration

## Entities

### Deployment Package

Represents the distributable Anthos release intended for NAS use.

**Fields**:
- `name`: Human-readable package name.
- `releaseVersion`: Stable release label.
- `entryPoint`: Description of how the package starts the service.
- `supportedPlatform`: Target deployment environment.

### Runtime Configuration

Represents the operator-provided settings that control deployment behavior.

**Fields**:
- `hostPort`: Exposed port used to reach Anthos.
- `storagePath`: Host-mounted path used for persistent data.
- `serviceName`: Stable deployment name used by the operator.
- `imageIdentity`: Image label that identifies the Anthos release.

### Persistent Storage

Represents the host directory that retains Anthos data between runs.

**Fields**:
- `path`: Mounted location on the NAS.
- `writable`: Whether the service can write to it.
- `containsExistingData`: Whether previous Anthos data is already present.
- `lastVerifiedAt`: Most recent successful mount check.

### Release Version

Represents a specific version of Anthos used for repeatable upgrades.

**Fields**:
- `label`: Operator-visible version label.
- `status`: Current relationship to the running deployment.
- `notes`: Operator-facing update notes.

## Relationships

- A `Deployment Package` is started using one `Runtime Configuration`.
- A `Runtime Configuration` points to one `Persistent Storage` location.
- A `Runtime Configuration` references one `Release Version` at a time.
- A `Persistent Storage` location may be reused across multiple `Release Version` updates.

## Validation Rules

- The storage path must exist or be creatable before startup completes.
- The storage path must be writable for Anthos to keep data across restarts.
- The exposed host port must be available before the service starts.
- The same storage path must preserve existing data when a newer release is applied.
- The deployment name and release label must clearly identify Anthos to the operator.

## State Flow

### Deployment lifecycle

1. `undeployed`
2. `deployed`
3. `running`
4. `updating`
5. `running`
6. `failed`

### Storage lifecycle

1. `uninitialized`
2. `initialized`
3. `persisting`
4. `reused`
5. `unavailable`
