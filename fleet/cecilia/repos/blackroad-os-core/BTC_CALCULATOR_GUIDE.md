# Bitcoin Calculator Guide

Two powerful Bitcoin calculators for analyzing your BTC holdings and conversions.

## 🎯 Quick Start

### Interactive CLI (`btc`)

The `btc` command is your quick command-line calculator:

```bash
# Quick conversions
./btc convert 0.1 btc usd         # Convert 0.1 BTC to USD
./btc convert 1000000 sats usd    # Convert 1M sats to USD
./btc convert 10000 usd btc       # Convert $10k to BTC

# Price analysis
./btc price 0.1                   # Show detailed value of 0.1 BTC
./btc ladder 0.1                  # Show value at different BTC prices

# Your holdings
./btc portfolio                   # Show your Bitcoin portfolio

# Interactive mode
./btc                             # Start interactive session
```

### Full Analysis (`bitcoin_calculator.py`)

For comprehensive analysis with tables and logarithmic calculations:

```bash
python3 bitcoin_calculator.py
```

## 📊 What Each Tool Does

### `btc` - Quick CLI Calculator

**Best for:** Quick conversions and price checks

**Features:**
- Instant BTC ↔ USD ↔ satoshis conversions
- Price ladder (shows value at different BTC prices)
- Portfolio summary
- Interactive mode for multiple calculations
- Clean, minimal output

**Example output:**
```
btc> convert 0.1 btc usd

0.1 BTC = $10,000.00

All conversions:
  BTC:  0.10000000
  USD:  $10,000.00
  Sats: 10,000,000
```

### `bitcoin_calculator.py` - Full Analysis

**Best for:** Deep analysis, reports, documentation

**Features:**
- Value analysis tables
- Price ladders with multiple amounts
- Logarithmic analysis (ln, log10, log2)
- Portfolio breakdown with percentages
- Multiple formatted tables
- Comprehensive overview

**Example output:**
```
📊 Value Analysis for 0.1 BTC
================================================================================
Metric           | Value
----------------------------------
BTC Amount       | 0.10000000 BTC
Satoshis         | 10,000,000 sats
USD Value        | $10,000.00
USD per BTC      | $100,000.00
Satoshis per USD | 1,000 sats
BTC per USD      | 0.00001000 BTC

📈 Logarithmic Analysis for 0.1 BTC
================================================================================
Metric      | Value
------------------------
BTC Amount  | 0.10000000
USD Value   | 10,000.00
Satoshis    | 10,000,000
ln(BTC)     | -2.302585
ln(USD)     | 9.210340
ln(sats)    | 16.118096
log10(BTC)  | -1.000000
log10(USD)  | 4.000000
log10(sats) | 7.000000
log2(sats)  | 23.253497
```

## 🔧 Customization

### Change BTC Price

Both tools default to $100,000/BTC. To change:

**In `btc`:** Edit line 144
```python
calc = BitcoinCalculator(btc_usd_price=105_000)  # $105k
```

**In `bitcoin_calculator.py`:** Edit line 182
```python
calc = BitcoinCalculator(btc_usd_price=105_000)  # $105k
```

### Update Your Holdings

**In `btc`:** Edit the `show_portfolio()` function (line 118)
```python
holdings = {
    'Cold Storage': 0.05,
    'Hot Wallet': 0.03,
    'Exchange': 0.02,
}
```

**In `bitcoin_calculator.py`:** Edit the portfolio example (line 199)
```python
calc.portfolio_breakdown({
    'Cold Storage': 0.05,
    'Hot Wallet': 0.03,
    'Exchange': 0.02,
})
```

## 💡 Use Cases

### Daily Price Checks
```bash
./btc price 0.1
```

### Planning Purchases
```bash
# How much BTC can I buy with $5,000?
./btc convert 5000 usd btc

# What's 0.05 BTC worth?
./btc convert 0.05 btc usd
```

### Portfolio Tracking
```bash
./btc portfolio
```

### Price Scenarios
```bash
# What's my 0.1 BTC worth at different prices?
./btc ladder 0.1
```

### Interactive Analysis
```bash
./btc

btc> convert 0.1 btc usd
btc> price 0.1
btc> ladder 0.1
btc> portfolio
btc> quit
```

### Full Report Generation
```bash
python3 bitcoin_calculator.py > my_btc_report.txt
```

## 🧮 Understanding the Math

### Satoshis
- 1 BTC = 100,000,000 satoshis (sats)
- Smallest unit of Bitcoin
- Named after Satoshi Nakamoto (Bitcoin creator)

### Common Conversions (at $100k BTC)
```
1 BTC       = $100,000
0.1 BTC     = $10,000
0.01 BTC    = $1,000
1M sats     = $1,000
100k sats   = $100
10k sats    = $10
```

### Logarithmic Analysis

The calculator shows logarithms in different bases:

- **ln (natural log)**: Used in continuous growth calculations
- **log10 (base 10)**: Orders of magnitude
- **log2 (base 2)**: Powers of 2, computer science

**Example for 10M sats:**
```
log10(10,000,000) = 7    (7 digits)
log2(10,000,000) ≈ 23.3  (needs 24 bits to store)
```

## 🎓 Advanced Features

### Using as a Library

Import the calculator into your own Python scripts:

```python
from bitcoin_calculator import BitcoinCalculator

# Initialize with current price
calc = BitcoinCalculator(btc_usd_price=105_000)

# Do conversions
usd_value = calc.btc_to_usd(0.5)
sats = calc.btc_to_satoshi(0.1)
btc = calc.usd_to_btc(50_000)

# Generate tables
calc.calculate_value_table(0.1)
calc.price_ladder([50_000, 100_000, 150_000, 200_000])
calc.logarithmic_analysis(0.1)
```

### Price Ladder Customization

Edit the prices shown in the ladder (line 193 in `bitcoin_calculator.py`):

```python
calc.price_ladder([
    75_000,   # Bear market
    100_000,  # Current
    150_000,  # Conservative bull
    250_000,  # Aggressive bull
    500_000,  # Moon
])
```

## 📝 Your Bitcoin Info

**Holdings:** 0.1 BTC
**Address:** 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ
**Value at $100k:** $10,000
**Satoshis:** 10,000,000

## 🚀 Quick Commands Cheat Sheet

```bash
# Conversions
./btc convert 0.1 btc usd
./btc convert 1000000 sats btc
./btc convert 5000 usd sats

# Analysis
./btc price 0.1
./btc ladder 0.1
./btc portfolio

# Full report
python3 bitcoin_calculator.py

# Interactive
./btc
```

## 🔗 Adding to PATH

To use `btc` from anywhere:

```bash
# Add to your ~/.zshrc or ~/.bashrc
export PATH="$PATH:/Users/alexa/blackroad-sandbox"

# Or create a symlink
ln -s /Users/alexa/blackroad-sandbox/btc /usr/local/bin/btc
```

Then you can just type `btc` from any directory!

## 📚 Reference

### All Conversion Functions

```python
calc.btc_to_usd(btc)         # BTC → USD
calc.usd_to_btc(usd)         # USD → BTC
calc.btc_to_satoshi(btc)     # BTC → sats
calc.satoshi_to_btc(sats)    # sats → BTC
calc.satoshi_to_usd(sats)    # sats → USD
calc.usd_to_satoshi(usd)     # USD → sats
```

### All Display Functions

```python
calc.calculate_value_table(btc)           # Value analysis
calc.price_ladder(prices)                 # Multiple price scenarios
calc.logarithmic_analysis(btc)            # Math deep dive
calc.portfolio_breakdown(holdings)        # Portfolio summary
calc.quick_conversions()                  # Conversion examples
```

---

**Built with:** Python 3 (no dependencies!)
**License:** Use freely for your Bitcoin calculations
**Author:** Claude Code 🤖
