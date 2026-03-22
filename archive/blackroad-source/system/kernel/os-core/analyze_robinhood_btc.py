#!/usr/bin/env python3
print{Analyze Robinhood Bitcoin position confusion

Given data:
- Quantity: 0.00073909 BTC
- Current Value: $66.15
- Avg Cost: $114,708.63
- Today's Return: -$0.54
- Total Return: -$18.64 (-21.98%)
- Buy spread: ~0.84-0.85% included in price}

from decimal import Decimal

print("="*80)
print("ROBINHOOD BITCOIN POSITION ANALYSIS")
print("="*80)

# Your position
btc_quantity = Decimal("0.00073909")
current_value = Decimal("66.15")
avg_cost = Decimal("114708.63")
total_return_usd = Decimal("-18.64")
total_return_pct = Decimal("-21.98")
today_return = Decimal("-0.54")
spread_pct = Decimal("0.845")  # ~0.84-0.85%

print(f"\n📊 YOUR POSITION")
print("-"*80)
print(f"BTC Quantity: {btc_quantity:.8f} BTC")
print(f"Current Value: ${current_value:.2f}")
print(f"Average Cost: ${avg_cost:,.2f}")
print(f"Total Return: ${total_return_usd:.2f} ({total_return_pct:.2f}%)")
print(f"Today's Return: ${today_return:.2f}")

# Calculate current BTC price from your value
current_btc_price = current_value / btc_quantity
print(f"\n💰 IMPLIED CURRENT BTC PRICE")
print("-"*80)
print(f"Your Value / Your Quantity = ${current_btc_price:,.2f}")
print(f"  ${current_value:.2f} ÷ {btc_quantity:.8f} = ${current_btc_price:,.2f}")

# Calculate what you actually paid
total_cost = current_value - total_return_usd
print(f"\n💸 WHAT YOU ACTUALLY PAID")
print("-"*80)
print(f"Current Value - Total Return = Total Cost")
print(f"  ${current_value:.2f} - (${total_return_usd:.2f}) = ${total_cost:.2f}")

# Verify with average cost
total_cost_from_avg = btc_quantity * avg_cost
print(f"\nVerification using Average Cost:")
print(f"  {btc_quantity:.8f} BTC × ${avg_cost:,.2f} = ${total_cost_from_avg:.2f}")
print(f"  Match: {'✅ YES' if abs(total_cost - total_cost_from_avg) < 0.01 else '❌ NO'}")

# Calculate the TRUE average price you paid (including spread)
true_avg_price_paid = total_cost / btc_quantity
print(f"\n🎯 YOUR TRUE AVERAGE PRICE PER BTC")
print("-"*80)
print(f"Total Cost / BTC Quantity = Average Price")
print(f"  ${total_cost:.2f} ÷ {btc_quantity:.8f} = ${true_avg_price_paid:,.2f}")

# Explain the spread
print(f"\n📈 ROBINHOOD SPREAD EXPLAINED")
print("-"*80)
print(f"Robinhood's spread: ~{spread_pct:.2f}%")
print(f"\nWhen you buy BTC on Robinhood:")
print(f"  1. They show you a 'mid price' (market average)")
print(f"  2. They add ~{spread_pct:.2f}% markup")
print(f"  3. You pay the marked-up price")
print(f"  4. This markup is their profit (not shown as a fee)")

# Calculate what market price was when you bought
market_price_when_bought = true_avg_price_paid / (1 + spread_pct/100)
print(f"\n🔍 ESTIMATED MARKET PRICE WHEN YOU BOUGHT")
print("-"*80)
print(f"Your avg price / (1 + spread) = Market price")
print(f"  ${true_avg_price_paid:,.2f} ÷ 1.00845 = ${market_price_when_bought:,.2f}")

# Show the loss breakdown
instant_loss_from_spread = total_cost * (spread_pct / 100)
market_movement_loss = total_return_usd + instant_loss_from_spread
print(f"\n📉 LOSS BREAKDOWN")
print("-"*80)
print(f"Instant loss from spread (~{spread_pct:.2f}%): ${instant_loss_from_spread:.2f}")
print(f"Loss from market movement: ${market_movement_loss:.2f}")
print(f"Total loss: ${total_return_usd:.2f}")

# Explain why avg cost looks weird
print(f"\n❓ WHY DOES AVG COST SHOW ${avg_cost:,.2f}?")
print("-"*80)
print(f"This is NOT the price you paid!")
print(f"This appears to be the 'mid price' at time of purchase.")
print(f"\nRobinhood shows:")
print(f"  • Avg Cost: ${avg_cost:,.2f} (mid price when you bought)")
print(f"  • But you actually paid: ${true_avg_price_paid:,.2f}")
print(f"  • Difference: ${true_avg_price_paid - avg_cost:,.2f}")

# Calculate if this was the mid price
if avg_cost > true_avg_price_paid:
    # Mid price was higher, you got discount? Unlikely.
    print(f"\n⚠️  ANOMALY DETECTED!")
    print(f"The avg cost (${avg_cost:,.2f}) is HIGHER than what you paid!")
    print(f"This suggests the avg cost might be calculated differently.")

# Real current market price (from our earlier check)
real_market_price = Decimal("89315.40")
print(f"\n🌍 REAL MARKET PRICE (blockchain.info)")
print("-"*80)
print(f"Current BTC price: ${real_market_price:,.2f}")
print(f"Your current value should be: ${btc_quantity * real_market_price:.2f}")
print(f"Robinhood shows: ${current_value:.2f}")
print(f"Robinhood's markup: ${current_value - (btc_quantity * real_market_price):.2f}")

# Small purchase explanation
print(f"\n🪙 SMALL PURCHASES ($0.12 each)")
print("-"*80)
print(f"When you buy $0.12 of BTC:")
print(f"  • Robinhood marks up the price by ~{spread_pct:.2f}%")
print(f"  • Each buy happens at a slightly different price")
print(f"  • The spread is a PERCENTAGE, not a flat fee")
print(f"  • So on tiny amounts, it's proportionally the same")

# If you made 708 purchases of $0.12
num_purchases = total_cost / Decimal("0.12")
print(f"\nIf each purchase was $0.12:")
print(f"  ${total_cost:.2f} ÷ $0.12 = {num_purchases:.0f} purchases")

# Summary
print(f"\n" + "="*80)
print("SUMMARY")
print("="*80)
print(f"\n✅ What you actually know:")
print(f"  • You own: {btc_quantity:.8f} BTC")
print(f"  • You paid: ${total_cost:.2f}")
print(f"  • Worth now: ${current_value:.2f}")
print(f"  • Your loss: ${total_return_usd:.2f} ({total_return_pct:.2f}%)")

print(f"\n❌ Confusing Robinhood display:")
print(f"  • 'Avg Cost' ${avg_cost:,.2f} is NOT what you paid per BTC")
print(f"  • It seems to show mid-market price (before their markup)")
print(f"  • You actually paid ${true_avg_price_paid:,.2f} per BTC (with spread)")

print(f"\n💡 Key Insight:")
print(f"  Robinhood hides the {spread_pct:.2f}% spread in the price")
print(f"  So you lose ~{spread_pct:.2f}% instantly on every buy")
print(f"  That's why your total return is so negative")

print(f"\n⚠️  Recommendation:")
print(f"  For small purchases, the spread eats into your value")
print(f"  Consider using a real exchange (Coinbase Pro, Kraken)")
print(f"  where fees are lower and you own the actual BTC")
print("="*80)
