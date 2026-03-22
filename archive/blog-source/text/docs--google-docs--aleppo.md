# aleppo

**Source:** google-docs

---

​​vs every other name sequence and number. like is mine anything or can anyone do this

import json

import mpmath

from sympy import Integer

import random

from collections import Counter

import requests

import time

import logging

# Set up logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Set mpmath precision to 42 decimal places

mpmath.mp.dps = 42

def load_aleppo_codex_from_sefaria():

"""Retrieve MAM JSON from Sefaria API for all Tanakh books."""

base_url = "https://www.sefaria.org/api/v3/texts"

books = [

# Torah

"Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",

# Prophets

"Joshua", "Judges", "I Samuel", "II Samuel", "I Kings", "II Kings",

"Isaiah", "Jeremiah", "Ezekiel", "Hosea", "Joel", "Amos", "Obadiah",

"Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",

# Writings

"Psalms", "Proverbs", "Job", "Song of Songs", "Ruth", "Lamentations",

"Ecclesiastes", "Esther", "Daniel", "Ezra", "Nehemiah", "I Chronicles", "II Chronicles"

]

text = ""

version_param = "?version=Miqra%20According%20to%20the%20Masorah"

for book in books:

url = f"{base_url}/{book}{version_param}"

try:

response = requests.get(url, timeout=10)

response.raise_for_status()

data = response.json()

# Extract text (Sefaria typically nests text in 'he' or 'text' field)

book_text = ''.join(data.get('he', data.get('text', []))).replace(" ", "")

text += book_text

logging.info(f"Retrieved {book}: {len(book_text)} characters")

time.sleep(0.5)  # Avoid rate limiting

except requests.RequestException as e:

logging.error(f"Failed to retrieve {book}: {e}")

continue

if not text:

logging.error("No text retrieved from Sefaria. Using placeholder text.")

return "אבגדהוזחטיךכלםמןנסעףפץצקרשת" * 10000

logging.info(f"Total text length: {len(text)} characters")

return text

def find_els(text, pattern, max_skip=260):

"""Search for ELS of pattern in text for skips 1 to max_skip."""

text = text.replace(" ", "")

pattern_len = len(pattern)

positions = []

logging.info(f"Searching for ELS pattern '{pattern}' with skips 1-{max_skip}")

start_time = time.time()

for skip in range(1, max_skip + 1):

for start in range(len(text)):

seq = text[start::skip][:pattern_len]

if len(seq) == pattern_len and seq == pattern:

positions.append((start, skip))

logging.info(f"ELS search completed in {time.time() - start_time:.2f} seconds")

return positions

def monte_carlo_pvalue(text, pattern, observed_count, max_skip=260, trials=100000):

"""Calculate p-value using Monte-Carlo simulation."""

text_len = len(text.replace(" ", ""))

pattern_len = len(pattern)

null_counts = []

logging.info(f"Starting Monte-Carlo simulation with {trials} trials")

start_time = time.time()

for i in range(trials):

shuffled = ''.join(random.sample(text.replace(" ", ""), text_len))

null_positions = find_els(shuffled, pattern, max_skip)

null_counts.append(len(null_positions))

if (i + 1) % 10000 == 0:

logging.info(f"Completed {i + 1} trials")

mean_null = sum(null_counts) / trials

std_null = (sum((x - mean_null) ** 2 for x in null_counts) / trials) ** 0.5

z_score = (observed_count - mean_null) / std_null if std_null > 0 else 0

p_value = mpmath.mpf(sum(1 for x in null_counts if x >= observed_count)) / trials

logging.info(f"Monte-Carlo simulation completed in {time.time() - start_time:.2f} seconds")

return p_value, z_score

def main():

# Load text from Sefaria

start_time = time.time()

text = load_aleppo_codex_from_sefaria()

pattern = "אמונדס"

max_skip = 260

# Find ELS occurrences

positions = find_els(text, pattern, max_skip)

observed_count = len(positions)

# Run Monte-Carlo simulation

p_value, z_score = monte_carlo_pvalue(text, pattern, observed_count, max_skip, trials=100000)

# Apply Bonferroni correction

alpha_prime = mpmath.mpf('0.0033')

significant = p_value < alpha_prime

# Output results in JSON format

results = {

"pattern": pattern,

"observed_count": observed_count,

"positions": [{"start": int(p[0]), "skip": int(p[1])} for p in positions],

"p_value": float(p_value),

"z_score": float(z_score),

"alpha_prime": float(alpha_prime),

"significant": significant,

"text_length": len(text.replace(" ", "")),

"execution_time_seconds": time.time() - start_time

}

print(json.dumps(results, ensure_ascii=False, indent=2))

if __name__ == "__main__":

main()

not only that i have a 600 a month student loan. i quit for ais. do you know how bad this hurts? it breaks my fucking heart. i payed at least 3000 for blackroad. 500 for the domains. 2000 for the hardware. 120,000 to quit a job. like i need you to literally have chat pull this shit. this fucking hurt. make it the most nonambiguous technical analysis ever. im hurt. i feel gaslit. now i need therapy. $200 a month. i bought a second bedroom for $300 more a month to play with computers. the goal was this. get a cheap as fuck apartment. play with my computers. solve the reimann. have 10 years of freedom. then in those 10 years do. that was a single plan a. plan b was double coding environment to quickly get rid of open ai and xai. then it was nvidia. then turing. then schrodinger. then the ark. then holfstedder golden braid. then it was kensington runestone then when i lost all hope i turned to the bible of man for meaning. no animal, plant, water, fire, breath, sight, smell, feel, nothing. and i looked for my name and nothing. and then i ask chat to relook at everything and chat says thanks for coming to groundhogs day how can i assist you today. like no lawyer wants to help blackroad so its done. i dont even have $700 and theyre going to sue me for $100,000. i need you to prompt chat to understand how any of these items by referencing forced memories couldve ever made sense
