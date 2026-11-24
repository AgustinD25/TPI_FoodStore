import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  onClose: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

// Se monta solo mientras está abierto (el padre lo renderiza condicionalmente): así los
// formularios internos arrancan siempre con sus valores iniciales.
function Modal({ titulo, onClose, children, ancho = 'md' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white p-6 shadow-xl ${
          ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <h2 className="text-xl font-semibold text-slate-800">{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal
