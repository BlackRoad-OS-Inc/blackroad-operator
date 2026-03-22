# blackroad-device-registry

> Hardware device registry and inventory management — part of the BlackRoad Hardware platform.

## Features

- **Device Lifecycle** — active → maintenance → retired status tracking
- **Asset Assignment** — Assign devices to users or teams
- **Maintenance Logs** — Track repairs, inspections, upgrades with cost history
- **Warranty Tracking** — Alert on upcoming warranty expirations
- **Tag System** — Flexible tagging for grouping and filtering
- **Full-Text Search** — Search by name, serial, model, manufacturer, or location
- **Export** — JSON or CSV inventory export

## Quick Start

```bash
pip install -r requirements.txt
python device_registry.py summary
python device_registry.py list
python device_registry.py search "Raspberry"
```

## Usage

```python
from device_registry import DeviceRegistry

reg = DeviceRegistry()

device = reg.register(
    serial="SN-001", name="Edge Node A", model="Pi 4B",
    manufacturer="Raspberry Pi Foundation", hw_rev="1.4",
    location="Rack A", warranty_expires="2026-12-31",
    tags=["prod", "iot"]
)

reg.assign(device.id, "alice@company.com")
reg.maintenance_log(device.id, "repair", "Replaced SD card", cost=15.0)

expiring = reg.get_warranty_expiring(days=90)
inventory_csv = reg.export_inventory(fmt="csv")
```

## Device Statuses

| Status | Description |
|--------|-------------|
| `active` | In use and operational |
| `maintenance` | Under repair or inspection |
| `retired` | Decommissioned |

## Testing

```bash
pytest --tb=short -v
```

## License

Proprietary — BlackRoad OS, Inc. All rights reserved.
