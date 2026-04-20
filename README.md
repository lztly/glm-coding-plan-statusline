# GLM Coding Plan Statusline

<p align="center">
  <strong>Smart Status Bar for GLM Coding Plan</strong>
</p>

<p align="center">
  Real-time usage monitoring for GLM Coding Plan users
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@wangjs-jacky/glm-coding-plan-statusline.svg" alt="npm version">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Node.js-16+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue.svg" alt="Platform">
</p>

<p align="center">
  <a href="./README_CN.md">中文文档</a>
</p>

---

## Features

- **Real-time Quota Monitoring** - Display MCP monthly quota usage percentage
- **Token Usage Tracking** - Monthly/Daily/Session level token consumption statistics
- **Context Progress Bar** - Visualize context window usage
- **Smart Color Alerts** - Automatic color change warnings based on usage rate
- **Smart Caching** - Reduce API requests, improve response speed
- **Flexible Configuration** - Support multiple display modes
- **GSD Bridge Compatible** - Works with GSD context-monitor for low context warnings

## Requirements

- **Node.js**: Version ≥ 16.0.0
- **Claude Code**: Used with GLM Coding Plan
- **GLM Coding Plan**: Valid ANTHROPIC_AUTH_TOKEN required

## Quick Start

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx @wangjs-jacky/glm-coding-plan-statusline@latest"
  }
}
```

Save and restart Claude Code to see the status bar!

## Local Packaging and Installation

If you have modified this repository locally and want to install your own build instead of the npm registry version:

```bash
# Generate a local tarball in the current directory
npm pack

# Install the tarball globally
npm install -g ./wangjs-jacky-glm-coding-plan-statusline-1.6.0.tgz
```

After installation, you can configure Claude Code to call the installed command directly:

```json
{
  "statusLine": {
    "type": "command",
    "command": "glm-statusline"
  }
}
```

If your global npm directory requires elevated permissions, use `sudo npm install -g ...` or install with your own npm prefix.

The generated `.tgz` file is only needed for installation and can be deleted afterwards.

## Display Example

```
GLM-5 │ glm-coding-plan-statusline(main*) │ Sess:160.0K │ Day:42.8M │ Mon:979.2M
Ctx █████░░░░░ 68% │ 5h:45%(27m) 7d:12%(5d) │ MCP 28%
```

### Fields

**Line 1: Token Statistics**
| Field | Description | Color |
|-------|-------------|-------|
| **GLM-5** | Current model | Cyan bold |
| **glm-coding-plan-statusline(main\*)** | Current directory and Git branch | Default, `*` Gray |
| **Sess:160.0K** | Session tokens | Gray |
| **Day:42.8M** | Daily tokens | Default |
| **Mon:979.2M** | Monthly tokens | Blue |

**Line 2: Quota Progress Bars**
| Field | Description | Color Rules |
|-------|-------------|-------------|
| **Ctx** | Context window usage | Green(<50%) / Yellow(50-80%) / Red(>80%) |
| **5h** | 5-hour quota used and reset countdown | Green(<50%) / Yellow(50-80%) / Red(>80%) |
| **7d** | 7-day quota used and reset countdown | Green(<50%) / Yellow(50-80%) / Red(>80%) |
| **MCP** | Monthly quota used | Green(<50%) / Yellow(50-80%) / Red(>80%) |

## GSD Bridge Compatibility

This statusline is compatible with [Get Shit Done (GSD)](https://github.com/discreteprojects/get-shit-done) framework's context monitoring feature.

### How It Works

When Claude Code calls the statusline, it automatically writes context metrics to a bridge file:

```
/tmp/claude-ctx-{session_id}.json
```

This file can be read by GSD's `gsd-context-monitor` hook to inject low context warnings to the agent.

### Bridge File Format

```json
{
  "session_id": "abc123",
  "remaining_percentage": 65,
  "used_pct": 35,
  "timestamp": 1742053200
}
```

### Using with GSD

If you have GSD installed, the context-monitor hook will automatically read these metrics and warn the agent when context is running low (≤35% warning, ≤25% critical).

## Options

```bash
# Full mode (two lines, recommended)
npx @wangjs-jacky/glm-coding-plan-statusline

# Compact mode (single line)
npx @wangjs-jacky/glm-coding-plan-statusline --compact

# Local mode (no API requests, context only)
npx @wangjs-jacky/glm-coding-plan-statusline --local

# Clear cache
npx @wangjs-jacky/glm-coding-plan-statusline --clear-cache

# Show help
npx @wangjs-jacky/glm-coding-plan-statusline --help
```

## Environment Variables

Ensure these environment variables are set (usually in settings.json env field):

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-token-here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic"
  }
}
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Issues and Pull Requests are welcome!

## Contact

- **Author**: wangjs-jacky
- **GitHub**: https://github.com/wangjs-jacky/glm-coding-plan-statusline
- **Issues**: https://github.com/wangjs-jacky/glm-coding-plan-statusline/issues

---

<p align="center">
  If this project helps you, please give it a ⭐️ Star!
</p>
