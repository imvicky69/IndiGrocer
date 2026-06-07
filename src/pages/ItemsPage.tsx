import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X, 
  Database,
  ShoppingBag,
  Percent
} from 'lucide-react'
import { PageTemplate } from './PageTemplate'
import { 
  fetchItemsList, 
  createItem, 
  updateItem, 
  deleteItem, 
  seedInitialData
} from '../lib/db'
import type { Item } from '../lib/db'
import { useToast } from '../providers/ToastProvider'
import { ConfirmationDialog } from '../components/ConfirmationDialog'

// Zod validation schema
const itemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  unit: z.enum(['kg', 'liter', 'unit']),
  isGstApplicable: z.boolean(),
  gstPercentage: z.number().nullable().optional(),
  isActive: z.boolean()
}).refine((data) => {
  if (data.isGstApplicable && (data.gstPercentage === undefined || data.gstPercentage === null)) {
    return false
  }
  return true
}, {
  message: 'GST percentage is required when GST is enabled',
  path: ['gstPercentage']
})

type ItemFormValues = z.infer<typeof itemSchema>

export function ItemsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Filters State
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Modals & confirmation State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty }
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      unit: 'kg',
      isGstApplicable: false,
      gstPercentage: null,
      isActive: true
    }
  })

  // Watch GST fields to perform conditional logic
  const isGstApplicable = useWatch({
    control,
    name: 'isGstApplicable'
  })

  // Reset GST percentage to null when disabled
  useEffect(() => {
    if (!isGstApplicable) {
      setValue('gstPercentage', null)
    }
  }, [isGstApplicable, setValue])

  // Fetching Items List
  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['items', search, status],
    queryFn: () => fetchItemsList({ searchQuery: search, statusFilter: status })
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      toast('Item added successfully!', 'success')
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setIsFormOpen(false)
      reset()
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to add item.', 'error')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemFormValues> }) => updateItem(id, data),
    onSuccess: () => {
      toast('Item updated successfully!', 'success')
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setIsFormOpen(false)
      setSelectedItem(null)
      reset()
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to update item.', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      toast('Item deactivated successfully (soft-deleted)!', 'success')
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setDeleteId(null)
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to delete item.', 'error')
      setDeleteId(null)
    }
  })

  // Seed DB trigger
  const [seeding, setSeeding] = useState(false)
  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedInitialData()
      toast('Database seeded successfully!', 'success')
      queryClient.invalidateQueries({ queryKey: ['items'] })
    } catch (err) {
      toast('Failed to seed database.', 'error')
    } finally {
      setSeeding(false)
    }
  }

  const onSubmitForm = (values: ItemFormValues) => {
    // Force set gstPercentage to null if not applicable
    const payload = {
      ...values,
      gstPercentage: values.isGstApplicable ? Number(values.gstPercentage) : null
    }

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleEditClick = (item: Item) => {
    setSelectedItem(item)
    reset({
      name: item.name,
      unit: item.unit,
      isGstApplicable: item.isGstApplicable,
      gstPercentage: item.gstPercentage,
      isActive: item.isActive
    })
    setIsFormOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedItem(null)
    reset({
      name: '',
      unit: 'kg',
      isGstApplicable: false,
      gstPercentage: null,
      isActive: true
    })
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Discard?')) {
        setIsFormOpen(false)
        reset()
      }
    } else {
      setIsFormOpen(false)
      reset()
    }
  }

  return (
    <>
      <PageTemplate
        title="Items & Inventory"
        description="Manage grocery products, unit designations, and GST brackets"
      >
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex flex-1 gap-3 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search grocery items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <Filter className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" size={12} />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Database size={14} />
            {seeding ? 'Seeding...' : 'Seed Data'}
          </button>

          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Item
          </button>
        </div>
      </div>

      {/* Items List Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 h-40 animate-pulse"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-rose-500 text-sm font-semibold">
          Failed to fetch grocery items. Please check connection.
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No items registered</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">Add items manually or seed mock inventory to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 hover:border-slate-350/60 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
            >
              {/* Top Row: Info & Actions */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-sm font-bold text-slate-800 leading-snug truncate group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg uppercase">
                    Per {item.unit}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {item.isGstApplicable && item.gstPercentage !== null ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      <Percent size={10} />
                      GST: {item.gstPercentage}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-450 border border-slate-150">
                      GST Exempt
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-slate-100/70">
                <button
                  onClick={() => handleEditClick(item)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Edit"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTemplate>

      {/* Item Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={handleCancelForm}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl z-10 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-800">
                {selectedItem ? 'Edit Grocery Item' : 'Create New Item'}
              </h2>
              <button
                onClick={handleCancelForm}
                className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Item Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. Fine Sugar"
                />
                {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Unit Type</label>
                <select
                  {...register('unit')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="liter">Liter (liter)</option>
                  <option value="unit">Unit (unit)</option>
                </select>
                {errors.unit && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.unit.message}</p>}
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">GST Applicable</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Toggle if GST applies to this item</span>
                </div>
                <input
                  type="checkbox"
                  {...register('isGstApplicable')}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-250 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Conditional GST Percentage Selection */}
              {isGstApplicable && (
                <div className="animate-slide-in">
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">GST Percentage</label>
                  <select
                    {...register('gstPercentage', { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Select GST Rate</option>
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                  {errors.gstPercentage && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.gstPercentage.message}</p>}
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="itemActive"
                  {...register('isActive')}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-250 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="itemActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark this item as Active / Available
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Deactivate Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteId !== null}
        title="Confirm Soft Delete"
        message="Are you sure you want to deactivate this item? It will be archived and hidden from active billing selections."
        confirmText="Deactivate"
        isDangerous={true}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
