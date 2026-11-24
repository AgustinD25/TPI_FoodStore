interface SkeletonProps {
  className?: string
}

// Bloque gris animado que ocupa el lugar del contenido mientras se cargan los datos.
function Skeleton({ className = '' }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export default Skeleton
