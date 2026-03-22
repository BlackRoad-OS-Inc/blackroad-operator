# squad-webhook — Safe Change Boundaries

## SAFE (do freely)
- Read source code and agent definitions
- Read wrangler.toml (secrets are referenced, not stored)
- Edit documentation
- Add comments to code

## CAUTION (test first, verify after)
- Modify agent system prompts (changes what agents say publicly on GitHub)
- Change webhook event filtering (may miss or duplicate events)
- Edit agent routing logic
- Modify the Ollama API call parameters

## DANGEROUS (ask before doing)
- Deploy to production (live on 69 repos, agents will respond publicly)
- Change the GitHub token or webhook secret
- Modify HMAC verification logic
- Add new webhook event types (may trigger on unexpected events)

## NEVER
- Disable webhook signature verification
- Put GitHub tokens in source code
- Post comments containing internal IPs, secrets, or raw error stacks
- Force push to main
- Deploy untested agent prompts (they speak publicly as BlackRoad)
