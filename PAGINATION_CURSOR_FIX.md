# ✅ Pagination Cursor Fix

## The Problem

**Symptom:** Clicking "Next Page" button changed the page number, but displayed the same coins.

**Root Cause:**
```
Page 1: after=undefined → Gets coins 1-20 ✅
Page 2: after=undefined → Gets coins 1-20 ❌ (same as page 1!)
Page 3: after=undefined → Gets coins 1-20 ❌ (same as page 1!)
```

The Zora SDK uses **cursor-based pagination** (like GraphQL), not page numbers:
- Each response includes an `endCursor` 
- To get the next page, you pass that cursor as `after`
- We were ignoring the cursor and always fetching from the beginning!

---

## The Fix

### 1. **Track Cursors in State**
```typescript
const [cursors, setCursors] = useState<{ [page: number]: string }>({})
```

Stores the cursor for each page:
```typescript
{
  1: "cursor_after_page_1",
  2: "cursor_after_page_2",
  3: "cursor_after_page_3"
}
```

### 2. **Use Cursor When Fetching**
```typescript
// Page 1: no cursor
const cursor = page > 1 ? cursors[page - 1] : undefined

// Page 2: use cursor from page 1
// Page 3: use cursor from page 2
```

### 3. **Store Cursor from Response**
```typescript
if (data.data.endCursor && data.data.hasNextPage) {
  setCursors(prev => ({ ...prev, [page]: data.data.endCursor }))
}
```

### 4. **Clear Cursors on Sort/Search Change**
```typescript
useEffect(() => {
  setPage(1)
  setCursors({}) // Start fresh when sorting/searching
}, [searchTerm, sortBy])
```

---

## How It Works Now

### Page 1:
```
Request: after=undefined
Response: Coins 1-20, endCursor="abc123"
Store: cursors[1] = "abc123"
```

### Page 2:
```
Get cursor: cursors[1] = "abc123"
Request: after="abc123"
Response: Coins 21-40, endCursor="def456"
Store: cursors[2] = "def456"
```

### Page 3:
```
Get cursor: cursors[2] = "def456"
Request: after="def456"
Response: Coins 41-60, endCursor="ghi789"
Store: cursors[3] = "ghi789"
```

---

## Testing

### ✅ Refresh browser and test:

1. **Page 1:** Should show coins 1-20
2. **Click Next:** Should show DIFFERENT coins (21-40)
3. **Click Next Again:** Should show MORE new coins (41-60)
4. **Click Previous:** Should go back to coins 21-40
5. **Click Previous Again:** Should go back to coins 1-20

### Console Logs to Watch:
```
Fetching coins with params: {sortBy, limit, page: 1, cursor: undefined}
Page 1: Got 20 coins, hasNextPage: true, endCursor: Yes

Fetching coins with params: {sortBy, limit, page: 2, cursor: "abc123..."}
Page 2: Got 20 coins, hasNextPage: true, endCursor: Yes

Fetching coins with params: {sortBy, limit, page: 3, cursor: "def456..."}
Page 3: Got 20 coins, hasNextPage: true, endCursor: Yes
```

### Edge Cases:

**✅ Changing Sort:**
- Cursors reset
- Page goes back to 1
- Fresh fetch starts

**✅ Searching:**
- Cursors reset
- Page goes back to 1
- Fetches 100 coins for search

**✅ Last Page:**
- `hasNextPage` becomes `false`
- Next button becomes disabled
- No cursor stored

---

## Before vs After

### Before ❌
```
Page 1: Coin A, Coin B, Coin C
Page 2: Coin A, Coin B, Coin C (same!)
Page 3: Coin A, Coin B, Coin C (same!)
```

### After ✅
```
Page 1: Coin A, Coin B, Coin C
Page 2: Coin D, Coin E, Coin F (different!)
Page 3: Coin G, Coin H, Coin I (different!)
```

---

## Code Changes

### Modified Files:
- `src/components/coins-table.tsx`
  - Added `cursors` state
  - Clear cursors on sort/search change
  - Pass cursor to API
  - Store cursor from response

### API Changes:
- ✅ No changes needed!
- API already accepts `after` parameter
- API already returns `endCursor` in response

---

## Related Fixes

This fix works together with:

1. **Multi-page fetching** (in `zora.ts`):
   - Fetches multiple pages to get 100 coins for stats
   
2. **Pagination component**:
   - Uses `hasNextPage` instead of `totalPages`
   - Shows "..." when more pages available

3. **API caching**:
   - Each page/cursor combo cached separately
   - Faster back/forward navigation

---

## Known Limitations

### You Can't Jump to Random Pages
- Can only go: Page 1 → 2 → 3 → 4
- Can't jump directly to Page 10
- **Why:** Cursor-based pagination requires going through pages sequentially

### Cursors Reset on Sort/Search
- Going to Page 3
- Changing sort to "Top Gainers"
- Goes back to Page 1 with fresh cursors

**Why:** Different sorts have different orderings and cursors

### No Total Page Count
- We show "1 ... >" instead of "1 of 50"
- **Why:** Cursor-based pagination doesn't provide total count
- We rely on `hasNextPage` to know if there's more

---

## Summary

✅ **Fixed:** Pagination now shows different coins on each page
✅ **Method:** Using cursor-based pagination correctly
✅ **Performance:** Cursors cached per page
✅ **UX:** Next/Previous buttons work as expected

🎉 **Pagination is now fully functional!**


