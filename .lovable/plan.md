

# Fix: Dashboard Frontend Invocation Issues

## Root Cause
The edge functions are correct (already using `getUser()`). The issue is in `src/pages/admin/AdminDashboard.tsx`:

1. **`body: null`** gets serialized as the string `"null"`, which the edge function receives as unexpected POST body content
2. **`method: "POST"`** is unnecessary -- the SDK defaults to GET when no body is provided
3. **Redundant `Authorization` header** -- the Supabase SDK automatically includes it from the current session
4. **No error handling** -- if `getSession()` returns no session, `setLoading(false)` is never called, leaving the spinner stuck forever

## Fix

### File: `src/pages/admin/AdminDashboard.tsx`

**Simplify the `fetchStats` function (lines 45-82):**

- Remove `headers`, `body: null`, and `method: "POST"` from the `supabase.functions.invoke` call
- Wrap the entire function in `try/catch/finally` to ensure `setLoading(false)` always runs
- If no session exists, set an error message and stop loading

```typescript
const fetchStats = async (forceRefresh = false) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    if (forceRefresh) {
      setRefreshing(true);
      try {
        const res = await fetch(
          `https://clqbumovauiuoeizwbhd.supabase.co/functions/v1/fetch-dashboard-stats?refresh=true`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          }
        );
        const freshData = await res.json();
        if (res.ok) {
          setStats(freshData);
          setIsCached(false);
        }
      } catch {
        // Keep showing stale data
      }
      setRefreshing(false);
      return;
    }

    // Simplified: no body, no method, no manual headers
    const { data, error: fnError } = await supabase.functions.invoke(
      "fetch-dashboard-stats"
    );

    if (fnError) {
      setError("Failed to load dashboard stats");
    } else {
      setStats(data);
      setIsCached(!!data?.cached);
    }
  } catch {
    setError("Failed to load dashboard stats");
  } finally {
    setLoading(false);
  }
};
```

## Changes

| File | Change |
|------|--------|
| `src/pages/admin/AdminDashboard.tsx` | Remove `body: null`, `method: "POST"`, and redundant `headers` from invoke call; add try/catch/finally for resilient loading state |

## Result
- The SDK handles auth automatically -- no manual header needed
- No `body: null` serialization issue
- Loading spinner always resolves, even on errors
- Dashboard loads correctly from the Supabase-backed edge function
