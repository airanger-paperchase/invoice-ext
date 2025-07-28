import React from "react"

export function Alert({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  return (
    <div className={`border rounded p-4 mb-2 ${variant === "destructive" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300 bg-white"}`}>
      {children}
    </div>
  )
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
} 