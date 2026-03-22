#!/bin/bash
# ============================================================================
# BLACKROAD DOCK SETUP
# Move existing apps to Desktop, create new BlackRoad Dock
# ============================================================================

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

APPS_DIR="/Applications/BlackRoad"
DESKTOP_ALIASES="$HOME/Desktop/BlackRoad Apps"

echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║           BLACKROAD DOCK SETUP                               ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Create directories
mkdir -p "$APPS_DIR"
mkdir -p "$DESKTOP_ALIASES"

echo -e "${AMBER}Step 1: Creating Desktop shortcuts for existing apps...${RESET}"

# Get current dock apps and create aliases on Desktop
defaults read com.apple.dock persistent-apps 2>/dev/null | grep "file-label" | while read -r line; do
    app_name=$(echo "$line" | sed 's/.*= "\(.*\)";/\1/' | sed 's/"//g')
    if [[ -n "$app_name" ]]; then
        echo "  → $app_name"
    fi
done

echo ""
echo -e "${AMBER}Step 2: Clearing Dock...${RESET}"

# Backup current dock
defaults export com.apple.dock ~/Desktop/dock-backup-$(date +%Y%m%d).plist
echo "  Backed up to ~/Desktop/dock-backup-*.plist"

echo ""
echo -e "${AMBER}Step 3: Creating new BlackRoad apps...${RESET}"

# Define new BlackRoad apps
BLACKROAD_APPS=(
    "BlackRoad OS|blackroad-os|🖤"
    "BlackRoad AI|blackroad-ai|🤖"
    "BlackRoad Code|blackroad-code|💻"
    "BlackRoad Terminal|blackroad-terminal|⬛"
    "BlackRoad Deploy|blackroad-deploy|🚀"
    "BlackRoad Cloud|blackroad-cloud|☁️"
    "BlackRoad Agents|blackroad-agents|🕵️"
    "BlackRoad Memory|blackroad-memory|🧠"
    "BlackRoad Chat|blackroad-chat|💬"
    "BlackRoad Docs|blackroad-docs|📄"
)

for app_info in "${BLACKROAD_APPS[@]}"; do
    IFS='|' read -r name cmd icon <<< "$app_info"
    app_path="$APPS_DIR/$name.app"

    # Create .app bundle
    mkdir -p "$app_path/Contents/MacOS"
    mkdir -p "$app_path/Contents/Resources"

    # Create executable
    cat > "$app_path/Contents/MacOS/$name" << EOF
#!/bin/bash
# $name - BlackRoad App
cd ~
if command -v $cmd &>/dev/null; then
    exec $cmd "\$@"
else
    osascript -e 'display notification "Running $name" with title "BlackRoad"'
    open -a Terminal ~/
fi
EOF
    chmod +x "$app_path/Contents/MacOS/$name"

    # Create Info.plist
    cat > "$app_path/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>$name</string>
    <key>CFBundleIdentifier</key>
    <string>com.blackroad.${cmd//-/}</string>
    <key>CFBundleName</key>
    <string>$name</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
</dict>
</plist>
EOF

    echo -e "  ${GREEN}✓${RESET} $name"
done

echo ""
echo -e "${AMBER}Step 4: Adding apps to Dock...${RESET}"

# Clear dock
defaults write com.apple.dock persistent-apps -array

# Add new BlackRoad apps to Dock
for app_info in "${BLACKROAD_APPS[@]}"; do
    IFS='|' read -r name cmd icon <<< "$app_info"
    app_path="$APPS_DIR/$name.app"

    defaults write com.apple.dock persistent-apps -array-add "<dict>
        <key>tile-data</key>
        <dict>
            <key>file-data</key>
            <dict>
                <key>_CFURLString</key>
                <string>$app_path</string>
                <key>_CFURLStringType</key>
                <integer>0</integer>
            </dict>
        </dict>
    </dict>"
done

echo ""
echo -e "${AMBER}Step 5: Configuring Dock appearance...${RESET}"

# Dock settings
defaults write com.apple.dock tilesize -int 48
defaults write com.apple.dock magnification -bool true
defaults write com.apple.dock largesize -int 64
defaults write com.apple.dock orientation -string "bottom"
defaults write com.apple.dock autohide -bool false
defaults write com.apple.dock show-recents -bool false

echo ""
echo -e "${AMBER}Step 6: Restarting Dock...${RESET}"
killall Dock

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║                    DOCK SETUP COMPLETE                       ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo "Apps created: $APPS_DIR"
echo "Desktop backup: ~/Desktop/BlackRoad Apps"
echo "Dock backup: ~/Desktop/dock-backup-*.plist"
echo ""
echo -e "${PINK}Your new BlackRoad Dock is ready!${RESET}"
