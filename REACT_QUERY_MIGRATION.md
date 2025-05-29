# React Query Migration Guide

## Overview

We've successfully implemented React Query to optimize API calls for subscription and usage data, providing better performance through caching, background refetching, and loading states.

## What's Been Implemented

### 1. QueryClient Setup
- **File**: `src/App.tsx`
- **Features**: QueryClient provider with optimized defaults (5min stale time, 10min cache time, smart retry logic)

### 2. API Service Layer
- **File**: `src/lib/api.ts`
- **Features**: 
  - Centralized API functions for subscription and usage data
  - Proper error handling with typed responses
  - Combined data fetching (subscription + usage)
  - Query keys for React Query

### 3. React Query Hooks
- **File**: `src/hooks/useSubscriptionQuery.ts`
- **Hooks**:
  - `useSubscriptionQuery()` - Fetches subscription data with real-time updates
  - `useUsageQuery()` - Fetches current usage data  
  - `useSubscriptionWithUsageQuery()` - Fetches both subscription and usage data combined

### 4. Updated Components

#### ✅ Components Already Updated:
- `src/hooks/useUsageLimit.ts` - Now uses React Query hooks
- `src/components/UsageDisplay.tsx` - Uses React Query with loading states
- `src/pages/Account.tsx` - Uses React Query for all subscription/usage data

#### 🔄 Components Still Using Old Hooks:
- `src/pages/Index.tsx` - Uses `useSubscription()` (old hook)
- `src/components/WebsiteForm.tsx` - Uses `useUsageLimit()` (updated)
- `src/components/FileUploadNetlify.tsx` - Uses `useUsageLimit()` (updated)

## Migration Instructions

### For Components Using Old `useSubscription()` Hook:

**Before:**
```typescript
import { useSubscription } from '@/hooks/useSubscription';

const { subscription, isLoading } = useSubscription();
```

**After:**
```typescript
import { useSubscriptionQuery } from '@/hooks/useSubscriptionQuery';

const { subscription, isLoading } = useSubscriptionQuery();
```

### For Components Needing Both Subscription and Usage:

**Option 1 - Separate Hooks:**
```typescript
import { useSubscriptionQuery, useUsageQuery } from '@/hooks/useSubscriptionQuery';

const { subscription, isLoading: subscriptionLoading } = useSubscriptionQuery();
const { usage, isLoading: usageLoading } = useUsageQuery();
const isLoading = subscriptionLoading || usageLoading;
```

**Option 2 - Combined Hook:**
```typescript
import { useSubscriptionWithUsageQuery } from '@/hooks/useSubscriptionQuery';

const { subscription, usage, isLoading } = useSubscriptionWithUsageQuery();
```

### For Manual API Calls:

**Before:**
```typescript
const fetchUsage = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/subscription/usage/${user.id}`);
  const data = await response.json();
  setUsage(data.count);
};
```

**After:**
```typescript
import { useUsageQuery } from '@/hooks/useSubscriptionQuery';

const { usage, isLoading, refetch } = useUsageQuery();
// usage.count contains the usage data
// refetch() to manually refresh
```

## Benefits of React Query Implementation

### 1. **Performance Improvements**
- **Caching**: Data is cached for 5-10 minutes, reducing API calls
- **Background Refetching**: Data stays fresh automatically
- **Deduplication**: Multiple components requesting same data share one request

### 2. **Better UX**
- **Loading States**: Proper loading indicators while data fetches
- **Stale-While-Revalidate**: Shows cached data immediately, updates in background
- **Error Handling**: Centralized error management

### 3. **Real-time Updates**
- **Supabase Integration**: Real-time subscription changes via websockets
- **Cache Invalidation**: Automatic cache updates when data changes
- **Optimistic Updates**: UI updates immediately on mutations

### 4. **Developer Experience**
- **DevTools**: React Query DevTools for debugging (development only)
- **TypeScript**: Full type safety for all API responses
- **Consistent API**: Same hook interface across all components

## Query Configuration

### Default Settings:
```typescript
staleTime: 5 * 60 * 1000, // 5 minutes
gcTime: 10 * 60 * 1000, // 10 minutes  
retry: smart retry (no retry for 4xx errors)
refetchOnWindowFocus: false
```

### Subscription-Specific:
- **Subscription Data**: 30 second stale time (changes frequently)
- **Usage Data**: 1 minute stale time (updates with each book read)
- **Real-time Updates**: Automatic cache updates via Supabase subscriptions

## Query Keys Structure

```typescript
// Individual queries
['subscription', userId]
['usage', userId] 

// Combined queries
['subscription-with-usage', userId]
```

## Next Steps

1. **Update Index.tsx**: Replace `useSubscription()` with `useSubscriptionQuery()`
2. **Add DevTools**: Install `@tanstack/react-query-devtools` for development
3. **Monitor Performance**: Check network tab to see reduced API calls
4. **Add Mutations**: Implement mutations for subscription updates/cancellations

## Troubleshooting

### Common Issues:

1. **"Invalid hook call"**: Make sure QueryClient provider wraps your app
2. **Stale data**: Use `refetch()` to manually refresh data
3. **Loading states**: Check both individual hook loading states and combined states
4. **Real-time not working**: Verify Supabase subscriptions are properly set up

### Debug Tools:

1. **React Query DevTools**: Toggle with Cmd/Ctrl + Shift + D in development
2. **Network Tab**: Monitor actual API calls being made
3. **Console Logs**: API service functions log errors for debugging

---

This migration provides significant performance improvements while maintaining the same component interface patterns. 