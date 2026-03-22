# BlackRoad Pi Mesh - Current Status
**Updated**: 2025-12-19 23:45 CST

## Working Nodes

### 1. blackroad-pi (192.168.4.64)
- ✅ SSH accessible from Mac
- ✅ Ollama installed: `/usr/local/bin/ollama`
- ✅ Can ping lucidia
- Serial: `a25723602382c449`
- Interfaces: `192.168.4.64`, `172.17.0.1`

### 2. alice (192.168.4.49)  
- ✅ SSH accessible from Mac
- ✅ ProxyJump through blackroad-pi configured
- ❌ Ollama not installed (DNS resolution issues)
- ❌ Cannot reach lucidia (destination host unreachable)
- Serial: `1000000091da3c05`
- User: `alice` (not `pi`)
- Password: `alice`

### 3. lucidia (192.168.4.38)
- ⏳ SSH NOT accessible from Mac (needs authorized_keys)
- ✅ Accessible via Termius (user confirmed)
- ✅ Tailscale running: `100.66.235.47`
- ✅ Blackroad-pi can ping it
- Interfaces: `192.168.4.38`, `172.17.0.1`, `172.18.0.1`, `100.66.235.47`
- Hostname: `lucidia` (not `lucidia.local`)

## SSH Keys Needed

Lucidia needs these added to `~/.ssh/authorized_keys`:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJrPGHiadjNl9XWJeIaF+721DkVcnUDrw+rdFWSaEo07 blackroad-pi
```

## Next Steps
1. Add SSH keys to lucidia via Termius
2. Enable MagicDNS on Tailscale
3. Install Ollama on alice and lucidia
4. Test full mesh connectivity

