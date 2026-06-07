import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  Building,
  User,
  Phone,
  MapPin
} from 'lucide-react'
import { PageTemplate } from './PageTemplate'
import {
  fetchSchoolsList,
  createSchool,
  updateSchool,
  deleteSchool,
  seedInitialData
} from '../lib/db'
import type { School } from '../lib/db'
import { useToast } from '../providers/ToastProvider'
import { ConfirmationDialog } from '../components/ConfirmationDialog'

// Zod Schema for School Form
const schoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters'),
  udiseCode: z.string().length(11, 'UDISE code must be exactly 11 digits').regex(/^\d+$/, 'UDISE code must contain only numbers'),
  headmasterName: z.string().min(3, 'Headmaster name must be at least 3 characters'),
  phoneNumber: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d+$/, 'Phone number must contain only numbers'),
  block: z.string().min(2, 'Block is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  isActive: z.boolean()
})

type SchoolFormValues = z.infer<typeof schoolSchema>

export function SchoolsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // State Management
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const sortBy = 'name'
  const sortOrder = 'asc'

  // Pagination State
  const [page, setPage] = useState(1)
  const [cursors, setCursors] = useState<Record<number, any>>({})
  const pageSize = 5

  // Modals & Panels State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      udiseCode: '',
      headmasterName: '',
      phoneNumber: '',
      block: '',
      address: '',
      isActive: true
    }
  })

  // Seed DB if empty trigger
  const [seeding, setSeeding] = useState(false)
  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedInitialData()
      toast('Database seeded with standard schools and items!', 'success')
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    } catch (err) {
      toast('Failed to seed database.', 'error')
    } finally {
      setSeeding(false)
    }
  }

  // Fetching data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schools', search, status, sortBy, sortOrder, page, cursors[page - 1]],
    queryFn: () => fetchSchoolsList({
      searchQuery: search,
      statusFilter: status,
      sortBy,
      sortOrder,
      pageSize,
      lastVisibleDoc: cursors[page - 1] || null
    })
  })

  // Reset page when search or status filters change
  useEffect(() => {
    setPage(1)
    setCursors({})
  }, [search, status, sortBy, sortOrder])

  // Handle Next Page
  const handleNextPage = () => {
    if (data?.hasMore && data?.lastVisibleDoc) {
      setCursors(prev => ({ ...prev, [page]: data.lastVisibleDoc }))
      setPage(prev => prev + 1)
    }
  }

  // Handle Prev Page
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createSchool,
    onSuccess: () => {
      toast('School added successfully!', 'success')
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      setIsFormOpen(false)
      reset()
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to add school.', 'error')
    }
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SchoolFormValues> }) => updateSchool(id, data),
    onSuccess: () => {
      toast('School updated successfully!', 'success')
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      setIsFormOpen(false)
      setSelectedSchool(null)
      reset()
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to update school.', 'error')
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      toast('School deleted successfully (soft-deleted)!', 'success')
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      setDeleteId(null)
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to delete school.', 'error')
      setDeleteId(null)
    }
  })

  // Form Submit Handler
  const onSubmitForm = (values: SchoolFormValues) => {
    if (selectedSchool) {
      updateMutation.mutate({ id: selectedSchool.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  // Open Edit Form Panel
  const handleEditClick = (school: School) => {
    setSelectedSchool(school)
    reset({
      name: school.name,
      udiseCode: school.udiseCode,
      headmasterName: school.headmasterName,
      phoneNumber: school.phoneNumber,
      block: school.block,
      address: school.address,
      isActive: school.isActive
    })
    setIsFormOpen(true)
  }

  // Open Create Form Panel
  const handleCreateClick = () => {
    setSelectedSchool(null)
    reset({
      name: '',
      udiseCode: '',
      headmasterName: '',
      phoneNumber: '',
      block: '',
      address: '',
      isActive: true
    })
    setIsFormOpen(true)
  }

  // Open View details drawer
  const handleViewDetails = (school: School) => {
    setSelectedSchool(school)
    setIsDetailsOpen(true)
  }

  const handleCancelForm = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
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
        title="Schools"
        description="Manage educational institutions and verify active schools"
      >
      {/* Top action / filter panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex flex-1 gap-3 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by school name or UDISE..."
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
            title="Pre-populate database with dummy schools and items"
          >
            <Database size={14} />
            {seeding ? 'Seeding...' : 'Seed Initial Data'}
          </button>

          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add School
          </button>
        </div>
      </div>

      { }
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-slate-100 rounded-lg animate-pulse w-1/4"></div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-500 font-semibold text-sm">
            Failed to load schools data. Please check connection.
          </div>
        ) : !data || data.schools.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Building size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No schools found</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Try refining search parameters or seed initial data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4 pl-6">School Name</th>
                  <th className="p-4">UDISE Code</th>
                  <th className="p-4">Headmaster</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Block</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {data.schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800">{school.name}</td>
                    <td className="p-4 text-slate-500 font-mono">{school.udiseCode}</td>
                    <td className="p-4 text-slate-600">{school.headmasterName}</td>
                    <td className="p-4 text-slate-500">{school.phoneNumber}</td>
                    <td className="p-4 text-slate-600">{school.block}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${school.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${school.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right relative">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(school)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEditClick(school)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(school.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.schools.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Page <span className="text-slate-700 font-bold">{page}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-650 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNextPage}
                disabled={!data?.hasMore}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-650 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>

      {/* School Form Modal */}
      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={handleCancelForm}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-xl z-10 animate-scale-in max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">
                {selectedSchool ? 'Edit School Details' : 'Add New School'}
              </h2>
              <button
                onClick={handleCancelForm}
                className="p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">School Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. Model Primary School"
                />
                {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">UDISE Code (11 digits)</label>
                  <input
                    type="text"
                    maxLength={11}
                    {...register('udiseCode')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                    placeholder="e.g. 27120300101"
                  />
                  {errors.udiseCode && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.udiseCode.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Block</label>
                  <input
                    type="text"
                    {...register('block')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="e.g. Block A"
                  />
                  {errors.block && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.block.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Headmaster Name</label>
                  <input
                    type="text"
                    {...register('headmasterName')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="e.g. John Doe"
                  />
                  {errors.headmasterName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.headmasterName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    {...register('phoneNumber')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="e.g. 9876543210"
                  />
                  {errors.phoneNumber && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Address</label>
                <textarea
                  rows={2}
                  {...register('address')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  placeholder="Enter physical address..."
                />
                {errors.address && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.address.message}</p>}
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-250 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark this school as Active
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 py-3 border border-slate-200 text-slate-655 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-bold text-xs shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* School Details Modal */}
      {isDetailsOpen && selectedSchool ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDetailsOpen(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl z-10 animate-scale-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">School Profile</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">UDISE: {selectedSchool.udiseCode}</p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Building className="text-indigo-600 flex-shrink-0" size={18} />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Institution Name</span>
                  <span className="text-slate-800 font-bold">{selectedSchool.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <User className="text-indigo-600 flex-shrink-0" size={18} />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Headmaster / Principal</span>
                  <span className="text-slate-800 font-bold">{selectedSchool.headmasterName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Phone className="text-indigo-600 flex-shrink-0" size={18} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Contact Number</span>
                    <span className="text-slate-800 font-bold">{selectedSchool.phoneNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin className="text-indigo-600 flex-shrink-0" size={18} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Block Location</span>
                    <span className="text-slate-800 font-bold">{selectedSchool.block}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Postal Address</span>
                <p className="text-slate-700 leading-normal">{selectedSchool.address}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Status</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${selectedSchool.isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                  {selectedSchool.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsDetailsOpen(false)
                  handleEditClick(selectedSchool)
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-bold text-xs transition-all shadow-sm shadow-indigo-100"
              >
                Edit School
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteId !== null}
        title="Confirm Soft Delete"
        message="Are you sure you want to deactivate/delete this school? You can reactivate it later from the Status filter."
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
