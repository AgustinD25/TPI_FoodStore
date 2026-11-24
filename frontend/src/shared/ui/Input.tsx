import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const CLASE_CAMPO =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none'

interface CampoProps {
  label?: string
  errores?: string[] // mensajes de validación (TanStack Form: field.state.meta.errors)
}

function Etiqueta({ label, errores = [], children }: CampoProps & { children: ReactNode }) {
  const mensajes = [...new Set(errores)]
  return (
    <label className="mt-4 block text-sm font-medium text-slate-700">
      {label}
      {children}
      {mensajes.map((mensaje) => (
        <p key={mensaje} className="mt-1 text-xs font-normal text-red-600">
          {mensaje}
        </p>
      ))}
    </label>
  )
}

export function Input({ label, errores, className = '', ...resto }: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Etiqueta label={label} errores={errores}>
      <input className={`${CLASE_CAMPO} ${className}`} {...resto} />
    </Etiqueta>
  )
}

export function Textarea({ label, errores, className = '', ...resto }: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Etiqueta label={label} errores={errores}>
      <textarea className={`${CLASE_CAMPO} ${className}`} {...resto} />
    </Etiqueta>
  )
}

export function Select({ label, errores, className = '', children, ...resto }: CampoProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Etiqueta label={label} errores={errores}>
      <select className={`${CLASE_CAMPO} ${className}`} {...resto}>
        {children}
      </select>
    </Etiqueta>
  )
}

export default Input
