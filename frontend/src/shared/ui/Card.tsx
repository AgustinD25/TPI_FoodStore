import type { HTMLAttributes } from 'react'

function Card({ className = '', ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}
      {...resto}
    />
  )
}

export default Card
