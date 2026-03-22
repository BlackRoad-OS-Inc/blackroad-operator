# 🤝 Contributing to Education Pack

Thank you for contributing to the BlackRoad OS Education Pack! This guide will help you get started.

## 🎯 What We're Looking For

- **New course content** - Teach something valuable
- **Improved templates** - Better starting points for content creators
- **Enhanced agent configs** - More sophisticated tutor behaviors
- **Better documentation** - Clearer guides and examples
- **Bug fixes** - Issues with schemas, flows, or tests

## 🚀 Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/BlackRoad-OS/blackroad-os-pack-education.git
cd blackroad-os-pack-education
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Tests
```bash
npm test
```

All tests should pass before you start making changes.

## 📝 Making Changes

### Adding a New Schema

1. Create schema file in `/schemas/`
2. Use JSON Schema Draft 7 format
3. Include clear descriptions for all properties
4. Add `$id` with format: `https://blackroad-os.dev/schemas/education/{type}.json`
5. Create example instance in `/examples/`
6. Add test case to `tests/schema-validation.test.js`
7. Run `npm run test:schemas`

### Adding a New Template

1. Create template file in `/templates/`
2. Ensure it validates against its schema
3. Include helpful comments and placeholders
4. Add test case to verify it validates
5. Document in README or relevant guide

### Adding a New Agent

1. Create agent config in `/agents/`
2. Use schema: `schemas/tutor-agent.schema.json`
3. **REQUIRED guardrails:**
   - `cannotPass: true`
   - `noPII: true`
   - `mustProvideNextSteps: true`
4. Specify allowed Packs
5. Tests automatically run for all agents
6. Run `npm run test:agents`

### Adding a New Flow

1. Create flow file in `/flows/`
2. Use schema: `schemas/flow.schema.json`
3. Define steps with clear actions
4. Specify success/failure paths
5. Add test case if introducing new state transitions
6. Run tests

### Adding Example Content

1. Create directory in `/examples/`
2. Include complete course with lessons and activities
3. Ensure all content validates
4. Add README explaining what the example demonstrates

## ✅ Testing Your Changes

### Before Committing
```bash
npm test
```

All tests must pass.

### What to Test
- Schema validation for new content
- State transitions if you changed progress logic
- Agent configurations if you added/modified agents

## 📏 Code Style

### JSON Files
- Use 2-space indentation
- Include descriptive `description` fields
- Follow ID naming patterns: `type:kebab-case-name`

### Documentation
- Use markdown format
- Include emojis matching the local legend
- Provide code examples
- Link to related docs

### Comments
- Use comments sparingly
- Mark required training flows: `// REQUIRED TRAINING FLOW – COMPLETION MUST BE AUDITABLE`
- Explain complex logic

## 🔐 Security & Safety

### Never Include:
- ❌ Real learner PII (names, emails, etc.)
- ❌ Hardcoded credentials
- ❌ Sensitive/proprietary course content without permission

### Always:
- ✅ Use learner IDs instead of PII
- ✅ Configure agent data access restrictions
- ✅ Mark compliance-critical courses properly
- ✅ Validate all inputs in schemas

## 🚫 What NOT to Change

Don't modify these without discussion:

- Core state transition logic (not-started → in-progress → completed → mastered)
- Agent guardrail requirements (cannotPass, noPII, mustProvideNextSteps)
- Schema $id URIs (breaks references)
- Test framework structure

## 📬 Submitting Changes

### Pull Request Process

1. **Create a branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

3. **Run tests:**
```bash
npm test
```

4. **Commit with clear messages:**
```bash
git commit -m "Add template for lab activities"
```

5. **Push and create PR:**
```bash
git push origin feature/your-feature-name
```

6. **PR Description should include:**
   - What you changed and why
   - How to test your changes
   - Screenshots (if applicable)
   - Related issues/discussions

### PR Checklist
- [ ] Tests pass (`npm test`)
- [ ] New schemas include examples
- [ ] Documentation updated
- [ ] No PII or secrets included
- [ ] Agent configs have proper guardrails
- [ ] Follows existing patterns and style

## 🎓 Content Guidelines

### Creating Educational Content

**Good course content:**
- ✅ Clear learning outcomes
- ✅ Logical progression
- ✅ Mix of theory and practice
- ✅ Appropriate difficulty for target level
- ✅ Constructive feedback opportunities

**Avoid:**
- ❌ Copying copyrighted material
- ❌ Ambiguous or vague outcomes
- ❌ Too much content in one lesson
- ❌ Assessments without clear rubrics

### Writing for Agents

When creating content that agents will interact with:

- Make rubrics **specific and measurable**
- Provide **clear success criteria**
- Include **example responses** where helpful
- Design activities that **agents can understand**

## 🐛 Reporting Issues

### Found a Bug?
Open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Your environment (OS, Node version)

### Have a Feature Idea?
Open an issue with:
- Use case (who needs this and why)
- Proposed solution
- Alternatives considered
- Example of how it would work

## 💡 Getting Help

- Read the docs in `/docs/`
- Check examples in `/examples/`
- Review templates in `/templates/`
- Ask questions in issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🌟 Recognition

Contributors are valued! Significant contributions will be recognized in:
- Repository contributors list
- Release notes
- Documentation credits

Thank you for making BlackRoad OS better! 💚
