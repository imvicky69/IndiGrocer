import { PageTemplate } from './PageTemplate'

export function ItemsPage() {
  return (
    <PageTemplate
      title="Items"
      description="Manage inventory items and products"
    >
      <div className="flex flex-col items-center justify-center min-h-[350px] border border-dashed border-slate-200/80 rounded-2xl bg-white p-8 animate-slide-in">
        <p className="text-slate-400 font-bold text-sm tracking-tight">This page will be here</p>
      </div>
    </PageTemplate>
  )
}
