// Test Component to Debug Dark Mode
import React from 'react';
import { Box, Typography, Paper, Button, Card, CardContent } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

export function ThemeDebug() {
  const muiTheme = useMuiTheme();
  const { theme, isDark, toggleTheme } = useCustomTheme();

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="text.primary">
          Theme Debug Page
        </Typography>
        <Button variant="contained" onClick={toggleTheme}>
          Toggle Theme (Current: {isDark ? 'Dark' : 'Light'})
        </Button>
      </Box>

      {/* Debug Info Paper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="text.primary">
          Theme Debug Info
        </Typography>
        
        <Typography variant="h6" sx={{ mt: 2 }} color="text.primary">
          MUI Theme (from useMuiTheme):
        </Typography>
        <Typography color="text.secondary">Mode: {muiTheme.palette.mode}</Typography>
        <Typography color="text.secondary">Text Primary: {muiTheme.palette.text.primary}</Typography>
        <Typography color="text.secondary">Text Secondary: {muiTheme.palette.text.secondary}</Typography>
        <Typography color="text.secondary">Background Default: {muiTheme.palette.background.default}</Typography>
        <Typography color="text.secondary">Background Paper: {muiTheme.palette.background.paper}</Typography>
        
        <Typography variant="h6" sx={{ mt: 2 }} color="text.primary">
          Custom Theme Context:
        </Typography>
        <Typography color="text.secondary">isDark: {isDark ? 'true' : 'false'}</Typography>
        <Typography color="text.secondary">theme.mode: {theme?.mode}</Typography>
        <Typography color="text.secondary">theme.muiTheme.palette.mode: {theme?.muiTheme?.palette?.mode}</Typography>
        <Typography color="text.secondary">theme.muiTheme.palette.text.primary: {theme?.muiTheme?.palette?.text?.primary}</Typography>
      </Paper>

      {/* Using MUI Shorthand (CORRECT WAY) */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="text.primary" gutterBottom>
          ✅ Using MUI Shorthand (CORRECT - Adapts to Dark Mode)
        </Typography>
        <Typography variant="body1" color="text.primary">
          color="text.primary" - Should be light in dark mode
        </Typography>
        <Typography variant="body2" color="text.secondary">
          color="text.secondary" - Should be lighter gray in dark mode
        </Typography>
        <Typography variant="caption" color="text.disabled">
          color="text.disabled" - Should be medium gray in dark mode
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography color="text.primary">
            bgcolor="background.default" with color="text.primary"
          </Typography>
        </Box>
      </Paper>

      {/* Using Direct Palette Values */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: muiTheme.palette.text.primary }} gutterBottom>
          ✅ Using Direct Palette (ALSO CORRECT)
        </Typography>
        <Typography sx={{ color: muiTheme.palette.text.primary }}>
          sx=&#123;&#123; color: muiTheme.palette.text.primary &#125;&#125;
        </Typography>
        <Typography sx={{ color: muiTheme.palette.text.secondary }}>
          sx=&#123;&#123; color: muiTheme.palette.text.secondary &#125;&#125;
        </Typography>
      </Paper>

      {/* Using theme.muiTheme.palette (What Dashboard uses) */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ color: theme.muiTheme.palette.text.primary }} 
          gutterBottom
        >
          ✅ Using theme.muiTheme.palette (What we changed to)
        </Typography>
        <Typography sx={{ color: theme.muiTheme.palette.text.primary }}>
          sx=&#123;&#123; color: theme.muiTheme.palette.text.primary &#125;&#125;
        </Typography>
        <Typography sx={{ color: theme.muiTheme.palette.text.secondary }}>
          sx=&#123;&#123; color: theme.muiTheme.palette.text.secondary &#125;&#125;
        </Typography>
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: theme.muiTheme.palette.background.default,
          color: theme.muiTheme.palette.text.primary,
          borderRadius: 1,
          border: `1px solid ${theme.muiTheme.palette.divider}`
        }}>
          <Typography>
            Using theme.muiTheme.palette for bgcolor and color
          </Typography>
        </Box>
      </Paper>

      {/* Test Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Card with Shorthand
            </Typography>
            <Typography color="text.secondary">
              This uses MUI's color shorthand
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography 
              variant="h6" 
              sx={{ color: theme.muiTheme.palette.text.primary }}
              gutterBottom
            >
              Card with theme.muiTheme
            </Typography>
            <Typography sx={{ color: theme.muiTheme.palette.text.secondary }}>
              This uses theme.muiTheme.palette directly
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'warning.main', color: 'warning.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          🔍 What to Check:
        </Typography>
        <Typography>
          1. Toggle between light and dark mode using the button above
        </Typography>
        <Typography>
          2. ALL text should be visible in BOTH modes
        </Typography>
        <Typography>
          3. In DARK mode: Text should be LIGHT colored on dark backgrounds
        </Typography>
        <Typography>
          4. In LIGHT mode: Text should be DARK colored on light backgrounds
        </Typography>
        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
          If text is NOT visible, the problem is NOT with our code changes - it's with the theme provider setup!
        </Typography>
      </Paper>
    </Box>
  );
}
