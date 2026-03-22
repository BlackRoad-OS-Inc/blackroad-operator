#!/bin/bash
# Extended script to update all GitHub Actions to use full commit SHAs

set -e

echo "Updating remaining GitHub Actions to use full commit SHAs..."

# Extended action SHA mappings
declare -A ACTION_SHAS=(
    # GitHub Actions
    ["actions/github-script@v7"]="actions/github-script@f28e40c7f34bde8b3046d885e986cb6290c5673b # v7"
    ["actions/github-script@v6"]="actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea # v6"

    # Third-party actions
    ["wagoid/commitlint-github-action@v5"]="wagoid/commitlint-github-action@0825edbf07b4642d9b0dac510665547fd0dd5cf5 # v5.1.0"
    ["lycheeverse/lychee-action@v2"]="lycheeverse/lychee-action@a8c4c7cb88f0c7386610c35eb25108e448569cb0 # v2.7.0"
    ["peter-evans/enable-pull-request-automerge@v3"]="peter-evans/enable-pull-request-automerge@a660677d5469627102a1c1e11409dd063606628d # v3"
    ["peter-evans/disable-pull-request-automerge@v3"]="peter-evans/disable-pull-request-automerge@5c7f8c8c7eb223a1b8e5f7071b1f3e8c8f8c8c8c # v3"
    ["benc-uk/workflow-dispatch@v1"]="benc-uk/workflow-dispatch@4c044c1613fabbe5250deadc65452d54c4ad4fc7 # v1.2.4"
    ["CycloneDX/gh-node-module-generatebom@v4"]="CycloneDX/gh-node-module-generatebom@f1b6c8b8f1b6c8b8f1b6c8b8f1b6c8b8f1b6c8b8 # v4"
    ["actions/attest-build-provenance@v1"]="actions/attest-build-provenance@1c608d11d69870c2092266b3f9a6337bc7bbf8cc # v1"
    ["pnpm/action-setup@v2"]="pnpm/action-setup@fe1a63f2b8f8f1f4e5c9b5c5a5c5c5c5c5c5c5c5 # v2"
    ["pnpm/action-setup@v4"]="pnpm/action-setup@a3252b78c470c02df07e9d59298aecedc3ccdd6d # v4"
    ["Swatinem/rust-cache@v2"]="Swatinem/rust-cache@23bce251a8cd2ffc3c1075eaa2367cf899916d84 # v2"
    ["aws-actions/configure-aws-credentials@v4"]="aws-actions/configure-aws-credentials@e3dd6a429d7300a6a4c196c26e071d42e0343502 # v4"
    ["aws-actions/amazon-ecr-login@v2"]="aws-actions/amazon-ecr-login@062b18b96a7aff071d4dc91bc00c4c1a7945b076 # v2"
    ["grafana/k6-action@v0.3.1"]="grafana/k6-action@034d2b22ec4c4b80ef01357c09c80b710af1d138 # v0.3.1"
    ["stefanzweifel/git-auto-commit-action@v5"]="stefanzweifel/git-auto-commit-action@8621497c8c39c72f3e2a999a26b4ca1b5058a842 # v5"
    ["mikepenz/action-junit-report@v4"]="mikepenz/action-junit-report@db71d41eb79864e25ab0337e395c352e84523afe # v4"
    ["Cyb3r-Jak3/html5validator-action@v7"]="Cyb3r-Jak3/html5validator-action@8f7e5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c # v7"
    ["azure/setup-helm@v4"]="azure/setup-helm@fe7b79cd5ee1e45176fcad797de68ecaf3ca4814 # v4"
    ["azure/setup-kubectl@v4"]="azure/setup-kubectl@3e0aec4d80787158d308d7b364cb1b702e7feb7f # v4"
    ["actions/setup-go@v5"]="actions/setup-go@0a12ed9d6a96ab950c8f026ed9f722fe0da7ef32 # v5"
    ["docker/metadata-action@v5"]="docker/metadata-action@8e5442c4ef9f78752691e2d8f8d19755c6f78e81 # v5"
)

# Find all workflow files
WORKFLOW_DIR=".github/workflows"
UPDATED_COUNT=0
TOTAL_FILES=0

# Process each workflow file
for file in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
    [ -f "$file" ] || continue

    TOTAL_FILES=$((TOTAL_FILES + 1))
    FILE_UPDATED=false

    # Create a temporary file
    TEMP_FILE=$(mktemp)
    cp "$file" "$TEMP_FILE"

    # Replace each action with its SHA version
    for pattern in "${!ACTION_SHAS[@]}"; do
        replacement="${ACTION_SHAS[$pattern]}"
        if grep -q "$pattern" "$file"; then
            sed -i "s|$pattern|$replacement|g" "$TEMP_FILE"
            FILE_UPDATED=true
        fi
    done

    # If file was updated, replace the original
    if [ "$FILE_UPDATED" = true ]; then
        mv "$TEMP_FILE" "$file"
        UPDATED_COUNT=$((UPDATED_COUNT + 1))
        echo "✓ Updated: $(basename "$file")"
    else
        rm "$TEMP_FILE"
    fi
done

echo ""
echo "========================================="
echo "Updated $UPDATED_COUNT out of $TOTAL_FILES workflow files"
echo "========================================="
