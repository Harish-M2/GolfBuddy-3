#!/bin/bash

# Fix all theme.muiTheme.palette references in Page files

echo "=== Fixing theme references in all Page files ==="

FILES=(
  "src/Pages/Dashboard.js"
  "src/Pages/Chat.js"
  "src/Pages/Buddies.js"
  "src/Pages/Photos.js"
  "src/Pages/Courses.js"
  "src/Pages/Scores.js"
  "src/Pages/TeeTimes.js"
  "src/Pages/Golf.js"
  "src/Pages/Settings.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Fix: sx={{ color: theme.muiTheme.palette.text.secondary, ... }} -> color="text.secondary" sx={{ ... }}
    sed -i '' 's/sx={{ color: theme\.muiTheme\.palette\.text\.secondary, /color="text.secondary" sx={{ /g' "$file"
    
    # Fix: sx={{ color: theme.muiTheme.palette.text.primary, ... }} -> color="text.primary" sx={{ ... }}
    sed -i '' 's/sx={{ color: theme\.muiTheme\.palette\.text\.primary, /color="text.primary" sx={{ /g' "$file"
    
    # Fix standalone color in sx: color: theme.muiTheme.palette.text.secondary -> color: 'text.secondary'
    sed -i '' "s/color: theme\.muiTheme\.palette\.text\.secondary/color: 'text.secondary'/g" "$file"
    
    # Fix standalone color in sx: color: theme.muiTheme.palette.text.primary -> color: 'text.primary'
    sed -i '' "s/color: theme\.muiTheme\.palette\.text\.primary/color: 'text.primary'/g" "$file"
    
    # Fix primary.main colors
    sed -i '' "s/color: theme\.muiTheme\.palette\.primary\.main/color: 'primary.main'/g" "$file"
    
    # Fix error.main colors
    sed -i '' "s/color: theme\.muiTheme\.palette\.error\.main/color: 'error.main'/g" "$file"
    
    # Fix standalone bgcolor
    sed -i '' "s/bgcolor: theme\.muiTheme\.palette\.background\.default/bgcolor: 'background.default'/g" "$file"
    sed -i '' "s/bgcolor: theme\.muiTheme\.palette\.background\.paper/bgcolor: 'background.paper'/g" "$file"
    
    # Fix background in sx
    sed -i '' "s/background: theme\.muiTheme\.palette\.background\.default/background: 'background.default'/g" "$file"
    
    echo "  ✓ Done"
  else
    echo "  ✗ File not found: $file"
  fi
done

echo ""
echo "=== Summary ==="
echo "All files processed. Complex template literals will need manual fixing."
echo "Run the app and test dark mode!"
