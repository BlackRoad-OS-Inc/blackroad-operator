# BlackRoad OS Repository Quick Reference

**Created**: 2026-02-13  
**Total Repos**: 9

## Quick Links

### Core (4)
- [BlackRoad-Public](https://github.com/BlackRoad-OS/BlackRoad-Public) - ✅ Public brand materials
- [BlackRoad-Private](https://github.com/BlackRoad-OS/BlackRoad-Private) - 🔒 Proprietary core IP
- [BlackRoad-Internal](https://github.com/BlackRoad-OS/BlackRoad-Internal) - 🔒 Team tools
- [BlackRoad-Personal](https://github.com/BlackRoad-OS/BlackRoad-Personal) - 🔒 Alexa's workspace

### AI Providers (4)
- [BlackRoad-Anthropic](https://github.com/BlackRoad-OS/BlackRoad-Anthropic) - 🔒 Claude integrations
- [BlackRoad-Google](https://github.com/BlackRoad-OS/BlackRoad-Google) - 🔒 Gemini integrations
- [BlackRoad-OpenAI](https://github.com/BlackRoad-OS/BlackRoad-OpenAI) - 🔒 GPT integrations
- [BlackRoad-xAI](https://github.com/BlackRoad-OS/BlackRoad-xAI) - 🔒 Grok integrations

### Communication (1)
- [BlackRoad-Communication](https://github.com/BlackRoad-OS/BlackRoad-Communication) - 🔒 ADRs, RFCs, meetings

## Local Paths

```bash
~/BlackRoad-Public/
~/BlackRoad-Private/
~/BlackRoad-Internal/
~/BlackRoad-Personal/
~/BlackRoad-Anthropic/
~/BlackRoad-Google/
~/BlackRoad-OpenAI/
~/BlackRoad-xAI/
~/BlackRoad-Communication/
```

## Clone All

```bash
cd ~
gh repo clone BlackRoad-OS/BlackRoad-Public
gh repo clone BlackRoad-OS/BlackRoad-Private
gh repo clone BlackRoad-OS/BlackRoad-Internal
gh repo clone BlackRoad-OS/BlackRoad-Personal
gh repo clone BlackRoad-OS/BlackRoad-Anthropic
gh repo clone BlackRoad-OS/BlackRoad-Google
gh repo clone BlackRoad-OS/BlackRoad-OpenAI
gh repo clone BlackRoad-OS/BlackRoad-xAI
gh repo clone BlackRoad-OS/BlackRoad-Communication
```

## Setup AI Provider Integration

```bash
# Example: Anthropic
cd ~/BlackRoad-Anthropic
cp .env.example .env
# Edit .env with your API keys
# NEVER commit .env file
```

## Communication Workflow

```bash
# Create an ADR
cd ~/BlackRoad-Communication
cp templates/adr-template.md decisions/$(date +%Y%m%d)-your-decision.md

# Create an RFC
cp templates/rfc-template.md rfcs/$(date +%Y%m%d)-your-proposal.md

# Create meeting notes
cp templates/meeting-template.md meetings/$(date +%Y%m%d)-meeting-name.md
```

## Security Reminders

- ❌ NEVER commit API keys
- ❌ NEVER commit .env files
- ❌ NEVER commit credentials
- ✅ ALWAYS use .env.example as template
- ✅ ALWAYS add secrets to .gitignore

---

Full documentation: [REPO_ARCHITECTURE.md](./REPO_ARCHITECTURE.md)
