import React from "react"

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full divide-y divide-gray-200">{children}</table>
}
export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}
export function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 ${className}`}>{children}</td>
}
export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 text-left ${className}`}>{children}</th>
}
export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>
}
export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={className}>{children}</tr>
} 