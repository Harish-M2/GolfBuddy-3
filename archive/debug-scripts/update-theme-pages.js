#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagesToUpdate = [
  'TeeTimes.js',
  'Buddies.js', 
  'Photos.js',
  'Settings.js',
  'Sports.js'
];

function updatePage(fileName) {
  const filePath = path.join(__dirname, 'src', 'Pages', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add ThemeProvider import
  if (!content.includes('ThemeProvider')) {
    content = content.replace(
      /(import\s+{\s*[^}]+)\s*}\s*from\s+['"]@mui\/material['"];/,
      '$1, ThemeProvider} from \'@mui/material\';'
    );
  }
  
  // Add useTheme import
  if (!content.includes('useTheme')) {
    const authImportMatch = content.match(/(import\s+{\s*useAuth\s*}\s+from\s+['"][^'"]+['"];)/);
    if (authImportMatch) {
      content = content.replace(
        authImportMatch[0],
        authImportMatch[0] + '\nimport { useTheme } from \'../contexts/ThemeContext\';'
      );
    }
  }
  
  // Add theme hook to component
  const componentMatch = content.match(/(export\s+function\s+\w+\(\)\s*{\s*)(const\s*{\s*currentUser\s*}\s*=\s*useAuth\(\);?)/);
  if (componentMatch && !content.includes('const { theme } = useTheme();')) {
    content = content.replace(
      componentMatch[2],
      componentMatch[2] + '\n  const { theme } = useTheme();'
    );
  }
  
  // Wrap return with ThemeProvider
  const returnMatch = content.match(/(\s+return\s*\(\s*)(<(?:Box|Container|div)[^>]*>)/);
  if (returnMatch && !content.includes('<ThemeProvider theme={theme.muiTheme}>')) {
    content = content.replace(
      returnMatch[0],
      returnMatch[1] + '<ThemeProvider theme={theme.muiTheme}>\n      ' + returnMatch[2]
    );
    
    // Find the closing of the main component and add closing ThemeProvider
    const lines = content.split('\n');
    let braceCount = 0;
    let returnFound = false;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      
      if (line.includes('  );') && line.includes('}') && !line.includes('ThemeProvider')) {
        lines[i] = line.replace('  );', '    </ThemeProvider>\n  );');
        break;
      }
    }
    
    content = lines.join('\n');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${fileName}`);
}

console.log('🎨 Updating remaining pages with theme support...\n');

pagesToUpdate.forEach(updatePage);

console.log('\n🎉 Theme update complete!');
