import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  GolfCourse, Home, PersonSearch, Map, Login, Logout, 
  Notifications, Settings, PersonAdd, CheckCircle, Close, PhotoCamera,
  Dashboard as DashboardIcon, Chat as ChatIcon, Event, People, ExpandMore
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
// import { useBuddyRequests } from '../hooks/useBuddyRequests'; // TEMP: Disabled
// import { signOutUser } from '../firebase/auth'; // TEMP: Disabled - using AuthContext method
// import { updateBuddyRequestStatus } from '../firebase/database'; // TEMP: Disabled
import AuthModal from './AuthModal';
import { DarkModeToggle } from './DarkModeToggle';

// Streamlined navigation structure with grouped items
const navigationGroups = {
  main: [
    { name: 'Home', path: '/', icon: <Home /> },
    { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  ],
  social: {
    label: 'Social',
    icon: <People />,
    items: [
      { name: 'Find Buddies', path: '/golf', icon: <PersonSearch /> },
      { name: 'My Buddies', path: '/buddies', icon: <PersonAdd />, showBadge: true },
      { name: 'Chat', path: '/chat', icon: <ChatIcon /> },
    ]
  },
  golf: {
    label: 'Golf',
    icon: <GolfCourse />,
    items: [
      { name: 'Tee Times', path: '/teetimes', icon: <Event /> },
      { name: 'Scores', path: '/scores', icon: <GolfCourse /> },
      { name: 'Courses', path: '/courses', icon: <Map /> },
      { name: 'Photos', path: '/photos', icon: <PhotoCamera /> },
    ]
  }
};

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = React.useState(null);
  const [anchorElSocial, setAnchorElSocial] = React.useState(null);
  const [anchorElGolf, setAnchorElGolf] = React.useState(null);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use real auth context
  const { currentUser, userProfile, signOut: authSignOut, loading: authLoading } = useAuth();
  const { notifications, unreadCount, markAsRead, clearNotification } = useNotifications();
  const pendingCount = 0; // TODO: Implement buddy requests

  console.log('🎯 AppBar - Auth State:', { 
    hasUser: !!currentUser, 
    email: currentUser?.email,
    loading: authLoading 
  });

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleOpenSocialMenu = (event) => {
    setAnchorElSocial(event.currentTarget);
  };

  const handleCloseSocialMenu = () => {
    setAnchorElSocial(null);
  };

  const handleOpenGolfMenu = (event) => {
    setAnchorElGolf(event.currentTarget);
  };

  const handleCloseGolfMenu = () => {
    setAnchorElGolf(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleCloseNavMenu();
    handleCloseSocialMenu();
    handleCloseGolfMenu();
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out...');
      await authSignOut();
      console.log('✅ Signed out successfully');
      handleCloseUserMenu();
      navigate('/');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // Navigate to appropriate page based on notification type
    if (notification.type === 'buddy_request') {
      navigate('/settings');
    }
    handleCloseNotifications();
  };

  const handleBuddyRequestResponse = async (requestId, status, event) => {
    event.stopPropagation();
    // TEMP: Disabled for testing
    console.log('Buddy request response disabled in test mode');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="static" 
      sx={{
        background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        borderRadius: 0
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Logo/Brand - Desktop */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <GolfCourse sx={{ mr: 1, fontSize: 28, color: '#22d3ee' }} />
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ 
              flexGrow: 0,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff, #22d3ee)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}
          >
            GolfBuddy
          </Typography>
        </Box>

        {/* Mobile Menu Button */}
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ 
              display: { xs: 'block', md: 'none' },
              '& .MuiPaper-root': {
                borderRadius: 2,
                mt: 1,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }
            }}
          >
            {/* Main Pages */}
            {navigationGroups.main.map((page) => (
              <MenuItem 
                key={page.name} 
                onClick={() => handleNavigate(page.path)}
                sx={{
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 64, 175, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {React.cloneElement(page.icon, { sx: { fontSize: 20, color: '#1e40af' } })}
                  <Typography 
                    sx={{ 
                      fontWeight: isActive(page.path) ? 600 : 400,
                      color: isActive(page.path) ? '#1e40af' : 'text.primary'
                    }}
                  >
                    {page.name}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            
            <Divider sx={{ my: 1 }} />
            
            {/* Social Section */}
            <MenuItem disabled sx={{ py: 0.5, px: 3, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                SOCIAL
              </Typography>
            </MenuItem>
            {navigationGroups.social.items.map((page) => (
              <MenuItem 
                key={page.name} 
                onClick={() => handleNavigate(page.path)}
                sx={{
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 64, 175, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {React.cloneElement(page.icon, { sx: { fontSize: 20, color: '#1e40af' } })}
                    <Typography 
                      sx={{ 
                        fontWeight: isActive(page.path) ? 600 : 400,
                        color: isActive(page.path) ? '#1e40af' : 'text.primary'
                      }}
                    >
                      {page.name}
                    </Typography>
                  </Box>
                  {page.showBadge && currentUser && pendingCount > 0 && (
                    <Chip 
                      label={pendingCount} 
                      size="small" 
                      color="error"
                      sx={{ 
                        height: 22,
                        minWidth: 22,
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
            
            <Divider sx={{ my: 1 }} />
            
            {/* Golf Section */}
            <MenuItem disabled sx={{ py: 0.5, px: 3, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                GOLF
              </Typography>
            </MenuItem>
            {navigationGroups.golf.items.map((page) => (
              <MenuItem 
                key={page.name} 
                onClick={() => handleNavigate(page.path)}
                sx={{
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 64, 175, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {React.cloneElement(page.icon, { sx: { fontSize: 20, color: '#1e40af' } })}
                  <Typography 
                    sx={{ 
                      fontWeight: isActive(page.path) ? 600 : 400,
                      color: isActive(page.path) ? '#1e40af' : 'text.primary'
                    }}
                  >
                    {page.name}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Mobile Logo */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 1,
            display: { xs: 'flex', md: 'none' },
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffffff, #22d3ee)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            justifyContent: 'center'
          }}
        >
          GolfBuddy
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1 }}>
          {/* Main Pages */}
          {navigationGroups.main.map((page) => (
            <Button
              key={page.name}
              onClick={() => handleNavigate(page.path)}
              startIcon={page.icon}
              sx={{ 
                color: 'white',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontWeight: isActive(page.path) ? 600 : 400,
                backgroundColor: isActive(page.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {page.name}
            </Button>
          ))}

          {/* Social Dropdown */}
          <Badge
            badgeContent={currentUser ? pendingCount : 0}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                right: 3,
                top: 8,
                border: '2px solid white',
                padding: '0 4px',
              }
            }}
          >
            <Button
              onClick={handleOpenSocialMenu}
              startIcon={navigationGroups.social.icon}
              endIcon={<ExpandMore />}
              sx={{ 
                color: 'white',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontWeight: 400,
                backgroundColor: Boolean(anchorElSocial) ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {navigationGroups.social.label}
            </Button>
          </Badge>
          <Menu
            anchorEl={anchorElSocial}
            open={Boolean(anchorElSocial)}
            onClose={handleCloseSocialMenu}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                mt: 1,
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 30, 0.95)' 
                  : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: (theme) => theme.palette.mode === 'dark'
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid rgba(255,255,255,0.2)',
                minWidth: 180
              }
            }}
          >
            {navigationGroups.social.items.map((item) => (
              <MenuItem
                key={item.name}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 64, 175, 0.1)'
                  }
                }}
              >
                <ListItemIcon>
                  {React.cloneElement(item.icon, { sx: { fontSize: 20, color: '#1e40af' } })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                    color: isActive(item.path) ? '#1e40af' : 'text.primary'
                  }}
                />
                {item.showBadge && currentUser && pendingCount > 0 && (
                  <Chip 
                    label={pendingCount} 
                    size="small" 
                    color="error"
                    sx={{ 
                      height: 22,
                      minWidth: 22,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      ml: 1
                    }}
                  />
                )}
              </MenuItem>
            ))}
          </Menu>

          {/* Golf Dropdown */}
          <Button
            onClick={handleOpenGolfMenu}
            startIcon={navigationGroups.golf.icon}
            endIcon={<ExpandMore />}
            sx={{ 
              color: 'white',
              px: 2.5,
              py: 1,
              borderRadius: 2,
              fontWeight: 400,
              backgroundColor: Boolean(anchorElGolf) ? 'rgba(255,255,255,0.2)' : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {navigationGroups.golf.label}
          </Button>
          <Menu
            anchorEl={anchorElGolf}
            open={Boolean(anchorElGolf)}
            onClose={handleCloseGolfMenu}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                mt: 1,
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 30, 0.95)' 
                  : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: (theme) => theme.palette.mode === 'dark'
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid rgba(255,255,255,0.2)',
                minWidth: 180
              }
            }}
          >
            {navigationGroups.golf.items.map((item) => (
              <MenuItem
                key={item.name}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(30, 64, 175, 0.1)'
                  }
                }}
              >
                <ListItemIcon>
                  {React.cloneElement(item.icon, { sx: { fontSize: 20, color: '#1e40af' } })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                    color: isActive(item.path) ? '#1e40af' : 'text.primary'
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Right side - Auth Controls */}
        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Dark Mode Toggle */}
          <DarkModeToggle variant="appbar" />
          
          {currentUser ? (
            <>
              {/* Notifications */}
              <IconButton
                onClick={handleOpenNotifications}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  color: 'rgba(255,255,255,0.9)'
                }}
              >
                Welcome, {userProfile?.displayName || currentUser.email}
              </Typography>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#22d3ee',
                    width: 35,
                    height: 35
                  }}
                >
                  {getInitials(userProfile?.displayName || currentUser.email)}
                </Avatar>
              </IconButton>
              
              {/* Notifications Popover */}
              <Popover
                open={Boolean(anchorElNotifications)}
                anchorEl={anchorElNotifications}
                onClose={handleCloseNotifications}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{ mt: 1 }}
              >
                <Paper sx={{ width: 350, maxHeight: 400 }}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notifications ({unreadCount})
                    </Typography>
                  </Box>
                  {notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No notifications
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
                      {notifications.map((notification) => (
                        <ListItem 
                          key={notification.id}
                          button
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            backgroundColor: notification.read ? 'transparent' : 'rgba(30, 64, 175, 0.05)',
                            borderLeft: notification.read ? 'none' : '3px solid #1e40af'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#1e40af' }}>
                              <PersonAdd />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.title}
                            secondary={notification.message}
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleBuddyRequestResponse(notification.id, 'accepted', e)}
                                sx={{ color: '#10b981' }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => handleBuddyRequestResponse(notification.id, 'rejected', e)}
                                sx={{ color: '#ef4444' }}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Popover>
              
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar-user"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => { navigate('/settings'); handleCloseUserMenu(); }}>
                  <Settings sx={{ mr: 1 }} />
                  <Typography textAlign="center">Settings</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                  <Logout sx={{ mr: 1 }} />
                  <Typography textAlign="center">Sign Out</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true)}
              startIcon={<Login />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              variant="outlined"
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
      
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </AppBar>
  );
}