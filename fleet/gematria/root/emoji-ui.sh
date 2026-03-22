source ~/colors.sh

ok()    { echo -e "${CLR_GREEN}🟢 $*${CLR_RESET}"; }
warn()  { echo -e "${CLR_YELLOW}⚠️  $*${CLR_RESET}"; }
err()   { echo -e "${CLR_RED}❌ $*${CLR_RESET}"; }
info()  { echo -e "${CLR_CYAN}ℹ️  $*${CLR_RESET}"; }
fire()  { echo -e "${CLR_MAGENTA}🔥 $*${CLR_RESET}"; }
launch(){ echo -e "${CLR_ORANGE}🚀 $*${CLR_RESET}"; }
brain() { echo -e "${CLR_PURPLE}🧠 $*${CLR_RESET}"; }
