import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">CreatorsMarketCap</h3>
            <p className="text-sm text-muted-foreground">
              The leading platform for tracking creator coins on Base blockchain.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/trending" className="hover:text-primary transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  All Coins
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Telegram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Developer</h4>
            <div className="text-sm">
              <p className="text-muted-foreground">Built for the Base ecosystem</p>
              <p className="text-muted-foreground mt-1">Creator coins dashboard</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 CreatorsMarketCap. Built for the Base ecosystem.</p>
        </div>
      </div>
    </footer>
  )
}