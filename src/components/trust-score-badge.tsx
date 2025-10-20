import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrustScoreBadgeProps {
  score: number
  showDetails?: boolean
}

export function TrustScoreBadge({ score, showDetails = false }: TrustScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 border-green-500/40"
    if (score >= 60) return "text-yellow-500 border-yellow-500/40"
    return "text-red-500 border-red-500/40"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <ShieldCheck className="w-3 h-3" />
    if (score >= 60) return <Shield className="w-3 h-3" />
    return <ShieldAlert className="w-3 h-3" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High Trust"
    if (score >= 60) return "Medium Trust"
    return "Low Trust"
  }

  if (showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`gap-1 ${getScoreColor(score)}`}>
              {getScoreIcon(score)}
              {score}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="glass-card border-border">
            <div className="space-y-1">
              <p className="font-semibold">{getScoreLabel(score)}</p>
              <p className="text-xs text-muted-foreground">
                Based on Talent Protocol builder score, GitHub activity, and on-chain reputation
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Badge variant="outline" className={`gap-1 ${getScoreColor(score)}`}>
      {getScoreIcon(score)}
      {score}
    </Badge>
  )
}