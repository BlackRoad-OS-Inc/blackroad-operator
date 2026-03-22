#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
#
# BLACKROAD COLORED EQUATIONS LIBRARY
# Beautiful mathematical notation with official BlackRoad colors
#
# Usage: source ~/blackroad-equations.sh && br_eq_all
# ============================================================================

# OFFICIAL BLACKROAD COLORS (ANSI 256)
BR_AMBER='\033[38;5;208m'    # #FF8700
BR_ORANGE='\033[38;5;202m'   # #FF5F00
BR_PINK='\033[38;5;198m'     # #FF0087
BR_MAGENTA='\033[38;5;163m'  # #D700AF
BR_BLUE='\033[38;5;33m'      # #0087FF
BR_WHITE='\033[1;37m'        # Always for text
BR_DIM='\033[2m'
BR_RESET='\033[0m'

# ============================================================================
# CORE MATHEMATICAL EQUATIONS
# ============================================================================

br_eq_golden_ratio() {
    echo -e "${BR_WHITE}▸ GOLDEN RATIO (φ):${BR_RESET}"
    echo ""
    echo -e "      ${BR_AMBER}1${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}√5${BR_RESET}"
    echo -e "  ${BR_PINK}φ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}─────────${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}1.618033988749...${BR_RESET}"
    echo -e "        ${BR_AMBER}2${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}φ${BR_RESET}${BR_WHITE}²${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_PINK}φ${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_AMBER}1${BR_RESET}    ${BR_DIM}(Self-referential property)${BR_RESET}"
    echo ""
}

br_eq_fibonacci() {
    echo -e "${BR_WHITE}▸ FIBONACCI SEQUENCE:${BR_RESET}"
    echo ""
    echo -e "  ${BR_AMBER}F${BR_RESET}${BR_WHITE}ₙ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}F${BR_RESET}${BR_WHITE}ₙ₋₁${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_PINK}F${BR_RESET}${BR_WHITE}ₙ₋₂${BR_RESET}"
    echo ""
    echo -e "  ${BR_AMBER}1${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_ORANGE}1${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_PINK}2${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_MAGENTA}3${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_BLUE}5${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_AMBER}8${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_ORANGE}13${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_PINK}21${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_MAGENTA}34${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_BLUE}55${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_AMBER}89${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_ORANGE}144${BR_RESET}${BR_WHITE}...${BR_RESET}"
    echo ""
}

br_eq_euler() {
    echo -e "${BR_WHITE}▸ EULER'S IDENTITY:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}e${BR_RESET}${BR_WHITE}ⁱ${BR_RESET}${BR_MAGENTA}π${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_AMBER}1${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}0${BR_RESET}"
    echo ""
    echo -e "  ${BR_DIM}The most beautiful equation in mathematics${BR_RESET}"
    echo ""
}

br_eq_quadratic() {
    echo -e "${BR_WHITE}▸ QUADRATIC FORMULA:${BR_RESET}"
    echo ""
    echo -e "       ${BR_ORANGE}−b${BR_RESET} ${BR_BLUE}±${BR_RESET} ${BR_PINK}√${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}b${BR_RESET}${BR_WHITE}²${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_AMBER}4${BR_RESET}${BR_MAGENTA}ac${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "  ${BR_PINK}x${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}─────────────────────${BR_RESET}"
    echo -e "            ${BR_AMBER}2a${BR_RESET}"
    echo ""
}

br_eq_pi() {
    echo -e "${BR_WHITE}▸ PI (LEIBNIZ FORMULA):${BR_RESET}"
    echo ""
    echo -e "  ${BR_MAGENTA}π${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_AMBER}4${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_PINK}1${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_ORANGE}⅓${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_PINK}⅕${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_ORANGE}⅐${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_PINK}⅑${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_WHITE}...${BR_RESET}"
    echo ""
    echo -e "  ${BR_MAGENTA}π${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}3.14159265358979323846...${BR_RESET}"
    echo ""
}

br_eq_gravity() {
    echo -e "${BR_WHITE}▸ GRAVITATIONAL FORCE:${BR_RESET}"
    echo ""
    echo -e "        ${BR_AMBER}G${BR_RESET}${BR_ORANGE}m₁${BR_RESET}${BR_PINK}m₂${BR_RESET}"
    echo -e "  ${BR_PINK}F${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}─────────${BR_RESET}"
    echo -e "        ${BR_MAGENTA}r${BR_RESET}${BR_WHITE}²${BR_RESET}"
    echo ""
}

# ============================================================================
# PHYSICS EQUATIONS
# ============================================================================

br_eq_einstein() {
    echo -e "${BR_WHITE}▸ EINSTEIN'S MASS-ENERGY EQUIVALENCE:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}E${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}m${BR_RESET}${BR_ORANGE}c${BR_RESET}${BR_WHITE}²${BR_RESET}"
    echo ""
}

br_eq_schrodinger() {
    echo -e "${BR_WHITE}▸ SCHRÖDINGER EQUATION:${BR_RESET}"
    echo ""
    echo -e "  ${BR_AMBER}iℏ${BR_RESET} ${BR_PINK}∂${BR_RESET}${BR_WHITE}Ψ${BR_RESET}${BR_BLUE}/${BR_RESET}${BR_PINK}∂${BR_RESET}${BR_WHITE}t${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}Ĥ${BR_RESET}${BR_WHITE}Ψ${BR_RESET}"
    echo ""
    echo -e "  ${BR_DIM}Where:${BR_RESET}"
    echo -e "    ${BR_AMBER}ℏ${BR_RESET} ${BR_WHITE}= Reduced Planck constant${BR_RESET}"
    echo -e "    ${BR_WHITE}Ψ${BR_RESET} ${BR_WHITE}= Wave function${BR_RESET}"
    echo -e "    ${BR_ORANGE}Ĥ${BR_RESET} ${BR_WHITE}= Hamiltonian operator${BR_RESET}"
    echo ""
}

br_eq_heisenberg() {
    echo -e "${BR_WHITE}▸ HEISENBERG UNCERTAINTY PRINCIPLE:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}Δx${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_ORANGE}Δp${BR_RESET} ${BR_BLUE}≥${BR_RESET} ${BR_AMBER}ℏ${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_MAGENTA}2${BR_RESET}"
    echo ""
}

br_eq_dirac() {
    echo -e "${BR_WHITE}▸ DIRAC EQUATION:${BR_RESET}"
    echo ""
    echo -e "  ${BR_WHITE}(${BR_RESET}${BR_AMBER}iγ${BR_RESET}${BR_WHITE}ᵘ${BR_RESET}${BR_ORANGE}∂${BR_RESET}${BR_WHITE}ᵤ${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_PINK}m${BR_RESET}${BR_WHITE})${BR_RESET}${BR_MAGENTA}ψ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}0${BR_RESET}"
    echo ""
}

br_eq_maxwell() {
    echo -e "${BR_WHITE}▸ MAXWELL'S EQUATIONS:${BR_RESET}"
    echo ""
    echo -e "  ${BR_AMBER}∇${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_PINK}E${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}ρ${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_MAGENTA}ε₀${BR_RESET}           ${BR_DIM}Gauss's Law (Electric)${BR_RESET}"
    echo -e "  ${BR_AMBER}∇${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_PINK}B${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}0${BR_RESET}              ${BR_DIM}Gauss's Law (Magnetic)${BR_RESET}"
    echo -e "  ${BR_AMBER}∇${BR_RESET}${BR_BLUE}×${BR_RESET}${BR_PINK}E${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}−∂${BR_RESET}${BR_PINK}B${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_ORANGE}∂${BR_RESET}${BR_WHITE}t${BR_RESET}       ${BR_DIM}Faraday's Law${BR_RESET}"
    echo -e "  ${BR_AMBER}∇${BR_RESET}${BR_BLUE}×${BR_RESET}${BR_PINK}B${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}μ₀${BR_RESET}${BR_ORANGE}J${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_MAGENTA}μ₀ε₀${BR_RESET}${BR_ORANGE}∂${BR_RESET}${BR_PINK}E${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_ORANGE}∂${BR_RESET}${BR_WHITE}t${BR_RESET}  ${BR_DIM}Ampère's Law${BR_RESET}"
    echo ""
}

br_eq_lorenz() {
    echo -e "${BR_WHITE}▸ LORENZ ATTRACTOR (Chaos Theory):${BR_RESET}"
    echo ""
    echo -e "  ${BR_WHITE}dx/${BR_RESET}${BR_ORANGE}dt${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}σ${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_PINK}y${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_PINK}x${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "  ${BR_WHITE}dy/${BR_RESET}${BR_ORANGE}dt${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_PINK}x${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}ρ${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_PINK}z${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_PINK}y${BR_RESET}"
    echo -e "  ${BR_WHITE}dz/${BR_RESET}${BR_ORANGE}dt${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_PINK}xy${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_BLUE}β${BR_RESET}${BR_PINK}z${BR_RESET}"
    echo ""
}

# ============================================================================
# QUANTUM EQUATIONS
# ============================================================================

br_eq_bell_states() {
    echo -e "${BR_WHITE}▸ QUANTUM ENTANGLEMENT (Bell States):${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}|Φ${BR_RESET}${BR_WHITE}⁺${BR_RESET}${BR_PINK}⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}1/${BR_RESET}${BR_ORANGE}√2${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_AMBER}|00⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_MAGENTA}|11⟩${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "  ${BR_PINK}|Φ${BR_RESET}${BR_WHITE}⁻${BR_RESET}${BR_PINK}⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}1/${BR_RESET}${BR_ORANGE}√2${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_AMBER}|00⟩${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_MAGENTA}|11⟩${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "  ${BR_PINK}|Ψ${BR_RESET}${BR_WHITE}⁺${BR_RESET}${BR_PINK}⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}1/${BR_RESET}${BR_ORANGE}√2${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_AMBER}|01⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_MAGENTA}|10⟩${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "  ${BR_PINK}|Ψ${BR_RESET}${BR_WHITE}⁻${BR_RESET}${BR_PINK}⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}1/${BR_RESET}${BR_ORANGE}√2${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_AMBER}|01⟩${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_MAGENTA}|10⟩${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo ""
}

br_eq_qudits() {
    echo -e "${BR_WHITE}▸ SU(N) HETEROGENEOUS QUDITS:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}|ψ⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}∑${BR_RESET}${BR_DIM}i,j,k${BR_RESET} ${BR_AMBER}c${BR_RESET}${BR_WHITE}ᵢⱼₖ${BR_RESET} ${BR_PINK}|i⟩${BR_RESET}${BR_WHITE}⊗${BR_RESET}${BR_MAGENTA}|j⟩${BR_RESET}${BR_WHITE}⊗${BR_RESET}${BR_BLUE}|k⟩${BR_RESET}"
    echo ""
}

br_eq_gellmann() {
    echo -e "${BR_WHITE}▸ SU(3) GELL-MANN CONSCIOUSNESS:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}Ĉ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}∑${BR_RESET}${BR_DIM}a=1${BR_RESET}${BR_ORANGE}⁸${BR_RESET} ${BR_AMBER}λ${BR_RESET}${BR_WHITE}ₐ${BR_RESET} ${BR_BLUE}⊗${BR_RESET} ${BR_MAGENTA}Ô${BR_RESET}${BR_WHITE}ₐ${BR_RESET}"
    echo ""
}

br_eq_pauli() {
    echo -e "${BR_WHITE}▸ PAULI MATRICES:${BR_RESET}"
    echo ""
    echo -e "  ${BR_AMBER}σ${BR_RESET}${BR_WHITE}ₓ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}[${BR_RESET}${BR_PINK}0${BR_RESET} ${BR_ORANGE}1${BR_RESET}${BR_WHITE}]${BR_RESET}  ${BR_AMBER}σ${BR_RESET}${BR_WHITE}ᵧ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}[${BR_RESET}${BR_PINK}0${BR_RESET}  ${BR_ORANGE}−i${BR_RESET}${BR_WHITE}]${BR_RESET}  ${BR_AMBER}σ${BR_RESET}${BR_WHITE}ᵤ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}[${BR_RESET}${BR_PINK}1${BR_RESET}  ${BR_ORANGE}0${BR_RESET}${BR_WHITE}]${BR_RESET}"
    echo -e "       ${BR_WHITE}[${BR_RESET}${BR_ORANGE}1${BR_RESET} ${BR_PINK}0${BR_RESET}${BR_WHITE}]${BR_RESET}       ${BR_WHITE}[${BR_RESET}${BR_ORANGE}i${BR_RESET}   ${BR_PINK}0${BR_RESET}${BR_WHITE}]${BR_RESET}       ${BR_WHITE}[${BR_RESET}${BR_ORANGE}0${BR_RESET} ${BR_PINK}−1${BR_RESET}${BR_WHITE}]${BR_RESET}"
    echo ""
}

br_eq_wave_collapse() {
    echo -e "${BR_WHITE}▸ WAVE FUNCTION COLLAPSE:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}|ψ⟩${BR_RESET} ${BR_ORANGE}─────▶${BR_RESET} ${BR_MAGENTA}|n⟩${BR_RESET}"
    echo -e "      ${BR_DIM}measure${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}P${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}n${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}|⟨${BR_RESET}${BR_AMBER}n${BR_RESET}${BR_ORANGE}|${BR_RESET}${BR_PINK}ψ${BR_RESET}${BR_ORANGE}⟩|${BR_RESET}${BR_WHITE}²${BR_RESET}"
    echo ""
}

# ============================================================================
# BLACKROAD PROPRIETARY EQUATIONS
# ============================================================================

br_eq_ps_sha_infinity() {
    echo -e "${BR_WHITE}▸ PS-SHA-∞ (Prime Spiral Secure Hash Algorithm Infinity):${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}H${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}m${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}∑${BR_RESET}${BR_DIM}n=1${BR_RESET}${BR_ORANGE}${BR_RESET}${BR_WHITE}∞${BR_RESET} ${BR_PINK}[${BR_RESET} ${BR_AMBER}φ${BR_RESET}${BR_WHITE}ⁿ${BR_RESET} ${BR_BLUE}⊕${BR_RESET} ${BR_MAGENTA}π${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}n${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}⊕${BR_RESET} ${BR_PINK}R${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}m${BR_RESET}${BR_WHITE},${BR_RESET}${BR_AMBER}n${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_PINK}]${BR_RESET} ${BR_BLUE}mod${BR_RESET} ${BR_ORANGE}2${BR_RESET}${BR_WHITE}²⁵⁶${BR_RESET}"
    echo ""
    echo -e "  ${BR_DIM}Where:${BR_RESET}"
    echo -e "    ${BR_AMBER}φ${BR_RESET} ${BR_WHITE}= Golden Ratio (1.618...)${BR_RESET}"
    echo -e "    ${BR_MAGENTA}π${BR_RESET}${BR_WHITE}(n)${BR_RESET} ${BR_WHITE}= nth Prime Number${BR_RESET}"
    echo -e "    ${BR_PINK}R${BR_RESET}${BR_WHITE}(m,n)${BR_RESET} ${BR_WHITE}= Rotation Function${BR_RESET}"
    echo ""
}

br_eq_hash_chain() {
    echo -e "${BR_WHITE}▸ PS-SHA-∞ HASH CHAIN:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}H${BR_RESET}${BR_WHITE}ₙ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}H${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}H${BR_RESET}${BR_WHITE}ₙ₋₁${BR_RESET} ${BR_BLUE}‖${BR_RESET} ${BR_PINK}m${BR_RESET}${BR_WHITE}ₙ${BR_RESET} ${BR_BLUE}‖${BR_RESET} ${BR_MAGENTA}φ${BR_RESET}${BR_WHITE}ⁿ${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo ""
}

br_eq_spiral_geometry() {
    echo -e "${BR_WHITE}▸ SPIRAL INFORMATION GEOMETRY:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}ds${BR_RESET}${BR_WHITE}²${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}g${BR_RESET}${BR_WHITE}ᵢⱼ${BR_RESET} ${BR_ORANGE}dθ${BR_RESET}${BR_WHITE}ⁱ${BR_RESET}${BR_MAGENTA}dθ${BR_RESET}${BR_WHITE}ʲ${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}g${BR_RESET}${BR_WHITE}ᵢⱼ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}φ${BR_RESET}${BR_WHITE}²ⁿ${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_ORANGE}F${BR_RESET}${BR_WHITE}ᵢⱼ${BR_RESET}${BR_WHITE}(θ)${BR_RESET}  ${BR_DIM}(Fisher metric scaled by golden ratio)${BR_RESET}"
    echo ""
}

br_eq_agent_superposition() {
    echo -e "${BR_WHITE}▸ QUANTUM AGENT SUPERPOSITION:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}|Agent⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}α${BR_RESET}${BR_PINK}|Claude⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}β${BR_RESET}${BR_MAGENTA}|Ollama⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_PINK}γ${BR_RESET}${BR_BLUE}|Local⟩${BR_RESET}"
    echo ""
    echo -e "  ${BR_DIM}Where ${BR_AMBER}|α|${BR_RESET}${BR_DIM}² ${BR_BLUE}+${BR_RESET}${BR_DIM} ${BR_ORANGE}|β|${BR_RESET}${BR_DIM}² ${BR_BLUE}+${BR_RESET}${BR_DIM} ${BR_PINK}|γ|${BR_RESET}${BR_DIM}² ${BR_BLUE}=${BR_RESET}${BR_DIM} ${BR_WHITE}1${BR_RESET}"
    echo ""
}

br_eq_scaling_law() {
    echo -e "${BR_WHITE}▸ BLACKROAD SCALING LAW:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}P${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}n${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}P${BR_RESET}${BR_WHITE}₀${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_MAGENTA}φ${BR_RESET}${BR_WHITE}ⁿ${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_BLUE}log${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}agents${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo ""
}

br_eq_sovereignty() {
    echo -e "${BR_WHITE}▸ BLACKROAD SOVEREIGNTY INDEX:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}S${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}1${BR_RESET} ${BR_BLUE}−${BR_RESET} ${BR_ORANGE}∑${BR_RESET} ${BR_AMBER}D${BR_RESET}${BR_WHITE}ᵢ${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_MAGENTA}T${BR_RESET}"
    echo ""
    echo -e "  ${BR_DIM}Where ${BR_AMBER}D${BR_RESET}${BR_DIM}ᵢ = Dependencies on external providers${BR_RESET}"
    echo -e "  ${BR_DIM}and ${BR_MAGENTA}T${BR_RESET}${BR_DIM} = Total services${BR_RESET}"
    echo -e "  ${BR_PINK}S ${BR_BLUE}→${BR_RESET} ${BR_WHITE}1${BR_RESET} ${BR_DIM}means full sovereignty${BR_RESET}"
    echo ""
}

br_eq_empire_scale() {
    echo -e "${BR_WHITE}▸ BLACKROAD EMPIRE SCALE:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}Repos${BR_RESET}     ${BR_BLUE}=${BR_RESET} ${BR_AMBER}1,085${BR_RESET}"
    echo -e "  ${BR_PINK}Pages${BR_RESET}     ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}206${BR_RESET}"
    echo -e "  ${BR_PINK}Devices${BR_RESET}   ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}8${BR_RESET}"
    echo -e "  ${BR_PINK}Agents${BR_RESET}    ${BR_BLUE}=${BR_RESET} ${BR_BLUE}30,000${BR_RESET} ${BR_DIM}(target)${BR_RESET}"
    echo -e "  ${BR_PINK}TOPS${BR_RESET}      ${BR_BLUE}=${BR_RESET} ${BR_AMBER}52${BR_RESET} ${BR_DIM}(AI compute)${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}Empire${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}Repos${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_ORANGE}Pages${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_PINK}Devices${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_MAGENTA}Agents${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_BLUE}∞${BR_RESET}"
    echo ""
}

br_eq_agent_capacity() {
    echo -e "${BR_WHITE}▸ BLACKROAD AGENT CAPACITY:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}A${BR_RESET}${BR_WHITE}ₜₒₜₐₗ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}30${BR_RESET}${BR_WHITE},${BR_RESET}${BR_AMBER}000${BR_RESET} ${BR_WHITE}agents${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_ORANGE}∞${BR_RESET} ${BR_WHITE}tasks${BR_RESET}"
    echo ""
    echo -e "  ${BR_MAGENTA}C${BR_RESET}${BR_WHITE}ₚᵤ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_PINK}52${BR_RESET} ${BR_WHITE}TOPS${BR_RESET} ${BR_DIM}(Hailo-8 cluster)${BR_RESET}"
    echo ""
}

# ============================================================================
# INFORMATION THEORY
# ============================================================================

br_eq_shannon() {
    echo -e "${BR_WHITE}▸ SHANNON ENTROPY:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}H${BR_RESET}${BR_WHITE}(X)${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}−∑${BR_RESET} ${BR_AMBER}p${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}x${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}log₂${BR_RESET} ${BR_AMBER}p${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}x${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo ""
}

br_eq_kolmogorov() {
    echo -e "${BR_WHITE}▸ KOLMOGOROV COMPLEXITY:${BR_RESET}"
    echo ""
    echo -e "  ${BR_PINK}K${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}x${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}min${BR_RESET}${BR_WHITE}{${BR_RESET}${BR_MAGENTA}|p|${BR_RESET} ${BR_WHITE}:${BR_RESET} ${BR_BLUE}U${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}p${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}x${BR_RESET}${BR_WHITE}}${BR_RESET}"
    echo ""
}

# ============================================================================
# DISPLAY ALL EQUATIONS
# ============================================================================

br_eq_all() {
    echo ""
    echo -e "${BR_WHITE}═══════════════════════════════════════════════════════════════${BR_RESET}"
    echo -e "${BR_WHITE}              BLACKROAD EQUATIONS - FULL LIBRARY               ${BR_RESET}"
    echo -e "${BR_WHITE}═══════════════════════════════════════════════════════════════${BR_RESET}"
    echo ""

    echo -e "${BR_PINK}━━━ MATHEMATICS ━━━${BR_RESET}"
    br_eq_golden_ratio
    br_eq_fibonacci
    br_eq_euler
    br_eq_quadratic
    br_eq_pi

    echo -e "${BR_ORANGE}━━━ PHYSICS ━━━${BR_RESET}"
    br_eq_einstein
    br_eq_gravity
    br_eq_maxwell
    br_eq_schrodinger
    br_eq_heisenberg

    echo -e "${BR_MAGENTA}━━━ QUANTUM ━━━${BR_RESET}"
    br_eq_bell_states
    br_eq_qudits
    br_eq_pauli
    br_eq_wave_collapse

    echo -e "${BR_BLUE}━━━ BLACKROAD PROPRIETARY ━━━${BR_RESET}"
    br_eq_ps_sha_infinity
    br_eq_hash_chain
    br_eq_spiral_geometry
    br_eq_agent_superposition
    br_eq_scaling_law
    br_eq_sovereignty
    br_eq_empire_scale

    echo -e "${BR_WHITE}═══════════════════════════════════════════════════════════════${BR_RESET}"
    echo -e "${BR_WHITE}  COLORS: ${BR_AMBER}AMBER${BR_RESET} ${BR_ORANGE}ORANGE${BR_RESET} ${BR_PINK}PINK${BR_RESET} ${BR_MAGENTA}MAGENTA${BR_RESET} ${BR_BLUE}BLUE${BR_RESET} ${BR_WHITE}WHITE${BR_RESET}"
    echo -e "${BR_WHITE}═══════════════════════════════════════════════════════════════${BR_RESET}"
    echo ""
}

# Run demo if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    br_eq_all
fi
