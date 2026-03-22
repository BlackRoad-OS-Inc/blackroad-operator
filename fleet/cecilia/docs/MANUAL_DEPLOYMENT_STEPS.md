# Infrastructure Deployment - Manual Steps

Since sudo requires password authentication, here are the exact commands to run manually on each Pi.

## Deploy to cecilia

```bash
ssh cecilia
sudo apt update && sudo apt upgrade -y

# nginx
sudo apt install -y nginx
sudo systemctl enable nginx && sudo systemctl restart nginx

# postfix
DEBIAN_FRONTEND=noninteractive sudo apt install -y postfix mailutils

# security
sudo apt install -y fail2ban ufw
sudo systemctl enable fail2ban && sudo systemctl restart fail2ban
sudo ufw --force enable
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp

# piper-tts
cd /tmp
wget https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_arm64.tar.gz
tar -xzf piper_arm64.tar.gz
sudo mv piper/piper /usr/local/bin/
rm -rf piper piper_arm64.tar.gz

# voice models
sudo mkdir -p /usr/local/share/piper
cd /usr/local/share/piper
sudo wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
sudo wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

echo "✅ Deployment complete on cecilia!"
exit
```

## Deploy to octavia  

```bash
ssh octavia
sudo apt update && sudo apt upgrade -y

# nginx (already installed, just ensure running)
sudo systemctl restart nginx

# postfix
DEBIAN_FRONTEND=noninteractive sudo apt install -y postfix mailutils

# security
sudo apt install -y fail2ban ufw
sudo systemctl enable fail2ban && sudo systemctl restart fail2ban
sudo ufw --force enable
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp

# piper-tts
cd /tmp
wget https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_arm64.tar.gz
tar -xzf piper_arm64.tar.gz
sudo mv piper/piper /usr/local/bin/
rm -rf piper piper_arm64.tar.gz

# voice models
sudo mkdir -p /usr/local/share/piper
cd /usr/local/share/piper
sudo wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
sudo wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

echo "✅ Deployment complete on octavia!"
exit
```

## Alternative: Create automated deployment

**If you want passwordless sudo**, add this to `/etc/sudoers.d/99-nopasswd`:

```bash
ssh cecilia
echo "$USER ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/99-nopasswd
sudo chmod 440 /etc/sudoers.d/99-nopasswd
exit
```

Then re-run:
```bash
bash deploy-mass-infrastructure.sh
```

## Or: Use ansible

Install ansible and use automated deployment:

```bash
brew install ansible
ansible-playbook -i hosts.ini deploy-infrastructure.yml
```

Choose your preferred method!
