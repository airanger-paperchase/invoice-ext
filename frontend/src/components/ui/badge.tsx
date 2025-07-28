import React from "react"

export function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${variant === "destructive" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-800"} ${className}`}>
      {children}
    </span>
  )
}

export default Badge; 