#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Theme reference mappings
const themeReplacements = {
  // Gradients - convert to dynamic based on theme mode
  'theme.gradients.background': `theme.muiTheme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'`,
  
  'theme.gradients.primary': `theme.muiTheme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'`,
  
  'theme.gradients.secondary': `theme.muiTheme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' 
    : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'`,
  
  'theme.gradients.glow': `theme.muiTheme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' 
    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'`,

  // Radius - convert to MUI theme values
  'theme.radius.sm': '1',
  'theme.radius.md': '2', 
  'theme.radius.lg': '2',
  'theme.radius.xl': '3',
  'theme.radius.full': '20',

  // Shadows - convert to MUI shadow values
  'theme.shadows.sm': 'theme.muiTheme.shadows[1]',
  'theme.shadows.md': 'theme.muiTheme.shadows[4]',
  'theme.shadows.lg': 'theme.muiTheme.shadows[8]',
  'theme.shadows.xl': 'theme.muiTheme.shadows[12]',
  'theme.shadows.card': 'theme.muiTheme.shadows[2]',
  'theme.shadows.cardHover': 'theme.muiTheme.shadows[12]',

  // Transitions - convert to standard CSS transitions
  'theme.transitions.base': "'all 0.2s ease-in-out'",
  'theme.transitions.slow': "'all 0.3s ease-in-out'",
  'theme.transitions.fast': "'all 0.15s ease-in-out'"
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Apply all replacements
  for (const [oldPattern, newPattern] of Object.entries(themeReplacements)) {
    // Escape special regex characters
    const escapedPattern = oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedPattern, 'g');
    
    if (content.match(regex)) {
      content = content.replace(regex, newPattern);
      modified = true;
      console.log(`✓ Replaced ${oldPattern} in ${path.basename(filePath)}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`📝 Updated ${path.basename(filePath)}`);
  }

  return modified;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalFiles = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && file.endsWith('.js')) {
      if (processFile(filePath)) {
        totalFiles++;
      }
    }
  });

  return totalFiles;
}

// Process all pages
const pagesDir = path.join(__dirname, 'src', 'Pages');
console.log('🔄 Fixing theme references in all pages...\n');

const updatedFiles = processDirectory(pagesDir);

console.log(`\n✅ Theme reference fix complete!`);
console.log(`📊 Updated ${updatedFiles} files with proper MUI theme integration.`);
console.log('\n🎨 Dark mode should now work properly across all pages!');
