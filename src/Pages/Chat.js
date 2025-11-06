import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Avatar,
  TextField, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  Divider, Badge, Paper, InputAdornment, Alert
} from '@mui/material';
import {
  Send, ArrowBack, MoreVert, Search, Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserChats,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUserBuddies
} from '../firebase/database';
import LoadingSpinner from '../Components/LoadingSpinner';
import theme, { gradientText } from '../theme';

export function Chat() {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Get existing chats and accepted buddies in parallel
      const [userChats, buddies] = await Promise.all([
        getUserChats(currentUser.uid),
        getUserBuddies(currentUser.uid)
      ]);
      
      // Create a map of existing chats by user ID for quick lookup
      const chatMap = new Map();
      userChats.forEach(chat => {
        chatMap.set(chat.otherUserId, chat);
      });
      
      // Merge buddies with chats - buddies without chats will be added
      const mergedChats = [...userChats];
      
      buddies.forEach(buddy => {
        // If buddy doesn't have an existing chat, create a placeholder
        if (!chatMap.has(buddy.uid)) {
          mergedChats.push({
            id: [currentUser.uid, buddy.uid].sort().join('_'),
            otherUser: buddy,
            otherUserId: buddy.uid,
            participants: [currentUser.uid, buddy.uid],
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0,
            isNewBuddy: true // Flag to indicate this is a buddy without messages yet
          });
        }
      });
      
      // Sort by last message time, putting new buddies at the end
      mergedChats.sort((a, b) => {
        if (a.isNewBuddy && !b.isNewBuddy) return 1;
        if (!a.isNewBuddy && b.isNewBuddy) return -1;
        
        const aTime = a.lastMessageTime?.toMillis?.() || 0;
        const bTime = b.lastMessageTime?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      setChats(mergedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const loadMessages = useCallback(async (chatId, otherUserId) => {
    if (!currentUser) return;
    
    try {
      const chatMessages = await getMessages(currentUser.uid, otherUserId);
      setMessages(chatMessages);
      
      // Mark as read
      await markMessagesAsRead(currentUser.uid, otherUserId);
      
      // Update the unread count for this specific chat locally
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.otherUserId === otherUserId 
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  }, [currentUser]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id, selectedChat.otherUserId);
      
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        loadMessages(selectedChat.id, selectedChat.otherUserId);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedChat, loadMessages]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setError('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      setSendingMessage(true);
      
      await sendMessage(currentUser.uid, selectedChat.otherUserId, newMessage.trim());
      
      setNewMessage('');
      
      // Reload messages
      await loadMessages(selectedChat.id, selectedChat.otherUserId);
      
      // Focus back on input
      messageInputRef.current?.focus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const getUnreadCount = (chat) => {
    if (!messages || !chat) return 0;
    return messages.filter(msg => 
      msg.toUserId === currentUser?.uid && !msg.read
    ).length;
  };

  const filteredChats = chats.filter(chat =>
    chat.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Loading chats..." />;
  }

  if (!currentUser) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: theme.gradients.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Alert severity="info" sx={{ maxWidth: 400, borderRadius: theme.radius.lg }}>
          Please sign in to access chat.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.gradients.background,
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ 
          textAlign: 'center',
          mb: 4,
          animation: 'fadeInDown 0.6s ease-out',
          '@keyframes fadeInDown': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Typography 
            variant="h2" 
            component="h1"
            sx={{
              fontWeight: 900,
              ...gradientText(theme.gradients.primary),
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Chat with Buddies 💬
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.colors.text.secondary,
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 500,
            }}
          >
            Message your golf buddies in real-time
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ mb: 3, borderRadius: theme.radius.lg }}
          >
            {error}
          </Alert>
        )}

        {/* Chat Interface */}
        <Grid container spacing={3} sx={{ height: { xs: 'auto', md: '70vh' } }}>
          {/* Chat List - Left Side */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: theme.radius.xl,
              boxShadow: theme.shadows.card,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Search */}
                <TextField
                  fullWidth
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: theme.colors.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.radius.lg,
                    },
                  }}
                />

                {/* Chat List */}
                {filteredChats.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No chats yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start a conversation with your buddies!
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ flex: 1, overflow: 'auto', px: 0 }}>
                    {filteredChats.map((chat) => (
                      <ListItem
                        key={chat.id}
                        button
                        selected={selectedChat?.id === chat.id}
                        onClick={() => handleSelectChat(chat)}
                        sx={{
                          borderRadius: theme.radius.lg,
                          mb: 1,
                          '&.Mui-selected': {
                            background: theme.gradients.glow,
                            '&:hover': {
                              background: theme.gradients.glow,
                            },
                          },
                          '&:hover': {
                            background: 'rgba(0,0,0,0.03)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={getUnreadCount(chat)}
                            color="error"
                            overlap="circular"
                          >
                            <Avatar
                              src={chat.otherUser?.photoURL}
                              sx={{
                                bgcolor: theme.colors.primary.main,
                                fontWeight: 'bold',
                              }}
                            >
                              {getInitials(chat.otherUser?.displayName)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {chat.otherUser?.displayName || 'Unknown'}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: chat.isNewBuddy ? theme.colors.primary.main : theme.colors.text.secondary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontStyle: chat.isNewBuddy ? 'italic' : 'normal',
                              }}
                            >
                              {chat.lastMessage || (chat.isNewBuddy ? 'Start a conversation 💬' : 'No messages yet')}
                            </Typography>
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(chat.lastMessageTime)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Divider sx={{ my: 2 }} />
                
                <IconButton 
                  onClick={loadChats}
                  sx={{ 
                    alignSelf: 'center',
                    color: theme.colors.primary.main 
                  }}
                >
                  <Refresh />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>

          {/* Messages - Right Side */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: theme.radius.xl,
              boxShadow: theme.shadows.card,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <Box sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                    <IconButton
                      onClick={() => setSelectedChat(null)}
                      sx={{ display: { xs: 'flex', md: 'none' } }}
                    >
                      <ArrowBack />
                    </IconButton>
                    <Avatar
                      src={selectedChat.otherUser?.photoURL}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: theme.colors.primary.main,
                        fontWeight: 'bold',
                      }}
                    >
                      {getInitials(selectedChat.otherUser?.displayName)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedChat.otherUser?.displayName || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedChat.otherUser?.skillLevel || 'Golfer'}
                      </Typography>
                    </Box>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* Messages */}
                  <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}>
                    {messages.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          No messages yet. Start the conversation! 👋
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.fromUserId === currentUser?.uid;
                        return (
                          <Box
                            key={msg.id}
                            sx={{
                              display: 'flex',
                              justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <Paper
                              sx={{
                                p: 2,
                                maxWidth: '70%',
                                background: isOwn 
                                  ? theme.gradients.primary
                                  : 'rgba(0,0,0,0.05)',
                                color: isOwn ? 'white' : 'text.primary',
                                borderRadius: theme.radius.lg,
                                boxShadow: theme.shadows.sm,
                              }}
                            >
                              <Typography variant="body1" sx={{ mb: 0.5 }}>
                                {msg.message}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  opacity: 0.8,
                                  display: 'block',
                                  textAlign: 'right',
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </Typography>
                            </Paper>
                          </Box>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Message Input */}
                  <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                      p: 2,
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                      inputRef={messageInputRef}
                      multiline
                      maxRows={3}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: theme.radius.lg,
                        },
                      }}
                    />
                    <IconButton
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      sx={{
                        background: theme.gradients.primary,
                        color: 'white',
                        width: 56,
                        height: 56,
                        '&:hover': {
                          background: theme.gradients.primary,
                          transform: 'scale(1.05)',
                        },
                        '&:disabled': {
                          background: theme.colors.text.disabled,
                          color: 'white',
                        },
                      }}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <Box sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                      Select a chat to start messaging
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Choose a buddy from the list to begin your conversation
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
