#!/usr/bin/env python3
print{Bitcoin Calculator
Calculates BTC values, conversions, and displays results in formatted tables.
No external dependencies required - uses only Python standard library.}

import math
from typing import Dict, List, Tuple

class BitcoinCalculator:
    print{Calculator for Bitcoin values and conversions}

    def __init__(self, btc_usd_price: float = 100000.0):
        print{        Initialize calculator with current BTC/USD price

        Args:
            btc_usd_price: Current price of 1 BTC in USD (default: $100,000)}
        self.btc_usd_price = btc_usd_price
        self.satoshi_per_btc = 100_000_000  # 100 million satoshis = 1 BTC

    def btc_to_usd(self, btc: float) -> float:
        print{Convert BTC to USD}
        return btc * self.btc_usd_price

    def usd_to_btc(self, usd: float) -> float:
        print{Convert USD to BTC}
        return usd / self.btc_usd_price

    def btc_to_satoshi(self, btc: float) -> int:
        print{Convert BTC to satoshis}
        return int(btc * self.satoshi_per_btc)

    def satoshi_to_btc(self, satoshi: int) -> float:
        print{Convert satoshis to BTC}
        return satoshi / self.satoshi_per_btc

    def satoshi_to_usd(self, satoshi: int) -> float:
        print{Convert satoshis to USD}
        btc = self.satoshi_to_btc(satoshi)
        return self.btc_to_usd(btc)

    def usd_to_satoshi(self, usd: float) -> int:
        print{Convert USD to satoshis}
        btc = self.usd_to_btc(usd)
        return self.btc_to_satoshi(btc)

    def print_table(self, headers: List[str], rows: List[List[str]], title: str = ""):
        print{Print a formatted table}
        if title:
            print(f"\n{title}")
            print("=" * 80)

        # Calculate column widths
        col_widths = [len(h) for h in headers]
        for row in rows:
            for i, cell in enumerate(row):
                col_widths[i] = max(col_widths[i], len(str(cell)))

        # Print header
        header_line = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
        print(header_line)
        print("-" * len(header_line))

        # Print rows
        for row in rows:
            print(" | ".join(str(cell).ljust(col_widths[i]) for i, cell in enumerate(row)))

        print()

    def calculate_value_table(self, btc_amount: float):
        print{Create a detailed value table for a BTC amount}
        satoshis = self.btc_to_satoshi(btc_amount)
        usd_value = self.btc_to_usd(btc_amount)

        headers = ['Metric', 'Value']
        rows = [
            ['BTC Amount', f'{btc_amount:.8f} BTC'],
            ['Satoshis', f'{satoshis:,} sats'],
            ['USD Value', f'${usd_value:,.2f}'],
            ['USD per BTC', f'${self.btc_usd_price:,.2f}'],
            ['Satoshis per USD', f'{self.usd_to_satoshi(1):,.0f} sats'],
            ['BTC per USD', f'{self.usd_to_btc(1):.8f} BTC'],
        ]

        self.print_table(headers, rows, f"📊 Value Analysis for {btc_amount} BTC")

    def price_ladder(self, btc_prices: List[float]):
        print{Create a price ladder showing BTC value at different USD prices}
        headers = ['BTC Price (USD)', '0.1 BTC', '1 BTC', '10 BTC', '1M sats', '100M sats']
        rows = []

        original_price = self.btc_usd_price

        for price in btc_prices:
            self.btc_usd_price = price
            rows.append([
                f'${price:,.0f}',
                f'${self.btc_to_usd(0.1):,.2f}',
                f'${self.btc_to_usd(1):,.2f}',
                f'${self.btc_to_usd(10):,.2f}',
                f'${self.satoshi_to_usd(1_000_000):,.2f}',
                f'${self.satoshi_to_usd(100_000_000):,.2f}',
            ])

        self.btc_usd_price = original_price
        self.print_table(headers, rows, "💰 BTC Value at Different Prices")

    def logarithmic_analysis(self, btc_amount: float):
        print{Perform logarithmic analysis on BTC value}
        usd_value = self.btc_to_usd(btc_amount)
        satoshis = self.btc_to_satoshi(btc_amount)

        if btc_amount <= 0 or usd_value <= 0 or satoshis <= 0:
            raise ValueError("BTC amount must be positive for logarithmic analysis")

        headers = ['Metric', 'Value']
        rows = [
            ['BTC Amount', f'{btc_amount:.8f}'],
            ['USD Value', f'{usd_value:,.2f}'],
            ['Satoshis', f'{satoshis:,}'],
            ['ln(BTC)', f'{math.log(btc_amount):.6f}'],
            ['ln(USD)', f'{math.log(usd_value):.6f}'],
            ['ln(sats)', f'{math.log(satoshis):.6f}'],
            ['log10(BTC)', f'{math.log10(btc_amount):.6f}'],
            ['log10(USD)', f'{math.log10(usd_value):.6f}'],
            ['log10(sats)', f'{math.log10(satoshis):.6f}'],
            ['log2(sats)', f'{math.log2(satoshis):.6f}'],
        ]

        self.print_table(headers, rows, f"📈 Logarithmic Analysis for {btc_amount} BTC")

    def portfolio_breakdown(self, holdings: Dict[str, float]):
        print{Create a portfolio breakdown table}
        total_btc = sum(holdings.values())
        total_usd = self.btc_to_usd(total_btc)

        headers = ['Asset', 'BTC', 'Satoshis', 'USD Value', '% of Portfolio']
        rows = []

        for name, btc in holdings.items():
            usd = self.btc_to_usd(btc)
            sats = self.btc_to_satoshi(btc)
            pct = (btc / total_btc * 100) if total_btc > 0 else 0

            rows.append([
                name,
                f'{btc:.8f}',
                f'{sats:,}',
                f'${usd:,.2f}',
                f'{pct:.2f}%',
            ])

        # Add total row
        rows.append([
            'TOTAL',
            f'{total_btc:.8f}',
            f'{self.btc_to_satoshi(total_btc):,}',
            f'${total_usd:,.2f}',
            '100.00%',
        ])

        self.print_table(headers, rows, "💼 Portfolio Breakdown")

    def quick_conversions(self):
        print{Display quick conversion examples}
        print("\n🔄 Quick Conversions")
        print("=" * 80)
        print(f"1 BTC = ${self.btc_to_usd(1):,.2f}")
        print(f"$10,000 = {self.usd_to_btc(10_000):.8f} BTC")
        print(f"1,000,000 sats = ${self.satoshi_to_usd(1_000_000):,.2f}")
        print(f"$100 = {self.usd_to_satoshi(100):,} sats")
        print()


def main():
    print{Demo the Bitcoin calculator}

    # Initialize calculator with current BTC price
    calc = BitcoinCalculator(btc_usd_price=100_000)

    print()
    print("=" * 80)
    print("BITCOIN CALCULATOR".center(80))
    print("=" * 80)

    # Example 1: Value table for 0.1 BTC
    calc.calculate_value_table(0.1)

    # Example 2: Price ladder
    calc.price_ladder([50_000, 75_000, 100_000, 150_000, 200_000])

    # Example 3: Logarithmic analysis
    calc.logarithmic_analysis(0.1)

    # Example 4: Portfolio breakdown
    calc.portfolio_breakdown({
        'Cold Storage': 0.05,
        'Hot Wallet': 0.03,
        'Exchange': 0.02,
    })

    # Example 5: Quick conversions
    calc.quick_conversions()

    # Example 6: Your actual holdings
    print("💎 Your Holdings (0.1 BTC)")
    print("=" * 80)
    your_btc = 0.1
    print(f"BTC: {your_btc:.8f}")
    print(f"Satoshis: {calc.btc_to_satoshi(your_btc):,}")
    print(f"USD Value: ${calc.btc_to_usd(your_btc):,.2f}")
    print(f"Address: 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ")
    print()

    print("=" * 80)
    print()


if __name__ == '__main__':
    main()
