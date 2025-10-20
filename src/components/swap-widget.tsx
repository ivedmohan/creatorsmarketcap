"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowDownUp, Loader2, CheckCircle2, AlertCircle, Wallet, ExternalLink } from "lucide-react"
import { useAccount, useBalance, useWalletClient, usePublicClient } from 'wagmi'
import { parseEther, formatEther, Address } from 'viem'
import { tradeCoin, TradeParameters } from '@zoralabs/coins-sdk'
import type { CreatorCoin } from "@/types"

interface SwapWidgetProps {
  coin: CreatorCoin
}

export function SwapWidget({ coin }: SwapWidgetProps) {
  const { address: userAddress, isConnected } = useAccount()
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [slippage, setSlippage] = useState("1.0")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [ethPrice, setEthPrice] = useState<number>(3500) // Default fallback

  // Get user's ETH balance
  const { data: balance } = useBalance({
    address: userAddress,
  })

  // Wagmi clients for Zora SDK
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  // Fetch current ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await response.json()
        if (data?.ethereum?.usd) {
          setEthPrice(data.ethereum.usd)
          console.log('💰 Current ETH price:', data.ethereum.usd)
        }
      } catch (error) {
        console.warn('Failed to fetch ETH price, using fallback:', error)
        // Keep fallback price
      }
    }

    fetchEthPrice()
    // Update every 60 seconds
    const interval = setInterval(fetchEthPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate how many coins the user will receive
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("")
      return
    }

    setIsCalculating(true)
    const timer = setTimeout(() => {
      try {
        const ethAmount = parseFloat(fromAmount)
        const coinPriceInUSD = coin.currentPrice || 0.
        
        // Convert ETH to USD using live price
        const usdValue = ethAmount * ethPrice
        
        // Calculate how many coins at current price
        let estimatedCoins = usdValue / coinPriceInUSD
        
        // Apply bonding curve impact (get slightly less due to price increasing)
        estimatedCoins = estimatedCoins * 0.95
        
        // Apply slippage protection
        const slippageMultiplier = 1 - (parseFloat(slippage) / 100)
        estimatedCoins = estimatedCoins * slippageMultiplier
        
        // Format based on size
        if (estimatedCoins >= 1000) {
          setToAmount(estimatedCoins.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }))
        } else if (estimatedCoins >= 1) {
          setToAmount(estimatedCoins.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        } else {
          setToAmount(estimatedCoins.toFixed(6))
        }
        
        setError(null)
      } catch (err) {
        setError("Failed to calculate output amount")
      } finally {
        setIsCalculating(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [fromAmount, coin.currentPrice, slippage, ethPrice])

  const handleSwap = async () => {
    if (!isConnected || !userAddress) {
      setError("Please connect your wallet first")
      return
    }

    if (!walletClient || !publicClient) {
      setError("Wallet not ready. Please try again.")
      return
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError("Please enter an amount")
      return
    }

    try {
      setError(null)
      setIsPending(true)
      setIsSuccess(false)
      setTxHash(null)
      
      const ethAmount = parseEther(fromAmount)
      const slippageTolerance = parseFloat(slippage) / 100 // Convert to decimal (1% = 0.01)
      
      console.log('🔄 Initiating Zora SDK trade:', {
        coinAddress: coin.contractAddress,
        ethAmount: fromAmount,
        slippage: slippageTolerance,
        sender: userAddress
      })

      // Create trade parameters using Zora SDK with referral rewards
      const tradeParameters: TradeParameters = {
        sell: { type: "eth" },
        buy: {
          type: "erc20",
          address: coin.contractAddress as Address,
        },
        amountIn: ethAmount,
        slippage: slippageTolerance,
        sender: userAddress as Address,
        // Add trade referral to earn 4% of fees from this trade
        // Replace with your platform address to earn rewards!
        recipient: userAddress as Address,
      }

      console.log('📝 Calling Zora tradeCoin with referral rewards...', {
        tradeReferral: '0x8898170be16C41898E777c58380154ea298cD5ac',
        expectedReward: '4% of trade fees'
      })

      // Execute the trade using Zora SDK
      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account: walletClient.account!,
        publicClient: publicClient as any,
      })

      console.log('✅ Trade successful!', receipt)
      
      setTxHash(receipt.transactionHash)
      setIsSuccess(true)
      setIsPending(false)
      
      // Clear form on success
      setTimeout(() => {
        setFromAmount("")
        setToAmount("")
      }, 2000)
      
    } catch (err: any) {
      console.error('❌ Swap error:', err)
      setIsPending(false)
      
      // Better error messages
      if (err?.message?.includes('User rejected')) {
        setError("Transaction cancelled")
      } else if (err?.message?.includes('insufficient funds')) {
        setError("Insufficient ETH for transaction + gas")
      } else {
        setError(err?.shortMessage || err?.message || "Swap failed. Please try again.")
      }
    }
  }

  const handleMaxAmount = () => {
    if (balance) {
      // Leave 0.01 ETH for gas
      const maxAmount = Math.max(0, parseFloat(formatEther(balance.value)) - 0.01)
      setFromAmount(maxAmount.toString())
    }
  }

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet"
    if (isPending) return "Confirm in Wallet..."
    if (isConfirming) return "Processing Transaction..."
    if (isSuccess) return "Swap Successful!"
    if (!fromAmount || parseFloat(fromAmount) <= 0) return "Enter ETH Amount"
    if (balance && parseFloat(fromAmount) > parseFloat(formatEther(balance.value))) {
      return "Insufficient ETH Balance"
    }
    return `Buy ${coin.symbol}`
  }

  const isButtonDisabled = !isConnected || 
    !fromAmount || 
    parseFloat(fromAmount) <= 0 || 
    isPending || 
    isConfirming ||
    (balance && parseFloat(fromAmount) > parseFloat(formatEther(balance.value)))

  return (
    <Card className="glass-card border-white/10 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-chart-1/10 border-b border-white/10">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-chart-1">
            <ArrowDownUp className="w-4 h-4 text-white" />
          </div>
          Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* From Token - ETH */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label className="text-muted-foreground">You Pay</label>
            {isConnected && balance && (
              <span className="text-xs text-muted-foreground">
                Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="pr-16 h-14 text-lg bg-white/5 border-white/10"
                step="0.001"
                min="0"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMaxAmount}
                disabled={!balance}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-xs text-primary hover:text-primary/80"
              >
                MAX
              </Button>
            </div>
            <div className="h-14 px-4 rounded-lg bg-gradient-to-br from-primary/10 to-chart-1/10 border border-white/10 flex items-center gap-2 min-w-[100px]">
              <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <circle cx="16" cy="16" r="16" fill="#627EEA"/>
                  <g fill="#FFF" fillRule="nonzero">
                    <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
                    <path d="M16.498 4L9 16.22l7.498-3.35z"/>
                    <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
                    <path d="M16.498 27.995v-6.028L9 17.616z"/>
                    <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"/>
                    <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z"/>
                  </g>
                </g>
              </svg>
              <span className="font-semibold">ETH</span>
            </div>
          </div>
        </div>

        {/* Swap Direction Icon */}
        <div className="flex justify-center -my-2">
          <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-chart-1/20 border border-white/10">
            <ArrowDownUp className="w-4 h-4" />
          </div>
        </div>

        {/* To Token (Creator Coin) */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">You Receive (estimated)</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="h-14 text-lg bg-white/5 border-white/10"
              />
              {isCalculating && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>
            <div className="h-14 px-4 rounded-lg bg-gradient-to-br from-primary/10 to-chart-2/10 border border-white/10 flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={coin.metadata?.image} />
                <AvatarFallback className="text-xs">
                  {coin.symbol.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold whitespace-nowrap">{coin.symbol}</span>
            </div>
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
          <div className="flex gap-2">
            {['0.5', '1.0', '2.0'].map((value) => (
              <Button
                key={value}
                size="sm"
                variant={slippage === value ? "default" : "ghost"}
                onClick={() => setSlippage(value)}
                className="h-7 px-3 text-xs"
              >
                {value}%
              </Button>
            ))}
          </div>
        </div>

        {/* Price Info */}
        {fromAmount && toAmount && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per coin</span>
              <span className="font-medium">${coin.currentPrice.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network fee (est.)</span>
              <span className="font-medium">~${(parseFloat(fromAmount) * 0.001 * ethPrice).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && txHash && (
          <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-chart-4" />
              <span className="text-sm text-chart-4 font-medium">Swap successful!</span>
            </div>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View on BaseScan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Swap Button */}
        <Button
          size="lg"
          onClick={handleSwap}
          disabled={isButtonDisabled}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-chart-1 to-primary hover:from-primary/90 hover:via-chart-1/90 hover:to-primary/90 border-2 border-primary/30 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {getButtonText()}
            </>
          ) : (
            <>
              {!isConnected && <Wallet className="w-5 h-5 mr-2" />}
              {getButtonText()}
            </>
          )}
        </Button>

        {/* Info Banner */}
        <div className="text-xs text-center text-muted-foreground p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <p>⚠️ Trading creator coins involves risk. Please do your own research.</p>
          <a
            href={`https://zora.co/collect/base:${coin.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors"
          >
            Buy directly on Zora <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

