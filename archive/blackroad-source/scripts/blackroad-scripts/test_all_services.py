#!/usr/bin/env python3
"""Test all service integrations for Cece"""
import os
import sys

def test_github():
    """Test GitHub via gh CLI"""
    import subprocess
    result = subprocess.run(['gh', 'api', '/user', '--jq', '.login'], 
                          capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ GitHub: Authenticated as {result.stdout.strip()}")
        return True
    else:
        print(f"❌ GitHub: {result.stderr}")
        return False

def test_stripe():
    """Test Stripe API"""
    import subprocess
    result = subprocess.run(['stripe', 'customers', 'list', '--limit', '1'], 
                          capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Stripe: API working, customers accessible")
        return True
    else:
        print(f"❌ Stripe: {result.stderr}")
        return False

def test_cloudflare():
    """Test Cloudflare via wrangler"""
    import subprocess
    result = subprocess.run(['wrangler', 'whoami'], 
                          capture_output=True, text=True)
    if 'logged in' in result.stdout.lower():
        print("✅ Cloudflare: Authenticated")
        return True
    else:
        print(f"❌ Cloudflare: Not authenticated")
        return False

def test_railway():
    """Test Railway token"""
    import json
    try:
        with open(os.path.expanduser('~/.railway/config.json')) as f:
            config = json.load(f)
            if config.get('user', {}).get('token'):
                print("✅ Railway: Token found (needs refresh)")
                return True
    except Exception as e:
        print(f"❌ Railway: {e}")
    return False

def test_huggingface():
    """Test HuggingFace"""
    try:
        from huggingface_hub import whoami
        info = whoami()
        print(f"✅ HuggingFace: Authenticated as {info.get('name', 'unknown')}")
        return True
    except Exception as e:
        if 'Token is required' in str(e):
            print("❌ HuggingFace: No token (run: huggingface-cli login)")
        else:
            print(f"❌ HuggingFace: {e}")
        return False

def test_anthropic():
    """Test Anthropic (Cece)"""
    if os.getenv('ANTHROPIC_API_KEY'):
        try:
            from anthropic import Anthropic
            client = Anthropic()
            message = client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=20,
                messages=[{"role": "user", "content": "Say 'working'"}]
            )
            response = message.content[0].text
            print(f"✅ Anthropic (Cece): {response}")
            return True
        except Exception as e:
            print(f"❌ Anthropic (Cece): {e}")
            return False
    else:
        print("❌ Anthropic (Cece): ANTHROPIC_API_KEY not set")
        return False

if __name__ == '__main__':
    print("🔍 Testing all service integrations...\n")
    
    results = {
        'GitHub': test_github(),
        'Stripe': test_stripe(),
        'Cloudflare': test_cloudflare(),
        'Railway': test_railway(),
        'HuggingFace': test_huggingface(),
        'Anthropic': test_anthropic(),
    }
    
    print(f"\n📊 Results: {sum(results.values())}/{len(results)} services working")
    sys.exit(0 if all(results.values()) else 1)
