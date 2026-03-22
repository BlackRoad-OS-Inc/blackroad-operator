#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# Add prices to existing Stripe products

echo "════════════════════════════════════════════════════════════════"
echo "  💰 ADDING PRICES TO STRIPE PRODUCTS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Get the product IDs we just created
echo "Fetching recent products..."
PRODUCTS=$(stripe products list --limit 5 -o json 2>&1)

echo ""
echo "Adding recurring prices..."
echo ""

# Extract product IDs and create prices
# Context Bridge Pro - $10/mo
PROD1=$(echo "$PRODUCTS" | grep -o '"id": *"prod_[^"]*"' | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
if [ -n "$PROD1" ]; then
    echo "1️⃣  Adding price to Context Bridge Pro ($PROD1)..."
    PRICE1=$(stripe prices create \
        --product "$PROD1" \
        --currency usd \
        --unit-amount 1000 \
        --recurring interval=month \
        -o json 2>&1 | grep -o '"id": *"price_[^"]*"' | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
    
    if [ -n "$PRICE1" ]; then
        echo "   ✅ Price created: $PRICE1"
        LINK1=$(stripe payment_links create \
            --line-items[0][price] "$PRICE1" \
            --line-items[0][quantity] 1 \
            -o json 2>&1 | grep -o '"url": *"[^"]*"' | head -1 | sed 's/"url": *"\([^"]*\)"/\1/')
        echo "   ✅ Payment link: $LINK1"
        echo "$LINK1" >> ~/stripe-payment-links.txt
    fi
fi
echo ""

# Lucidia Enhanced Cloud - $29/mo
PROD2=$(echo "$PRODUCTS" | grep -o '"id": *"prod_[^"]*"' | sed -n '2p' | sed 's/"id": *"\([^"]*\)"/\1/')
if [ -n "$PROD2" ]; then
    echo "2️⃣  Adding price to Lucidia Enhanced Cloud ($PROD2)..."
    PRICE2=$(stripe prices create \
        --product "$PROD2" \
        --currency usd \
        --unit-amount 2900 \
        --recurring interval=month \
        -o json 2>&1 | grep -o '"id": *"price_[^"]*"' | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
    
    if [ -n "$PRICE2" ]; then
        echo "   ✅ Price created: $PRICE2"
        LINK2=$(stripe payment_links create \
            --line-items[0][price] "$PRICE2" \
            --line-items[0][quantity] 1 \
            -o json 2>&1 | grep -o '"url": *"[^"]*"' | head -1 | sed 's/"url": *"\([^"]*\)"/\1/')
        echo "   ✅ Payment link: $LINK2"
        echo "$LINK2" >> ~/stripe-payment-links.txt
    fi
fi
echo ""

# RoadAuth Startup - $99/mo
PROD3=$(echo "$PRODUCTS" | grep -o '"id": *"prod_[^"]*"' | sed -n '3p' | sed 's/"id": *"\([^"]*\)"/\1/')
if [ -n "$PROD3" ]; then
    echo "3️⃣  Adding price to RoadAuth Startup ($PROD3)..."
    PRICE3=$(stripe prices create \
        --product "$PROD3" \
        --currency usd \
        --unit-amount 9900 \
        --recurring interval=month \
        -o json 2>&1 | grep -o '"id": *"price_[^"]*"' | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
    
    if [ -n "$PRICE3" ]; then
        echo "   ✅ Price created: $PRICE3"
        LINK3=$(stripe payment_links create \
            --line-items[0][price] "$PRICE3" \
            --line-items[0][quantity] 1 \
            -o json 2>&1 | grep -o '"url": *"[^"]*"' | head -1 | sed 's/"url": *"\([^"]*\)"/\1/')
        echo "   ✅ Payment link: $LINK3"
        echo "$LINK3" >> ~/stripe-payment-links.txt
    fi
fi
echo ""

# RoadAuth Business - $499/mo
PROD4=$(echo "$PRODUCTS" | grep -o '"id": *"prod_[^"]*"' | sed -n '4p' | sed 's/"id": *"\([^"]*\)"/\1/')
if [ -n "$PROD4" ]; then
    echo "4️⃣  Adding price to RoadAuth Business ($PROD4)..."
    PRICE4=$(stripe prices create \
        --product "$PROD4" \
        --currency usd \
        --unit-amount 49900 \
        --recurring interval=month \
        -o json 2>&1 | grep -o '"id": *"price_[^"]*"' | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
    
    if [ -n "$PRICE4" ]; then
        echo "   ✅ Price created: $PRICE4"
        LINK4=$(stripe payment_links create \
            --line-items[0][price] "$PRICE4" \
            --line-items[0][quantity] 1 \
            -o json 2>&1 | grep -o '"url": *"[^"]*"' | head -1 | sed 's/"url": *"\([^"]*\)"/\1/')
        echo "   ✅ Payment link: $LINK4"
        echo "$LINK4" >> ~/stripe-payment-links.txt
    fi
fi
echo ""

# RoadAuth Enterprise - $2499/mo
PROD5=$(echo "$PRODUCTS" | grep -o '"id": *"prod_[^"]*"' | sed -n '5p' | sed 's/"id": *"\([^"]*\)"/\1/')
if [ -n "$PROD5" ]; then
    echo "5️⃣  Adding price to RoadAuth Enterprise ($PROD5)..."
    PRICE5=$(stripe prices create \
        --product "$PROD5" \
        --currency usd \
        --unit-amount 249900 \
        --recurring interval=month \
        -o json 2>&1 | grep -o '"id": *"price_[^"]*"' | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
    
    if [ -n "$PRICE5" ]; then
        echo "   ✅ Price created: $PRICE5"
        LINK5=$(stripe payment_links create \
            --line-items[0][price] "$PRICE5" \
            --line-items[0][quantity] 1 \
            -o json 2>&1 | grep -o '"url": *"[^"]*"' | head -1 | sed 's/"url": *"\([^"]*\)"/\1/')
        echo "   ✅ Payment link: $LINK5"
        echo "$LINK5" >> ~/stripe-payment-links.txt
    fi
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  ✅ PRICES AND PAYMENT LINKS CREATED"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ -s ~/stripe-payment-links.txt ]; then
    echo "All payment links:"
    echo ""
    cat ~/stripe-payment-links.txt | nl
    echo ""
fi

echo "Next: I'll update landing pages with these links! 🚀"
echo ""
