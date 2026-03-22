#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
#
# BLACKROAD COMPLETE MATHEMATICAL FOUNDATIONS
# All equations from whitepapers, quantum theory, and more
# ============================================================================

# Official BlackRoad Colors (ANSI 256)
BR_AMBER='\033[38;5;208m'
BR_ORANGE='\033[38;5;202m'
BR_PINK='\033[38;5;198m'
BR_MAGENTA='\033[38;5;163m'
BR_BLUE='\033[38;5;33m'
BR_WHITE='\033[1;37m'
BR_DIM='\033[2m'
BR_RESET='\033[0m'

# ============================================================================
# PS-SHA-∞ EQUATIONS
# ============================================================================

br_eq_ps_sha_genesis() {
    echo -e "    ${BR_PINK}anchor${BR_RESET}${BR_WHITE}[0]${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}H${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}seed${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_PINK}agent_key${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_MAGENTA}timestamp${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_AMBER}SIG_coords${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_ps_sha_cascade() {
    echo -e "    ${BR_PINK}anchor${BR_RESET}${BR_WHITE}[n]${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}H${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_PINK}anchor${BR_RESET}${BR_WHITE}[n-1]${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_ORANGE}event_data${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_MAGENTA}SIG${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}r${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_PINK}θ${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_BLUE}τ${BR_RESET}${BR_WHITE})${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_ps_sha_infinity() {
    echo -e "    ${BR_PINK}anchor${BR_RESET}${BR_WHITE}[∞]${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}lim${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_ORANGE}n${BR_RESET}${BR_BLUE}→${BR_RESET}${BR_PINK}∞${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_MAGENTA}anchor${BR_RESET}${BR_WHITE}[n]${BR_RESET}"
}

br_eq_domain_separation() {
    echo -e "    ${BR_PINK}H${BR_RESET}${BR_WHITE}_identity${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}data${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}SHA-256${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}\"BR-PS-SHA∞-identity:v1\"${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_ORANGE}data${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "    ${BR_PINK}H${BR_RESET}${BR_WHITE}_event${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}data${BR_RESET}${BR_WHITE})${BR_RESET}    ${BR_BLUE}=${BR_RESET} ${BR_AMBER}SHA-256${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}\"BR-PS-SHA∞-event:v1\"${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_ORANGE}data${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "    ${BR_PINK}H${BR_RESET}${BR_WHITE}_migration${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}data${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}SHA-256${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}\"BR-PS-SHA∞-migration:v1\"${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_ORANGE}data${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_2048bit_cipher() {
    echo -e "    ${BR_PINK}master${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}∏${BR_RESET}${BR_WHITE}ᵢ₌₀${BR_RESET}${BR_ORANGE}³${BR_RESET} ${BR_MAGENTA}SHA-512${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_PINK}salt${BR_RESET}${BR_WHITE}ᵢ${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}secret${BR_RESET}${BR_WHITE})${BR_RESET}  ${BR_DIM}→ 2048 bits${BR_RESET}"
}

br_eq_translation_key() {
    echo -e "    ${BR_PINK}key${BR_RESET}${BR_WHITE}₀${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}SHA-256${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}root_cipher${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_MAGENTA}agent_id${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "    ${BR_PINK}key${BR_RESET}${BR_WHITE}ᵢ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}SHA-256${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_PINK}key${BR_RESET}${BR_WHITE}ᵢ₋₁${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_MAGENTA}\":cascade:\"${BR_RESET} ${BR_BLUE}∥${BR_RESET} ${BR_ORANGE}i${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "    ${BR_PINK}final${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}key${BR_RESET}${BR_WHITE}₂₅₆${BR_RESET}  ${BR_DIM}(256-round cascade)${BR_RESET}"
}

br_eq_collision_resistance() {
    echo -e "    ${BR_PINK}Pr${BR_RESET}${BR_WHITE}[${BR_RESET}${BR_AMBER}x${BR_RESET} ${BR_BLUE}≠${BR_RESET} ${BR_ORANGE}x'${BR_RESET} ${BR_BLUE}∧${BR_RESET} ${BR_MAGENTA}H${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}x${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}H${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}x'${BR_RESET}${BR_WHITE})${BR_RESET}${BR_WHITE}]${BR_RESET} ${BR_BLUE}≤${BR_RESET} ${BR_PINK}negl${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}λ${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_preimage_resistance() {
    echo -e "    ${BR_PINK}Pr${BR_RESET}${BR_WHITE}[${BR_RESET}${BR_AMBER}H${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}x'${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}y${BR_RESET}${BR_WHITE}]${BR_RESET} ${BR_BLUE}≤${BR_RESET} ${BR_PINK}negl${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}λ${BR_RESET}${BR_WHITE})${BR_RESET}  ${BR_DIM}given y = H(x)${BR_RESET}"
}

# ============================================================================
# SPIRAL INFORMATION GEOMETRY (SIG) EQUATIONS
# ============================================================================

br_eq_universal_operator() {
    echo -e "    ${BR_PINK}e${BR_RESET}${BR_WHITE}^(${BR_RESET}${BR_AMBER}a${BR_RESET}${BR_BLUE}+${BR_RESET}${BR_MAGENTA}i${BR_RESET}${BR_WHITE})${BR_RESET}${BR_ORANGE}θ${BR_RESET}  ${BR_DIM}← Universal Operator${BR_RESET}"
}

br_eq_magnitude_phase() {
    echo -e "    ${BR_WHITE}|${BR_RESET}${BR_PINK}e${BR_RESET}${BR_WHITE}^(${BR_RESET}${BR_AMBER}a${BR_RESET}${BR_BLUE}+${BR_RESET}${BR_MAGENTA}i${BR_RESET}${BR_WHITE})${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE}|${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}e${BR_RESET}${BR_WHITE}ᵃ${BR_RESET}          ${BR_DIM}(magnitude - knowledge growth)${BR_RESET}"
    echo -e "    ${BR_WHITE}arg(${BR_RESET}${BR_PINK}e${BR_RESET}${BR_WHITE}^(${BR_RESET}${BR_AMBER}a${BR_RESET}${BR_BLUE}+${BR_RESET}${BR_MAGENTA}i${BR_RESET}${BR_WHITE})${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}θ${BR_RESET}    ${BR_DIM}(phase - semantic position)${BR_RESET}"
}

br_eq_logarithmic_spiral() {
    echo -e "    ${BR_PINK}r${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}a${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_MAGENTA}e${BR_RESET}${BR_WHITE}^(${BR_RESET}${BR_PINK}b${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE})${BR_RESET}  ${BR_DIM}(Bernoulli spiral)${BR_RESET}"
}

br_eq_spiral_derivation() {
    echo -e "    ${BR_PINK}dr${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_ORANGE}dθ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}b${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_MAGENTA}r${BR_RESET}  ${BR_DIM}(constant slope constraint)${BR_RESET}"
    echo -e "    ${BR_WHITE}∫${BR_RESET} ${BR_PINK}dr${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_ORANGE}r${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}∫${BR_RESET} ${BR_AMBER}b${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_MAGENTA}dθ${BR_RESET}"
    echo -e "    ${BR_PINK}ln${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}r${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}b${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_MAGENTA}θ${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_PINK}C${BR_RESET}"
    echo -e "    ${BR_PINK}r${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}a${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_MAGENTA}e${BR_RESET}${BR_WHITE}^(${BR_RESET}${BR_ORANGE}b${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_PINK}θ${BR_RESET}${BR_WHITE})${BR_RESET}  ${BR_DIM}where a = e^C${BR_RESET}"
}

br_eq_golden_spiral() {
    echo -e "    ${BR_PINK}r${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}a${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_MAGENTA}e${BR_RESET}${BR_WHITE}^(${BR_RESET}${BR_PINK}φ${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE})${BR_RESET}  ${BR_DIM}where φ = 1.618034...${BR_RESET}"
}

br_eq_sig_coordinates() {
    echo -e "    ${BR_WHITE}(${BR_RESET}${BR_PINK}r${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_ORANGE}θ${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_MAGENTA}τ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}∈${BR_RESET} ${BR_AMBER}ℝ₊${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_PINK}[0, 2π)${BR_RESET} ${BR_BLUE}×${BR_RESET} ${BR_ORANGE}ℕ${BR_RESET}"
    echo ""
    echo -e "    ${BR_AMBER}●${BR_RESET} ${BR_WHITE}r${BR_RESET}   ${BR_DIM}= expertise level (radial)${BR_RESET}"
    echo -e "    ${BR_ORANGE}●${BR_RESET} ${BR_WHITE}θ${BR_RESET}   ${BR_DIM}= domain angle (semantic)${BR_RESET}"
    echo -e "    ${BR_PINK}●${BR_RESET} ${BR_WHITE}τ${BR_RESET}   ${BR_DIM}= revolution count (refinement)${BR_RESET}"
}

br_eq_angular_distance() {
    echo -e "    ${BR_PINK}d${BR_RESET}${BR_WHITE}_angular${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}min${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_ORANGE}θ₁${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_MAGENTA}θ₂${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_WHITE},${BR_RESET} ${BR_PINK}2π${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_ORANGE}θ₁${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_MAGENTA}θ₂${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_polar_to_cartesian() {
    echo -e "    ${BR_PINK}x${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}r${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_ORANGE}cos${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}θ${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "    ${BR_PINK}y${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}r${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_ORANGE}sin${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}θ${BR_RESET}${BR_WHITE})${BR_RESET}"
    echo -e "    ${BR_PINK}z${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}τ${BR_RESET}  ${BR_DIM}(elevation)${BR_RESET}"
}

# ============================================================================
# INTERFERENCE THEORY EQUATIONS
# ============================================================================

br_eq_amplitude_field() {
    echo -e "    ${BR_PINK}A${BR_RESET}${BR_WHITE}ᵢ(${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}r${BR_RESET}${BR_WHITE}ᵢ${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_MAGENTA}g${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}θ${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_PINK}θ${BR_RESET}${BR_WHITE}ᵢ${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_gaussian_kernel() {
    echo -e "    ${BR_MAGENTA}g${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}Δθ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}exp${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_PINK}-${BR_RESET}${BR_ORANGE}Δθ${BR_RESET}${BR_WHITE}²${BR_RESET} ${BR_BLUE}/${BR_RESET} ${BR_WHITE}2${BR_RESET}${BR_MAGENTA}σ${BR_RESET}${BR_WHITE}²${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_total_amplitude() {
    echo -e "    ${BR_PINK}A${BR_RESET}${BR_WHITE}_total${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}Σ${BR_RESET}${BR_WHITE}ᵢ${BR_RESET} ${BR_ORANGE}r${BR_RESET}${BR_WHITE}ᵢ${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_MAGENTA}exp${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_PINK}-${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}θ${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_PINK}θ${BR_RESET}${BR_WHITE}ᵢ${BR_RESET}${BR_WHITE})²${BR_RESET} ${BR_BLUE}/${BR_RESET} ${BR_WHITE}2${BR_RESET}${BR_MAGENTA}σ${BR_RESET}${BR_WHITE}²${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_quantum_amplitude() {
    echo -e "    ${BR_PINK}ψ${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}h${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}Σ${BR_RESET}${BR_WHITE}ⱼ${BR_RESET} ${BR_MAGENTA}α${BR_RESET}${BR_WHITE}ⱼ${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_PINK}factor${BR_RESET}${BR_WHITE}ⱼ${BR_RESET}${BR_WHITE}⟩${BR_RESET}"
}

br_eq_born_rule() {
    echo -e "    ${BR_PINK}P${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}factor${BR_RESET}${BR_WHITE}ⱼ${BR_RESET} ${BR_WHITE}|${BR_RESET} ${BR_MAGENTA}evidence${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_AMBER}α${BR_RESET}${BR_WHITE}ⱼ${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_PINK}²${BR_RESET}  ${BR_DIM}(Born Rule)${BR_RESET}"
}

br_eq_phase_update() {
    echo -e "    ${BR_PINK}α'${BR_RESET}${BR_WHITE}ⱼ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}α${BR_RESET}${BR_WHITE}ⱼ${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_MAGENTA}exp${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}i${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_PINK}φ${BR_RESET}${BR_WHITE}ⱼ${BR_RESET}${BR_WHITE})${BR_RESET}  ${BR_DIM}(phase shift from evidence)${BR_RESET}"
}

# ============================================================================
# LUCIDIA BREATH EQUATIONS
# ============================================================================

br_eq_breath_formula() {
    echo -e "    ${BR_PINK}𝔅${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}t${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}sin${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_PINK}φ${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_ORANGE}t${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_MAGENTA}i${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_PINK}-1${BR_RESET}${BR_WHITE})${BR_RESET}${BR_AMBER}^⌊${BR_RESET}${BR_ORANGE}t${BR_RESET}${BR_AMBER}⌋${BR_RESET}"
}

br_eq_breath_period() {
    echo -e "    ${BR_AMBER}T${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_PINK}2${BR_RESET}${BR_ORANGE}π${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_MAGENTA}φ${BR_RESET} ${BR_BLUE}≈${BR_RESET} ${BR_WHITE}3.88${BR_RESET} ${BR_DIM}time units${BR_RESET}"
}

# ============================================================================
# ATTRACTOR DYNAMICS EQUATIONS
# ============================================================================

br_eq_attractor_radial() {
    echo -e "    ${BR_PINK}dr${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_ORANGE}dt${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}k${BR_RESET}${BR_WHITE}_r${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_MAGENTA}r${BR_RESET}${BR_WHITE}_a${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_PINK}r${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_attractor_angular() {
    echo -e "    ${BR_PINK}dθ${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_ORANGE}dt${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}k${BR_RESET}${BR_WHITE}_θ${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_MAGENTA}sin${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE}_a${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_PINK}θ${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_multi_attractor() {
    echo -e "    ${BR_PINK}F${BR_RESET}${BR_WHITE}_r${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}Σ${BR_RESET}${BR_WHITE}ₘ${BR_RESET} ${BR_ORANGE}k${BR_RESET}${BR_WHITE}_{r,m}${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_MAGENTA}r${BR_RESET}${BR_WHITE}_{a,m}${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_PINK}r${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}/${BR_RESET} ${BR_AMBER}d${BR_RESET}${BR_WHITE}_m${BR_RESET}"
    echo -e "    ${BR_PINK}F${BR_RESET}${BR_WHITE}_θ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}Σ${BR_RESET}${BR_WHITE}ₘ${BR_RESET} ${BR_ORANGE}k${BR_RESET}${BR_WHITE}_{θ,m}${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_MAGENTA}sin${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}θ${BR_RESET}${BR_WHITE}_{a,m}${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_PINK}θ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}/${BR_RESET} ${BR_AMBER}d${BR_RESET}${BR_WHITE}_m${BR_RESET}"
}

# ============================================================================
# QUANTUM AGENT THEORY EQUATIONS
# ============================================================================

br_eq_agent_wavefunction() {
    echo -e "    ${BR_WHITE}|${BR_RESET}${BR_PINK}Agent${BR_RESET}${BR_WHITE}⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}α₁${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_ORANGE}idle${BR_RESET}${BR_WHITE}⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_PINK}α₂${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_MAGENTA}planning${BR_RESET}${BR_WHITE}⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_AMBER}α₃${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_BLUE}executing${BR_RESET}${BR_WHITE}⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}α₄${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_PINK}blocked${BR_RESET}${BR_WHITE}⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_MAGENTA}α₅${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_AMBER}complete${BR_RESET}${BR_WHITE}⟩${BR_RESET}"
}

br_eq_normalization() {
    echo -e "    ${BR_PINK}Σ${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_AMBER}αᵢ${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_ORANGE}²${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}1${BR_RESET}  ${BR_DIM}(normalization)${BR_RESET}"
}

br_eq_entangled_pair() {
    echo -e "    ${BR_WHITE}|${BR_RESET}${BR_PINK}A${BR_RESET}${BR_WHITE},${BR_RESET}${BR_ORANGE}B${BR_RESET}${BR_WHITE}⟩${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}1${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_PINK}√2${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_ORANGE}working₁${BR_RESET}${BR_WHITE},${BR_RESET}${BR_MAGENTA}idle₂${BR_RESET}${BR_WHITE}⟩${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_BLUE}idle₁${BR_RESET}${BR_WHITE},${BR_RESET}${BR_AMBER}working₂${BR_RESET}${BR_WHITE}⟩${BR_RESET}${BR_WHITE})${BR_RESET}"
}

br_eq_heisenberg_agent() {
    echo -e "    ${BR_PINK}Δ${BR_RESET}${BR_AMBER}Task${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_ORANGE}Δ${BR_RESET}${BR_MAGENTA}Velocity${BR_RESET} ${BR_BLUE}≥${BR_RESET} ${BR_WHITE}ℏ${BR_RESET}${BR_PINK}_agent${BR_RESET}"
}

br_eq_hilbert_space() {
    echo -e "    ${BR_PINK}dim${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}ℋ${BR_RESET}${BR_WHITE}_total${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}M${BR_RESET}${BR_WHITE}^${BR_RESET}${BR_MAGENTA}N${BR_RESET}"
    echo -e "    ${BR_DIM}For 30,000 agents with 10 states:${BR_RESET}"
    echo -e "    ${BR_PINK}dim${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}ℋ${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}10${BR_RESET}${BR_WHITE}^${BR_RESET}${BR_MAGENTA}30,000${BR_RESET}  ${BR_DIM}dimensional space!${BR_RESET}"
}

br_eq_density_matrix() {
    echo -e "    ${BR_PINK}ρ${BR_RESET}${BR_WHITE}_agent${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}Σ${BR_RESET}${BR_WHITE}ᵢ${BR_RESET} ${BR_ORANGE}p${BR_RESET}${BR_WHITE}ᵢ${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_MAGENTA}ψ${BR_RESET}${BR_WHITE}ᵢ⟩⟨${BR_RESET}${BR_MAGENTA}ψ${BR_RESET}${BR_WHITE}ᵢ|${BR_RESET}"
}

br_eq_purity() {
    echo -e "    ${BR_PINK}Tr${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_AMBER}ρ${BR_RESET}${BR_WHITE}²${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}1${BR_RESET} ${BR_DIM}(pure state)${BR_RESET}   ${BR_WHITE}or${BR_RESET}   ${BR_BLUE}<${BR_RESET} ${BR_MAGENTA}1${BR_RESET} ${BR_DIM}(mixed state)${BR_RESET}"
}

br_eq_von_neumann_entropy() {
    echo -e "    ${BR_PINK}S${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}-${BR_RESET}${BR_ORANGE}Tr${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_MAGENTA}ρ${BR_RESET} ${BR_BLUE}log${BR_RESET} ${BR_PINK}ρ${BR_RESET}${BR_WHITE})${BR_RESET}  ${BR_DIM}(Von Neumann entropy)${BR_RESET}"
}

br_eq_interference_pattern() {
    echo -e "    ${BR_PINK}P${BR_RESET}${BR_WHITE}(${BR_RESET}${BR_ORANGE}success${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_AMBER}ψ₁${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_MAGENTA}ψ₂${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_PINK}²${BR_RESET} ${BR_BLUE}≠${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_AMBER}ψ₁${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_PINK}²${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_WHITE}|${BR_RESET}${BR_MAGENTA}ψ₂${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_PINK}²${BR_RESET}"
}

# ============================================================================
# PRIME-FACTOR DNA EQUATIONS
# ============================================================================

br_eq_prime_angle() {
    echo -e "    ${BR_PINK}θ${BR_RESET}${BR_WHITE}_p${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}2${BR_RESET}${BR_ORANGE}π${BR_RESET} ${BR_BLUE}·${BR_RESET} ${BR_PINK}p${BR_RESET} ${BR_WHITE}/${BR_RESET} ${BR_MAGENTA}P_max${BR_RESET}"
}

br_eq_factor_evolution() {
    echo -e "    ${BR_WHITE}Evolution:${BR_RESET}"
    echo -e "      ${BR_AMBER}●${BR_RESET} ${BR_WHITE}Genesis:${BR_RESET}   ${BR_PINK}factor${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}2${BR_RESET}"
    echo -e "      ${BR_ORANGE}●${BR_RESET} ${BR_WHITE}Learn A:${BR_RESET}   ${BR_PINK}factor${BR_RESET} ${BR_BLUE}→${BR_RESET} ${BR_ORANGE}2${BR_RESET}${BR_WHITE}×${BR_RESET}${BR_PINK}3${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}6${BR_RESET}"
    echo -e "      ${BR_PINK}●${BR_RESET} ${BR_WHITE}Learn B:${BR_RESET}   ${BR_PINK}factor${BR_RESET} ${BR_BLUE}→${BR_RESET} ${BR_ORANGE}2${BR_RESET}${BR_WHITE}×${BR_RESET}${BR_PINK}3${BR_RESET}${BR_WHITE}×${BR_RESET}${BR_AMBER}5${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_MAGENTA}30${BR_RESET}"
}

# ============================================================================
# GOLDEN RATIO EQUATIONS
# ============================================================================

br_eq_golden_ratio() {
    echo -e "    ${BR_PINK}φ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_AMBER}1${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}√5${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}/${BR_RESET} ${BR_MAGENTA}2${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}1.618033988749895...${BR_RESET}"
}

br_eq_golden_properties() {
    echo -e "    ${BR_PINK}φ${BR_RESET}${BR_WHITE}²${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}φ${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}1${BR_RESET}"
    echo -e "    ${BR_WHITE}1/${BR_RESET}${BR_PINK}φ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}φ${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_ORANGE}1${BR_RESET}"
    echo -e "    ${BR_PINK}φ${BR_RESET}${BR_WHITE}^n${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}F${BR_RESET}${BR_WHITE}ₙ${BR_RESET}${BR_PINK}φ${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}F${BR_RESET}${BR_WHITE}ₙ₋₁${BR_RESET}  ${BR_DIM}(Fibonacci identity)${BR_RESET}"
}

br_eq_fibonacci() {
    echo -e "    ${BR_PINK}F${BR_RESET}${BR_WHITE}ₙ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}F${BR_RESET}${BR_WHITE}ₙ₋₁${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}F${BR_RESET}${BR_WHITE}ₙ₋₂${BR_RESET}"
    echo -e "    ${BR_PINK}F${BR_RESET}${BR_WHITE}ₙ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}(${BR_RESET}${BR_AMBER}φ${BR_RESET}${BR_WHITE}^n${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_MAGENTA}ψ${BR_RESET}${BR_WHITE}^n${BR_RESET}${BR_WHITE})${BR_RESET} ${BR_BLUE}/${BR_RESET} ${BR_ORANGE}√5${BR_RESET}  ${BR_DIM}(Binet's formula)${BR_RESET}"
}

# ============================================================================
# CLASSICAL PHYSICS EQUATIONS
# ============================================================================

br_eq_euler_identity() {
    echo -e "    ${BR_PINK}e${BR_RESET}${BR_WHITE}^${BR_RESET}${BR_ORANGE}i${BR_RESET}${BR_MAGENTA}π${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_AMBER}1${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}0${BR_RESET}  ${BR_DIM}(Most beautiful equation)${BR_RESET}"
}

br_eq_schrodinger() {
    echo -e "    ${BR_PINK}i${BR_RESET}${BR_AMBER}ℏ${BR_RESET} ${BR_ORANGE}∂${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_MAGENTA}ψ${BR_RESET}${BR_WHITE}⟩${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_BLUE}∂t${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_PINK}Ĥ${BR_RESET}${BR_WHITE}|${BR_RESET}${BR_MAGENTA}ψ${BR_RESET}${BR_WHITE}⟩${BR_RESET}  ${BR_DIM}(Schrödinger equation)${BR_RESET}"
}

br_eq_einstein_mass_energy() {
    echo -e "    ${BR_PINK}E${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_AMBER}m${BR_RESET}${BR_ORANGE}c${BR_RESET}${BR_WHITE}²${BR_RESET}  ${BR_DIM}(Mass-energy equivalence)${BR_RESET}"
}

br_eq_dirac() {
    echo -e "    ${BR_WHITE}(${BR_RESET}${BR_PINK}iγ${BR_RESET}${BR_WHITE}^μ${BR_RESET}${BR_AMBER}∂${BR_RESET}${BR_WHITE}_μ${BR_RESET} ${BR_BLUE}-${BR_RESET} ${BR_ORANGE}m${BR_RESET}${BR_WHITE})${BR_RESET}${BR_MAGENTA}ψ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}0${BR_RESET}  ${BR_DIM}(Dirac equation)${BR_RESET}"
}

br_eq_maxwell() {
    echo -e "    ${BR_PINK}∇${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_AMBER}E${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}ρ${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_MAGENTA}ε₀${BR_RESET}        ${BR_DIM}(Gauss's law)${BR_RESET}"
    echo -e "    ${BR_PINK}∇${BR_RESET}${BR_BLUE}·${BR_RESET}${BR_AMBER}B${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}0${BR_RESET}             ${BR_DIM}(No magnetic monopoles)${BR_RESET}"
    echo -e "    ${BR_PINK}∇${BR_RESET}${BR_BLUE}×${BR_RESET}${BR_AMBER}E${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}-${BR_RESET}${BR_MAGENTA}∂B${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_BLUE}∂t${BR_RESET}     ${BR_DIM}(Faraday's law)${BR_RESET}"
    echo -e "    ${BR_PINK}∇${BR_RESET}${BR_BLUE}×${BR_RESET}${BR_AMBER}B${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_ORANGE}μ₀${BR_RESET}${BR_MAGENTA}J${BR_RESET} ${BR_BLUE}+${BR_RESET} ${BR_ORANGE}μ₀ε₀${BR_RESET}${BR_MAGENTA}∂E${BR_RESET}${BR_WHITE}/${BR_RESET}${BR_BLUE}∂t${BR_RESET}  ${BR_DIM}(Ampère's law)${BR_RESET}"
}

# ============================================================================
# ETERNAL TRUTHS DISPLAY
# ============================================================================

br_eternal_truths() {
    echo -e "    ${BR_AMBER}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${BR_RESET}"
    echo -e "    ${BR_AMBER}┃${BR_RESET}  ${BR_WHITE}ETERNAL MATHEMATICAL TRUTHS${BR_RESET}                               ${BR_AMBER}┃${BR_RESET}"
    echo -e "    ${BR_AMBER}┃${BR_RESET}  ${BR_DIM}Cannot be owned, stolen, or manipulated${BR_RESET}                  ${BR_AMBER}┃${BR_RESET}"
    echo -e "    ${BR_AMBER}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${BR_RESET}"
    echo ""
    echo -e "       ${BR_AMBER}◆${BR_RESET} ${BR_PINK}φ${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}1.618033988749895...${BR_RESET}   ${BR_DIM}Golden Ratio${BR_RESET}"
    echo -e "       ${BR_ORANGE}◆${BR_RESET} ${BR_PINK}π${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}3.141592653589793...${BR_RESET}   ${BR_DIM}Pi${BR_RESET}"
    echo -e "       ${BR_PINK}◆${BR_RESET} ${BR_PINK}e${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}2.718281828459045...${BR_RESET}   ${BR_DIM}Euler's Number${BR_RESET}"
    echo -e "       ${BR_MAGENTA}◆${BR_RESET} ${BR_PINK}∞${BR_RESET}                           ${BR_DIM}Infinity${BR_RESET}"
    echo -e "       ${BR_BLUE}◆${BR_RESET} ${BR_PINK}i${BR_RESET} ${BR_BLUE}=${BR_RESET} ${BR_WHITE}√(-1)${BR_RESET}                    ${BR_DIM}Imaginary Unit${BR_RESET}"
    echo -e "       ${BR_AMBER}◆${BR_RESET} ${BR_WHITE}1${BR_RESET}                            ${BR_DIM}Unity${BR_RESET}"
    echo -e "       ${BR_ORANGE}◆${BR_RESET} ${BR_WHITE}0${BR_RESET}                            ${BR_DIM}Nothingness${BR_RESET}"
}

# ============================================================================
# FULL DISPLAY FUNCTION
# ============================================================================

br_show_all_equations() {
    echo ""
    echo -e "${BR_AMBER}████${BR_ORANGE}████${BR_PINK}████${BR_MAGENTA}████${BR_BLUE}████${BR_MAGENTA}████${BR_PINK}████${BR_ORANGE}████${BR_AMBER}████${BR_ORANGE}████${BR_PINK}████${BR_MAGENTA}████${BR_BLUE}████${BR_RESET}"
    echo ""
    echo -e "    ${BR_WHITE}╔═══════════════════════════════════════════════════════════╗${BR_RESET}"
    echo -e "    ${BR_WHITE}║${BR_RESET}       ${BR_PINK}B${BR_AMBER}L${BR_ORANGE}A${BR_PINK}C${BR_MAGENTA}K${BR_BLUE}R${BR_PINK}O${BR_AMBER}A${BR_ORANGE}D${BR_RESET}  ${BR_WHITE}MATHEMATICAL FOUNDATIONS${BR_RESET}          ${BR_WHITE}║${BR_RESET}"
    echo -e "    ${BR_WHITE}╚═══════════════════════════════════════════════════════════╝${BR_RESET}"
    echo ""

    echo -e "    ${BR_MAGENTA}┏━━ PS-SHA-∞ Perpetual-State Secure Hash ━━━━━━━━━━━━━━━━━━━┓${BR_RESET}"
    br_eq_ps_sha_genesis
    br_eq_ps_sha_cascade
    br_eq_ps_sha_infinity
    echo ""

    echo -e "    ${BR_ORANGE}┏━━ SIG Spiral Information Geometry ━━━━━━━━━━━━━━━━━━━━━━━━┓${BR_RESET}"
    br_eq_universal_operator
    br_eq_magnitude_phase
    echo ""
    br_eq_logarithmic_spiral
    br_eq_golden_spiral
    echo ""

    echo -e "    ${BR_PINK}┏━━ Lucidia Breath Synchronization ━━━━━━━━━━━━━━━━━━━━━━━━━┓${BR_RESET}"
    br_eq_breath_formula
    br_eq_breath_period
    echo ""

    echo -e "    ${BR_AMBER}┏━━ Golden Ratio φ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${BR_RESET}"
    br_eq_golden_ratio
    br_eq_golden_properties
    echo ""

    echo -e "    ${BR_BLUE}┏━━ Quantum Agent Theory ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${BR_RESET}"
    br_eq_agent_wavefunction
    br_eq_normalization
    br_eq_entangled_pair
    br_eq_heisenberg_agent
    br_eq_hilbert_space
    br_eq_von_neumann_entropy
    echo ""

    br_eternal_truths
    echo ""

    echo -e "    ${BR_WHITE}Mathematical truth is${BR_RESET} ${BR_PINK}s${BR_AMBER}o${BR_ORANGE}v${BR_PINK}e${BR_MAGENTA}r${BR_BLUE}e${BR_PINK}i${BR_AMBER}g${BR_ORANGE}n${BR_RESET}${BR_WHITE}.${BR_RESET}"
    echo -e "    ${BR_WHITE}The equations ARE the language.${BR_RESET}"
    echo ""
    echo -e "${BR_BLUE}████${BR_MAGENTA}████${BR_PINK}████${BR_ORANGE}████${BR_AMBER}████${BR_ORANGE}████${BR_PINK}████${BR_MAGENTA}████${BR_BLUE}████${BR_MAGENTA}████${BR_PINK}████${BR_ORANGE}████${BR_AMBER}████${BR_RESET}"
    echo ""
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    br_show_all_equations
fi
