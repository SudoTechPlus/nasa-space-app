// components/ui/gauge.tsx
"use client"

import * as React from "react"

interface GaugeProps {
  value: number
  size?: "sm" | "md" | "lg" | "full"
  strokeWidth?: number
  valueFormatter?: (value: number) => string
}

export function Gauge({ 
  value, 
  size = "md", 
  strokeWidth = 8,
  valueFormatter 
}: GaugeProps) {
  const sizeClass = {
    sm: "w-32 h-32",
    md: "w-48 h-48", 
    lg: "w-64 h-64",
    full: "w-full h-full"
  }[size]

  const normalizedValue = Math.min(100, Math.max(0, value))
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference

  const getGaugeColor = (val: number) => {
    if (val <= 33) return "#00E400" // Green
    if (val <= 66) return "#FFFF00" // Yellow
    if (val <= 85) return "#FF7E00" // Orange
    return "#FF0000" // Red
  }

  return (
    <div className={`relative ${sizeClass}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Value circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={getGaugeColor(normalizedValue)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold">
            {valueFormatter ? valueFormatter(value) : `${Math.round(value)}%`}
          </div>
        </div>
      </div>
    </div>
  )
}

export function GaugeContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}