export PATH=$HOME/.local/bin:$PATH
RCLONE=$(which rclone || echo ~/.local/bin/rclone)
LOG=~/.blackroad/logs/gdrive-sync.log
mkdir -p ~/.blackroad/logs
$RCLONE sync ~/blackroad gdrive-blackroad:blackroad-$(hostname)   --exclude ".git/**" --exclude "node_modules/**" --exclude "*.pyc"   --log-file=$LOG --log-level=INFO 2>&1
echo "$(date): sync complete" >> $LOG
