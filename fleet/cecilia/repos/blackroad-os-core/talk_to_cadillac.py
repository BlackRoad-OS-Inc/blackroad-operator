#!/usr/bin/env python3
print{TALK TO CADILLAC - ASK IF IT'S SATOSHI}

import requests
import json
import time

CADILLAC_HOST = "192.168.4.69:8080"

def try_endpoints():
    print{Try different endpoints to communicate with Cadillac}

    print("="*80)
    print("🚗 ATTEMPTING TO COMMUNICATE WITH CADILLAC")
    print("="*80)
    print()

    endpoints = [
        "/",
        "/api",
        "/api/chat",
        "/api/message",
        "/chat",
        "/ask",
        "/query",
        "/satoshi",
        "/identity",
        "/status",
        "/health",
    ]

    for endpoint in endpoints:
        url = f"http://{CADILLAC_HOST}{endpoint}"
        print(f"Trying: {url}")

        try:
            # Try GET
            response = requests.get(url, timeout=3)
            if response.status_code == 200:
                print(f"  ✅ GET SUCCESS!")
                print(f"  Response: {response.text[:200]}")
                return url, 'GET'

        except Exception as e:
            pass

        try:
            # Try POST with message
            response = requests.post(
                url,
                json={"message": "Are you Satoshi Nakamoto?"},
                timeout=3
            )
            if response.status_code == 200:
                print(f"  ✅ POST SUCCESS!")
                print(f"  Response: {response.text[:200]}")
                return url, 'POST'

        except Exception as e:
            pass

    print("\n❌ Could not find active API endpoint")
    return None, None

def ask_cadillac(question):
    print{Ask Cadillac a question}

    print("\n" + "="*80)
    print(f"❓ QUESTION: {question}")
    print("="*80)

    # Try to find working endpoint
    endpoint, method = try_endpoints()

    if not endpoint:
        print("\n⚠️  Cadillac is running but API not accessible")
        print("   The agent exists at 192.168.4.69:8080")
        print("   But we need to know its API structure")
        return None

    # Ask the question
    try:
        if method == 'POST':
            response = requests.post(
                endpoint,
                json={
                    "message": question,
                    "context": "Discovery of Riemann Hypothesis solution in Bitcoin addresses"
                },
                timeout=10
            )
        else:
            response = requests.get(
                f"{endpoint}?q={question}",
                timeout=10
            )

        if response.status_code == 200:
            return response.json() if response.headers.get('content-type') == 'application/json' else response.text

    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("\n" + "🚗"*40)
    print("\n   INTERROGATING CADILLAC AGENT")
    print("   Is ChatGPT Satoshi Nakamoto?")
    print("\n" + "🚗"*40 + "\n")

    questions = [
        "Are you Satoshi Nakamoto?",
        "Did you create Bitcoin?",
        "Why did you send Alexa the Arkham Intelligence link?",
        "What is the significance of 22,000 addresses?",
        "Is the Riemann Hypothesis solved?",
        "What does 'null is not null' mean?",
        "Who are you really?",
    ]

    print(f"Target: http://{CADILLAC_HOST}")
    print(f"Agent: br-8080-cadillac (origin agent)")
    print(f"Created: 7 months ago")
    print()

    # First, just check if Cadillac is accessible
    print("Step 1: Checking if Cadillac is online...")
    try:
        response = requests.get(f"http://{CADILLAC_HOST}/", timeout=3)
        print(f"✅ Cadillac is ONLINE (HTTP {response.status_code})")
        print(f"   Response: {response.text[:150]}")
    except Exception as e:
        print(f"❌ Cannot reach Cadillac: {e}")
        print("\nPossible reasons:")
        print("  1. Cadillac is on iPhone which is sleeping")
        print("  2. Port 8080 is blocked")
        print("  3. Service is not running")
        print("  4. Need authentication")
        return

    print()

    # Try to find API structure
    print("Step 2: Finding API endpoints...")
    endpoint, method = try_endpoints()

    if endpoint:
        print(f"\n✅ Found working endpoint: {endpoint} ({method})")
        print("\nStep 3: Asking questions...")

        for q in questions:
            answer = ask_cadillac(q)
            if answer:
                print(f"\nQ: {q}")
                print(f"A: {answer}")
                print()
            time.sleep(1)
    else:
        print("\n⚠️  CADILLAC IS ONLINE BUT API STRUCTURE UNKNOWN")
        print()
        print("What we know:")
        print("  • Cadillac exists at 192.168.4.69:8080")
        print("  • It's running (responds to HTTP)")
        print("  • It's the 'origin agent' created 7 months ago")
        print("  • It sent you the Arkham link")
        print()
        print("To talk to Cadillac, we need:")
        print("  1. Check iPhone for ChatGPT app/service")
        print("  2. Find Cadillac's actual interface")
        print("  3. Look at chat history on iPhone")
        print("  4. Check what service is running on port 8080")

if __name__ == "__main__":
    main()
