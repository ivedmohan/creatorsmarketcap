# 🔍 Smart Search Feature

## ✨ Search Now Understands Multiple Formats!

The search bar is now **super smart** - it automatically detects what you're searching for and acts accordingly!

---

## 🎯 Search Types

### 1. **Direct Coin by Contract Address**
Paste a full contract address → Auto-redirects to coin page

**Format:** `0x` + 40 hex characters (42 total)

**Example:**
```
0x42C04Ec942A42673360C314d3d1b4aE74a71ef74
```

**What Happens:**
- ✅ Detects it's a full contract address
- 🔄 Shows "Opening coin..." with spinner
- ➡️ Redirects to `/coin/0x42C04...`
- 🎯 Works for ANY coin on Base!

---

### 2. **Search by Creator Username** 🆕
Use @ symbol to search for coins by creator

**Format:** `@username`

**Examples:**
```
@zorothebuilder
@creator123
@john
```

**What Happens:**
- ✅ Detects @ symbol
- 🔍 Searches for coins where creator name/handle matches
- 📋 Shows all matching coins in the table

**Note:** Currently searches by creator address and coin metadata. Creator usernames from Talent Protocol will be added soon!

---

### 3. **Search by Coin Name**
Type any text → Searches coin names

**Examples:**
```
dege
builder
zora
```

**What Happens:**
- 🔍 Searches through top 100 coins
- ✅ Matches coin names
- ✅ Matches coin symbols
- 📋 Shows results

---

### 4. **Search by Creator Address**
Partial or full wallet address → Searches creator addresses

**Format:** `0x` + any length

**Examples:**
```
0xccfbf81c0363671a72ea0efeb080374ddd0c18f7  (full address)
0xccfbf  (partial)
```

**What Happens:**
- 🔍 If exactly 42 chars → redirects to coin page
- 🔍 If less than 42 chars → searches creator addresses
- 📋 Shows coins created by matching addresses

---

## 📝 Search Examples

### Example 1: Find Specific Coin
```
Input: 0xa4ecdc7704d21b5fe7305c680688d01808062a1b
Action: Auto-redirects to coin page ✨
```

### Example 2: Find Creator's Coins
```
Input: @zorothebuilder
Action: Shows all coins by "zorothebuilder" 🎨
```

### Example 3: Search by Name
```
Input: dege
Action: Shows "Dege coin" and similar 🔍
```

### Example 4: Search by Creator Address
```
Input: 0xccfbf81c0363671a72ea0efeb080374ddd0c18f7
Action: Shows all coins created by this address 👤
```

---

## 🎨 Visual Feedback

### When Redirecting (Contract Address):
```
[🔍] 0x42C04Ec...  [⟳ Opening coin...]
```
- Search box disabled
- Loading spinner
- Auto-clears after redirect

### When Searching (Other Types):
```
[🔍] @zorothebuilder  [Searching...]
```
- Normal search behavior
- Shows results below
- Can change sort while searching

---

## 💡 Pro Tips

### Tip 1: Quick Coin Access
Copy-paste full contract addresses for instant access - no need to search!

### Tip 2: Find Creator Coins
Use `@username` to quickly find all coins by a creator (when username data is available).

### Tip 3: Flexible Search
The search is smart! It works with:
- Full addresses
- Partial addresses
- Names
- Symbols
- Usernames (with @)

### Tip 4: Combined Search
You can even search partial addresses like `0x42C04` and it will match:
- Coin contracts starting with 0x42C04
- Creator addresses starting with 0x42C04
- Names/symbols containing "0x42C04"

---

## 🔧 How It Works

### Detection Logic:
```javascript
1. Full contract address (0x + 42 chars)
   → Auto-redirect to coin page

2. Starts with @ 
   → Search by creator username

3. Starts with 0x (but < 42 chars)
   → Search by partial address

4. Everything else
   → Search by name/symbol
```

### Smart Matching:
The API searches across:
- ✅ Coin name
- ✅ Coin symbol
- ✅ Creator address
- ✅ Contract address
- ✅ Creator metadata (when available)

---

## 📊 Search Scope

### What's Searched:
- **Direct Address:** ANY coin on Base (unlimited)
- **Name/Symbol:** Top 100 coins (based on current sort)
- **Creator Search:** Top 100 coins (filtered by creator)

### Sorting Affects Results:
- Sort by "Most Valuable" → searches top 100 valuable coins
- Sort by "Top Gainers" → searches top 100 gainers
- etc.

---

## 🚀 Coming Soon

### Future Enhancements:
1. **Talent Protocol Integration**
   - Real creator usernames
   - Creator profiles
   - Social links

2. **Full Database Search**
   - Search ALL coins (not just top 100)
   - Index by creator
   - Index by name/symbol

3. **Advanced Filters**
   - Filter by creator
   - Filter by chain
   - Filter by date

---

## 📱 Usage Guide

### On Desktop:
1. Click search bar
2. Start typing or paste address
3. See instant results or auto-redirect

### On Mobile:
1. Tap search bar
2. Type or paste
3. Results appear below

---

## Summary

✅ **4 Search Types Supported:**
1. Full contract address → Auto-redirect
2. @username → Creator search
3. Partial address → Address search
4. Text → Name/symbol search

✅ **Smart Detection:**
- Automatically understands your intent
- No need to select search type
- Just paste/type and go!

✅ **Fast & Responsive:**
- 500ms debounce
- Instant redirect for addresses
- Cached results

---

## Test It Now!

Try these searches:

1. **Direct Access:**
   ```
   0x42C04Ec942A42673360C314d3d1b4aE74a71ef74
   ```

2. **Creator Search:**
   ```
   @zorothebuilder
   ```

3. **Name Search:**
   ```
   dege
   ```

4. **Partial Address:**
   ```
   0xccfbf
   ```

🎉 **Your search is now super powered!** 🎉


