import type { ReactNode } from 'react'

interface PageTemplateProps {
  title: string
  description: string
  children: ReactNode
}

export function PageTemplate({ title, description, children }: PageTemplateProps) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-slide-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">{description}</p>
      </div>
      {children}
    </div>
  )
}
