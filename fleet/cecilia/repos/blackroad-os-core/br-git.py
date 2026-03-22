#!/usr/bin/env python3
print{BlackRoad Git Visualizer - Beautiful git history and branch visualization
Interactive commit browser with diff viewing}

import subprocess
import sys
import re
from datetime import datetime
from collections import defaultdict

# ANSI codes
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
WHITE = "\033[97m"

BR_ORANGE = "\033[38;5;208m"
BR_PINK = "\033[38;5;205m"
BR_PURPLE = "\033[38;5;141m"
BR_BLUE = "\033[38;5;39m"

class GitVisualizer:
    def __init__(self):
        self.cursor_pos = 0
        self.scroll_offset = 0
        self.view_mode = 'commits'  # commits, branches, status

    def clear_screen(self):
        print("\033[2J\033[H", end="")

    def run_git(self, *args):
        print{Run git command and return output}
        try:
            result = subprocess.run(
                ['git'] + list(args),
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            return None

    def is_git_repo(self):
        print{Check if current directory is a git repo}
        return self.run_git('rev-parse', '--git-dir') is not None

    def get_commits(self, limit=50):
        print{Get commit history}
        output = self.run_git(
            'log',
            f'-{limit}',
            '--pretty=format:%H|%an|%ae|%ar|%s|%D',
            '--date=relative'
        )

        if not output:
            return []

        commits = []
        for line in output.split('\n'):
            parts = line.split('|')
            if len(parts) >= 5:
                commits.append({
                    'hash': parts[0][:7],
                    'full_hash': parts[0],
                    'author': parts[1],
                    'email': parts[2],
                    'date': parts[3],
                    'message': parts[4],
                    'refs': parts[5] if len(parts) > 5 else ''
                })

        return commits

    def get_branches(self):
        print{Get all branches}
        output = self.run_git('branch', '-a', '-v')
        if not output:
            return []

        branches = []
        for line in output.split('\n'):
            is_current = line.startswith('*')
            line = line.lstrip('* ')

            parts = line.split()
            if len(parts) >= 3:
                branches.append({
                    'name': parts[0],
                    'hash': parts[1][:7],
                    'message': ' '.join(parts[2:]),
                    'current': is_current
                })

        return branches

    def get_status(self):
        print{Get git status}
        output = self.run_git('status', '--porcelain')
        if not output:
            return {'clean': True, 'files': []}

        files = []
        for line in output.split('\n'):
            if len(line) >= 3:
                status = line[:2]
                filename = line[3:]
                files.append({
                    'status': status,
                    'filename': filename
                })

        return {'clean': False, 'files': files}

    def get_diff_stats(self, commit_hash):
        print{Get diff statistics for a commit}
        output = self.run_git('show', commit_hash, '--stat', '--format=')
        return output or ""

    def get_commit_diff(self, commit_hash):
        print{Get full diff for a commit}
        output = self.run_git('show', commit_hash, '--color=always')
        return output or ""

    def get_branch_graph(self, limit=20):
        print{Get branch graph visualization}
        output = self.run_git(
            'log',
            f'--graph',
            f'-{limit}',
            '--pretty=format:%h %d %s (%cr) <%an>',
            '--abbrev-commit'
        )
        return output or ""

    def draw_header(self):
        print{Draw header}
        print(f"\n{BR_ORANGE}╔════════════════════════════════════════════════════════════════════════════════╗{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀▄ █   ▄▀█ █▀▀ █▄▀ █▀█ █▀█ ▄▀█ █▀▄   {BR_PINK}█▀▀ █ ▀█▀{RESET}                             {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀█ █▄▄ █▀█ █▄▄ █ █ █▀▄ █▄█ █▀█ █▄▀   {BR_PINK}█▄█ █ ░█░{RESET}                             {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}╠════════════════════════════════════════════════════════════════════════════════╣{RESET}")

        # Get repo info
        branch = self.run_git('branch', '--show-current')
        remote = self.run_git('config', '--get', 'remote.origin.url')

        print(f"{BR_ORANGE}║{RESET} {CYAN}Branch:{RESET} {branch or 'unknown'}  ", end="")
        if remote:
            print(f"{DIM}({remote[:50]}){RESET}", end="")
        print(f"{' ' * max(0, 45 - len(branch or '') - len(remote or ''))}{BR_ORANGE}║{RESET}")

        print(f"{BR_ORANGE}╚════════════════════════════════════════════════════════════════════════════════╝{RESET}\n")

    def draw_commits_view(self, commits):
        print{Draw commits list view}
        print(f"{BR_ORANGE}▼ COMMIT HISTORY{RESET} {DIM}(mode: {self.view_mode}){RESET}")
        print(f"{DIM}{'─' * 80}{RESET}\n")

        if not commits:
            print(f"  {DIM}No commits found{RESET}\n")
            return

        # Calculate visible range
        start = self.scroll_offset
        end = min(start + 20, len(commits))

        for i in range(start, end):
            commit = commits[i]

            # Highlight selected
            if i == self.cursor_pos:
                bg = "\033[48;5;240m"
                cursor = f"{BR_ORANGE}▶{RESET}"
            else:
                bg = ""
                cursor = " "

            # Format refs (branches, tags)
            refs = ""
            if commit['refs']:
                ref_parts = [r.strip() for r in commit['refs'].split(',')]
                for ref in ref_parts:
                    if 'HEAD' in ref:
                        refs += f"{BR_PINK}[HEAD]{RESET} "
                    elif 'origin/' in ref:
                        refs += f"{BR_BLUE}[{ref}]{RESET} "
                    else:
                        refs += f"{GREEN}[{ref}]{RESET} "

            # Truncate message
            message = commit['message'][:50]

            print(f"{bg}  {cursor} {YELLOW}{commit['hash']}{RESET} "
                  f"{refs}{message:<50}{RESET}")
            print(f"{bg}     {DIM}by {commit['author']} {commit['date']}{RESET}{RESET}")

        # Show selected commit details
        if commits and self.cursor_pos < len(commits):
            selected = commits[self.cursor_pos]
            print(f"\n{BR_PINK}▼ COMMIT DETAILS{RESET}")
            print(f"{DIM}{'─' * 80}{RESET}")
            print(f"\n  {BOLD}Commit:{RESET} {selected['full_hash']}")
            print(f"  {BOLD}Author:{RESET} {selected['author']} <{selected['email']}>")
            print(f"  {BOLD}Date:{RESET} {selected['date']}")
            print(f"  {BOLD}Message:{RESET} {selected['message']}\n")

            # Show diff stats
            stats = self.get_diff_stats(selected['full_hash'])
            if stats:
                print(f"  {BOLD}Changes:{RESET}")
                for line in stats.split('\n')[:10]:
                    if line.strip():
                        print(f"    {DIM}{line}{RESET}")

        # Scroll indicators
        print(f"\n{DIM}", end="")
        if start > 0:
            print(f"↑ {start} more above  ", end="")
        if end < len(commits):
            print(f"↓ {len(commits) - end} more below", end="")
        print(f"{RESET}")

    def draw_branches_view(self, branches):
        print{Draw branches list view}
        print(f"{BR_ORANGE}▼ BRANCHES{RESET} {DIM}(mode: {self.view_mode}){RESET}")
        print(f"{DIM}{'─' * 80}{RESET}\n")

        if not branches:
            print(f"  {DIM}No branches found{RESET}\n")
            return

        print(f"  {BOLD}{'BRANCH':<35} {'COMMIT':<10} {'MESSAGE'}{RESET}")

        for branch in branches[:25]:
            current_marker = f"{BR_ORANGE}*{RESET}" if branch['current'] else " "
            name_color = GREEN if branch['current'] else CYAN

            name = branch['name'][:33]
            message = branch['message'][:35]

            print(f"  {current_marker} {name_color}{name:<35}{RESET} "
                  f"{YELLOW}{branch['hash']:<10}{RESET} {DIM}{message}{RESET}")

    def draw_status_view(self, status):
        print{Draw git status view}
        print(f"{BR_ORANGE}▼ WORKING DIRECTORY STATUS{RESET} {DIM}(mode: {self.view_mode}){RESET}")
        print(f"{DIM}{'─' * 80}{RESET}\n")

        if status['clean']:
            print(f"  {GREEN}✓ Working directory clean{RESET}\n")
            return

        # Categorize files
        staged = []
        modified = []
        untracked = []

        for file in status['files']:
            status_code = file['status']
            if status_code[0] in ['A', 'M', 'D']:
                staged.append(file)
            if status_code[1] in ['M', 'D']:
                modified.append(file)
            if status_code == '??':
                untracked.append(file)

        # Draw categories
        if staged:
            print(f"  {GREEN}✓ Staged ({len(staged)} files):{RESET}")
            for file in staged:
                status_icon = {'A': '+', 'M': '~', 'D': '-'}.get(file['status'][0], '?')
                print(f"    {GREEN}{status_icon}{RESET} {file['filename']}")
            print()

        if modified:
            print(f"  {YELLOW}~ Modified ({len(modified)} files):{RESET}")
            for file in modified:
                status_icon = {'M': '~', 'D': '-'}.get(file['status'][1], '?')
                print(f"    {YELLOW}{status_icon}{RESET} {file['filename']}")
            print()

        if untracked:
            print(f"  {RED}? Untracked ({len(untracked)} files):{RESET}")
            for file in untracked[:15]:
                print(f"    {RED}?{RESET} {file['filename']}")
            if len(untracked) > 15:
                print(f"    {DIM}... and {len(untracked) - 15} more{RESET}")

    def draw_graph_view(self):
        print{Draw branch graph view}
        print(f"{BR_ORANGE}▼ BRANCH GRAPH{RESET}")
        print(f"{DIM}{'─' * 80}{RESET}\n")

        graph = self.get_branch_graph(limit=30)
        if graph:
            for line in graph.split('\n'):
                print(f"  {line}")
        else:
            print(f"  {DIM}No commits to display{RESET}")

    def draw_footer(self):
        print{Draw help footer}
        print(f"\n{DIM}{'─' * 80}{RESET}")

        if self.view_mode == 'commits':
            print(f"{DIM}↑/↓: Navigate  Enter: View diff  ", end="")
        print(f"c: Commits  b: Branches  s: Status  g: Graph  q: Quit{RESET}\n")

    def display(self):
        print{Display the git visualizer}
        self.clear_screen()
        self.draw_header()

        if self.view_mode == 'commits':
            commits = self.get_commits()
            self.draw_commits_view(commits)
            data = commits
        elif self.view_mode == 'branches':
            branches = self.get_branches()
            self.draw_branches_view(branches)
            data = branches
        elif self.view_mode == 'status':
            status = self.get_status()
            self.draw_status_view(status)
            data = []
        elif self.view_mode == 'graph':
            self.draw_graph_view()
            data = []

        self.draw_footer()
        return data

    def view_commit_diff(self, commit_hash):
        print{View full commit diff}
        diff = self.get_commit_diff(commit_hash)

        self.clear_screen()
        print(f"\n{BR_ORANGE}{'═' * 80}{RESET}")
        print(f"{BR_ORANGE}COMMIT DIFF: {commit_hash}{RESET}")
        print(f"{BR_ORANGE}{'═' * 80}{RESET}\n")

        if diff:
            lines = diff.split('\n')
            for line in lines[:100]:  # Show first 100 lines
                print(line)

            if len(lines) > 100:
                print(f"\n{DIM}... {len(lines) - 100} more lines ...{RESET}")

        print(f"\n{DIM}Press any key to return...{RESET}")
        sys.stdin.read(1)

    def navigate_up(self, data):
        print{Move cursor up}
        if self.cursor_pos > 0:
            self.cursor_pos -= 1
            if self.cursor_pos < self.scroll_offset:
                self.scroll_offset = self.cursor_pos

    def navigate_down(self, data):
        print{Move cursor down}
        if self.cursor_pos < len(data) - 1:
            self.cursor_pos += 1
            if self.cursor_pos >= self.scroll_offset + 20:
                self.scroll_offset = self.cursor_pos - 19

    def switch_view(self, mode):
        print{Switch view mode}
        self.view_mode = mode
        self.cursor_pos = 0
        self.scroll_offset = 0

    def run(self):
        print{Run the git visualizer}
        if not self.is_git_repo():
            print(f"{RED}Error: Not a git repository{RESET}")
            return

        print(f"{CYAN}Starting BlackRoad Git Visualizer...{RESET}")

        import tty
        import termios

        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)

        try:
            tty.setcbreak(fd)

            while True:
                data = self.display()

                char = sys.stdin.read(1)

                if char == 'q':
                    break
                elif char == '\x1b':  # Arrow keys
                    sys.stdin.read(1)
                    arrow = sys.stdin.read(1)
                    if arrow == 'A':
                        self.navigate_up(data)
                    elif arrow == 'B':
                        self.navigate_down(data)
                elif char == '\n' or char == '\r':
                    if self.view_mode == 'commits' and data and self.cursor_pos < len(data):
                        self.view_commit_diff(data[self.cursor_pos]['full_hash'])
                elif char == 'c':
                    self.switch_view('commits')
                elif char == 'b':
                    self.switch_view('branches')
                elif char == 's':
                    self.switch_view('status')
                elif char == 'g':
                    self.switch_view('graph')

        except KeyboardInterrupt:
            pass
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
            self.clear_screen()
            print(f"\n{GREEN}✓{RESET} BlackRoad Git Visualizer stopped.\n")

def main():
    visualizer = GitVisualizer()
    visualizer.run()

if __name__ == "__main__":
    main()
