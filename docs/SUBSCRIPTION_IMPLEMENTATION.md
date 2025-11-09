# 🔧 Technical Implementation: Subscription System

## 💳 Stripe Integration Setup

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js stripe react-stripe-js
```

### 2. Environment Variables

```env
# .env
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Stripe Configuration

```javascript
// src/utils/stripe.js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export default stripePromise;

export const subscriptionPlans = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 buddy connections/month',
      'Basic course search',
      'Last 5 rounds tracking',
      'Standard chat'
    ]
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    priceId: 'price_premium_monthly',
    features: [
      'Unlimited buddy connections',
      'Advanced course search',
      'Unlimited score tracking',
      'Priority chat support',
      'Tee time booking',
      'Ad-free experience'
    ]
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    priceId: 'price_pro_monthly',
    features: [
      'Everything in Premium',
      'Advanced analytics',
      'Tournament organization',
      'Group management',
      'Equipment recommendations',
      'Golf lesson booking'
    ]
  }
};
```

---

## 🏗️ Subscription Components

### 1. Subscription Plans Component

```javascript
// src/Components/SubscriptionPlans.js
import React from 'react';
import { Box, Card, CardContent, Typography, Button, List, ListItem, CheckCircle } from '@mui/material';
import { subscriptionPlans } from '../utils/stripe';
import { useAuth } from '../contexts/AuthContext';

export function SubscriptionPlans({ onSelectPlan }) {
  const { userProfile } = useAuth();
  const currentTier = userProfile?.subscription?.tier || 'free';

  return (
    <Box sx={{ py: 6 }}>
      <Typography variant="h3" align="center" sx={{ mb: 6, fontWeight: 800 }}>
        Choose Your Plan 🏌️
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {Object.entries(subscriptionPlans).map(([tier, plan]) => (
          <Card
            key={tier}
            sx={{
              width: 350,
              position: 'relative',
              border: currentTier === tier ? '3px solid #059669' : '1px solid #e2e8f0',
              transform: tier === 'premium' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: tier === 'premium' ? '0 20px 60px rgba(5, 150, 105, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            {tier === 'premium' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -15,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                🌟 Most Popular
              </Box>
            )}
            
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {plan.name}
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#059669' }}>
                  ${plan.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per month
                </Typography>
              </Box>
              
              <List sx={{ mb: 4 }}>
                {plan.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <CheckCircle sx={{ color: '#10b981', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">{feature}</Typography>
                  </ListItem>
                ))}
              </List>
              
              <Button
                fullWidth
                variant={currentTier === tier ? 'outlined' : 'contained'}
                disabled={currentTier === tier}
                onClick={() => onSelectPlan(tier, plan)}
                sx={{
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  background: tier !== 'free' ? 'linear-gradient(135deg, #059669, #10b981)' : undefined,
                }}
              >
                {currentTier === tier ? 'Current Plan' : 
                 tier === 'free' ? 'Current Plan' : 
                 `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
```

### 2. Subscription Context

```javascript
// src/contexts/SubscriptionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setSubscription(userData.subscription || { tier: 'free', status: 'active' });
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const updateSubscription = async (subscriptionData) => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        subscription: subscriptionData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const checkFeatureAccess = (feature) => {
    if (!subscription) return false;

    const featureAccess = {
      unlimited_buddies: ['premium', 'pro'],
      advanced_search: ['premium', 'pro'],
      unlimited_tracking: ['premium', 'pro'],
      tee_time_booking: ['premium', 'pro'],
      analytics: ['pro'],
      tournaments: ['pro'],
      group_management: ['pro']
    };

    return featureAccess[feature]?.includes(subscription.tier) || false;
  };

  const getUsageLimit = (feature) => {
    const limits = {
      free: {
        buddies: 5,
        course_searches: 10,
        score_rounds: 5
      },
      premium: {
        buddies: Infinity,
        course_searches: Infinity,
        score_rounds: Infinity
      },
      pro: {
        buddies: Infinity,
        course_searches: Infinity,
        score_rounds: Infinity
      }
    };

    return limits[subscription?.tier || 'free'][feature] || 0;
  };

  const value = {
    subscription,
    loading,
    updateSubscription,
    checkFeatureAccess,
    getUsageLimit,
    isPremium: subscription?.tier === 'premium' || subscription?.tier === 'pro',
    isPro: subscription?.tier === 'pro'
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
```

### 3. Feature Gates Component

```javascript
// src/Components/FeatureGate.js
import React from 'react';
import { Box, Typography, Button, Dialog, DialogContent } from '@mui/material';
import { Lock, Star } from '@mui/icons-material';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SubscriptionPlans } from './SubscriptionPlans';

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradeModal = true 
}) {
  const { checkFeatureAccess } = useSubscription();
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  
  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return children;
  }

  const handleUpgradeClick = () => {
    if (showUpgradeModal) {
      setUpgradeModalOpen(true);
    }
  };

  if (fallback) {
    return fallback;
  }

  return (
    <>
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed #e2e8f0',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05))',
        }}
      >
        <Lock sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Premium Feature
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upgrade to access this feature and unlock more powerful tools for your golf game.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Star />}
          onClick={handleUpgradeClick}
          sx={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontWeight: 600,
          }}
        >
          Upgrade Now
        </Button>
      </Box>

      <Dialog
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <SubscriptionPlans onSelectPlan={() => setUpgradeModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🎯 Usage Implementation Examples

### 1. Buddy Finder with Limits

```javascript
// src/Pages/Golf.js modifications
import { useSubscription } from '../contexts/SubscriptionContext';
import { FeatureGate } from '../Components/FeatureGate';

export function Golf() {
  const { getUsageLimit, isPremium } = useSubscription();
  const [buddyCount, setBuddyCount] = useState(0);
  
  const buddyLimit = getUsageLimit('buddies');
  const canAddMoreBuddies = buddyCount < buddyLimit || isPremium;

  return (
    <Container>
      {/* Existing code... */}
      
      {!canAddMoreBuddies && (
        <FeatureGate feature="unlimited_buddies">
          <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, mb: 2 }}>
            <Typography>
              You've reached your monthly buddy limit ({buddyLimit}). 
              Upgrade to Premium for unlimited connections!
            </Typography>
          </Box>
        </FeatureGate>
      )}
      
      <Button
        disabled={!canAddMoreBuddies}
        onClick={handleAddBuddy}
      >
        Add Buddy {!isPremium && `(${buddyCount}/${buddyLimit})`}
      </Button>
    </Container>
  );
}
```

### 2. Premium Analytics Dashboard

```javascript
// src/Components/PremiumAnalytics.js
import { FeatureGate } from './FeatureGate';

export function PremiumAnalytics() {
  return (
    <FeatureGate feature="analytics">
      <Box>
        <Typography variant="h5" gutterBottom>📊 Advanced Analytics</Typography>
        {/* Premium analytics content */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Handicap Trending</Typography>
                {/* Chart component */}
              </CardContent>
            </Card>
          </Grid>
          {/* More premium features */}
        </Grid>
      </Box>
    </FeatureGate>
  );
}
```

---

## 🚀 Implementation Steps

### Step 1: Set up Stripe Account
1. Create Stripe account
2. Set up products and prices
3. Configure webhooks
4. Add environment variables

### Step 2: Add Subscription UI
1. Create subscription plans page
2. Add upgrade buttons throughout app
3. Implement feature gates
4. Add usage indicators

### Step 3: Backend Integration
1. Set up Stripe webhook handler
2. Update user subscription status
3. Implement usage tracking
4. Add subscription management

### Step 4: Testing & Launch
1. Test payment flows
2. Test feature restrictions
3. Add analytics tracking
4. Launch with promotional pricing

This implementation will give you a solid foundation for monetizing your GolfBuddy app through subscriptions!
