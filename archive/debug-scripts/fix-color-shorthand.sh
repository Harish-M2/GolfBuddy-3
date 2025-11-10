#!/bin/bash

# Script to convert all theme.muiTheme.palette.* to MUI shorthand in sx props

echo "🔧 Converting all pages to use MUI shorthand color syntax..."

cd /Users/harish/Documents/Projects/GolfBuddy

# For all JavaScript files in Pages directory
for file in src/Pages/*.js; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Replace common patterns:
    # sx={{ color: theme.muiTheme.palette.text.primary }} -> sx={{ color: 'text.primary' }}
    sed -i '' 's/color: theme\.muiTheme\.palette\.text\.primary/color: '\''text.primary'\''/g' "$file"
    sed -i '' 's/color: theme\.muiTheme\.palette\.text\.secondary/color: '\''text.secondary'\''/g' "$file"
    sed -i '' 's/color: theme\.muiTheme\.palette\.text\.disabled/color: '\''text.disabled'\''/g' "$file"
    
    # Background colors
    sed -i '' 's/bgcolor: theme\.muiTheme\.palette\.background\.default/bgcolor: '\''background.default'\''/g' "$file"
    sed -i '' 's/bgcolor: theme\.muiTheme\.palette\.background\.paper/bgcolor: '\''background.paper'\''/g' "$file"
    sed -i '' 's/background: theme\.muiTheme\.palette\.background\.default/background: '\''background.default'\''/g' "$file"
    sed -i '' 's/background: theme\.muiTheme\.palette\.background\.paper/background: '\''background.paper'\''/g' "$file"
    
    # Primary colors
    sed -i '' 's/color: theme\.muiTheme\.palette\.primary\.main/color: '\''primary.main'\''/g' "$file"
    sed -i '' 's/bgcolor: theme\.muiTheme\.palette\.primary\.main/bgcolor: '\''primary.main'\''/g' "$file"
    
    # Secondary colors
    sed -i '' 's/color: theme\.muiTheme\.palette\.secondary\.main/color: '\''secondary.main'\''/g' "$file"
    
    # Success/Warning/Error
    sed -i '' 's/color: theme\.muiTheme\.palette\.success\.main/color: '\''success.main'\''/g' "$file"
    sed -i '' 's/color: theme\.muiTheme\.palette\.warning\.main/color: '\''warning.main'\''/g' "$file"
    sed -i '' 's/color: theme\.muiTheme\.palette\.error\.main/color: '\''error.main'\''/g' "$file"
  fi
done

echo "✅ Conversion complete!"
echo ""
echo "Note: This converts simple color references in sx props."
echo "Complex expressions may still need manual fixing."
