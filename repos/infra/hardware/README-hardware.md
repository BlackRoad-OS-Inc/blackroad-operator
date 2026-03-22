# BlackRoad Hardware Mesh

This directory captures the provisioning workflow for the Raspberry Pi, Jetson, and kiosk fleet.

## Provisioning Steps
1. Update `inventory.yaml` with device hostnames and IP addresses.
2. Bootstrap Raspberry Pis:
   ```bash
   ansible-playbook -i inventory.yaml ansible/playbooks/pi.yml
   ansible-playbook -i inventory.yaml ansible/playbooks/k3s.yml
   ```
3. Configure the Jetson edge node:
   ```bash
   ansible-playbook -i inventory.yaml ansible/playbooks/jetson.yml
   ```
4. Prepare kiosk displays:
   ```bash
   ansible-playbook -i inventory.yaml ansible/playbooks/kiosk.yml
   ```

## Kubernetes Deployment
1. Apply the base workloads:
   ```bash
   kubectl apply -f k8s/base -n blackroad
   ```
2. Install MetalLB using the upstream manifest and configure an address pool:
   ```bash
   kubectl apply -f k8s/metallb/metallb-native.yaml
   kubectl apply -f k8s/metallb/ip-pool.yaml
   ```
3. Deploy the island gateway service if not included with the base set:
   ```bash
   kubectl apply -f k8s/island-gateway/deployment.yaml
   ```

## Local Edge Development
Run a lightweight stack for testing:
```bash
docker compose -f infra/hardware/compose/edge-dev/docker-compose.yml up --build
```

## Notes
- Replace kiosk URL in `systemd/kiosk-browser.service` to point at the desired Lighthouse/Ellis page.
- Secrets such as Tailscale or Grafana passwords should be injected at deploy time via SOPS, Vault, or environment managers.
- Gateway logs emit structured JSON and will refuse to emit actions when `allowed` is `false`.
