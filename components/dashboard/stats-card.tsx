'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'zinc'
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'indigo',
}: StatsCardProps) {
  
  const iconColorMap = {
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50',
    zinc: 'text-zinc-600 bg-zinc-50',
  }

  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-xl hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          iconColorMap[color]
        )}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md",
            changeType === 'positive' && "bg-emerald-50 text-emerald-700",
            changeType === 'negative' && "bg-rose-50 text-rose-700",
            changeType === 'neutral' && "bg-zinc-50 text-zinc-600"
          )}>
            {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>

      <p className="text-[13px] font-medium text-zinc-500 mb-0.5">{title}</p>
      <p className="text-2xl font-bold tracking-tight text-zinc-900">{value}</p>
    </div>
  )
}
