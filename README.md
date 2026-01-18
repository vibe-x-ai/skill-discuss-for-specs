# Skill Discuss for Specs

> Whenever you have an idea and want to make it clearer and more actionable, use this project.

An AI-powered discussion facilitation system that helps generate high-quality specifications through structured, deep conversations.

![Discussion Mode](./assets/banner.jpg)

---

## 💡 The Problem

In **Spec Driven Development (SDD)**, generating high-quality specifications is a well-known bottleneck:

- **Good Specs are powerful**: Complete, rich specifications dramatically improve code generation quality, task completion rates, and enable solving higher complexity problems
- **But creating them is hard**: Generating comprehensive, well-thought-out Specs efficiently remains difficult and cognitively demanding
- **The missing piece**: How do we produce high-quality Specs without overwhelming cognitive load?

---

## 🎯 The Solution: Discussion Mode

This project introduces **Discussion Mode** - an AI-facilitated conversation approach that helps you iteratively develop clear, actionable specifications. It solves three critical problems:

### 1. Agent-Driven Proactivity

The AI Agent actively drives the discussion forward:

- **Agent proposes**: Continuously provides solutions, alternatives, and ideas
- **Human decides**: You only need to select, confirm, or answer questions
- **Guided refinement**: Through this guided process, you naturally deepen and perfect technical solutions
- **Reduced cognitive load**: You stay in the decision-maker role while the Agent handles the mental heavy lifting

### 2. State Management & Progress Tracking

Never lose track in deep discussions:

- **Maintains context**: Continuously tracks discussion state through structured outlines
- **Decision precipitation**: Automatically captures and documents confirmed decisions
- **Progress awareness**: Always knows where you are and what questions remain
- **No details lost**: Deep, long-running discussions stay organized without effort
- **Low-cost depth**: Engage in thorough exploration without worrying about losing the thread

### 3. Progressive Enhancement

Flexible and adaptive to your workflow:

- **Start anytime**: Before Spec generation, during development, while debugging, or when analyzing problems
- **Controllable depth**: Exit and precipitate decisions whenever ready, or continue discussing until every detail is 100% confirmed
- **Always relevant**: Effective whether you have a vague idea or a concrete challenge

---

## 👀 See the Difference

### Conversation Flow

**Without Discussion Mode** - You drive everything:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  You ──────►  "I need to design a caching system. I'm thinking about       │
│               using Redis, but I'm not sure about the TTL strategy.         │
│               Should I use lazy expiration or active expiration?            │
│               Also, what about cache invalidation patterns? And             │
│               I need to consider the read/write ratio..."                   │
│                                                                             │
│               (You must think of all questions yourself)                    │
│               (You must structure your own thoughts)                        │
│               (You must drive the conversation)                             │
│                         │                                                   │
│                         ▼                                                   │
│  Agent ────►  [Responds to what you asked]                                  │
│                         │                                                   │
│                         ▼                                                   │
│  You ──────►  "OK, but what about... wait, I forgot to ask about..."       │
│                                                                             │
│               (You need to remember everything)                             │
│               (You need to discover all edge cases)                         │
│               (You might miss important aspects)                            │
│                         │                                                   │
│                         ▼                                                   │
│                       .....                                                 │
│                                                                             │
│  😓 HIGH cognitive load: You think, you ask, you track, you remember       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**With Discussion Mode** - Agent drives, you decide:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  You ──────►  "Design a caching system"  (That's it. Just the topic.)      │
│                         │                                                   │
│                         ▼                                                   │
│  Agent ────►  "Let me understand the problem space first.                   │
│                                                                             │
│               💡 What's the primary driver for caching?                     │
│                  - Performance optimization?                                │
│                  - Cost reduction?                                          │
│                  - Reliability improvement?                                 │
│                                                                             │
│               💡 I notice we should clarify the read/write ratio early -   │
│                  this fundamentally affects architecture choices.           │
│                                                                             │
│               ❓ Is this more read-heavy or write-heavy?"                   │
│                         │                                                   │
│                         ▼                                                   │
│  You ──────►  "Read-heavy, for API responses"  (Simple answer)             │
│                         │                                                   │
│                         ▼                                                   │
│  Agent ────►  "Good. For read-heavy API caching, there's something you     │
│               might not have considered:                                    │
│                                                                             │
│               💡 Cache-aside vs Read-through patterns have very different  │
│                  invalidation complexity. Let me explain the tradeoffs...  │
│                                                                             │
│               ┌────────────── Progress Tracked ──────────────┐             │
│               │ ✅ Confirmed: Read-heavy API caching         │             │
│               │ 🔄 Discussing: Caching pattern selection     │             │
│               │ 📋 Pending: TTL strategy, Invalidation       │             │
│               └──────────────────────────────────────────────┘"            │
│                         │                                                   │
│                         ▼                                                   │
│  You ──────►  "The first one"  (Simple choice)                             │
│                         │                                                   │
│                         ▼                                                   │
│                       .....                                                 │
│                                                                             │
│  😊 LOW cognitive load: Agent thinks, Agent asks, Agent tracks, You decide │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output Comparison

```
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│         WITHOUT DISCUSSION          │     │          WITH DISCUSSION            │
├─────────────────────────────────────┤     ├─────────────────────────────────────┤
│                                     │     │                                     │
│   📜 Just chat history              │     │   📁 discuss/caching-system/        │
│      (scroll up to find things)     │     │      │                              │
│                                     │     │      ├── 📋 outline.md              │
│   • Decision 1... somewhere         │     │      │   (live progress, all Qs)    │
│   • Decision 2... maybe forgot      │     │      │                              │
│   • Decision 3... which round?      │     │      ├── 📊 meta.yaml               │
│   • Did we cover everything?        │     │      │   (round count, sync status) │
│   • What's still pending?           │     │      │                              │
│                                     │     │      └── 📄 decisions/              │
│   ❌ No structure                   │     │          ├── 01-cache-pattern.md    │
│   ❌ Easy to lose track             │     │          ├── 02-storage-choice.md   │
│   ❌ Hard to resume later           │     │          └── 03-ttl-strategy.md     │
│                                     │     │                                     │
│                                     │     │   ✅ Structured & searchable        │
│                                     │     │   ✅ Nothing lost                   │
│                                     │     │   ✅ Resume anytime                 │
│                                     │     │                                     │
└─────────────────────────────────────┘     └─────────────────────────────────────┘
```

---

## 🔧 Use Cases

Use Discussion Mode whenever you need to clarify and refine ideas:

| Scenario | How It Helps |
|----------|--------------|
| **Technical Solution Design** | Explore architectures, evaluate tradeoffs, reach clear decisions |
| **Problem Diagnosis** | Systematically analyze issues, track hypotheses, document findings |
| **Technology Selection** | Compare options, assess fit, make informed choices |
| **Product Design** | Refine requirements, explore user flows, document decisions |
| **Spec Generation** | Transform rough ideas into comprehensive, actionable specifications |

---

## ✨ Technical Features

- **2-Skill Architecture**: Clean separation between coordination (`disc-coordinator`) and output (`disc-output`)
- **Intelligent Precipitation**: Automatic detection of unprecipitated decisions with configurable reminders
- **Hook-Based Automation**: Process work (round counting, state checking) handled by Python scripts, not AI
- **Multi-Platform Support**: Claude Code (ready), Cursor & VS Code (planned)
- **Structured Tracking**: Problem lifecycle management, trend analysis, and convergence detection
- **Cross-Platform Design**: Shared Skill content with platform-specific adaptations

---

## 🚀 Quick Start

### Installation (Claude Code)

```bash
# Clone the repository
git clone https://github.com/yourusername/skill-discuss-for-specs.git
cd skill-discuss-for-specs

# Install for Claude Code
./platforms/claude-code/install.sh
```

### Installation (Cursor) - Coming Soon

```bash
./platforms/cursor/install.sh
```

### Start a Discussion

Once installed, simply tell your AI:

> "Enter discussion mode. I want to design [your topic]."

The Agent will guide you through a structured conversation, tracking decisions and progress automatically.

---

## 📁 Project Structure

```
skill-discuss-for-specs/
├── skills/              # 📝 Skill instructions (Markdown for AI)
│   ├── disc-coordinator/    # Discussion coordination & tracking
│   └── disc-output/         # Outline rendering & documentation
├── hooks/               # ⚡ Automation scripts (Python)
│   ├── post-response/       # Round counting, stale detection
│   └── common/              # Shared utilities
├── platforms/           # 🔌 Platform adaptations
│   ├── claude-code/         # Claude Code integration
│   └── cursor/              # Cursor integration (planned)
├── config/              # ⚙️ Configuration templates
├── templates/           # 📄 Document templates
└── discuss/             # 💬 Discussion archives (examples)
```

---

## 🏗️ Architecture

### Skills (Markdown Instructions for AI)

- **disc-coordinator**: Facilitates discussion flow, tracks problems and trends, recognizes consensus
- **disc-output**: Renders outlines, manages files, generates decision documents

### Hooks (Python Scripts)

- **post-response**: Triggered after each AI response
  - `check_stale.py`: Detects decisions awaiting documentation
  - `update_round.py`: Maintains round counter
- **common**: Shared utilities for meta.yaml parsing and file operations

### Design Principle

> **Intelligence work for Agent, process work for Hook**

The AI focuses on understanding, analyzing, and guiding discussion. Mechanical tasks (counting, checking, reminding) are automated by scripts.

---

## 📚 Documentation

- [Architecture Design Discussion](discuss/2026-01-17/skill-discuss-architecture-design/outline.md) - Real example of Discussion Mode in action
- [Decision Records](discuss/2026-01-17/skill-discuss-architecture-design/decisions/) - Documented architectural decisions
- [AGENTS.md](AGENTS.md) - Guidelines for AI agents working with this system

---

## 🔧 Configuration

Global configuration is automatically initialized on first run:

```yaml
# ~/.claude/skills/disc-config.yaml (Claude Code)
stale_detection:
  enabled: true
  max_stale_rounds: 3      # Rounds before reminder
  
hooks:
  post_response: true
  auto_init_config: true
```

Customize thresholds and behavior to match your workflow.

---

## 🛠️ Development

### Prerequisites

- Python 3.8+
- pip

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest tests/

# Build for all platforms
./scripts/build.sh
```

---

## 🤝 Contributing

Contributions are welcome! This is V1 - foundation. We're iterating based on real-world usage.

---

## 📄 License

[MIT License](LICENSE)

---

## 🙏 Acknowledgments

Built on insights from the Claude Skills ecosystem, Spec Driven Development practices, and cross-platform IDE extension architectures.

---

**Version**: 1.0.0  
**Status**: V1 - Foundation  
**Philosophy**: Transform rough ideas into actionable specifications through AI-guided structured discussion.
