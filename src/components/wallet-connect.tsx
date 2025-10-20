"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet } from "lucide-react"

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="gap-2 bg-gradient-to-r from-primary to-chart-4 hover:opacity-90"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    Wrong network
                  </Button>
                )
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/40 bg-transparent">
                      <Wallet className="w-4 h-4" />
                      {account.displayName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card border-border">
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(account.address)}>
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/profile/${account.address}`, "_blank")}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openAccountModal} className="text-destructive">
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
