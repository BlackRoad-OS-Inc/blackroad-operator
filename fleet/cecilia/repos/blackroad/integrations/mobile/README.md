# Mobile Development Tools Integration

BlackRoad OS supports integration with mobile development tools for iOS development workflows.

## Supported Tools

### Working Copy (iOS Git Client)

Working Copy is a powerful Git client for iOS that provides full Git functionality.

**URL Scheme:** `working-copy://`

**Integration Features:**
- Clone repositories directly
- Commit and push changes
- Branch management
- SSH key support
- Shortcuts automation

**Example Shortcut URL:**
```
working-copy://x-callback-url/pull?repo=MyRepo&remote=origin
working-copy://x-callback-url/commit?repo=MyRepo&message=Update%20from%20iOS
```

**Configuration file:** `.workingcopy/config.json`
```json
{
  "repo": "your-repo-name",
  "remote": "origin",
  "branch": "main",
  "auto_fetch": true,
  "notification_on_changes": true
}
```

---

### Shellfish (iOS SSH/SFTP Client)

Shellfish provides SSH terminal and SFTP file management on iOS.

**URL Scheme:** `shellfish://`

**Integration Features:**
- SSH terminal access
- SFTP file transfers
- Mosh support for unstable connections
- iOS Files app integration
- Shortcuts automation

**Example Shortcut URL:**
```
shellfish://connect?host=server.example.com&user=admin
shellfish://run?host=myserver&command=docker%20ps
```

**Configuration file:** `.shellfish/hosts.json`
```json
{
  "hosts": [
    {
      "name": "Production Server",
      "host": "prod.example.com",
      "port": 22,
      "user": "deploy",
      "auth": "key",
      "key_name": "deploy_key"
    },
    {
      "name": "Raspberry Pi",
      "host": "pi.local",
      "port": 22,
      "user": "pi",
      "auth": "key"
    }
  ]
}
```

---

### Pyto (iOS Python IDE)

Pyto is a Python IDE for iOS with extensive library support.

**URL Scheme:** `pyto://`

**Integration Features:**
- Python 3.10+ runtime
- pip package installation
- NumPy, Pandas, Matplotlib support
- Shortcuts automation
- File provider access

**Supported Libraries:**
- numpy
- pandas
- matplotlib
- scipy
- pillow
- opencv-python
- requests
- beautifulsoup4
- flask (local server)

**Example Shortcut URL:**
```
pyto://run?script=deploy.py
pyto://x-callback-url/run?code=print(%22Hello%22)
```

**Configuration file:** `.pyto/config.json`
```json
{
  "scripts": {
    "deploy": "scripts/deploy.py",
    "status": "scripts/check_status.py",
    "backup": "scripts/backup.py"
  },
  "packages": [
    "requests",
    "paramiko",
    "python-dotenv"
  ],
  "shortcuts": {
    "deploy_prod": {
      "script": "deploy.py",
      "args": ["--env", "production"]
    }
  }
}
```

---

## iOS Shortcuts Integration

All three apps support iOS Shortcuts for automation. Here's an example deployment workflow:

### Deployment Shortcut

```
1. Working Copy: Pull latest changes
   URL: working-copy://x-callback-url/pull?repo=MyApp

2. Pyto: Run deployment script
   URL: pyto://run?script=deploy.py

3. Shellfish: Check deployment status
   URL: shellfish://run?host=prod&command=systemctl%20status%20myapp

4. Notification: Show result
```

---

## Configuration Files

Place these configuration files in your repository to enable mobile tool integration:

```
.workingcopy/
  config.json       # Working Copy settings

.shellfish/
  hosts.json        # SSH host configurations

.pyto/
  config.json       # Pyto settings
  scripts/          # Python scripts for automation
    deploy.py
    status.py
```

---

## Security Notes

1. **Never commit sensitive credentials** - Use environment variables or iOS Keychain
2. **Use SSH keys** - Stored in each app's secure storage
3. **Enable 2FA** - On all remote services
4. **Review Shortcuts permissions** - Limit app access appropriately
