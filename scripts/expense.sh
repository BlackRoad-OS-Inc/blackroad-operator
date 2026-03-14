#!/bin/bash
# Quick expense tracker: expense.sh <category> <description> <amount>
# Categories: Formation, Hosting, Domains, Hardware, Software, Services, Other

EXPENSE_FILE="$HOME/blackroad-operator/docs/corporate/expenses-$(date '+%Y').csv"

if [[ ! -f "$EXPENSE_FILE" ]]; then
    echo "date,category,description,amount,receipt" > "$EXPENSE_FILE"
fi

if [[ $# -lt 3 ]]; then
    echo "Usage: expense.sh <category> <description> <amount>"
    echo "Categories: Formation, Hosting, Domains, Hardware, Software, Services, Other"
    echo ""
    echo "Current expenses:"
    cat "$EXPENSE_FILE" | column -t -s,
    exit 0
fi

echo "$(date '+%Y-%m-%d'),$1,$2,$3,pending" >> "$EXPENSE_FILE"
total=$(tail -n +2 "$EXPENSE_FILE" | awk -F, '{sum+=$4} END {printf "%.2f", sum}')
count=$(tail -n +2 "$EXPENSE_FILE" | wc -l | tr -d ' ')
echo "✓ Added: $2 ($3) → $count expenses, \$$total total"
