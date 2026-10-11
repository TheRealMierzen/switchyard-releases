# Switchyard

A control panel for terminal coding agents. Start, watch, steer, stop and resume **Claude Code** and
**Codex** sessions across all your projects, each in a real terminal, with a status signal on every
session. Wayfinder maps are first-class: browse them, chart new ones and work their tickets, one at a
time or all at once.

This repository holds Switchyard's releases; it has no source code.

## Install

Download a package from the
[latest release](https://github.com/TheRealMierzen/switchyard-releases/releases/latest).

**Linux (x86_64).** Install the `.deb` or `.rpm`:

```bash
sudo apt install ./Switchyard_*_amd64.deb      # Debian, Ubuntu, Mint, Pop!_OS
sudo dnf install ./Switchyard-*.x86_64.rpm      # Fedora, RHEL
```

Both put `switchyard-app` and the `switchyard` daemon in `/usr/bin` and add Switchyard to your
app launcher.

**macOS (Apple Silicon).** Open the `.dmg` and drag Switchyard to Applications. It isn't
notarized, so the first launch is blocked: open **System Settings → Privacy & Security** and
choose **Open Anyway**, or clear the download flag with
`xattr -dr com.apple.quarantine /Applications/Switchyard.app`. Run it from Applications rather
than from the disk image, since the agents' hooks call the daemon at the path it ran from.

**Windows (x64).** Run the `-setup.exe`. It installs for your user only, so it needs no admin
rights. It isn't code-signed, so SmartScreen warns on first run: choose **More info → Run
anyway**. Claude Code on Windows needs [Git for Windows](https://git-scm.com/download/win), and
Switchyard needs `git` for its worktrees anyway. With Codex hooks installed, Codex started outside
Switchyard may warn that it can't find `switchyard`, since Switchyard isn't on your `PATH`; the
hook does nothing there in any case.

You also need:

- [Claude Code](https://docs.claude.com/en/docs/claude-code) and/or
  [Codex](https://github.com/openai/codex) on your `PATH`: Switchyard runs them, it doesn't
  bundle them
- the wayfinder skill installed in those agents, for wayfinder maps
- `gh`, signed in with `gh auth login`, for anything from GitHub: wayfinder maps and issues kept
  there, the pull requests view, and the PR badges and landed check on checkouts. Without it those
  just show nothing from GitHub

## Updates

From 0.1.31 on, Switchyard updates itself. When a new release is out, the sidebar offers
**Update to …**: Switchyard downloads it, checks its signature, installs it (on Linux your system
asks for your password) and restarts. Your sessions keep running, since the daemon stays on its old
build; it moves to the new one by itself once they have all ended, or when you choose **Restart
daemon to finish updating**.
