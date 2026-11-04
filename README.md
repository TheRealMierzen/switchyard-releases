# Switchyard

A control panel for terminal coding agents. Start, watch, steer, stop and resume **Claude Code** and
**Codex** sessions across all your projects, each in a real terminal, with a status signal on every
session. Wayfinder maps are first-class: browse them, chart new ones, work their tickets one at a
time or all at once, and reach a map's destination once its way is clear.

This repository holds Switchyard's releases; it has no source code.

## Install

Download a package from the
[latest release](https://github.com/TheRealMierzen/switchyard-releases/releases/latest).

**Linux (x86_64).** Install the `.deb`, `.rpm` or Arch `.pkg.tar.zst`:

```bash
sudo apt install ./Switchyard_*_amd64.deb      # Debian, Ubuntu, Mint, Pop!_OS
sudo dnf install ./Switchyard-*.x86_64.rpm      # Fedora, RHEL
sudo pacman -U ./switchyard-*-x86_64.pkg.tar.zst  # Arch, Manjaro, EndeavourOS
```

Each puts `switchyard-app` and the `switchyard` daemon in `/usr/bin` and adds Switchyard to your
app launcher. If you also have a source install in `~/.local/bin`, remove it, since it comes
first on `PATH`.

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

**Updates.** When a new release is out, the sidebar offers **Update to …**: Switchyard downloads
it, checks its signature, installs it (on Linux your system asks for your password) and restarts.
Your sessions keep running, since the daemon stays on its old build; it moves to the new one by
itself once they have all ended, or when you choose **Restart daemon to finish updating**. A source
install isn't updated this way, nor is the Arch package; the sidebar links to the release instead.

**Just the daemon, on another host.** Each release also carries `switchyard` on its own for each
host it can run on, beside a `.sig` signed with the updater's key:

| Host | File |
| --- | --- |
| Linux x86_64 (static, any distro) | `switchyard-x86_64-unknown-linux-musl` |
| Linux aarch64 (static, any distro) | `switchyard-aarch64-unknown-linux-musl` |
| macOS (Apple Silicon) | `switchyard-aarch64-apple-darwin` |
| Windows (x64) | `switchyard-x86_64-pc-windows-msvc.exe` |

To install one by hand, take it from the release matching your app's version: `v<version>`, or
`v<version>-linux` for a Linux-only release, which carries the Linux ones. It installs for your
user, with no root, to `~/.local/bin/switchyard`:

```bash
v=0.1.45 file=switchyard-x86_64-unknown-linux-musl
curl -fLO "https://github.com/TheRealMierzen/switchyard-releases/releases/download/v$v/$file"
mkdir -p ~/.local/bin && install -m 755 "$file" ~/.local/bin/switchyard.new && mv ~/.local/bin/switchyard.new ~/.local/bin/switchyard
```

On Windows, in PowerShell, it goes to
`%LOCALAPPDATA%\Programs\switchyard`:

```powershell
$v = "0.1.45"; $dir = "$env:LOCALAPPDATA\Programs\switchyard"
New-Item -ItemType Directory -Force $dir | Out-Null
Invoke-WebRequest "https://github.com/TheRealMierzen/switchyard-releases/releases/download/v$v/switchyard-x86_64-pc-windows-msvc.exe" -OutFile "$dir\switchyard.new.exe"
# A running daemon keeps its copy: Windows won't write over it, but will rename it aside.
if (Test-Path "$dir\switchyard.exe") { Move-Item "$dir\switchyard.exe" "$dir\switchyard.old-$(Get-Date -UFormat %s).exe" }
Move-Item "$dir\switchyard.new.exe" "$dir\switchyard.exe"
```

Download it with `curl` on macOS too: a browser marks it as downloaded, and macOS then won't run it.
To check a download's signature with [minisign](https://jedisct1.github.io/minisign/), fetch its
`.sig` beside it and run:

```bash
minisign -V -P RWT+tC9OIVkxBQD0397VenQzk+pxUcuoeof9zTObv1bm02QrSak2h5UP -m "$file" -x <(base64 -d "$file.sig")
```

You also need:

- [Claude Code](https://docs.claude.com/en/docs/claude-code) and/or
  [Codex](https://github.com/openai/codex) on your `PATH`: Switchyard runs them, it doesn't
  bundle them
- the wayfinder skill installed in those agents, for wayfinder maps
- `gh`, signed in with `gh auth login`, for anything from GitHub: wayfinder maps and issues kept
  there, the pull requests view, and the PR badges and landed check on checkouts. Without it those
  just show nothing from GitHub; a project with a GitHub remote says what's missing

## Signals

| Lamp | State |
|---|---|
| hollow | starting (e.g. waiting on Claude's folder-trust prompt) |
| white | ready, no prompt yet |
| amber, pulsing | working |
| red | needs permission |
| blue | asked you a question |
| green | done, waiting for your next prompt |
| unlit | exited (resumable) |

A lamp with a halo changed state while you weren't looking at it.

## New sessions

**New session**, the **+** next to a project and Ctrl+N start a session straight away with the
global agent and the project's other defaults. A project or group can be pinned to Claude or Codex
when it is designed around that agent. Shift+click (Ctrl+Shift+N) opens the dialog instead, to pick a
different agent, model, effort or worktree, or to give a first prompt.
Right-click a project for quick starts with a particular agent, model or Codex thinking level.
Right-click one of its sessions, or the header of an open session, to rename, duplicate, resume,
stop, finish, dismiss or delete it, with the available actions following the session's current state.
**Copy Session Reference** copies a Codex thread link (`codex://threads/<session-id>`) or a Claude
conversation UUID. It becomes available once the provider's session ID is known.

If that agent has no five-hour or weekly usage left, Switchyard offers to start the new session with
the other agent when its usage is current and available. It uses that agent's model default; existing
conversations still resume with the agent that owns them.

The usage controls can set separate **Suggest switching**, **Wrap up**, and **Stop** percentages for
the five-hour and weekly windows. Once the global agent reaches a switch line, new sessions offer the
other installed, active agent as a temporary override. Explicit agent choices and projects pinned to
an agent are left alone.

New sessions quick-start by default. You can always show their options dialog globally, then let a
project, group or This PC inherit that choice or override it.

New worktrees go on `switchyard/<id>` branches unless you name one. Where branches follow a
convention, untick **Switchyard may name new worktrees' branches** in the project's settings: each
new worktree then asks for its branch. In a project whose issues are on a tracker that names a
branch for each issue (Shortcut or Linear, set under **Issues from**), answer with an issue (`sc-123`,
`ENG-42` or its link) to work on that issue's branch, or with a branch name.

A session only goes on an issue's branch unasked when you gave that issue, as the branch or the
answer to the branch question. A branch you give is always used. An issue that the prompt, the map
or the issue merely mentions is asked about first, since it may be a related ticket rather than the
one being worked; once one session on a map works the map's issue, the rest of that map follows it.
A chart's description is never read for an issue: charting a map has its own **Branch** field, right
under the idea, for the issue or branch it works on.

Each project reads its issues from **Issues from** and charts its maps where **Maps go to** says:
GitHub (through `gh`), GitLab, Shortcut, Linear or Jira, or local `.scratch` files only. Issues can
come from several trackers at once (Shortcut and GitHub, say), listed side by side; a new issue then
picks which tracker it's filed on, each time. Left unset, issues follow the remote and maps follow
the first tracker issues come from. Agents reach any tracker but GitHub through Switchyard's own
tracker tools, so they never hold its token.

Working a map ticket or an issue starts like any other new session: the same agent, model, effort and
worktree defaults, the same dialog policy, and Shift+click for the dialog. **Work all** always starts
straight away, since one dialog can't set up several sessions.

**This PC**, at the top of the sidebar, is for sessions that aren't about any one project: they
run in your home folder, so the agent can work anywhere on the machine. Its default agent and
model are in Settings, under Sessions. It has no worktrees or maps.

A session that is closed before it ever got a prompt is forgotten, as if it had never been
started. One that exits with an error stays, so you can read it, and so does one with a worktree.
Middle-click a session in the sidebar to put it away: a stopped one is dismissed, a running one
that never got a prompt is closed. A running session with work in it needs Stop or Finished.

To tidy up several at once, right-click a project, group or This PC to dismiss all its exited
sessions, stop all its idle (green) ones, or finish them all. Right-click a map's or issue group's
row in the sidebar, or use the buttons beside **Work all** on its card, to stop or finish every
session working it, and right-click a session in a split to stop the whole split. Shift+click
selects a range of sessions in the sidebar; right-click one of them to act on the selection, and
Escape clears it. The single actions' rules hold: a session that never got a prompt is forgotten,
and running sessions, or worktrees holding uncommitted changes, are listed in one question first.

## Groups

A group is a set of projects, from any workspace, that one agent works on together: a frontend and
its backend, say, kept in their own folders. Make one in Settings with **New
group**, and pick its projects. Its sessions run in the first project's folder and can read and change
the others too, and each project's `CLAUDE.md` is loaded. **Run here** picks which project they start
in. Groups sit under their own heading in the sidebar; like This PC, they have no worktrees or maps.

## Split view

A split puts two to four sessions, from any workspace or project, side by side. You can keep as
many splits as you like, and each session belongs to one at most. Ctrl+click a session (⌘+click
on macOS) to add it next to the one you're looking at, use **Split** in the session bar, or drag
it from the sidebar onto a pane: the pane's outer thirds open it beside that pane, the middle puts
it in that pane's place. Drag a pane's header the same way to move or swap it. A full split
refuses another session rather than pushing one out. **Split** also offers a new session in each
project on screen, which joins the split.

A plain click never changes a split. Clicking a session that's in one brings that split back as
you left it, with that session focused; clicking any other session shows it on its own. Sessions
in a split carry a small icon in the sidebar showing the split's shape with their own pane lit.

Each project has its own colour, shown next to its name in the sidebar and down the edge of its
panes, so panes from one project match. Drag the dividers between panes to resize them; double-click one to even them out again.
Each split keeps its own sizes, and splits are remembered across restarts.
Ctrl+Shift+Left/Right moves between panes, Ctrl+Shift+PageUp/PageDown moves between splits, and
Ctrl+Shift+Up/Down steps through the sidebar. The × on a pane, or a middle-click on its header,
takes it out of the split without stopping the session.

Ctrl+K (⌘K on macOS) opens the switcher: type a few letters of a session's title, project,
workspace or branch, or of a project, group or map, and press Enter to go there as a plain click
would. Ctrl+Enter adds a session to the split instead. Sessions that need you come first while
nothing is typed. Once you type, it also offers a new session in a project, resuming a stopped
session and working a map's next ticket; Shift+Enter opens the new-session dialog for those first.

## Reviewing changes

A session's bar and each checkout on the project page show how much its work changes, as
`+120 −34, 6 files`: everything since its branch left the default branch (on the default branch
itself, since its upstream), uncommitted files included. Click it to review the changes before
pushing: what was committed and what wasn't, each in its own list, with the diff of the file you
pick. From there you can commit everything or only the files you tick, with a message you type or
one **Draft** writes from the change, the session's task and the repo's recent commits (Claude's
cheapest model, out of band, and still yours to edit). You can also discard one file's uncommitted
changes, push (a branch that tracks nothing yet is published on origin under its own name) and open
a pull request into the default branch, titled from its commits. Committing and discarding wait
while an agent is at work in the checkout.

Click a line number to comment on that line, or drag over line numbers (or Shift+click another)
to comment on several. The comments go to the session as one prompt, each naming its file and
lines, so the agent can act on them. Reviewing from a stopped session is read
only.

## Codex status

Claude sessions get their hooks per launch via `--settings`, so nothing in your Claude config changes.
Before every Codex start or resume, Switchyard asks Codex whether its status hooks are installed,
enabled and trusted for that folder, then tests delivery to the daemon. If setup is needed, a
dialog keeps your prompt and options while you install and approve the Switchyard command.
You can also open **Settings → Tools → Codex status reporting → Set up status reporting**.
Other hook approvals are preserved. New Codex sessions connect their status after the first prompt;
the terminal explains this and offers **Check status** if updates do not arrive.

## Wayfinder

Quiet sessions run the plain wayfinder skill with Switchyard's own rules on top, given to the agent
as instructions at launch: it drafts answers to the obvious questions and asks the real ones, and you
approve both at one gate before anything reaches the tracker. Nothing extra needs installing.

**Work all** on a map starts a session on every takeable ticket and opens them side by side, in as
few splits of up to four as hold them. Once every ticket on a map is closed and nothing is left in its
fog, the map shows its way as clear and offers **Reach destination**: a session that produces what the
map was finding its way to (a spec, a decision, a change), as its Destination and Notes describe it, and
then closes the map. Maps are remembered as last read, so the dashboard and a project's page show them
straight away and refresh from the tracker behind them.
