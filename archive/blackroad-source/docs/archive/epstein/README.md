# Epstein Files Transparency Archive

[![Documents](https://img.shields.io/badge/documents-DOJ_indexed-FF6B2B.svg)](https://blackboxprogramming.github.io)
[![Open Data](https://img.shields.io/badge/open-data-00D4FF.svg)](https://blackroad.io)
[![FOIA](https://img.shields.io/badge/FOIA-transparency-3776AB.svg)](https://blackroad.io)



> **"No record shall be withheld, delayed, or redacted on the basis of embarrassment, reputational harm, or political sensitivity."**  
> — Epstein Files Transparency Act (H.R. 4405)

---

## What's Here

This repository contains **officially released US Government documents** organized for public accessibility and research.

### Documents (119MB total)

| File | Size | Description |
|------|------|-------------|
| `flight-logs-maxwell-trial.pdf` | 11MB | 118 pages of pilot flight logs |
| `cbp-epstein-records-02.pdf` | 32MB | 84 pages CBP travel records |
| `little-black-book.pdf` | 10MB | 92 page scanned contact book |
| `contact-book.pdf` | 7.1MB | DOJ contact evidence |
| `evidence-list.pdf` | 712KB | FBI evidence inventory |
| `black-book-transcribed.txt` | 185KB | **Full text transcript (17,480 lines)** |

### Extracted Data

| File | Contents |
|------|----------|
| `extracted/contacts.json` | 1,293 contacts in structured JSON |
| `extracted/contacts.csv` | Spreadsheet-ready CSV export |
| `extracted/ALL_NAMES_ALPHA.txt` | All names A-Z |
| `extracted/ALL_PHONES.txt` | 3,041 phone numbers |
| `extracted/ALL_EMAILS.txt` | 191 email addresses |
| `extracted/NOTABLE_PERSONS.md` | High-profile name matches |
| `extracted/CONTACTS_TABLE.md` | Full markdown table |

### Search Interface

Open `search.html` in a browser (with local server) for searchable interface.

---

## Notable Entries Found

### Maxwell Family (10 entries)
- Maxwell, Debbie
- Maxwell, H.
- Maxwell, Ian & Tara  
- Maxwell, Isabel (maxwell@commtouch.com)
- Maxwell, Kevin (kmaxwell@telemonde.com)
- Maxwell, Marcella

### Trump Family
- Trump, Ivana
- Trump, Ivanka
- Trump, Blaine & Robert

### Political/Business
- Clinton references
- Bloomberg, Mike
- Kennedy family (Ted Jr, Senator, Bobby & Mary)
- Murdoch, Rupert
- Branson, Richard
- Wexner, Les (Epstein's main financial backer)
- Soros, Peter
- Rockefeller, David
- Rothschild, Edouard & Evelyn

### Royalty
- Duke of York (Prince Andrew)
- Princess Firyal
- Prince Pavlos of Greece
- d'Arenberg, Prince

### Modeling Agencies
- Ford Models
- Baltic Models
- MC2 references

---

## Travel Pattern (CBP Records)

**Primary Route:** St. Thomas Island (USVI) ↔ Teterboro NJ (private jet)

| Location | Entries |
|----------|---------|
| St. Thomas Island | 42+ |
| Teterboro (private hangar) | 8 |
| Palm Beach | 13 |
| Paris (CDG/Orly) | 8+ |
| JFK | 10 |

---

## Evidence Inventory Highlights

From FBI Case 50D-NY-3027571:

- CD labeled "girl pics nude book 4"
- "Nude and semi nude images and videos"
- Photo album of "girl & Epstein"
- Photo albums of "girls"
- 4 framed photos of naked females
- 5 massage tables
- Austrian passport (fake ID)
- Box of shredded documents
- "Matchmaker shred reconstruction" disk
- Unifi Video NVR (surveillance system)
- $21,515 in cash envelopes

---

## How to Search

### Command Line
```bash
# Search for any name
grep -i "trump" black-book-transcribed.txt

# Get full entry for someone
grep -A10 "Wexner" black-book-transcribed.txt

# Find all emails
grep -E "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" black-book-transcribed.txt
```

### Python
```python
import json
with open("extracted/contacts.json") as f:
    contacts = json.load(f)
    
# Search
results = [c for c in contacts if "maxwell" in c['name'].lower()]
```

### Web Interface
```bash
cd epstein-docs
python3 -m http.server 8000
# Open http://localhost:8000/search.html
```

---

## Sources

All documents are from official US Government releases:

- **DOJ**: https://www.justice.gov/epstein
- **DOJ Court Records**: https://www.justice.gov/epstein/court-records
- **CBP Records**: https://www.cbp.gov
- **Internet Archive** (Black Book): https://archive.org/details/jeffrey-epstein-39s-little-black-book-unredacted
- **DocumentCloud**: https://www.documentcloud.org/documents/1508273

---

## Disclaimer

**Being listed in this contact book does NOT imply wrongdoing.** This was Epstein's personal address book containing business contacts, acquaintances, and associates. Many people listed had no knowledge of his crimes.

This archive exists for:
- Public transparency
- Journalistic research  
- Legal investigations
- Victims seeking justice

---

## License

Public domain - official government documents.

---

*Transparency serves justice. Victims deserve truth.*
