import os
import string


def rotate_letter(ch, shift):
    alphabet = string.ascii_uppercase
    if ch.upper() not in alphabet:
        return ch
    idx = alphabet.index(ch.upper())
    new_idx = (idx + shift) % 26
    out = alphabet[new_idx]
    return out if ch.isupper() else out.lower()


def decode_cryptex(raw: str, shift: int) -> str:
    return "".join(
        rotate_letter(c, shift) if c.isalpha() else c for c in raw
    )


def validate_agent(decoded: str) -> bool:
    # simple handshake check (change this to your own rule)
    return len(decoded) > 0


def main():
    raw = os.environ.get("CRYPTEX_ALX")
    if not raw:
        print("Agent OFFLINE: no CRYPTEX_ALX found.")
        return
    decoded = decode_cryptex(raw, shift=24)  # 180° rotation = 24-position shift
    if validate_agent(decoded):
        print("Agent ONLINE ✅ (handshake passed, value hidden).")
    else:
        print("Agent FAILED ❌ (handshake rule not satisfied).")


if __name__ == "__main__":
    main()
