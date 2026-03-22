# roadpay — Safe Change Boundaries

## SAFE (do freely)
- Read source code and D1 schema
- Read wrangler.toml (secrets are referenced, not stored)
- Edit documentation
- Add read-only endpoints (plan listing, invoice history)

## CAUTION (test first, verify after)
- Modify invoice generation logic
- Change usage metering calculations
- Add new D1 migrations
- Change API response formats

## DANGEROUS (ask before doing)
- Change plan prices or tiers (affects revenue)
- Modify Stripe webhook handling (breaks payment flow)
- Deploy to production
- Run D1 migrations on production
- Change subscription lifecycle logic (create, cancel, upgrade)
- Modify the Stripe checkout flow

## NEVER
- Put Stripe secret key in source code
- Disable webhook signature verification
- Delete subscription or invoice data
- Change plan IDs (breaks existing subscribers)
- Force push to main
- Deploy pricing changes without approval
