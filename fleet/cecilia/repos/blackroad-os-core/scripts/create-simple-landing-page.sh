#!/bin/bash

# Create a simple landing page for projects without web UI
# This creates a minimal HTML page that can be deployed to Cloudflare Pages

set -e

if [ $# -lt 3 ]; then
  echo "Usage: $0 <project-name> <title> <description>"
  echo ""
  echo "Example:"
  echo "  $0 lucidia-math 'Lucidia Math' 'Advanced mathematical engines for consciousness modeling'"
  exit 1
fi

PROJECT_NAME=$1
TITLE=$2
DESCRIPTION=$3

OUTPUT_DIR="landing-pages/$PROJECT_NAME"

echo "🎨 Creating landing page for $PROJECT_NAME"
echo "=============================================="
echo ""

# Create directory structure
mkdir -p "$OUTPUT_DIR"

# Create index.html
cat > "$OUTPUT_DIR/index.html" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$TITLE - BlackRoad OS</title>
    <meta name="description" content="$DESCRIPTION">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .logo {
            font-size: 60px;
            margin-bottom: 20px;
        }

        h1 {
            font-size: 36px;
            color: #1a202c;
            margin-bottom: 16px;
            font-weight: 700;
        }

        p {
            font-size: 18px;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
        }

        .links {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .link {
            display: inline-block;
            padding: 12px 24px;
            background: #4a5568;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s, background 0.2s;
        }

        .link:hover {
            transform: translateY(-2px);
            background: #2d3748;
        }

        .link.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .link.primary:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🌌</div>
        <div class="badge">BlackRoad OS</div>
        <h1>$TITLE</h1>
        <p>$DESCRIPTION</p>

        <div class="links">
            <a href="https://blackroad.io" class="link primary">Back to Home</a>
            <a href="https://docs.blackroad.io" class="link">Documentation</a>
            <a href="https://github.com/BlackRoad-OS/$PROJECT_NAME" class="link">GitHub</a>
        </div>

        <div class="footer">
            Powered by BlackRoad OS • Deployed on Cloudflare Pages
        </div>
    </div>
</body>
</html>
EOF

# Create wrangler.toml for deployment
cat > "$OUTPUT_DIR/wrangler.toml" <<EOF
name = "$PROJECT_NAME"
compatibility_date = "2025-12-13"
pages_build_output_dir = "."

[build]
command = "echo 'No build needed for static HTML'"
EOF

# Create .gitignore
cat > "$OUTPUT_DIR/.gitignore" <<EOF
node_modules
.wrangler
dist
.env
EOF

# Create README.md
cat > "$OUTPUT_DIR/README.md" <<EOF
# $TITLE

$DESCRIPTION

## Deployment

This is a simple landing page deployed to Cloudflare Pages.

### Deploy manually

\`\`\`bash
wrangler pages deploy . --project-name=$PROJECT_NAME
\`\`\`

### Auto-deploy with GitHub Actions

See \`.github/workflows/deploy.yml\` for automated deployment setup.

## Development

This is a static HTML page, no build process needed. Just edit \`index.html\` and deploy.

## Links

- **Main Site:** https://blackroad.io
- **Documentation:** https://docs.blackroad.io
- **GitHub:** https://github.com/BlackRoad-OS/$PROJECT_NAME
EOF

echo "✅ Landing page created at: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Customize the HTML in $OUTPUT_DIR/index.html"
echo "2. Deploy to Cloudflare Pages:"
echo "   cd $OUTPUT_DIR && wrangler pages deploy . --project-name=$PROJECT_NAME"
echo ""
echo "Or create a new GitHub repo and push:"
echo "   cd $OUTPUT_DIR"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial landing page'"
echo "   gh repo create BlackRoad-OS/$PROJECT_NAME --private --source=. --push"
echo ""
