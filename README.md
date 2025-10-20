# Creator Coins Dashboard (CMC)

A CoinMarketCap-style platform for creator coins on Base blockchain, featuring Zora integration and Talent Protocol trust scoring.

## 🚀 Overview

This platform aggregates and displays creator coins from the Zora ecosystem on Base blockchain, combining market data visualization with trust scoring through Talent Protocol integration. Users can discover trending creator coins, verify ownership, and build trust scores.

## ✨ Features

### 🔥 Currently Working
- **Creator Coins Discovery** - Browse and search creator coins on Base
- **Market Data** - Real-time price, market cap, volume, and holder information
- **Coin Details** - Comprehensive coin information with metadata and creator profiles
- **Multiple Sorting Options** - Top gainers, most valuable, new coins, trending, etc.
- **Ownership Verification** - Claim and verify coin ownership via wallet signatures
- **Profile Integration** - Zora profile data with social accounts and created coins
- **Trust Scoring Foundation** - Talent Protocol integration (requires API key)

### 🔮 Planned Features
- **Frontend Dashboard** - React UI with tables, charts, and interactive elements
- **Wallet Integration** - Connect wallet for claiming and verification
- **Advanced Filtering** - Filter by trust score, creator verification, etc.
- **Real-time Updates** - Live price updates and notifications

## 🛠 Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi, Viem, RainbowKit
- **APIs**: Zora Protocol SDK, Talent Protocol API
- **Database**: Supabase (PostgreSQL)
- **Caching**: In-memory + Local Storage
- **Charts**: Chart.js with react-chartjs-2

## 📡 API Endpoints

### Zora Integration (✅ Working)

#### `GET /api/coins`
Fetch creator coins with various sorting options
```bash
# Get most valuable coins
curl "http://localhost:3000/api/coins?sortBy=mostValuable&limit=10"

# Get top gainers
curl "http://localhost:3000/api/coins?sortBy=topGainers&limit=5"

# Search coins
curl "http://localhost:3000/api/coins?search=base&limit=5"
```

**Parameters:**
- `sortBy`: `mostValuable`, `topGainers`, `topVolume`, `new`, `recentlyTraded`, `creators`, `valuableCreators`
- `limit`: Number of results (default: 20)
- `page`: Page number for pagination
- `search`: Search by name, symbol, or creator address

#### `GET /api/coins/[address]`
Get detailed information about a specific coin
```bash
# Basic coin info
curl "http://localhost:3000/api/coins/0xd769d56f479e9e72a77bb1523e866a33098feec5"

# Include holders, swaps, and comments
curl "http://localhost:3000/api/coins/0xd769d56f479e9e72a77bb1523e866a33098feec5?includeDetails=true"
```

#### `GET /api/coins/trending`
Get trending coins (combination of top gainers and high volume)
```bash
curl "http://localhost:3000/api/coins/trending?count=10"
```

#### `GET /api/profile/[address]`
Get user profile and created coins
```bash
# Basic profile
curl "http://localhost:3000/api/profile/0x19ff7ea0badffa183f03533c3884f9ca03145aad"

# Include created coins
curl "http://localhost:3000/api/profile/0x19ff7ea0badffa183f03533c3884f9ca03145aad?includeCoins=true"
```

### Ownership Verification (✅ Working)

#### `GET /api/verify-ownership`
Check ownership status for a coin
```bash
# Check all claims for a coin
curl "http://localhost:3000/api/verify-ownership?coinAddress=0xd769d56f479e9e72a77bb1523e866a33098feec5"

# Check specific user claim
curl "http://localhost:3000/api/verify-ownership?coinAddress=0xd769d56f479e9e72a77bb1523e866a33098feec5&userAddress=0x123..."
```

#### `POST /api/verify-ownership`
Verify coin ownership with wallet signature
```bash
curl -X POST "http://localhost:3000/api/verify-ownership" \
  -H "Content-Type: application/json" \
  -d '{
    "coinAddress": "0xd769d56f479e9e72a77bb1523e866a33098feec5",
    "userAddress": "0x19ff7ea0badffa183f03533c3884f9ca03145aad",
    "signature": "0x...",
    "message": "I am claiming ownership of coin 0xd769d56f479e9e72a77bb1523e866a33098feec5 with my wallet 0x19ff7ea0badffa183f03533c3884f9ca03145aad"
  }'
```

### Talent Protocol Integration (🔑 Requires API Key)

#### `GET /api/talent/score`
Get builder scores for trust calculation
```bash
# Single address
curl "http://localhost:3000/api/talent/score?address=0x123..."

# Multiple addresses
curl "http://localhost:3000/api/talent/score?addresses=0x123...,0x456..."

# Force refresh cache
curl "http://localhost:3000/api/talent/score?address=0x123...&forceRefresh=true"
```

#### `POST /api/talent/connect`
Connect Talent Protocol profile
```bash
curl -X POST "http://localhost:3000/api/talent/connect" \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x123...",
    "signature": "0x...",
    "message": "I want to connect my Talent Protocol profile to address 0x123..."
  }'
```

#### `GET /api/talent/connect`
Check Talent Protocol connection status
```bash
curl "http://localhost:3000/api/talent/connect?userAddress=0x123..."
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd cmc

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables
```bash
# Required for Talent Protocol (get from https://docs.talentprotocol.com)
TALENT_API_KEY=your_talent_protocol_api_key_here

# Optional: Zora API Key for production usage
ZORA_API_KEY=your_zora_api_key_here

# Next.js App URL
NEXTAUTH_URL=http://localhost:3000

# Optional: Custom RPC URL for Base chain
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Data Models

### CreatorCoin
```typescript
interface CreatorCoin {
  id: string
  name: string
  symbol: string
  creatorAddress: string
  contractAddress: string
  chainId: number
  currentPrice: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  holders: number
  trustScore?: number
  isVerified: boolean
  isClaimed: boolean
  metadata: {
    description?: string
    image?: string
    externalUrl?: string
  }
}
```

### BuilderScore (Talent Protocol)
```typescript
interface BuilderScore {
  score: number
  rank: number
  verified: boolean
  components: {
    onChainActivity: number
    githubActivity: number
    socialCredibility: number
  }
}
```

## 🧪 Testing

### Test API Endpoints
```bash
# Test Zora integration
curl "http://localhost:3000/api/coins?limit=5"

# Test specific coin
curl "http://localhost:3000/api/coins/0xd769d56f479e9e72a77bb1523e866a33098feec5"

# Test profile
curl "http://localhost:3000/api/profile/0x19ff7ea0badffa183f03533c3884f9ca03145aad"

# Test ownership verification (GET)
curl "http://localhost:3000/api/verify-ownership?coinAddress=0xd769d56f479e9e72a77bb1523e866a33098feec5"
```

### Test Results ✅
- **Zora API**: Successfully fetching real creator coins from Base
- **Market Data**: Getting accurate price, volume, market cap data
- **Coin Details**: Complete metadata and creator information
- **Profile Data**: User profiles with social accounts and created coins
- **Ownership Verification**: Basic verification flow working
- **Talent Protocol**: Framework ready (needs API key for full testing)

## 🏗 Architecture

### Backend Structure
```
src/
├── app/api/                 # Next.js API routes
│   ├── coins/              # Coin-related endpoints
│   ├── talent/             # Talent Protocol endpoints
│   ├── verify-ownership/   # Ownership verification
│   └── profile/            # User profile endpoints
├── lib/                    # Core libraries
│   ├── zora.ts            # Zora SDK integration
│   ├── talent.ts          # Talent Protocol client
│   ├── database.ts        # Database utilities
│   ├── localStorage.ts    # Caching utilities
│   └── dataTransforms.ts  # Data transformation
└── types/                 # TypeScript interfaces
```

### Key Features
- **Caching**: In-memory caching for API responses (5 min for coins, 1 hour for scores)
- **Error Handling**: Comprehensive error handling with graceful degradation
- **Rate Limiting**: Respect external API limits with delays and batching
- **Data Transformation**: Convert external API responses to consistent interfaces
- **Background Jobs**: Automated score refresh and cache maintenance

## 🔮 Next Steps

### Frontend Development
1. **Dashboard UI** - Create responsive tables and charts
2. **Wallet Integration** - Add wallet connection with RainbowKit
3. **Coin Detail Pages** - Individual coin pages with charts and activity
4. **Search & Filters** - Advanced filtering and search functionality
5. **User Profiles** - User dashboard for claimed coins and scores

### Backend Enhancements
1. **Real-time Updates** - WebSocket integration for live data
2. **Advanced Caching** - Redis integration for production
3. **Database Migration** - Move from localStorage to proper database
4. **API Rate Limiting** - Implement proper rate limiting middleware
5. **Monitoring** - Add logging and monitoring for production

### Integration
1. **Talent Protocol API Key** - Get API key for full trust scoring
2. **Zora API Key** - Add API key for production rate limits
3. **Trading Integration** - Add Zora trading functionality (future)
4. **Notifications** - Price alerts and activity notifications

## 📝 API Key Setup

### Talent Protocol API Key
1. Visit [Talent Protocol Docs](https://docs.talentprotocol.com)
2. Sign up for an account
3. Generate API key from developer settings
4. Add to `.env.local` as `TALENT_API_KEY`

### Zora API Key (Optional)
1. Visit [Zora Developer Settings](https://zora.co/settings/developer)
2. Create API key
3. Add to `.env.local` as `ZORA_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Status**: Backend Complete ✅ | Frontend In Progress 🚧 | Production Ready 🔄

Built with ❤️ for the Base ecosystem and creator economy.# creatorsmarketcap
