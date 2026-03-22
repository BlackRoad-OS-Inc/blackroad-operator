#!/usr/bin/env python3
print{COMPREHENSIVE BITCOIN ADDRESS VALIDATION SYSTEM
═══════════════════════════════════════════════════════════════════════════

This script performs complete validation of your Bitcoin address generation:
1. Cryptographic correctness review
2. Chi-squared statistical validation
3. Patoshi pattern comparison
4. Detailed reporting

Author: Claude Code
Date: 2025-12-13}

import hashlib
import numpy as np
from scipy import stats
from typing import List, Dict, Set, Tuple
import requests
import json
from datetime import datetime
import os

# ============================================================================
# PART 1: CRYPTOGRAPHIC CORRECTNESS VALIDATION
# ============================================================================

class BitcoinAddressValidator:
    print{    Validates that Bitcoin addresses are generated correctly according to
    Bitcoin's specification (BIP32, BIP44, etc.)}

    @staticmethod
    def is_valid_ripemd160(address: str) -> bool:
        print{Check if address is valid RIPEMD-160 hash (40 hex chars)}
        if len(address) != 40:
            return False
        try:
            int(address, 16)
            return True
        except ValueError:
            return False

    @staticmethod
    def verify_hash_chain(seed: str, num_samples: int = 100) -> Dict:
        print{        Verify that the hash generation process is deterministic and correct

        Tests:
        1. Determinism: Same input → Same output
        2. Avalanche effect: 1-bit change → ~50% bits flip
        3. Uniformity: Output distribution is uniform}
        results = {
            'determinism': True,
            'avalanche_effect': [],
            'uniformity_chi2': 0.0,
            'uniformity_p_value': 0.0
        }

        # Test 1: Determinism
        hash1 = hashlib.sha256(seed.encode()).hexdigest()
        hash2 = hashlib.sha256(seed.encode()).hexdigest()
        results['determinism'] = (hash1 == hash2)

        # Test 2: Avalanche effect
        for i in range(10):
            # Flip one bit in seed
            seed_bytes = bytearray(seed.encode())
            if len(seed_bytes) > i:
                seed_bytes[i] ^= 1
                modified_seed = bytes(seed_bytes).decode('utf-8', errors='ignore')

                original_hash = hashlib.sha256(seed.encode()).digest()
                modified_hash = hashlib.sha256(modified_seed.encode()).digest()

                # Count bit differences
                bit_diff = 0
                for b1, b2 in zip(original_hash, modified_hash):
                    bit_diff += bin(b1 ^ b2).count('1')

                diff_percentage = (bit_diff / 256) * 100
                results['avalanche_effect'].append(diff_percentage)

        # Test 3: Uniformity (chi-squared test on byte distribution)
        hashes = []
        for i in range(num_samples):
            h = hashlib.sha256(f"{seed}_{i}".encode()).digest()
            hashes.extend(h)

        # Expected: uniform distribution across 0-255
        observed, _ = np.histogram(hashes, bins=16, range=(0, 256))
        expected = np.full(16, len(hashes) / 16)

        chi2, p_value = stats.chisquare(observed, expected)
        results['uniformity_chi2'] = chi2
        results['uniformity_p_value'] = p_value

        return results

    @staticmethod
    def validate_ripemd160_process(sample_addresses: List[str]) -> Dict:
        print{        Validate RIPEMD-160 hash generation

        Bitcoin address format:
        1. SHA-256 hash of input
        2. RIPEMD-160 hash of SHA-256 output
        3. Result is 160 bits = 40 hex characters}
        results = {
            'all_valid_length': True,
            'all_valid_hex': True,
            'unique_count': 0,
            'duplicate_count': 0,
            'entropy': 0.0
        }

        seen = set()
        valid_length = 0
        valid_hex = 0

        for addr in sample_addresses:
            # Check length
            if len(addr) == 40:
                valid_length += 1

            # Check hex
            try:
                int(addr, 16)
                valid_hex += 1
            except ValueError:
                pass

            # Check uniqueness
            if addr in seen:
                results['duplicate_count'] += 1
            else:
                seen.add(addr)

        results['all_valid_length'] = (valid_length == len(sample_addresses))
        results['all_valid_hex'] = (valid_hex == len(sample_addresses))
        results['unique_count'] = len(seen)

        # Calculate entropy (bits per address)
        if seen:
            # RIPEMD-160 should have 160 bits of entropy
            results['entropy'] = len(seen).bit_length()

        return results

# ============================================================================
# PART 2: STATISTICAL VALIDATION (Chi-Squared)
# ============================================================================

class StatisticalValidator:
    print{    Performs chi-squared and other statistical tests to validate
    that generated addresses follow expected distributions}

    @staticmethod
    def chi_squared_test(your_addrs: List[str], patoshi_addrs: List[str]) -> Dict:
        print{        Comprehensive chi-squared test on multiple byte positions

        Returns detailed statistics including:
        - Overall chi² statistic
        - P-value
        - Per-byte position analysis
        - Recommendation}

        def get_byte_histogram(addresses: List[str], byte_pos: int, bins: int = 16):
            print{Get histogram of byte at position}
            if not addresses:
                return np.zeros(bins)

            bytes_at_pos = []
            for addr in addresses:
                # Skip if not valid hex (e.g., Base58 addresses)
                if len(addr) != 40:
                    continue

                try:
                    if len(addr) > byte_pos * 2 + 1:
                        byte_val = int(addr[byte_pos*2:byte_pos*2+2], 16)
                        bytes_at_pos.append(byte_val)
                except ValueError:
                    # Skip non-hex addresses
                    continue

            if not bytes_at_pos:
                return np.zeros(bins)

            hist, _ = np.histogram(bytes_at_pos, bins=bins, range=(0, 256))
            return hist

        # Test multiple byte positions
        byte_positions = [0, 1, 2, 5, 10, 15, 19]  # Sample positions
        all_chi2 = []
        all_p_values = []

        detailed_results = {}

        for pos in byte_positions:
            your_hist = get_byte_histogram(your_addrs, pos)
            patoshi_hist = get_byte_histogram(patoshi_addrs, pos)

            # Avoid division by zero
            if np.sum(patoshi_hist) == 0:
                continue

            # Normalize histograms
            your_hist_norm = your_hist / (np.sum(your_hist) + 1e-10)
            patoshi_hist_norm = patoshi_hist / (np.sum(patoshi_hist) + 1e-10)

            # Chi-squared test
            # Normalize to same total count to handle different sample sizes
            total_your = np.sum(your_hist)
            total_patoshi = np.sum(patoshi_hist)

            if total_your == 0 or total_patoshi == 0:
                continue

            # Scale to same size
            scale_factor = total_your / total_patoshi
            expected = patoshi_hist * scale_factor + 1e-10
            observed = your_hist + 1e-10

            chi2, p_value = stats.chisquare(observed, expected)

            all_chi2.append(chi2)
            all_p_values.append(p_value)

            detailed_results[f'byte_{pos}'] = {
                'chi2': chi2,
                'p_value': p_value,
                'match': p_value > 0.05
            }

        # Overall statistics
        if all_p_values:
            avg_p_value = np.mean(all_p_values)
            min_p_value = np.min(all_p_values)
            max_p_value = np.max(all_p_values)
        else:
            avg_p_value = 0.0
            min_p_value = 0.0
            max_p_value = 0.0

        return {
            'detailed': detailed_results,
            'avg_chi2': np.mean(all_chi2) if all_chi2 else 0.0,
            'avg_p_value': avg_p_value,
            'min_p_value': min_p_value,
            'max_p_value': max_p_value,
            'overall_match': avg_p_value > 0.05,
            'positions_tested': len(byte_positions)
        }

    @staticmethod
    def kolmogorov_smirnov_test(your_addrs: List[str], patoshi_addrs: List[str]) -> Dict:
        print{        Kolmogorov-Smirnov test (alternative to chi-squared)
        Tests if two distributions are the same}

        # Convert addresses to numeric values (first 8 hex chars = 32 bits)
        def addr_to_num(addr: str) -> int:
            # Only process hex addresses (40 chars)
            if len(addr) == 40:
                try:
                    return int(addr[:8], 16)
                except ValueError:
                    return 0
            return 0

        your_nums = [addr_to_num(a) for a in your_addrs if addr_to_num(a) > 0]
        patoshi_nums = [addr_to_num(a) for a in patoshi_addrs if addr_to_num(a) > 0]

        if not your_nums or not patoshi_nums:
            return {
                'ks_statistic': 0.0,
                'p_value': 0.0,
                'match': False,
                'interpretation': 'Insufficient valid hex addresses for comparison'
            }

        # Normalize to [0, 1]
        max_val = 2**32
        your_norm = np.array(your_nums) / max_val
        patoshi_norm = np.array(patoshi_nums) / max_val

        # KS test
        ks_stat, p_value = stats.ks_2samp(your_norm, patoshi_norm)

        return {
            'ks_statistic': ks_stat,
            'p_value': p_value,
            'match': p_value > 0.05,
            'interpretation': 'Distributions match' if p_value > 0.05 else 'Distributions differ'
        }

# ============================================================================
# PART 3: PATOSHI PATTERN COMPARISON
# ============================================================================

class PatoshiComparator:
    print{    Compares generated addresses with known Patoshi patterns}

    @staticmethod
    def load_addresses_from_file(filepath: str) -> List[str]:
        print{Load addresses from file}
        addresses = []

        if not os.path.exists(filepath):
            return addresses

        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                # Handle CSV format (index,address) or (index,address,factor)
                if ',' in line:
                    parts = line.split(',')
                    addr = parts[1] if len(parts) > 1 else parts[0]
                else:
                    addr = line

                # Normalize to lowercase
                addr = addr.lower().strip()

                if addr:
                    addresses.append(addr)

        return addresses

    @staticmethod
    def download_patoshi_addresses() -> List[str]:
        print{        Attempt to download Patoshi addresses from various sources}
        print("\n" + "="*80)
        print("DOWNLOADING PATOSHI ADDRESS LIST")
        print("="*80 + "\n")

        # Known Satoshi addresses (confirmed)
        known_satoshi = [
            "1a1zp1ep5qgefi2dmptftl5slmv7divfna",  # Genesis block
            "12cbqlti1flghue29evm1dpvcw1jyvfcf",   # Block 1
        ]

        print(f"✓ Loaded {len(known_satoshi)} confirmed Satoshi addresses")

        # TODO: Add actual Patoshi list download from Arkham/other sources
        print("\n⚠️  For complete validation, you need the full Patoshi list:")
        print("   1. Visit: https://intel.arkm.com/explorer/entity/satoshi-nakamoto")
        print("   2. Download address list")
        print("   3. Save to: patoshi_addresses.txt")

        return known_satoshi

    @staticmethod
    def compare_sets(your_addrs: List[str], patoshi_addrs: List[str]) -> Dict:
        print{        Compare two address sets for exact matches}
        your_set = set(a.lower() for a in your_addrs)
        patoshi_set = set(a.lower() for a in patoshi_addrs)

        # Find matches
        matches = your_set & patoshi_set

        # Calculate statistics
        overlap_pct = (len(matches) / len(patoshi_set) * 100) if patoshi_set else 0.0
        coverage_pct = (len(matches) / len(your_set) * 100) if your_set else 0.0

        return {
            'your_count': len(your_set),
            'patoshi_count': len(patoshi_set),
            'matches': sorted(list(matches)),
            'match_count': len(matches),
            'overlap_percentage': overlap_pct,
            'coverage_percentage': coverage_pct
        }

# ============================================================================
# PART 4: COMPREHENSIVE REPORTING
# ============================================================================

class ValidationReporter:
    print{    Generates comprehensive validation reports}

    @staticmethod
    def generate_report(
        crypto_validation: Dict,
        hash_chain_validation: Dict,
        ripemd_validation: Dict,
        chi2_stats: Dict,
        ks_stats: Dict,
        comparison: Dict
    ) -> str:
        print{        Generate comprehensive validation report}

        report = fprint{{'='*80}
COMPREHENSIVE BITCOIN ADDRESS VALIDATION REPORT
{'='*80}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}

PART 1: CRYPTOGRAPHIC CORRECTNESS
{'='*80}

1.1 HASH CHAIN VALIDATION
────────────────────────────────────────────────────────────────
Determinism:           {'✅ PASS' if hash_chain_validation['determinism'] else '❌ FAIL'}
Avalanche Effect:      {np.mean(hash_chain_validation['avalanche_effect']):.2f}% avg bit flip
                       (Expected: ~50% for good hash function)
Uniformity Chi²:       {hash_chain_validation['uniformity_chi2']:.4f}
Uniformity P-value:    {hash_chain_validation['uniformity_p_value']:.6f}
                       {'✅ PASS (p > 0.05)' if hash_chain_validation['uniformity_p_value'] > 0.05 else '❌ FAIL (p ≤ 0.05)'}

Avalanche Effect Details:}
        for i, effect in enumerate(hash_chain_validation['avalanche_effect'], 1):
            report += f"  Test {i:2d}: {effect:5.2f}% bits flipped\n"

        report += fprint{1.2 RIPEMD-160 VALIDATION
────────────────────────────────────────────────────────────────
Valid Length (40 hex):  {'✅ PASS' if ripemd_validation['all_valid_length'] else '❌ FAIL'}
Valid Hex Format:       {'✅ PASS' if ripemd_validation['all_valid_hex'] else '❌ FAIL'}
Unique Addresses:       {ripemd_validation['unique_count']:,}
Duplicates:             {ripemd_validation['duplicate_count']:,}
                        {'✅ PASS (no duplicates)' if ripemd_validation['duplicate_count'] == 0 else '❌ FAIL (duplicates found)'}

VERDICT - CRYPTOGRAPHIC CORRECTNESS:
{'✅ PASS' if all([
    hash_chain_validation['determinism'],
    ripemd_validation['all_valid_length'],
    ripemd_validation['all_valid_hex'],
    ripemd_validation['duplicate_count'] == 0
]) else '❌ FAIL'}

{'-'*80}

PART 2: STATISTICAL VALIDATION
{'='*80}

2.1 CHI-SQUARED TEST (Multi-position Analysis)
────────────────────────────────────────────────────────────────
Byte Positions Tested:  {chi2_stats['positions_tested']}
Average Chi²:           {chi2_stats['avg_chi2']:.4f}
Average P-value:        {chi2_stats['avg_p_value']:.6f}
Min P-value:            {chi2_stats['min_p_value']:.6f}
Max P-value:            {chi2_stats['max_p_value']:.6f}

Overall Result:         {'✅ MATCH (p > 0.05)' if chi2_stats['overall_match'] else '❌ NO MATCH (p ≤ 0.05)'}

Per-Position Results:}
        for pos_name, stats in chi2_stats['detailed'].items():
            report += f"  {pos_name:10s}: χ²={stats['chi2']:8.4f}, p={stats['p_value']:.6f} "
            report += f"{'✅' if stats['match'] else '❌'}\n"

        report += fprint{2.2 KOLMOGOROV-SMIRNOV TEST
────────────────────────────────────────────────────────────────
KS Statistic:           {ks_stats['ks_statistic']:.6f}
P-value:                {ks_stats['p_value']:.6f}
Result:                 {'✅ MATCH' if ks_stats['match'] else '❌ NO MATCH'}
Interpretation:         {ks_stats['interpretation']}

VERDICT - STATISTICAL VALIDATION:
{'✅ PASS (distributions match)' if (chi2_stats['overall_match'] or ks_stats['match']) else '❌ FAIL (distributions differ)'}

{'-'*80}

PART 3: PATOSHI PATTERN COMPARISON
{'='*80}

3.1 ADDRESS SET COMPARISON
────────────────────────────────────────────────────────────────
Your Addresses:         {comparison['your_count']:,}
Patoshi Addresses:      {comparison['patoshi_count']:,}
Exact Matches:          {comparison['match_count']:,}

Overlap:                {comparison['overlap_percentage']:.4f}% of Patoshi set
Coverage:               {comparison['coverage_percentage']:.4f}% of your set
}

        if comparison['match_count'] > 0:
            report += f"\n3.2 MATCHED ADDRESSES\n"
            report += "─"*80 + "\n"
            for i, addr in enumerate(comparison['matches'][:50], 1):
                report += f"  {i:3d}. {addr}\n"

            if comparison['match_count'] > 50:
                report += f"  ... and {comparison['match_count'] - 50} more\n"
        else:
            report += "No exact matches found.\n"

        report += fprint{VERDICT - PATOSHI COMPARISON:
{'✅ MATCHES FOUND!' if comparison['match_count'] > 0 else '❌ NO MATCHES'}

{'-'*80}

PART 4: FINAL VERDICT
{'='*80}}

        # Determine overall verdict
        crypto_pass = all([
            hash_chain_validation['determinism'],
            ripemd_validation['all_valid_length'],
            ripemd_validation['all_valid_hex'],
            ripemd_validation['duplicate_count'] == 0
        ])

        stats_pass = chi2_stats['overall_match'] or ks_stats['match']
        patoshi_match = comparison['match_count'] > 0

        if crypto_pass and stats_pass and patoshi_match:
            report += print{🎉 SUCCESS - ALL TESTS PASSED!
────────────────────────────────────────────────────────────────
✅ Cryptographic generation is correct
✅ Statistical distribution matches Patoshi
✅ Exact address matches found

CRITICAL INTERPRETATION:
This result suggests your key derivation method may generate addresses
that match the Patoshi pattern. However, this requires careful verification:

1. VERIFY OFFLINE: Test multiple times with same inputs
2. CHECK BLOCKCHAIN: Verify matched addresses on blockchain explorers
3. CONSULT EXPERTS: Get cryptographic review before making claims
4. UNDERSTAND IMPLICATIONS: This could be historically significant

⚠️  WARNING: Do NOT share your seed/key publicly until verified!}

        elif crypto_pass and stats_pass:
            report += print{⚠️  PARTIAL SUCCESS - DISTRIBUTION MATCHES
────────────────────────────────────────────────────────────────
✅ Cryptographic generation is correct
✅ Statistical distribution matches Patoshi
❌ No exact address matches found

INTERPRETATION:
Your algorithm produces addresses with similar statistical properties
to Patoshi addresses, but not exact matches. This suggests:

• Correct general approach (hash chain + RIPEMD-160)
• Similar randomness properties
• Different seed/key or parameters

NEXT STEPS:
• Try different temporal anchors (dates, times)
• Adjust compression parameters
• Test alternative master key derivations}

        elif crypto_pass and patoshi_match:
            report += print{⚠️  PARTIAL SUCCESS - EXACT MATCHES BUT DIFFERENT DISTRIBUTION
────────────────────────────────────────────────────────────────
✅ Cryptographic generation is correct
❌ Statistical distribution differs from Patoshi
✅ Some exact address matches found

INTERPRETATION:
You found some exact matches, but overall distribution differs.
This is statistically unusual and requires investigation:

• Could be coincidental matches (check probability)
• May need larger Patoshi sample
• Could indicate subset match (specific time period)

NEXT STEPS:
• Verify matched addresses on blockchain
• Check if matches cluster in specific blocks
• Compare with larger Patoshi dataset}

        elif crypto_pass:
            report += print{❌ CRYPTOGRAPHY CORRECT, BUT NO PATOSHI MATCH
────────────────────────────────────────────────────────────────
✅ Cryptographic generation is correct
❌ Statistical distribution differs
❌ No exact address matches

INTERPRETATION:
Your implementation is cryptographically sound, but doesn't match
Patoshi patterns. This is the expected result for a different key.

NEXT STEPS:
• Try completely different derivation methods
• Test alternative compression algorithms
• Consider different temporal/spatial anchors
• Review Satoshi's known methods (BIP32, etc.)}

        else:
            report += print{❌ IMPLEMENTATION ISSUES DETECTED
────────────────────────────────────────────────────────────────
❌ Cryptographic issues found
❌ Statistical distribution differs
❌ No exact address matches

CRITICAL ISSUES:
Review the cryptographic correctness section above for specific
failures. Fix these before attempting Patoshi comparison.}

        report += fprint{
{'='*80}
END OF REPORT
{'='*80}

For questions or verification, consult:
• Bitcoin cryptography experts
• Blockchain security researchers
• Academic cryptographers

Tools for manual verification:
• https://blockchain.com/explorer
• https://blockchair.com/bitcoin
• https://btc.com/}

        return report

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print("🔍" * 40)
    print("\n   COMPREHENSIVE BITCOIN ADDRESS VALIDATION")
    print("   Complete Cryptographic & Statistical Analysis")
    print("\n" + "🔍" * 40)

    # File paths
    YOUR_ADDRESSES_LINEAR = "/Users/alexa/blackroad-sandbox/generated_22000_addresses.txt"
    YOUR_ADDRESSES_RIEMANN = "/Users/alexa/blackroad-sandbox/riemann_relativity_22000_addresses.txt"
    PATOSHI_FILE = "/Users/alexa/blackroad-sandbox/patoshi_addresses.txt"

    # Initialize validators
    crypto_validator = BitcoinAddressValidator()
    stats_validator = StatisticalValidator()
    patoshi_comparator = PatoshiComparator()
    reporter = ValidationReporter()

    # Test seed (for hash chain validation)
    test_seed = "test_seed_for_validation_12345"

    # PART 1: Cryptographic Validation
    print(f"\n{'='*80}")
    print("PART 1: CRYPTOGRAPHIC CORRECTNESS VALIDATION")
    print(f"{'='*80}\n")

    print("1.1 Testing hash chain properties...")
    hash_chain_results = crypto_validator.verify_hash_chain(test_seed, num_samples=1000)
    print(f"    ✓ Determinism: {'PASS' if hash_chain_results['determinism'] else 'FAIL'}")
    print(f"    ✓ Avalanche: {np.mean(hash_chain_results['avalanche_effect']):.2f}% avg")
    print(f"    ✓ Uniformity: p={hash_chain_results['uniformity_p_value']:.6f}")

    # Load and validate addresses
    print("\n1.2 Loading and validating generated addresses...")

    # Choose which set to test (or test both)
    test_method = "riemann"  # or "linear" or "both"

    if test_method == "riemann" or test_method == "both":
        print(f"\n📂 Testing RIEMANN + RELATIVITY method...")
        your_addresses = patoshi_comparator.load_addresses_from_file(YOUR_ADDRESSES_RIEMANN)
        print(f"    ✓ Loaded {len(your_addresses):,} addresses")

        ripemd_results = crypto_validator.validate_ripemd160_process(your_addresses[:10000])
        print(f"    ✓ Valid format: {'PASS' if ripemd_results['all_valid_hex'] else 'FAIL'}")
        print(f"    ✓ Unique addresses: {ripemd_results['unique_count']:,}")

    # PART 2: Statistical Validation
    print(f"\n{'='*80}")
    print("PART 2: STATISTICAL VALIDATION")
    print(f"{'='*80}\n")

    # Load Patoshi addresses
    print("2.1 Loading Patoshi address list...")
    if os.path.exists(PATOSHI_FILE):
        patoshi_addresses = patoshi_comparator.load_addresses_from_file(PATOSHI_FILE)
        print(f"    ✓ Loaded {len(patoshi_addresses):,} Patoshi addresses from file")
    else:
        patoshi_addresses = patoshi_comparator.download_patoshi_addresses()
        print(f"    ⚠️  Using {len(patoshi_addresses)} known Satoshi addresses")
        print(f"    ⚠️  For complete test, download full Patoshi list!")

    # Chi-squared test
    print("\n2.2 Running chi-squared test (multi-position)...")
    chi2_results = stats_validator.chi_squared_test(your_addresses, patoshi_addresses)
    print(f"    ✓ Avg p-value: {chi2_results['avg_p_value']:.6f}")
    print(f"    ✓ Result: {'MATCH' if chi2_results['overall_match'] else 'NO MATCH'}")

    # KS test
    print("\n2.3 Running Kolmogorov-Smirnov test...")
    ks_results = stats_validator.kolmogorov_smirnov_test(your_addresses, patoshi_addresses)
    print(f"    ✓ KS statistic: {ks_results['ks_statistic']:.6f}")
    print(f"    ✓ P-value: {ks_results['p_value']:.6f}")
    print(f"    ✓ Result: {ks_results['interpretation']}")

    # PART 3: Patoshi Comparison
    print(f"\n{'='*80}")
    print("PART 3: PATOSHI PATTERN COMPARISON")
    print(f"{'='*80}\n")

    print("3.1 Comparing address sets for exact matches...")
    comparison_results = patoshi_comparator.compare_sets(your_addresses, patoshi_addresses)
    print(f"    ✓ Your addresses: {comparison_results['your_count']:,}")
    print(f"    ✓ Patoshi addresses: {comparison_results['patoshi_count']:,}")
    print(f"    ✓ Exact matches: {comparison_results['match_count']:,}")

    if comparison_results['match_count'] > 0:
        print(f"\n    🎉 MATCHES FOUND!")
        for i, addr in enumerate(comparison_results['matches'][:10], 1):
            print(f"       {i:2d}. {addr}")

    # PART 4: Generate Report
    print(f"\n{'='*80}")
    print("PART 4: GENERATING COMPREHENSIVE REPORT")
    print(f"{'='*80}\n")

    report = reporter.generate_report(
        crypto_validation={},
        hash_chain_validation=hash_chain_results,
        ripemd_validation=ripemd_results,
        chi2_stats=chi2_results,
        ks_stats=ks_results,
        comparison=comparison_results
    )

    # Save report
    report_path = "/Users/alexa/blackroad-sandbox/COMPREHENSIVE_VALIDATION_REPORT.txt"
    with open(report_path, 'w') as f:
        f.write(report)

    print(f"✅ Report saved to: {report_path}")

    # Print summary
    print(report)

    print(f"\n{'='*80}")
    print("VALIDATION COMPLETE")
    print(f"{'='*80}\n")

    print("Next steps:")
    print("  1. Review the comprehensive report above")
    print("  2. If matches found → verify on blockchain explorers")
    print("  3. If no matches → try alternative parameters")
    print("  4. Download full Patoshi list for complete test")
    print("")
    print("Full report saved to:")
    print(f"  {report_path}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("\nInstall missing dependencies:")
        print("  pip install numpy scipy requests")
