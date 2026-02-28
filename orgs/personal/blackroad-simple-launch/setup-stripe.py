#!/usr/bin/env python3
"""
BlackRoad OS - Stripe Product & Payment Link Setup
Programmatically creates products and payment links
"""

import stripe
import sys
import os

# Stripe API key (load from environment or ~/.stripe_keys)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

if not stripe.api_key:
    print("⚠️  STRIPE_SECRET_KEY not found in environment")
    print("📝 Loading from ~/.stripe_keys...")
    try:
        with open(os.path.expanduser('~/.stripe_keys'), 'r') as f:
            for line in f:
                if line.startswith('STRIPE_SECRET_KEY='):
                    stripe.api_key = line.split('=', 1)[1].strip()
                    break
    except FileNotFoundError:
        print("❌ Error: ~/.stripe_keys not found")
        print("💡 Create ~/.stripe_keys with: STRIPE_SECRET_KEY=sk_live_...")
        sys.exit(1)

if not stripe.api_key:
    print("❌ Error: STRIPE_SECRET_KEY not configured")
    sys.exit(1)

def create_products():
    """Create BlackRoad OS products in Stripe"""

    print("🚀 Creating Stripe products...\n")

    # Product 1: Founding Member (50% OFF FOREVER)
    print("1️⃣ Creating: BlackRoad OS Pro - Founding Member")
    founding_product = stripe.Product.create(
        name="BlackRoad OS - Pro (Founding Member - 50% OFF FOREVER)",
        description="AI operating system for teams. Founding members get 50% off for life.",
        metadata={
            "tier": "founding_member",
            "discount": "50_percent_lifetime"
        }
    )

    founding_price = stripe.Price.create(
        product=founding_product.id,
        unit_amount=2900,  # $29.00 (already discounted from $58)
        currency="usd",
        recurring={"interval": "month"},
        metadata={"original_price": "5800"}
    )

    print(f"   ✅ Product ID: {founding_product.id}")
    print(f"   ✅ Price ID: {founding_price.id}")
    print()

    # Product 2: Regular Pro
    print("2️⃣ Creating: BlackRoad OS Pro")
    pro_product = stripe.Product.create(
        name="BlackRoad OS - Pro",
        description="AI operating system for teams. Deploy instantly, build with AI, ship faster.",
        metadata={"tier": "pro"}
    )

    pro_price = stripe.Price.create(
        product=pro_product.id,
        unit_amount=5800,  # $58.00
        currency="usd",
        recurring={"interval": "month"}
    )

    print(f"   ✅ Product ID: {pro_product.id}")
    print(f"   ✅ Price ID: {pro_price.id}")
    print()

    # Product 3: Enterprise
    print("3️⃣ Creating: BlackRoad OS Enterprise")
    enterprise_product = stripe.Product.create(
        name="BlackRoad OS - Enterprise",
        description="AI operating system for large teams. Custom integrations, dedicated support, SLA.",
        metadata={"tier": "enterprise"}
    )

    enterprise_price = stripe.Price.create(
        product=enterprise_product.id,
        unit_amount=19900,  # $199.00
        currency="usd",
        recurring={"interval": "month"}
    )

    print(f"   ✅ Product ID: {enterprise_product.id}")
    print(f"   ✅ Price ID: {enterprise_price.id}")
    print()

    return {
        "founding": {"product": founding_product, "price": founding_price},
        "pro": {"product": pro_product, "price": pro_price},
        "enterprise": {"product": enterprise_product, "price": enterprise_price}
    }

def create_payment_links(products):
    """Create payment links for each product"""

    print("💳 Creating payment links...\n")

    # Founding Member Link
    print("1️⃣ Creating payment link: Founding Member")
    founding_link = stripe.PaymentLink.create(
        line_items=[{
            "price": products["founding"]["price"].id,
            "quantity": 1
        }],
        after_completion={
            "type": "hosted_confirmation",
            "hosted_confirmation": {
                "custom_message": "🎉 Welcome to BlackRoad OS! You're now a Founding Member with 50% off for life. Check your email for login details."
            }
        },
        allow_promotion_codes=True,
        billing_address_collection="auto",
        shipping_address_collection=None,
        phone_number_collection={"enabled": False},
        custom_text={
            "submit": {"message": "Start your 14-day free trial"}
        },
        subscription_data={
            "trial_period_days": 14
        }
    )

    print(f"   ✅ Payment Link: {founding_link.url}")
    print()

    # Pro Link
    print("2️⃣ Creating payment link: Pro")
    pro_link = stripe.PaymentLink.create(
        line_items=[{
            "price": products["pro"]["price"].id,
            "quantity": 1
        }],
        after_completion={
            "type": "hosted_confirmation",
            "hosted_confirmation": {
                "custom_message": "Welcome to BlackRoad OS Pro! Check your email for login details."
            }
        },
        allow_promotion_codes=True,
        billing_address_collection="auto",
        subscription_data={
            "trial_period_days": 14
        }
    )

    print(f"   ✅ Payment Link: {pro_link.url}")
    print()

    # Enterprise Link
    print("3️⃣ Creating payment link: Enterprise")
    enterprise_link = stripe.PaymentLink.create(
        line_items=[{
            "price": products["enterprise"]["price"].id,
            "quantity": 1
        }],
        after_completion={
            "type": "redirect",
            "redirect": {"url": "https://app.blackroad.io/welcome"}
        },
        allow_promotion_codes=True,
        billing_address_collection="required",
        subscription_data={
            "trial_period_days": 30
        }
    )

    print(f"   ✅ Payment Link: {enterprise_link.url}")
    print()

    return {
        "founding": founding_link,
        "pro": pro_link,
        "enterprise": enterprise_link
    }

def main():
    print("=" * 60)
    print("BlackRoad OS - Stripe Setup")
    print("=" * 60)
    print()

    try:
        # Create products
        products = create_products()

        # Create payment links
        links = create_payment_links(products)

        # Summary
        print("=" * 60)
        print("✅ SETUP COMPLETE!")
        print("=" * 60)
        print()
        print("📋 SAVE THESE URLs:")
        print()
        print(f"🎁 Founding Member (50% OFF): {links['founding'].url}")
        print(f"💼 Pro Plan: {links['pro'].url}")
        print(f"🏢 Enterprise: {links['enterprise'].url}")
        print()
        print("💾 SAVE THESE PRICE IDs (for API integration):")
        print()
        print(f"Founding: {products['founding']['price'].id}")
        print(f"Pro: {products['pro']['price'].id}")
        print(f"Enterprise: {products['enterprise']['price'].id}")
        print()
        print("🚀 Next: Update landing page with founding member link!")

    except stripe.StripeError as e:
        print(f"❌ Stripe Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
