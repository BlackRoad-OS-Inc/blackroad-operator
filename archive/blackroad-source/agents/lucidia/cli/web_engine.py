"""
LUCIDIA WEB ENGINE
Terminal-native HTML renderer and browser
⬥ BlackRoad OS, Inc.
"""

import urllib.request
import urllib.parse
import re
import json
from html.parser import HTMLParser


class TerminalHTMLParser(HTMLParser):
    """Convert HTML to Rich markup for terminal display"""
    
    def __init__(self):
        super().__init__()
        self.output = []
        self.links = []
        self.current_link = None
        self.in_script = False
        self.in_style = False
        self.in_pre = False
        self.list_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script': self.in_script = True
        elif tag == 'style': self.in_style = True
        elif tag == 'pre': self.in_pre = True
        elif tag == 'a' and 'href' in attrs:
            self.current_link = attrs['href']
        elif tag in ('h1', 'h2', 'h3'):
            self.output.append('\n\n[bold cyan]')
        elif tag == 'p':
            self.output.append('\n\n')
        elif tag == 'br':
            self.output.append('\n')
        elif tag == 'li':
            self.output.append('\n  • ' if self.list_depth else '\n• ')
        elif tag in ('ul', 'ol'):
            self.list_depth += 1
        elif tag in ('strong', 'b'):
            self.output.append('[bold]')
        elif tag in ('em', 'i'):
            self.output.append('[italic]')
        elif tag == 'code':
            self.output.append('[yellow]')

    def handle_endtag(self, tag):
        if tag == 'script': self.in_script = False
        elif tag == 'style': self.in_style = False
        elif tag == 'pre': self.in_pre = False
        elif tag == 'a' and self.current_link:
            idx = len(self.links)
            self.links.append(self.current_link)
            self.output.append(f'[/][dim]\\[{idx}][/]')
            self.current_link = None
        elif tag in ('h1', 'h2', 'h3'):
            self.output.append('[/]\n')
        elif tag in ('ul', 'ol'):
            self.list_depth = max(0, self.list_depth - 1)
        elif tag in ('strong', 'b', 'em', 'i', 'code'):
            self.output.append('[/]')

    def handle_data(self, data):
        if self.in_script or self.in_style:
            return
        if not self.in_pre:
            data = ' '.join(data.split())
        if data.strip():
            if self.current_link:
                self.output.append(f'[cyan underline]{data}[/]')
            else:
                self.output.append(data)

    def get_result(self):
        text = ''.join(self.output)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip(), self.links


class WebEngine:
    """Terminal web browser with history, link following, search"""
    
    USER_AGENT = 'Lucidia/0.2 (Terminal Web Engine; BlackRoad OS)'
    
    def __init__(self):
        self.history = []
        self.current_url = None
        self.current_links = []
        self.bookmarks = []

    def fetch(self, url):
        """Fetch and parse a URL"""
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        self.history.append(url)
        self.current_url = url
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': self.USER_AGENT})
            with urllib.request.urlopen(req, timeout=10) as resp:
                content_type = resp.headers.get('Content-Type', '')
                data = resp.read().decode('utf-8', errors='replace')
                
                if 'text/html' in content_type:
                    return self._parse_html(data)
                elif 'application/json' in content_type:
                    return self._format_json(data), []
                else:
                    return data[:5000], []
        except Exception as e:
            return f"[red]Error: {e}[/]", []

    def _parse_html(self, html):
        parser = TerminalHTMLParser()
        parser.feed(html)
        text, links = parser.get_result()
        self.current_links = links
        return text, links

    def _format_json(self, data):
        try:
            return json.dumps(json.loads(data), indent=2)
        except:
            return data

    def follow_link(self, idx):
        """Follow a numbered link from current page"""
        if 0 <= idx < len(self.current_links):
            link = self.current_links[idx]
            if not link.startswith('http'):
                from urllib.parse import urljoin
                link = urljoin(self.current_url, link)
            return self.fetch(link)
        return "[red]Invalid link number[/]", []

    def back(self):
        """Go back in history"""
        if len(self.history) > 1:
            self.history.pop()
            return self.fetch(self.history.pop())
        return "[dim]No history[/]", []

    def search(self, query):
        """DuckDuckGo search"""
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        return self.fetch(url)

    def bookmark(self, url=None):
        """Add current or specified URL to bookmarks"""
        url = url or self.current_url
        if url and url not in self.bookmarks:
            self.bookmarks.append(url)
        return self.bookmarks


# Test if run directly
if __name__ == "__main__":
    web = WebEngine()
    content, links = web.fetch("example.com")
    print(content)
    print(f"\n{len(links)} links found")
