## Canonical Mounts

agents                 → /ai/agents
alexa                  → /home/alexa
analytics              → /var/analytics
api                    → /com/api
archive                → /var/archive
assets                 → /usr/share/assets
audit                  → /sys/audit
auth                   → /sys/auth
aws                    → /cloud/iaas/aws
backup                 → /var/backup
billing                → /sys/billing
blackroad-cli          → /usr/bin/blackroad-cli
blackroad-tools        → /usr/bin/blackroad-tools
blackroad.io           → /com/blackroad.io
brand                  → /usr/share/brand
cdn                    → /cloud/edge/cdn
cloudflare             → /cloud/edge/cloudflare
compliance             → /sys/compliance
data                   → /var/data
database               → /var/lib/database
digitalocean           → /cloud/iaas/digitalocean
dns                    → /cloud/net/dns
docs                   → /usr/share/docs
droplet                → /cloud/iaas/digitalocean/droplet
edge                   → /cloud/edge
email                  → /com/communications/email
experiments            → /usr/local/experiments
facebook               → /com/social/facebook
finance                → /sys/finance
identity               → /sys/identity
inbox                  → /home/alexa/inbox
index                  → /sys/index
infra                  → /cloud/infra
instagram              → /com/social/instagram
keys                   → /sys/keys
labs                   → /usr/local/labs
legacy                 → /usr/local/legacy
linkedin               → /com/social/linkedin
media                  → /usr/share/media
migration              → /usr/local/migration
network                → /cloud/net
notifications          → /com/communications/notifications
orchestration          → /os/orchestration
payments               → /sys/payments
portal                 → /com/portal
railway                → /cloud/paas/railway
research               → /usr/local/research
runtime                → /os/runtime
scheduler              → /os/scheduler
scratch                → /tmp/scratch
security               → /sys/security
skills-sdk             → /usr/lib/skills-sdk
support                → /com/support
tiktok                 → /com/social/tiktok
tools-api              → /usr/bin/tools-api
vercel                 → /cloud/edge/vercel
warehouse              → /var/lib/warehouse
web                    → /com/web
x                      → /com/social/x
youtube                → /com/social/youtube


---

## Canonical Mounts (promoted from audit)

agents-api                → /usr/bin/agents-api
api                       → /usr/bin/api
api-blackroad-io          → /usr/bin/api-blackroad-io
api-blackroadio           → /usr/bin/api-blackroadio

agents                    → /ai/agents
agent-registry            → /ai/agents/registry
agent-visualization-dashboard → /ai/agents/dashboard

arangodb                  → /var/data/arangodb
influxdb                  → /var/data/influxdb

auth-blackroad-io         → /sys/security/auth-blackroad-io
authelia                  → /sys/security/authelia

blackroad-gov-portal      → /com/web/blackroad-gov-portal
blackroad-infra-scanner   → /cloud/infra/blackroad-infra-scanner


---

## Canonical Mounts (cloud, data, web)

aws                     → /cloud/iaas/aws
cloudflare              → /cloud/edge/cloudflare
digitalocean            → /cloud/iaas/digitalocean
droplet                 → /cloud/iaas/digitalocean/droplet
railway                 → /cloud/paas/railway
vercel                  → /cloud/edge/vercel

arangodb-1              → /var/data/arangodb/replica
blackroad-influxdb      → /var/data/influxdb

portal                  → /com/portal
web                     → /com/web
admin-blackroad-io      → /com/admin/admin-blackroad-io
admin-blackroadio       → /com/admin/admin-blackroadio

analytics-blackroad-io  → /var/analytics/blackroad-io
analytics-blackroadio   → /var/analytics/blackroadio


---

## Canonical Mounts (databases, search, observability)

clickhouse               → /var/data/clickhouse
clickhouse-1             → /var/data/clickhouse/replica

opensearch               → /var/data/opensearch
opensearch-1             → /var/data/opensearch/replica

grafana                  → /usr/share/observability/grafana
blackroad-grafana        → /usr/share/observability/blackroad-grafana

prometheus               → /usr/share/observability/prometheus
blackroad-prometheus     → /usr/share/observability/blackroad-prometheus


---

## Canonical Mounts (AI runtimes & agents)

localai                 → /ai/runtime/localai
localai-1               → /ai/runtime/localai/replica

comfyui                 → /ai/runtime/comfyui

agents-blackroad-io     → /ai/agents/blackroad-io
agents-blackroadio      → /ai/agents/blackroadio

adaptive-edge-ai-optimizer → /ai/agents/optimizers/adaptive-edge
blackroad-fundraising-platform → /ai/agents/platforms/fundraising


---

## Canonical Mounts (security, identity, governance)

auth                    → /sys/security/auth
identity                → /sys/identity
keys                    → /sys/keys
audit                   → /sys/audit
compliance              → /sys/compliance
billing                 → /sys/billing
payments                → /sys/payments
finance                 → /sys/finance

authelia-1              → /sys/security/authelia/replica
headscale               → /sys/security/headscale

gov                     → /gov
policy                  → /gov/policy
rules                   → /gov/rules


---

## Canonical Mounts (communications & social)

email                  → /com/communications/email
notifications          → /com/communications/notifications
support                → /com/support

instagram              → /com/social/instagram
youtube                → /com/social/youtube
linkedin               → /com/social/linkedin
facebook               → /com/social/facebook
x                      → /com/social/x
tiktok                 → /com/social/tiktok


---

## Canonical Mounts (human)

alexa                  → /home/alexa
inbox                  → /home/alexa/inbox
vault                  → /home/vault

profile                → /home/alexa/profile
workspace              → /home/alexa/workspace
notes                  → /home/alexa/notes

identity               → /sys/identity/human
keys-human             → /sys/keys/human


---

## Canonical Mounts (governance)

gov                    → /gov
policy                 → /gov/policy
charter                → /gov/charter
constitution           → /gov/constitution

compliance             → /sys/compliance
audit                  → /sys/audit
records                → /sys/records

risk                   → /sys/risk
oversight              → /sys/oversight


---

## Canonical Mounts (tools)

tools                  → /usr/bin
tooling                → /usr/lib/tooling
toolchains             → /usr/lib/toolchains

blackroad-tools        → /usr/bin/blackroad-tools
blackroad-cli          → /usr/bin/blackroad-cli

ci                     → /usr/lib/ci
cd                     → /usr/lib/cd
pipelines              → /usr/lib/pipelines

build                  → /usr/lib/build
packaging              → /usr/lib/packaging
release                → /usr/lib/release

lint                   → /usr/lib/lint
format                 → /usr/lib/format
test                   → /usr/lib/test


---

## Canonical Mounts (runtime)

runtime                → /os/runtime
kernel                 → /os/kernel
scheduler              → /os/scheduler
orchestration          → /os/orchestration

services               → /os/services
workers                → /os/workers
daemons                → /os/daemons

logs                   → /var/log
state                  → /var/state
cache                  → /var/cache
sessions               → /var/sessions


---

## Canonical Mounts (network)

network                → /cloud/net
dns                    → /cloud/net/dns
routing                → /cloud/net/routing
gateway                → /cloud/net/gateway

vpn                    → /cloud/net/vpn
mesh                   → /cloud/net/mesh
tailscale              → /cloud/net/tailscale

firewall               → /cloud/net/firewall
load-balancer          → /cloud/net/load-balancer
proxy                  → /cloud/net/proxy


---

## Canonical Mounts (security)

security                → /sys/security
auth                    → /sys/security/auth
identity                → /sys/identity
iam                     → /sys/security/iam

keys                    → /sys/keys
secrets                 → /sys/keys/secrets
kms                     → /sys/keys/kms
vault                   → /sys/keys/vault

policies                → /sys/security/policies
compliance              → /sys/compliance
audit                   → /sys/audit

incident-response       → /sys/security/incident-response
forensics               → /sys/security/forensics


---

## Canonical Mounts (infrastructure)

infra                   → /cloud/infra
provisioning            → /cloud/infra/provisioning
terraform               → /cloud/infra/terraform
pulumi                  → /cloud/infra/pulumi

network                 → /cloud/net
vpc                     → /cloud/net/vpc
dns                     → /cloud/net/dns
firewall                → /cloud/net/firewall
load-balancer           → /cloud/net/load-balancer

compute                 → /cloud/compute
containers              → /cloud/compute/containers
kubernetes              → /cloud/compute/kubernetes
nodes                   → /cloud/compute/nodes

observability           → /cloud/observability
logging                 → /cloud/observability/logging
metrics                 → /cloud/observability/metrics
tracing                 → /cloud/observability/tracing


---

## Canonical Mounts (storage)

storage                 → /var/storage
volumes                 → /var/storage/volumes
blocks                  → /var/storage/blocks
objects                 → /var/storage/objects

backups                 → /var/backup
snapshots               → /var/backup/snapshots
archives                → /var/archive

cache                   → /var/cache
cdn-cache               → /var/cache/cdn

secrets                 → /sys/secrets
vault                   → /sys/secrets/vault


---

## Canonical Mounts (compute)

compute                 → /os/compute
runtime-local           → /os/compute/local
runtime-remote          → /os/compute/remote

workers                 → /os/compute/workers
jobs                    → /os/compute/jobs
queues                  → /os/compute/queues

containers              → /os/compute/containers
images                  → /os/compute/images

vm                      → /os/compute/vm
baremetal               → /os/compute/baremetal


---

## Canonical Mounts (network)

network-core            → /cloud/net
routing                 → /cloud/net/routing
gateway                 → /cloud/net/gateway
ingress                 → /cloud/net/ingress
egress                  → /cloud/net/egress

dns                     → /cloud/net/dns
ipam                    → /cloud/net/ipam

mesh                    → /cloud/net/mesh
overlay                 → /cloud/net/overlay
vpn                     → /cloud/net/vpn
tunnel                  → /cloud/net/tunnel

load-balancer           → /cloud/net/load-balancer
proxy                   → /cloud/net/proxy

firewall                → /sys/security/firewall
zero-trust              → /sys/security/zero-trust


---

## Canonical Mounts (storage)

storage                 → /var/storage
volumes                 → /var/storage/volumes
blocks                  → /var/storage/blocks
objects                 → /var/storage/objects
files                   → /var/storage/files

snapshots               → /var/storage/snapshots
replicas                → /var/storage/replicas
tiers                   → /var/storage/tiers

cache                   → /var/cache
buffer                  → /var/buffer

backup-store            → /var/backup/store
cold-storage            → /var/archive/cold


---

## Canonical Mounts (observability)

observability           → /sys/observability
metrics                 → /sys/observability/metrics
logs                    → /sys/observability/logs
traces                  → /sys/observability/traces
events                  → /sys/observability/events

monitoring              → /sys/observability/monitoring
alerting                → /sys/observability/alerting
dashboards              → /sys/observability/dashboards

profiling               → /sys/observability/profiling
health                  → /sys/observability/health
uptime                  → /sys/observability/uptime


---

## Canonical Mounts (hardware)

hardware                → /dev/hardware
devices                 → /dev/hardware/devices
sensors                 → /dev/hardware/sensors
actuators               → /dev/hardware/actuators

cpu                     → /dev/hardware/cpu
gpu                     → /dev/hardware/gpu
accelerators            → /dev/hardware/accelerators

memory                  → /dev/hardware/memory
storage                 → /dev/hardware/storage
disks                   → /dev/hardware/storage/disks
volumes                 → /dev/hardware/storage/volumes

network-interfaces      → /dev/hardware/network/interfaces
radios                  → /dev/hardware/network/radios
iot                     → /dev/hardware/iot

power                   → /dev/hardware/power
thermal                 → /dev/hardware/thermal
firmware                → /dev/hardware/firmware
bios                    → /dev/hardware/firmware/bios

embedded                → /dev/hardware/embedded
robotics                → /dev/hardware/robotics


---

## Canonical Mounts (network)

network-core            → /cloud/net/core
routing                 → /cloud/net/routing
switching               → /cloud/net/switching
firewalls               → /cloud/net/firewalls
load-balancers          → /cloud/net/load-balancers

vpn                     → /cloud/net/vpn
tailscale               → /cloud/net/vpn/tailscale
wireguard               → /cloud/net/vpn/wireguard

dns-zones               → /cloud/net/dns/zones
records                 → /cloud/net/dns/records
resolver                → /cloud/net/dns/resolver

ingress                 → /cloud/net/ingress
egress                  → /cloud/net/egress
peering                 → /cloud/net/peering

monitoring-net          → /cloud/net/monitoring
traffic                 → /cloud/net/traffic
qos                     → /cloud/net/qos


---

## Canonical Mounts (hardware)

hardware                → /dev/hardware
compute-nodes           → /dev/compute/nodes
accelerators            → /dev/compute/accelerators
gpus                    → /dev/compute/accelerators/gpu
npus                    → /dev/compute/accelerators/npu

storage                 → /dev/storage
disks                   → /dev/storage/disks
volumes                 → /dev/storage/volumes
backplanes              → /dev/storage/backplanes

sensors                 → /dev/sensors
cameras                 → /dev/sensors/cameras
lidar                   → /dev/sensors/lidar
radar                   → /dev/sensors/radar
imu                     → /dev/sensors/imu

peripherals             → /dev/peripherals
usb                     → /dev/peripherals/usb
serial                  → /dev/peripherals/serial
gpio                    → /dev/peripherals/gpio

power                   → /dev/power
psu                     → /dev/power/psu
battery                 → /dev/power/battery
thermal                 → /dev/power/thermal

firmware                → /dev/firmware
bootloaders             → /dev/firmware/bootloaders
bios                    → /dev/firmware/bios
uefi                    → /dev/firmware/uefi


---

## Canonical Mounts (governance)

governance              → /gov
policy                  → /gov/policy
constitution            → /gov/constitution
charters                → /gov/charters
bylaws                  → /gov/bylaws

authority               → /gov/authority
delegation              → /gov/delegation
roles                   → /gov/roles
permissions             → /gov/permissions

compliance               → /gov/compliance
regulatory               → /gov/compliance/regulatory
risk                     → /gov/compliance/risk
controls                 → /gov/compliance/controls

audit-log               → /gov/audit/log
decisions               → /gov/decisions
proposals               → /gov/proposals
votes                    → /gov/votes

treasury                → /gov/treasury
budgets                  → /gov/treasury/budgets
allocations              → /gov/treasury/allocations


---

## Canonical Mounts (hardware)

hardware                → /dev
boards                  → /dev/boards
sensors                 → /dev/sensors
actuators               → /dev/actuators

raspberry-pi            → /dev/boards/raspberry-pi
jetson                  → /dev/boards/jetson
x86                     → /dev/boards/x86

gpio                    → /dev/io/gpio
i2c                     → /dev/io/i2c
spi                     → /dev/io/spi
uart                    → /dev/io/uart

cameras                 → /dev/peripherals/cameras
displays                → /dev/peripherals/displays
audio                   → /dev/peripherals/audio
storage                 → /dev/peripherals/storage
network-cards           → /dev/peripherals/network

power                   → /dev/power
thermal                 → /dev/thermal
firmware                → /dev/firmware


---

## Canonical Mounts (network)

network                 → /cloud/net
lan                     → /cloud/net/lan
wan                     → /cloud/net/wan
mesh                    → /cloud/net/mesh
vpn                     → /cloud/net/vpn

dns                     → /cloud/net/dns
dhcp                    → /cloud/net/dhcp
firewall                → /cloud/net/firewall
routing                 → /cloud/net/routing
load-balancer           → /cloud/net/load-balancer

ingress                 → /cloud/net/ingress
egress                  → /cloud/net/egress
proxy                   → /cloud/net/proxy
gateway                 → /cloud/net/gateway

tls                     → /cloud/net/tls
certificates            → /cloud/net/certs
secrets                 → /cloud/net/secrets

monitoring              → /cloud/net/monitoring
traffic                 → /cloud/net/traffic
metrics                 → /cloud/net/metrics
logs                     → /cloud/net/logs


---

## Canonical Mounts (storage)

storage                 → /var/storage
block                   → /var/storage/block
object                  → /var/storage/object
file                    → /var/storage/file

volumes                 → /var/storage/volumes
snapshots               → /var/storage/snapshots
replicas                → /var/storage/replicas
backups                 → /var/storage/backups
archives                → /var/storage/archives

nfs                     → /var/storage/nfs
smb                     → /var/storage/smb
iscsi                   → /var/storage/iscsi

cache                   → /var/storage/cache
tiering                 → /var/storage/tiering
cold                    → /var/storage/cold
warm                    → /var/storage/warm
hot                     → /var/storage/hot

integrity               → /var/storage/integrity
encryption              → /var/storage/encryption
keys-storage            → /sys/keys/storage


---

## Canonical Mounts (compute)

compute                 → /compute
execution               → /compute/execution
workers                 → /compute/workers
jobs                    → /compute/jobs
tasks                   → /compute/tasks

runtimes                → /compute/runtimes
containers              → /compute/containers
images                  → /compute/images
pods                    → /compute/pods
services                → /compute/services

scheduler-compute       → /compute/scheduler
queues                  → /compute/queues
autoscaling             → /compute/autoscaling

gpu                     → /compute/gpu
cuda                    → /compute/gpu/cuda
tpu                     → /compute/tpu
accelerators            → /compute/accelerators

wasm                    → /compute/wasm
functions               → /compute/functions
edge-workers            → /compute/edge/workers

limits                  → /compute/limits
quotas                  → /compute/quotas
isolation               → /compute/isolation

logs-compute            → /var/log/compute
metrics-compute         → /var/metrics/compute


---

## Canonical Mounts (hardware)

hardware                → /dev/hardware
devices                 → /dev/devices
sensors                 → /dev/sensors
actuators               → /dev/actuators

cpu                     → /dev/cpu
memory                  → /dev/memory
storage                 → /dev/storage
nvme                    → /dev/storage/nvme
ssd                     → /dev/storage/ssd
hdd                     → /dev/storage/hdd

gpu-hw                  → /dev/gpu
nvidia                  → /dev/gpu/nvidia
amd                     → /dev/gpu/amd
intel                   → /dev/gpu/intel

network-hw              → /dev/network
ethernet                → /dev/network/ethernet
wifi                    → /dev/network/wifi
bluetooth               → /dev/network/bluetooth

usb                     → /dev/usb
pci                     → /dev/pci
serial                  → /dev/serial
i2c                     → /dev/i2c
spi                     → /dev/spi
gpio                    → /dev/gpio

power                   → /dev/power
thermal                 → /dev/thermal
fans                    → /dev/thermal/fans

firmware                → /sys/firmware
bios                    → /sys/firmware/bios
uefi                    → /sys/firmware/uefi

drivers                 → /sys/drivers
modules                 → /sys/modules


---

## Canonical Mounts (compute)

compute                 → /compute
execution               → /compute/execution
workers                 → /compute/workers
jobs                    → /compute/jobs
queues                  → /compute/queues

containers               → /compute/containers
docker                   → /compute/containers/docker
containerd               → /compute/containers/containerd
kubernetes               → /compute/orchestration/kubernetes
k3s                      → /compute/orchestration/k3s

functions                → /compute/functions
workers-edge             → /compute/functions/edge
workers-cloud            → /compute/functions/cloud

vm                       → /compute/vm
qemu                     → /compute/vm/qemu
kvm                      → /compute/vm/kvm

schedulers               → /compute/schedulers
cron                     → /compute/schedulers/cron
events                   → /compute/events

runtimes                 → /compute/runtimes
python                   → /compute/runtimes/python
node                     → /compute/runtimes/node
go                       → /compute/runtimes/go
rust                     → /compute/runtimes/rust


---

## Canonical Mounts (security)

security                 → /sys/security
auth                     → /sys/security/auth
identity                 → /sys/identity
keys                     → /sys/keys
secrets                  → /sys/keys/secrets
tokens                   → /sys/keys/tokens

iam                      → /sys/security/iam
rbac                     → /sys/security/iam/rbac
policies                 → /sys/security/policies

encryption               → /sys/security/encryption
kms                      → /sys/security/encryption/kms
vault                    → /sys/security/encryption/vault

certificates             → /sys/security/certificates
pki                      → /sys/security/pki
tls                      → /sys/security/tls

audit                    → /sys/audit
logs                     → /sys/security/logs
alerts                   → /sys/security/alerts
incidents                → /sys/security/incidents

compliance               → /sys/compliance
risk                     → /sys/security/risk
threat-models            → /sys/security/threat-models

firewall                 → /sys/security/firewall
waf                      → /sys/security/waf
rate-limits              → /sys/security/rate-limits

backup-keys              → /sys/keys/backup
rotation                 → /sys/keys/rotation


---

## Canonical Mounts (hardware)

hardware                 → /dev/hardware
devices                  → /dev/hardware/devices
sensors                  → /dev/hardware/sensors
actuators                → /dev/hardware/actuators

boards                   → /dev/hardware/boards
raspberry-pi             → /dev/hardware/boards/raspberry-pi
jetson                   → /dev/hardware/boards/jetson
microcontrollers         → /dev/hardware/boards/mcu

accelerators             → /dev/hardware/accelerators
gpu                      → /dev/hardware/accelerators/gpu
npu                      → /dev/hardware/accelerators/npu
fpga                     → /dev/hardware/accelerators/fpga

storage-devices          → /dev/hardware/storage
nvme                     → /dev/hardware/storage/nvme
ssd                      → /dev/hardware/storage/ssd
hdd                      → /dev/hardware/storage/hdd

network-devices          → /dev/hardware/network
nic                      → /dev/hardware/network/nic
switch                   → /dev/hardware/network/switch

power                    → /dev/hardware/power
battery                  → /dev/hardware/power/battery
ups                      → /dev/hardware/power/ups

firmware                 → /dev/hardware/firmware
bios                     → /dev/hardware/firmware/bios
uefi                     → /dev/hardware/firmware/uefi


---

## Canonical Mounts (compute)

compute                  → /compute
workers                  → /compute/workers
jobs                     → /compute/jobs
queues                   → /compute/queues

containers               → /compute/containers
docker                   → /compute/containers/docker
containerd               → /compute/containers/containerd

orchestration-runtime    → /compute/orchestration
kubernetes               → /compute/orchestration/kubernetes
k3s                      → /compute/orchestration/k3s
nomad                    → /compute/orchestration/nomad

functions                → /compute/functions
serverless               → /compute/functions/serverless
workers-edge             → /compute/functions/edge

schedulers               → /compute/schedulers
cron                     → /compute/schedulers/cron
batch                    → /compute/schedulers/batch

execution                → /compute/execution
sandbox                  → /compute/execution/sandbox
vm                        → /compute/execution/vm


---

## Canonical Mounts (storage)

storage                  → /storage
volumes                  → /storage/volumes
mounts                   → /storage/mounts

block                    → /storage/block
filesystem               → /storage/filesystem
object                   → /storage/object

s3                       → /storage/object/s3
r2                       → /storage/object/r2
gcs                      → /storage/object/gcs
azure-blob               → /storage/object/azure-blob

nfs                      → /storage/filesystem/nfs
ceph                     → /storage/filesystem/ceph
gluster                  → /storage/filesystem/gluster

snapshots                → /storage/snapshots
replication              → /storage/replication
tiers                    → /storage/tiers

cold                     → /storage/tiers/cold
warm                     → /storage/tiers/warm
hot                      → /storage/tiers/hot

cache                    → /storage/cache
redis                    → /storage/cache/redis
memcached                → /storage/cache/memcached


---

## Canonical Mounts (hardware)

hardware                 → /dev
devices                  → /dev/devices
drivers                  → /dev/drivers
firmware                 → /dev/firmware

cpu                      → /dev/cpu
gpu                      → /dev/gpu
tpu                      → /dev/tpu
npu                      → /dev/npu
fpga                    → /dev/fpga

memory                   → /dev/memory
storage-devices          → /dev/storage
network-devices          → /dev/network

sensors                  → /dev/sensors
cameras                  → /dev/cameras
audio                    → /dev/audio
input                    → /dev/input
usb                      → /dev/usb
pci                      → /dev/pci

power                    → /dev/power
battery                  → /dev/power/battery
thermal                  → /dev/thermal
cooling                  → /dev/cooling

boards                   → /dev/boards
raspberrypi              → /dev/boards/raspberrypi
jetson                   → /dev/boards/jetson
microcontroller          → /dev/boards/microcontroller


---

## Canonical Mounts (network)

network                 → /net
interfaces              → /net/interfaces
routing                 → /net/routing
firewall                → /net/firewall
nat                     → /net/nat

dns                     → /net/dns
dhcp                    → /net/dhcp
ntp                     → /net/ntp

vpn                     → /net/vpn
wireguard               → /net/vpn/wireguard
tailscale               → /net/vpn/tailscale
zerotier                → /net/vpn/zerotier

proxy                   → /net/proxy
reverse-proxy           → /net/proxy/reverse
load-balancer           → /net/load-balancer

ingress                 → /net/ingress
egress                  → /net/egress

http                    → /net/http
https                   → /net/https
grpc                    → /net/grpc
websocket               → /net/websocket

monitoring              → /net/monitoring
metrics                 → /net/monitoring/metrics
logs                    → /net/monitoring/logs
traces                  → /net/monitoring/traces


---

## Canonical Mounts (observability)

observability           → /observability
telemetry               → /observability/telemetry

logging                 → /observability/logging
logs                    → /observability/logging/logs
audit-logs              → /observability/logging/audit

metrics                 → /observability/metrics
prometheus              → /observability/metrics/prometheus
grafana                 → /observability/metrics/grafana

tracing                 → /observability/tracing
opentelemetry           → /observability/tracing/opentelemetry
jaeger                  → /observability/tracing/jaeger

profiling               → /observability/profiling
pprof                   → /observability/profiling/pprof

alerts                  → /observability/alerts
incidents               → /observability/incidents
status                  → /observability/status

health                  → /observability/health
uptime                  → /observability/uptime


---

## Canonical Mounts (compute)

compute                  → /compute
execution                → /compute/execution
runtimes                 → /compute/runtimes

containers               → /compute/containers
docker                   → /compute/containers/docker
containerd               → /compute/containers/containerd
podman                   → /compute/containers/podman

orchestration            → /compute/orchestration
kubernetes               → /compute/orchestration/kubernetes
k3s                      → /compute/orchestration/k3s
nomad                    → /compute/orchestration/nomad

workers                  → /compute/workers
jobs                     → /compute/jobs
queues                   → /compute/queues

functions                → /compute/functions
workers-edge             → /compute/functions/edge
workers-serverless       → /compute/functions/serverless

vm                       → /compute/vm
qemu                     → /compute/vm/qemu
kvm                      → /compute/vm/kvm
firecracker              → /compute/vm/firecracker

schedulers               → /compute/schedulers
autoscaling              → /compute/autoscaling


---

## Canonical Mounts (security)

security                → /security
policies                → /security/policies
controls                → /security/controls

identity                → /security/identity
iam                     → /security/identity/iam
sso                     → /security/identity/sso
directory               → /security/identity/directory

authentication          → /security/authentication
authorization           → /security/authorization
sessions                → /security/sessions

keys                    → /security/keys
secrets                 → /security/secrets
vault                   → /security/secrets/vault
kms                     → /security/keys/kms
hsm                     → /security/keys/hsm

certificates            → /security/certificates
pki                     → /security/certificates/pki
tls                     → /security/certificates/tls

encryption              → /security/encryption
at-rest                 → /security/encryption/at-rest
in-transit              → /security/encryption/in-transit

vulnerability           → /security/vulnerability
scanning                → /security/vulnerability/scanning
patching                → /security/vulnerability/patching

threat-detection        → /security/threat-detection
siem                    → /security/threat-detection/siem
soc                     → /security/threat-detection/soc

incident-response       → /security/incident-response
forensics               → /security/forensics

compliance              → /security/compliance
audit                   → /security/audit
risk                    → /security/risk


---

## Canonical Mounts (governance)

governance              → /governance
charters                → /governance/charters
policies                → /governance/policies
standards               → /governance/standards

decision-making         → /governance/decisions
approvals               → /governance/approvals
delegations             → /governance/delegations

legal                   → /governance/legal
contracts               → /governance/legal/contracts
ip                      → /governance/legal/ip
licensing               → /governance/legal/licensing

risk                    → /governance/risk
ethics                  → /governance/ethics
privacy                 → /governance/privacy

records                 → /governance/records
minutes                 → /governance/records/minutes
filings                 → /governance/records/filings

roadmap                 → /governance/roadmap
milestones              → /governance/roadmap/milestones


---

## Canonical Mounts (data)

data                    → /data
datasets                → /data/datasets
raw                     → /data/raw
processed               → /data/processed
curated                 → /data/curated

databases               → /data/databases
sql                     → /data/databases/sql
postgres                → /data/databases/sql/postgres
mysql                   → /data/databases/sql/mysql
sqlite                  → /data/databases/sql/sqlite

nosql                   → /data/databases/nosql
mongodb                 → /data/databases/nosql/mongodb
cassandra               → /data/databases/nosql/cassandra
redis                   → /data/databases/nosql/redis

search                  → /data/search
opensearch              → /data/search/opensearch
elasticsearch           → /data/search/elasticsearch

warehouse               → /data/warehouse
lake                    → /data/lake
lakehouse               → /data/lakehouse

streams                 → /data/streams
kafka                   → /data/streams/kafka
nats                    → /data/streams/nats

etl                     → /data/etl
pipelines               → /data/pipelines
quality                 → /data/quality
catalog                 → /data/catalog
lineage                 → /data/lineage
governance-data         → /data/governance


---

## Canonical Mounts (ai)

ai                      → /ai
models                  → /ai/models
checkpoints             → /ai/models/checkpoints
weights                 → /ai/models/weights

training                → /ai/training
finetuning              → /ai/training/finetuning
rl                      → /ai/training/rl
datasets-ai             → /ai/training/datasets

inference               → /ai/inference
serving                 → /ai/inference/serving
batch                   → /ai/inference/batch
realtime                → /ai/inference/realtime

agents                  → /ai/agents
agent-runtime           → /ai/agents/runtime
agent-memory            → /ai/agents/memory
agent-tools             → /ai/agents/tools
agent-policies          → /ai/agents/policies

embeddings              → /ai/embeddings
vector-db               → /ai/vector-db
faiss                   → /ai/vector-db/faiss
milvus                  → /ai/vector-db/milvus
weaviate                → /ai/vector-db/weaviate

evaluation              → /ai/evaluation
benchmarks              → /ai/evaluation/benchmarks
safety                  → /ai/safety
alignment               → /ai/alignment

providers               → /ai/providers
openai                  → /ai/providers/openai
anthropic               → /ai/providers/anthropic
google                  → /ai/providers/google
xai                     → /ai/providers/xai
ollama                  → /ai/providers/ollama


---

## Canonical Mounts (communications)

communications           → /communications
messaging                → /communications/messaging
chat                     → /communications/chat
email                    → /communications/email
sms                      → /communications/sms
push                     → /communications/push

realtime                 → /communications/realtime
websocket                → /communications/realtime/websocket
webrtc                   → /communications/realtime/webrtc

bots                     → /communications/bots
integrations             → /communications/integrations
webhooks                 → /communications/webhooks

support                  → /communications/support
tickets                  → /communications/support/tickets
crm                      → /communications/support/crm

social                   → /communications/social
twitter                  → /communications/social/twitter
x                         → /communications/social/x
linkedin                  → /communications/social/linkedin
youtube                  → /communications/social/youtube
instagram                → /communications/social/instagram

announcements            → /communications/announcements
status-pages             → /communications/status


---

## Canonical Mounts (human)

human                   → /human
operators               → /human/operators
profiles                → /human/profiles
preferences             → /human/preferences

workspaces              → /human/workspaces
projects                → /human/workspaces/projects
scratch                 → /human/workspaces/scratch

identity-human          → /sys/identity/human
keys-human              → /sys/keys/human
credentials             → /human/credentials

inbox                   → /human/inbox
notes                   → /human/notes
journal                 → /human/journal
tasks                   → /human/tasks

permissions             → /human/permissions
delegations             → /human/delegations


---

## Canonical Mounts (tools)

tools                   → /tools
cli                     → /tools/cli
blackroad-cli            → /tools/cli/blackroad
utilities               → /tools/utilities
scripts                 → /tools/scripts

build                   → /tools/build
ci                      → /tools/ci
cd                      → /tools/cd

testing                 → /tools/testing
linting                 → /tools/testing/linting
formatting              → /tools/testing/formatting
coverage                → /tools/testing/coverage

debug                   → /tools/debug
profilers               → /tools/debug/profilers
tracing-tools           → /tools/debug/tracing

packaging               → /tools/packaging
artifacts               → /tools/artifacts
releases                → /tools/releases


---

## Canonical Mounts (finance)

finance                 → /finance
billing                 → /finance/billing
invoicing               → /finance/invoicing
subscriptions           → /finance/subscriptions

payments                → /finance/payments
processors              → /finance/payments/processors
stripe                  → /finance/payments/stripe
paypal                  → /finance/payments/paypal
crypto                  → /finance/payments/crypto

accounts                → /finance/accounts
ledger                  → /finance/ledger
general-ledger          → /finance/ledger/general
audit-ledger            → /finance/ledger/audit

tax                     → /finance/tax
compliance-finance      → /finance/compliance
reporting               → /finance/reporting
forecasting             → /finance/forecasting

treasury                → /finance/treasury
budgeting               → /finance/budgeting
costs                   → /finance/costs
finops                  → /finance/finops


---

## Canonical Mounts (dev)

dev                     → /dev
source                  → /dev/source
repos                   → /dev/repos
monorepo                → /dev/monorepo

languages               → /dev/languages
python                  → /dev/languages/python
typescript              → /dev/languages/typescript
go                      → /dev/languages/go
rust                    → /dev/languages/rust

frameworks              → /dev/frameworks
react                   → /dev/frameworks/react
nextjs                  → /dev/frameworks/nextjs
fastapi                 → /dev/frameworks/fastapi
django                  → /dev/frameworks/django

envs                    → /dev/envs
local                   → /dev/envs/local
staging                 → /dev/envs/staging
production              → /dev/envs/production

dependencies            → /dev/dependencies
packages                → /dev/packages
registries              → /dev/registries

codegen                 → /dev/codegen
templates               → /dev/templates
scaffolding             → /dev/scaffolding


---

## Canonical Mounts (kernel)

kernel                  → /kernel
boot                    → /kernel/boot
init                    → /kernel/init
modules                 → /kernel/modules
drivers                 → /kernel/drivers

syscalls                → /kernel/syscalls
scheduler-kernel        → /kernel/scheduler
processes               → /kernel/processes
threads                 → /kernel/threads

memory-management       → /kernel/memory
paging                  → /kernel/memory/paging
cgroups                 → /kernel/memory/cgroups

ipc                     → /kernel/ipc
signals                 → /kernel/ipc/signals
pipes                   → /kernel/ipc/pipes
shared-memory           → /kernel/ipc/shared-memory

filesystem-kernel       → /kernel/filesystem
vfs                     → /kernel/filesystem/vfs
mount-table             → /kernel/filesystem/mounts

time                    → /kernel/time
clock                   → /kernel/time/clock
timers                  → /kernel/time/timers

power-management        → /kernel/power
suspend                 → /kernel/power/suspend
resume                  → /kernel/power/resume

panic                   → /kernel/panic
logs-kernel             → /kernel/logs


---

## Canonical Mounts (io)

io                      → /io
input                   → /io/input
output                  → /io/output

stdin                   → /io/input/stdin
stdout                  → /io/output/stdout
stderr                  → /io/output/stderr

files                   → /io/files
streams                 → /io/streams
buffers                 → /io/buffers

serialization           → /io/serialization
json                    → /io/serialization/json
yaml                    → /io/serialization/yaml
protobuf                → /io/serialization/protobuf

encoding                → /io/encoding
utf8                    → /io/encoding/utf8
binary                  → /io/encoding/binary
compression             → /io/encoding/compression

adapters                → /io/adapters
connectors              → /io/connectors
bridges                 → /io/bridges


---

## Canonical Mounts (boot)

boot                    → /boot
bootloader              → /boot/loader
grub                    → /boot/loader/grub
systemd-boot            → /boot/loader/systemd-boot

kernel-images           → /boot/kernel
initramfs               → /boot/initramfs
firmware-boot           → /boot/firmware

startup                 → /boot/startup
early-init              → /boot/startup/early
late-init               → /boot/startup/late

boot-config             → /boot/config
cmdline                 → /boot/config/cmdline
env-boot                → /boot/config/env

secure-boot             → /boot/security
measured-boot           → /boot/security/measured
trusted-boot            → /boot/security/trusted

recovery                → /boot/recovery
rescue                  → /boot/recovery/rescue
rollback                → /boot/recovery/rollback


---

## Canonical Mounts (init)

init                    → /init
init-system             → /init/system
systemd                 → /init/system/systemd
openrc                  → /init/system/openrc
runit                   → /init/system/runit

services                → /init/services
service-units           → /init/services/units
targets                 → /init/services/targets

startup-order           → /init/order
dependencies            → /init/dependencies

environment              → /init/environment
env-vars                 → /init/environment/vars
profiles-init            → /init/environment/profiles

healthchecks             → /init/health
readiness                → /init/health/readiness
liveness                 → /init/health/liveness


---

## Canonical Mounts (shutdown)

shutdown                → /shutdown
signals                 → /shutdown/signals
graceful                → /shutdown/graceful
forced                  → /shutdown/forced

service-stop            → /shutdown/services
pre-stop                → /shutdown/services/pre
post-stop               → /shutdown/services/post

drain                   → /shutdown/drain
connections             → /shutdown/connections
queues                  → /shutdown/queues

flush                   → /shutdown/flush
buffers                 → /shutdown/flush/buffers
logs                    → /shutdown/flush/logs
metrics                 → /shutdown/flush/metrics

poweroff                → /shutdown/poweroff
reboot                  → /shutdown/reboot
halt                    → /shutdown/halt


---

## Canonical Mounts (firmware)

firmware                → /firmware
bios                    → /firmware/bios
uefi                    → /firmware/uefi

microcode               → /firmware/microcode
cpu-microcode           → /firmware/microcode/cpu
gpu-firmware            → /firmware/microcode/gpu

device-firmware         → /firmware/devices
network-firmware        → /firmware/devices/network
storage-firmware        → /firmware/devices/storage
peripheral-firmware     → /firmware/devices/peripherals

updates                 → /firmware/updates
rollback                → /firmware/rollback
verification            → /firmware/verification

signing                 → /firmware/signing
keys-firmware           → /firmware/keys


---

## Canonical Mounts (storage-low)

storage-low             → /storage-low
block-devices           → /storage-low/block
partitions              → /storage-low/partitions

filesystems-low         → /storage-low/filesystems
ext4                    → /storage-low/filesystems/ext4
xfs                     → /storage-low/filesystems/xfs
btrfs                   → /storage-low/filesystems/btrfs
zfs                     → /storage-low/filesystems/zfs

raid                    → /storage-low/raid
mdadm                   → /storage-low/raid/mdadm
lvm                     → /storage-low/lvm

encryption-storage      → /storage-low/encryption
luks                    → /storage-low/encryption/luks
dm-crypt                → /storage-low/encryption/dm-crypt

mounts-low              → /storage-low/mounts
fstab                   → /storage-low/mounts/fstab

io-schedulers           → /storage-low/io-schedulers
discard                 → /storage-low/discard
trim                    → /storage-low/trim

badblocks               → /storage-low/diagnostics/badblocks
fsck                    → /storage-low/diagnostics/fsck


---

## Canonical Mounts (crash)

crash                   → /crash
panics                  → /crash/panics
oops                    → /crash/oops

dumps                   → /crash/dumps
kdump                   → /crash/dumps/kdump
core-dumps              → /crash/dumps/core

traces-crash            → /crash/traces
stacktraces             → /crash/traces/stack

analysis                → /crash/analysis
symbolication           → /crash/analysis/symbols

alerts-crash            → /crash/alerts
notifications-crash     → /crash/notifications


---

## Canonical Mounts (recovery)

recovery                → /recovery
rescue                  → /recovery/rescue
live-env                → /recovery/live

snapshots-recovery      → /recovery/snapshots
rollback-recovery       → /recovery/rollback
restore                 → /recovery/restore

backups-recovery        → /recovery/backups
verify                  → /recovery/verify
integrity               → /recovery/integrity

keys-recovery           → /recovery/keys
secrets-recovery        → /recovery/secrets

playbooks               → /recovery/playbooks
runbooks                → /recovery/runbooks


---

## Canonical Mounts (backup-low)

backup-low              → /backup-low
snapshots-low           → /backup-low/snapshots
incremental             → /backup-low/incremental
full                    → /backup-low/full

replication-low         → /backup-low/replication
mirrors                 → /backup-low/replication/mirrors
offsite                 → /backup-low/replication/offsite

archives-low            → /backup-low/archives
compression-low         → /backup-low/compression
encryption-backup       → /backup-low/encryption

schedules               → /backup-low/schedules
retention               → /backup-low/retention
verification-backup     → /backup-low/verification

restore-low             → /backup-low/restore
test-restores           → /backup-low/restore/tests


---

## Canonical Mounts (diagnostics)

diagnostics             → /diagnostics
inspection              → /diagnostics/inspection
introspection           → /diagnostics/introspection

logs-diagnostics        → /diagnostics/logs
metrics-diagnostics     → /diagnostics/metrics
traces-diagnostics      → /diagnostics/traces

profiling-diagnostics   → /diagnostics/profiling
benchmarks              → /diagnostics/benchmarks
stress-tests            → /diagnostics/stress

healthchecks-diagnostics → /diagnostics/health
self-tests              → /diagnostics/self-tests

hardware-tests          → /diagnostics/hardware
memory-tests            → /diagnostics/memory
disk-tests              → /diagnostics/disk
network-tests           → /diagnostics/network

reporting-diagnostics   → /diagnostics/reports
exports                 → /diagnostics/exports


---

## Canonical Mounts (fsck)

fsck                    → /fsck
checks                  → /fsck/checks
repairs                 → /fsck/repairs

pre-mount               → /fsck/pre-mount
post-crash              → /fsck/post-crash
scheduled               → /fsck/scheduled

ext4-fsck               → /fsck/ext4
xfs-repair              → /fsck/xfs
btrfs-check             → /fsck/btrfs
zfs-scrub               → /fsck/zfs

logs-fsck               → /fsck/logs
reports-fsck            → /fsck/reports


---

## Canonical Mounts (storage-low)

block                   → /storage/block
volumes                 → /storage/volumes
partitions              → /storage/partitions

raid                    → /storage/raid
lvm                     → /storage/lvm
zfs                     → /storage/zfs
btrfs                   → /storage/btrfs

swap                    → /storage/swap
cache                   → /storage/cache

---

## Canonical Mounts (backup-low)

snapshots               → /backup/snapshots
incremental             → /backup/incremental
full                    → /backup/full

offsite                 → /backup/offsite
cold-storage            → /backup/cold
archive-backup          → /backup/archive

restore                 → /backup/restore
verify                  → /backup/verify
manifests               → /backup/manifests


---

## Canonical Mounts (network-low)

nic                     → /net/nic
drivers                 → /net/drivers
firmware                → /net/firmware

ethernet                → /net/ethernet
wifi                    → /net/wifi
bluetooth               → /net/bluetooth

routing                 → /net/routing
nat                     → /net/nat
firewall                → /net/firewall
qos                     → /net/qos

dns-cache               → /net/dns/cache
dhcp                    → /net/dhcp
ntp                     → /net/ntp

tunnels                 → /net/tunnels
vpn                     → /net/vpn
overlay                 → /net/overlay


---

## Canonical Mounts (hardware-low)

cpu                     → /hw/cpu
gpu                     → /hw/gpu
npu                     → /hw/npu
fpga                    → /hw/fpga

ram                     → /hw/memory/ram
rom                     → /hw/memory/rom
nvram                   → /hw/memory/nvram

disk                    → /hw/storage/disk
ssd                     → /hw/storage/ssd
nvme                    → /hw/storage/nvme

usb                     → /hw/bus/usb
pci                     → /hw/bus/pci
i2c                     → /hw/bus/i2c
spi                     → /hw/bus/spi
uart                   → /hw/bus/uart

sensors                 → /hw/sensors
camera                  → /hw/sensors/camera
microphone              → /hw/sensors/microphone
lidar                   → /hw/sensors/lidar
imu                     → /hw/sensors/imu
gps                     → /hw/sensors/gps

actuators               → /hw/actuators
motors                  → /hw/actuators/motors
relays                  → /hw/actuators/relays

power                   → /hw/power
battery                 → /hw/power/battery
charger                 → /hw/power/charger
thermal                 → /hw/thermal


---

## Canonical Mounts (compute-low)

compute                 → /compute
scheduler-low           → /compute/scheduler
workers                 → /compute/workers
queues                  → /compute/queues

containers              → /compute/containers
runtimes                → /compute/runtimes
wasm                    → /compute/runtimes/wasm
python                  → /compute/runtimes/python
node                    → /compute/runtimes/node
java                    → /compute/runtimes/java

threads                 → /kernel/threads
processes               → /kernel/processes
signals                 → /kernel/signals

ipc                     → /kernel/ipc
pipes                   → /kernel/ipc/pipes
sockets                 → /kernel/ipc/sockets
shared-memory           → /kernel/ipc/shm

timers                  → /kernel/timers
clocks                  → /kernel/clocks


---

## Canonical Mounts (security-low)

security-low            → /sys/security/low
sandbox                 → /sys/security/sandbox
policies                → /sys/security/policies
enforcement             → /sys/security/enforcement

firewall                → /sys/security/firewall
ids                     → /sys/security/ids
ips                     → /sys/security/ips

secrets                 → /sys/security/secrets
vault                   → /sys/security/vault
tokens                  → /sys/security/tokens
certificates            → /sys/security/certs

audit-log               → /sys/security/audit/log
audit-events            → /sys/security/audit/events

trust                   → /sys/security/trust
attestation             → /sys/security/attestation
integrity               → /sys/security/integrity


---

## Canonical Mounts (time)

time                    → /sys/time
clock                   → /sys/time/clock
monotonic               → /sys/time/monotonic
realtime                → /sys/time/realtime

ntp                     → /sys/time/ntp
ptp                     → /sys/time/ptp
timesync                → /sys/time/sync

scheduler-low            → /sys/time/scheduler
cron                    → /sys/time/cron
timers                  → /sys/time/timers

timestamps               → /sys/time/timestamps
epoch                   → /sys/time/epoch
leap                    → /sys/time/leap


---

## Canonical Mounts (energy)

power                   → /sys/power
energy                  → /sys/power/energy
battery                 → /sys/power/battery
charger                 → /sys/power/charger

thermal                 → /sys/thermal
cooling                 → /sys/thermal/cooling
fans                    → /sys/thermal/fans
throttle                → /sys/thermal/throttle

efficiency              → /sys/power/efficiency
governor                → /sys/power/governor
sleep                   → /sys/power/sleep
wake                    → /sys/power/wake


---

## Canonical Mounts (storage-low)

storage                 → /sys/storage
disks                   → /sys/storage/disks
volumes                 → /sys/storage/volumes
partitions              → /sys/storage/partitions

capacity                → /sys/storage/capacity
free                    → /sys/storage/free
used                    → /sys/storage/used
thresholds              → /sys/storage/thresholds

io-stats                → /sys/storage/io
latency                 → /sys/storage/latency
throughput              → /sys/storage/throughput

wear                    → /sys/storage/wear
smart                   → /sys/storage/smart
health                  → /sys/storage/health


---

## Canonical Mounts (backup-low)

backup                  → /sys/backup
snapshots               → /sys/backup/snapshots
restore                 → /sys/backup/restore
recovery                → /sys/backup/recovery

incremental             → /sys/backup/incremental
full                    → /sys/backup/full
retention               → /sys/backup/retention

offsite                 → /sys/backup/offsite
cold-storage            → /sys/backup/cold
archives                → /sys/backup/archive

checksums               → /sys/backup/checksums
verification            → /sys/backup/verify
integrity               → /sys/backup/integrity


---

## Canonical Mounts (network)

network                 → /sys/network
interfaces              → /sys/network/interfaces
routing                 → /sys/network/routing
firewall                → /sys/network/firewall

tcp                     → /sys/network/tcp
udp                     → /sys/network/udp
icmp                   → /sys/network/icmp

dns                     → /sys/network/dns
dhcp                    → /sys/network/dhcp
nat                     → /sys/network/nat

bandwidth               → /sys/network/bandwidth
latency                 → /sys/network/latency
packet-loss             → /sys/network/packet-loss

vpn                     → /sys/network/vpn
tunnels                 → /sys/network/tunnels
mesh                    → /sys/network/mesh


---

## Canonical Mounts (hardware)

hardware                → /dev
devices                 → /dev/devices
controllers             → /dev/controllers

cpu                     → /dev/cpu
gpu                     → /dev/gpu
accelerators            → /dev/accelerators

memory                  → /dev/memory
dma                     → /dev/dma
interrupts              → /dev/interrupts

usb                     → /dev/usb
pci                     → /dev/pci
i2c                     → /dev/i2c
spi                     → /dev/spi
serial                  → /dev/serial

sensors                 → /dev/sensors
cameras                 → /dev/cameras
audio                   → /dev/audio
input                   → /dev/input


---

## Canonical Mounts (compute)

compute                 → /sys/compute
execution               → /sys/compute/exec
workers                 → /sys/compute/workers
queues                  → /sys/compute/queues

runtimes                → /sys/compute/runtimes
containers              → /sys/compute/containers
vm                       → /sys/compute/vm
sandbox                 → /sys/compute/sandbox

scheduling               → /sys/compute/scheduling
priorities              → /sys/compute/priorities
quotas                  → /sys/compute/quotas
limits                  → /sys/compute/limits

metrics                 → /sys/compute/metrics
profiling               → /sys/compute/profiling
tracing                 → /sys/compute/tracing


---

## Canonical Mounts (kernel-low)

kernel                  → /sys/kernel
boot                    → /sys/kernel/boot
modules                 → /sys/kernel/modules
parameters              → /sys/kernel/parameters

syscalls                → /sys/kernel/syscalls
scheduler               → /sys/kernel/scheduler
preemption              → /sys/kernel/preemption

ipc                     → /sys/kernel/ipc
signals                 → /sys/kernel/signals
shared-memory           → /sys/kernel/shm
semaphores              → /sys/kernel/semaphores

namespaces              → /sys/kernel/namespaces
cgroups                 → /sys/kernel/cgroups
capabilities            → /sys/kernel/capabilities

panic                   → /sys/kernel/panic
oops                    → /sys/kernel/oops
logging                 → /sys/kernel/logging


---

## Canonical Mounts (memory-low)

memory                  → /sys/memory
ram                     → /sys/memory/ram
swap                    → /sys/memory/swap
paging                  → /sys/memory/paging

pressure                → /sys/memory/pressure
oom                     → /sys/memory/oom
reclaim                 → /sys/memory/reclaim

hugepages               → /sys/memory/hugepages
slab                    → /sys/memory/slab
cache                   → /sys/memory/cache
buffers                 → /sys/memory/buffers

leaks                   → /sys/memory/leaks
gc                      → /sys/memory/gc
compaction              → /sys/memory/compaction


---

## Canonical Mounts (io-low)

io                      → /sys/io
streams                 → /sys/io/streams
pipes                   → /sys/io/pipes
buffers                 → /sys/io/buffers

stdin                   → /sys/io/stdin
stdout                  → /sys/io/stdout
stderr                  → /sys/io/stderr

files                   → /sys/io/files
descriptors             → /sys/io/fd
polling                 → /sys/io/polling

async                   → /sys/io/async
sync                    → /sys/io/sync
backpressure            → /sys/io/backpressure


---

## Canonical Mounts (security-low)

security                → /sys/security
policies                → /sys/security/policies
enforcement             → /sys/security/enforcement
audit                   → /sys/security/audit

permissions             → /sys/security/permissions
roles                   → /sys/security/roles
capabilities            → /sys/security/capabilities

sandboxing              → /sys/security/sandboxing
isolation               → /sys/security/isolation
jail                    → /sys/security/jail

integrity               → /sys/security/integrity
attestation             → /sys/security/attestation
verification            → /sys/security/verification


---

## Canonical Mounts (process-low)

processes               → /sys/process
lifecycle               → /sys/process/lifecycle
states                  → /sys/process/states
priorities              → /sys/process/priorities

fork                    → /sys/process/fork
exec                    → /sys/process/exec
exit                    → /sys/process/exit

signals                 → /sys/process/signals
threads                 → /sys/process/threads
affinity                → /sys/process/affinity

limits                  → /sys/process/limits
quotas                  → /sys/process/quotas
accounting              → /sys/process/accounting


---

## Canonical Mounts (users-low)

users                   → /sys/users
accounts                → /sys/users/accounts
groups                  → /sys/users/groups
roles                   → /sys/users/roles

sessions                → /sys/users/sessions
logins                  → /sys/users/logins
presence                → /sys/users/presence

credentials             → /sys/users/credentials
passwords               → /sys/users/passwords
tokens                  → /sys/users/tokens

home                    → /sys/users/home
quotas                  → /sys/users/quotas
preferences             → /sys/users/preferences


---

## Canonical Mounts (logging-low)

logs                    → /var/log
logs-system             → /var/log/system
logs-kernel             → /var/log/kernel
logs-security           → /var/log/security
logs-auth               → /var/log/auth
logs-network            → /var/log/network
logs-audit              → /var/log/audit

metrics                 → /var/metrics
metrics-system          → /var/metrics/system
metrics-runtime         → /var/metrics/runtime
metrics-network         → /var/metrics/network

traces                  → /var/traces
spans                   → /var/traces/spans
profiles                → /var/traces/profiles

events                  → /var/events
events-system           → /var/events/system
events-runtime          → /var/events/runtime
events-security         → /var/events/security

alerts                  → /var/alerts
alerts-active           → /var/alerts/active
alerts-archive          → /var/alerts/archive


---

## Canonical Mounts (scheduler, jobs, queues)

scheduler               → /os/scheduler
scheduler-system        → /os/scheduler/system
scheduler-runtime       → /os/scheduler/runtime

jobs                    → /var/jobs
jobs-active             → /var/jobs/active
jobs-pending            → /var/jobs/pending
jobs-failed             → /var/jobs/failed
jobs-complete           → /var/jobs/complete

queues                  → /var/queues
queues-default          → /var/queues/default
queues-priority         → /var/queues/priority
queues-bulk             → /var/queues/bulk
queues-deadletter       → /var/queues/deadletter

workers                 → /os/workers
workers-local           → /os/workers/local
workers-remote          → /os/workers/remote
workers-ephemeral       → /os/workers/ephemeral

cron                    → /os/cron
cron-system             → /os/cron/system
cron-user               → /os/cron/user


---

## Canonical Mounts (telemetry, logs, metrics, tracing)

telemetry               → /var/telemetry
telemetry-agent         → /os/telemetry/agent
telemetry-collector     → /os/telemetry/collector

logs                    → /var/log
logs-system             → /var/log/system
logs-app                → /var/log/app
logs-security           → /var/log/security
logs-audit              → /var/log/audit

metrics                 → /var/metrics
metrics-node            → /var/metrics/node
metrics-app             → /var/metrics/app
metrics-network         → /var/metrics/network
metrics-storage         → /var/metrics/storage

traces                  → /var/traces
traces-ingest           → /var/traces/ingest
traces-store            → /var/traces/store

profiling               → /var/profiling
profiling-cpu           → /var/profiling/cpu
profiling-memory        → /var/profiling/memory
profiling-io            → /var/profiling/io

alerts                  → /sys/alerts
alerts-rules            → /sys/alerts/rules
alerts-dispatch         → /sys/alerts/dispatch


---

## Canonical Mounts (network, routing, mesh)

network-core            → /cloud/net/core
network-overlay         → /cloud/net/overlay
network-underlay        → /cloud/net/underlay

routing                 → /cloud/net/routing
routing-edge            → /cloud/net/routing/edge
routing-internal        → /cloud/net/routing/internal

mesh                    → /cloud/net/mesh
mesh-control-plane      → /cloud/net/mesh/control
mesh-data-plane         → /cloud/net/mesh/data

ingress                 → /cloud/net/ingress
egress                  → /cloud/net/egress
gateway                 → /cloud/net/gateway

load-balancer           → /cloud/net/load-balancer
reverse-proxy           → /cloud/net/reverse-proxy

service-discovery       → /cloud/net/discovery
dns-internal            → /cloud/net/dns/internal

firewall                → /sys/security/firewall
rate-limit              → /sys/security/rate-limit


---

## Canonical Mounts (observability, telemetry)

observability            → /sys/observability
telemetry                → /sys/observability/telemetry

metrics                  → /sys/observability/metrics
logs                     → /sys/observability/logs
traces                   → /sys/observability/traces

profiling                → /sys/observability/profiling
health                   → /sys/observability/health
status                   → /sys/observability/status

alerts                   → /sys/observability/alerts
incidents                → /sys/observability/incidents

dashboards               → /usr/share/observability/dashboards
visualization            → /usr/share/observability/visualization

exporters                → /sys/observability/exporters
collectors               → /sys/observability/collectors


---

## Canonical Mounts (resources, quotas, pressure)

resources                → /sys/resources
quotas                   → /sys/resources/quotas
limits                   → /sys/resources/limits

cpu                      → /sys/resources/cpu
memory                   → /sys/resources/memory
disk                     → /sys/resources/disk
network-io               → /sys/resources/network

pressure                 → /sys/resources/pressure
cpu-pressure             → /sys/resources/pressure/cpu
memory-pressure          → /sys/resources/pressure/memory
io-pressure              → /sys/resources/pressure/io

throttling               → /sys/resources/throttling
rate-limit               → /sys/resources/rate-limit


---

## Canonical Mounts (logging, observability, tracing)

logs                     → /var/log
system-logs              → /var/log/system
app-logs                 → /var/log/apps
security-logs            → /var/log/security
audit-logs               → /var/log/audit

metrics                  → /var/metrics
telemetry                → /var/telemetry

tracing                  → /var/tracing
spans                    → /var/tracing/spans
profiles                 → /var/profiles

alerts                   → /sys/alerts
health                   → /sys/health
status                   → /sys/status


---

## Canonical Mounts (network, routing, connectivity)

network-core            → /cloud/net/core
routing                 → /cloud/net/routing
switching               → /cloud/net/switching

firewall                → /sys/security/firewall
ids                     → /sys/security/ids
ips                     → /sys/security/ips

vpn                     → /cloud/net/vpn
tunnel                  → /cloud/net/tunnel
mesh                    → /cloud/net/mesh

load-balancer           → /cloud/net/load-balancer
ingress                 → /cloud/net/ingress
egress                  → /cloud/net/egress


---

## Canonical Mounts (storage, backup, persistence)

storage                 → /var/storage
block                   → /dev/block
filesystem              → /sys/fs

backup-low              → /var/backup/low
snapshot                → /var/backup/snapshots
replication             → /var/replication

object-store            → /var/storage/object
blob                    → /var/storage/blob
archive-cold            → /var/archive/cold

scrub                   → /sys/fs/scrub
repair                  → /sys/fs/repair
fsck                    → /sys/fs/check


---

## Canonical Mounts (compute, execution, workers)

compute                 → /os/compute
runtime-low             → /os/runtime/low
executor                → /os/exec
workers                 → /os/workers

jobs                    → /var/jobs
queues                  → /var/queues
ipc                     → /run/ipc

sandbox                 → /tmp/sandbox
isolates                → /os/isolates


---

## Canonical Mounts (hardware, devices)

hardware                → /dev
devices                 → /dev/devices
sensors                 → /dev/sensors
actuators               → /dev/actuators

usb                     → /dev/usb
pci                     → /dev/pci
i2c                     → /dev/i2c
spi                     → /dev/spi
gpio                    → /dev/gpio

camera                  → /dev/video
audio                   → /dev/audio
display                 → /dev/display

power                   → /sys/power
thermal                 → /sys/thermal
firmware                → /sys/firmware


---

## Canonical Mounts (network, transport)

net                     → /proc/net
interfaces              → /sys/class/net
routing                 → /net/route
firewall                → /net/firewall

tcp                     → /net/tcp
udp                     → /net/udp
icmp                   → /net/icmp

dns-cache               → /var/cache/dns
dhcp                    → /var/lib/dhcp

vpn                     → /net/vpn
wireguard               → /net/vpn/wireguard
tailscale               → /net/vpn/tailscale

proxy                   → /net/proxy
load-balancer           → /net/lb


---

## Canonical Mounts (security-low, trust root)

entropy                → /dev/random
entropy-urandom        → /dev/urandom

keyring                → /proc/keys
keyctl                 → /sys/kernel/keys

secrets                → /sys/secrets
secrets-runtime        → /run/secrets

certificates           → /etc/ssl
certificates-system    → /etc/ssl/certs
certificates-user      → /home/alexa/.ssl

hsm                    → /sys/hsm
tpm                    → /sys/class/tpm
secure-enclave         → /sys/secure_enclave

attestation            → /sys/attestation
integrity              → /sys/integrity
measured-boot          → /sys/boot/measurements


---

## Canonical Mounts (storage-low, durability)

block                   → /sys/block
block-mapper            → /dev/mapper

lvm                     → /etc/lvm
raid                    → /proc/mdstat

mounts                  → /proc/mounts
filesystems             → /proc/filesystems

swap                    → /proc/swaps
swapfile                → /var/swap

snapshots               → /var/snapshots
checkpoints             → /var/checkpoints

cold-storage            → /var/archive/cold
deep-archive            → /var/archive/deep


---

## Canonical Mounts (compute-low, execution)

cpu                     → /sys/devices/system/cpu
memory                  → /proc/meminfo
hugepages               → /sys/kernel/mm/hugepages

scheduler-low           → /sys/kernel/sched
cgroups                 → /sys/fs/cgroup

processes               → /proc
threads                 → /proc/self/task

syscalls                → /sys/kernel/syscalls
limits                  → /proc/limits

runtime-low             → /run/runtime
workers                 → /run/workers


---

## Canonical Mounts (network-low)

net                     → /sys/class/net
interfaces              → /sys/class/net/interfaces
routes                  → /proc/net/route

tcp                     → /proc/net/tcp
udp                     → /proc/net/udp
unix-sockets            → /proc/net/unix

firewall                → /sys/net/firewall
conntrack               → /proc/net/nf_conntrack

dns-low                 → /etc/resolv.conf
hosts                   → /etc/hosts


---

## Canonical Mounts (io-low)

stdin                  → /dev/stdin
stdout                 → /dev/stdout
stderr                 → /dev/stderr

tty                    → /dev/tty
pts                    → /dev/pts

input                  → /dev/input
uinput                 → /dev/uinput

serial                 → /dev/ttyS
usb                    → /dev/bus/usb

random                 → /dev/random
urandom                → /dev/urandom
null                   → /dev/null
zero                   → /dev/zero


---

## Canonical Mounts (kernel-low)

kernel                  → /sys/kernel
modules                 → /lib/modules
sysctl                  → /proc/sys

boot                    → /boot
cmdline                 → /proc/cmdline
version                 → /proc/version

cpu                     → /proc/cpuinfo
mem                     → /proc/meminfo
uptime                  → /proc/uptime
load                    → /proc/loadavg

interrupts              → /proc/interrupts
irq                     → /proc/irq


---

## Canonical Mounts (storage-low)

block                   → /sys/block
mounts                  → /proc/mounts
filesystems             → /proc/filesystems

disks                   → /dev/disk
by-id                   → /dev/disk/by-id
by-uuid                 → /dev/disk/by-uuid
by-label                → /dev/disk/by-label

swap                    → /proc/swaps
quota                   → /sys/fs/quota

fsck                    → /sbin/fsck
scrub                   → /sbin/scrub
trim                    → /sbin/fstrim


---

## Canonical Mounts (hardware-low)

cpu                     → /sys/devices/system/cpu
memory                  → /proc/meminfo
hugepages               → /sys/kernel/mm/hugepages

pci                     → /sys/bus/pci
usb                     → /sys/bus/usb
i2c                     → /sys/bus/i2c
spi                     → /sys/bus/spi

gpio                    → /sys/class/gpio
leds                    → /sys/class/leds
thermal                 → /sys/class/thermal
power                   → /sys/class/power_supply

sensors                 → /sys/class/hwmon
rtc                     → /sys/class/rtc


---

## Canonical Mounts (process-low)

proc                    → /proc
threads                 → /proc/self/task
limits                  → /proc/self/limits
fd                      → /proc/self/fd

scheduler                → /proc/schedstat
loadavg                  → /proc/loadavg
uptime                   → /proc/uptime

signals                  → /proc/interrupts
syscalls                 → /proc/syscall

cgroups                  → /sys/fs/cgroup
namespaces               → /proc/self/ns


---

## Canonical Mounts (network-low)

net                     → /proc/net
net-dev                 → /proc/net/dev
net-tcp                 → /proc/net/tcp
net-udp                 → /proc/net/udp
net-unix                → /proc/net/unix
net-arp                 → /proc/net/arp
net-route               → /proc/net/route

ip-forward               → /proc/sys/net/ipv4/ip_forward
tcp-tuning               → /proc/sys/net/ipv4/tcp_*
udp-tuning               → /proc/sys/net/ipv4/udp_*

conntrack                → /proc/sys/net/netfilter
nf-hooks                 → /sys/module/nf_conntrack


---

## Canonical Mounts (memory-low)

meminfo                 → /proc/meminfo
vmstat                  → /proc/vmstat
slabinfo                → /proc/slabinfo
buddyinfo               → /proc/buddyinfo
zoneinfo                → /proc/zoneinfo

oom                     → /proc/sys/vm/oom_*
overcommit              → /proc/sys/vm/overcommit_*
swappiness              → /proc/sys/vm/swappiness
dirty                   → /proc/sys/vm/dirty_*

hugepages               → /sys/kernel/mm/hugepages
ksm                     → /sys/kernel/mm/ksm
cgroups-mem             → /sys/fs/cgroup/memory


---

## Canonical Mounts (ipc-low)

ipc                     → /proc/sysvipc
msg                     → /proc/sysvipc/msg
sem                     → /proc/sysvipc/sem
shm                     → /proc/sysvipc/shm

posix-mq                → /dev/mqueue
futex                   → /sys/kernel/debug/futex

net-unix                → /proc/net/unix
net-tcp                 → /proc/net/tcp
net-udp                 → /proc/net/udp


---

## Canonical Mounts (storage-low)

block                  → /sys/block
disks                  → /dev/disk
by-id                  → /dev/disk/by-id
by-uuid                → /dev/disk/by-uuid
by-label               → /dev/disk/by-label

filesystems            → /proc/filesystems
mounts                 → /proc/self/mounts
mountinfo              → /proc/self/mountinfo

fsck                   → /sbin/fsck
fsck-auto              → /sbin/fsck.auto
fsck-ext4              → /sbin/fsck.ext4
fsck-xfs               → /sbin/fsck.xfs

quota                  → /usr/sbin/quota
quotacheck             → /usr/sbin/quotacheck


---

## Canonical Mounts (network-low)

net                    → /proc/net
netstat                → /proc/net/netstat
snmp                   → /proc/net/snmp
sockstat               → /proc/net/sockstat
sockstat6              → /proc/net/sockstat6
dev-net                → /proc/net/dev
arp                    → /proc/net/arp
route                  → /proc/net/route

iptables               → /sbin/iptables
ip6tables              → /sbin/ip6tables
nft                    → /usr/sbin/nft
tc                     → /sbin/tc
ip                     → /sbin/ip
ss                     → /usr/sbin/ss

resolv                 → /etc/resolv.conf
hosts                  → /etc/hosts
services               → /etc/services


---

## Canonical Mounts (kernel-low: memory, process, IPC)

meminfo                → /proc/meminfo
vmstat                 → /proc/vmstat
slabinfo               → /proc/slabinfo
buddyinfo              → /proc/buddyinfo
pagetypeinfo           → /proc/pagetypeinfo
swaps                  → /proc/swaps

uptime                 → /proc/uptime
loadavg                → /proc/loadavg
stat                   → /proc/stat
pressure-cpu           → /proc/pressure/cpu
pressure-io            → /proc/pressure/io
pressure-memory        → /proc/pressure/memory

sysvipc-msg            → /proc/sysvipc/msg
sysvipc-sem            → /proc/sysvipc/sem
sysvipc-shm            → /proc/sysvipc/shm
mqueue                 → /dev/mqueue
shm                    → /dev/shm

cgroups                → /sys/fs/cgroup
hugepages              → /sys/kernel/mm/hugepages

NOTE: This section defines canonical kernel intent. Changes require operator approval.
