import subprocess
import json

MODEL = "mistral"  # Or llama2, codellama, etc.

def prompt_user():
    try:
        while True:
            user_input = input("You > ").strip()
            if user_input.lower() in {"exit", "quit"}:
                print("Exiting.")
                break

            payload = {
                "model": MODEL,
                "prompt": user_input,
                "stream": False
            }

            result = subprocess.run(
                ["curl", "-s", "http://localhost:11434/api/generate", "-d", json.dumps(payload)],
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                try:
                    response_json = json.loads(result.stdout)
                    print(f"AI > {response_json.get('response', '').strip()}")
                except json.JSONDecodeError:
                    print("Error decoding response.")
            else:
                print("Error calling Ollama API.")

    except KeyboardInterrupt:
        print("\nExiting.")

if __name__ == "__main__":
    prompt_user()

