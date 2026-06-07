import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

export interface School {
  id: string;
  name: string;
  udiseCode: string;
  headmasterName: string;
  phoneNumber: string;
  block: string;
  address: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Item {
  id: string;
  name: string;
  unit: 'kg' | 'liter' | 'unit';
  isGstApplicable: boolean;
  gstPercentage: number | null;
  isActive: boolean;
  createdAt: Timestamp;
}

// ==========================================
// SCHOOLS SERVICE
// ==========================================

export async function fetchSchoolsList({
  searchQuery,
  statusFilter,
  sortBy = 'name',
  sortOrder = 'asc',
  pageSize = 10,
  lastVisibleDoc
}: {
  searchQuery?: string;
  statusFilter?: 'all' | 'active' | 'inactive';
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  lastVisibleDoc?: any;
}) {
  const schoolsRef = collection(db, 'schools')

  // Build query constraints
  const constraints: any[] = []

  // Status Filter
  if (statusFilter === 'active') {
    constraints.push(where('isActive', '==', true))
  } else if (statusFilter === 'inactive') {
    constraints.push(where('isActive', '==', false))
  }

  // Ordering
  constraints.push(orderBy(sortBy, sortOrder))

  // Pagination cursor
  if (lastVisibleDoc) {
    constraints.push(startAfter(lastVisibleDoc))
  }

  // Query limit (fetch +1 to check for next page)
  constraints.push(limit(pageSize + 1))

  const q = query(schoolsRef, ...constraints)
  const querySnapshot = await getDocs(q)

  let docs = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as School[]

  // Real client-side text filtering for flexible name/UDISE searching
  // since Firestore doesn't support full-text search with complex compound queries easily
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase()
    docs = docs.filter(
      school =>
        school.name.toLowerCase().includes(queryLower) ||
        school.udiseCode.toLowerCase().includes(queryLower)
    )
  }

  const hasMore = docs.length > pageSize
  if (hasMore) {
    docs = docs.slice(0, pageSize)
  }

  const lastDoc = querySnapshot.docs[docs.length - 1] || null

  return {
    schools: docs,
    lastVisibleDoc: lastDoc,
    hasMore
  }
}

export async function getSchoolById(id: string): Promise<School | null> {
  const docRef = doc(db, 'schools', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as School
  }
  return null
}

export async function createSchool(schoolData: Omit<School, 'id' | 'createdAt'>) {
  const schoolsRef = collection(db, 'schools')
  const docRef = await addDoc(schoolsRef, {
    ...schoolData,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export async function updateSchool(id: string, schoolData: Partial<Omit<School, 'id' | 'createdAt'>>) {
  const docRef = doc(db, 'schools', id)
  await updateDoc(docRef, schoolData)
}

// Soft delete
export async function deleteSchool(id: string) {
  const docRef = doc(db, 'schools', id)
  await updateDoc(docRef, { isActive: false })
}

export async function fetchSchoolDashboardStats() {
  const schoolsRef = collection(db, 'schools')
  const querySnapshot = await getDocs(schoolsRef)
  const docs = querySnapshot.docs.map(doc => doc.data())

  const total = docs.length
  const active = docs.filter((d: any) => d.isActive === true).length
  const inactive = total - active

  return {
    total,
    active,
    inactive
  }
}

// ==========================================
// ITEMS SERVICE
// ==========================================

export async function fetchItemsList({
  searchQuery,
  statusFilter
}: {
  searchQuery?: string;
  statusFilter?: 'all' | 'active' | 'inactive';
} = {}) {
  const itemsRef = collection(db, 'items')
  let q = query(itemsRef, orderBy('name', 'asc'))

  if (statusFilter === 'active') {
    q = query(itemsRef, where('isActive', '==', true), orderBy('name', 'asc'))
  } else if (statusFilter === 'inactive') {
    q = query(itemsRef, where('isActive', '==', false), orderBy('name', 'asc'))
  }

  const querySnapshot = await getDocs(q)
  let docs = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Item[]

  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase()
    docs = docs.filter(item => item.name.toLowerCase().includes(queryLower))
  }

  return docs
}

export async function createItem(itemData: Omit<Item, 'id' | 'createdAt'>) {
  const itemsRef = collection(db, 'items')
  const docRef = await addDoc(itemsRef, {
    ...itemData,
    createdAt: serverTimestamp()
  })
  return docRef.id
}

export async function updateItem(id: string, itemData: Partial<Omit<Item, 'id' | 'createdAt'>>) {
  const docRef = doc(db, 'items', id)
  await updateDoc(docRef, itemData)
}

// Soft delete
export async function deleteItem(id: string) {
  const docRef = doc(db, 'items', id)
  await updateDoc(docRef, { isActive: false })
}

// Seeding helper to create initial testing data if empty
export async function seedInitialData() {
  const schoolsSnapshot = await getDocs(collection(db, 'schools'))
  if (schoolsSnapshot.empty) {
    const batch = writeBatch(db)

    // Seed 4 schools
    const schoolSeeds = [
      { name: 'Central Primary School', udiseCode: '27120300101', headmasterName: 'Ramesh Sharma', phoneNumber: '9876543210', block: 'Block A', address: '12 Main Rd, Sector 4', isActive: true },
      { name: 'Model High School', udiseCode: '27120300102', headmasterName: 'Sunita Patel', phoneNumber: '9876543211', block: 'Block B', address: 'Plot 45, Gandhi Nagar', isActive: true },
      { name: 'Saint Marys Academy', udiseCode: '27120300103', headmasterName: 'Fr. Joseph', phoneNumber: '9876543212', block: 'Block A', address: 'Near Church, Station Rd', isActive: true },
      { name: 'West Valley School', udiseCode: '27120300104', headmasterName: 'Karan Singh', phoneNumber: '9876543213', block: 'Block C', address: 'Hilltop Lane, Sector 9', isActive: false }
    ]

    schoolSeeds.forEach((school) => {
      const docRef = doc(collection(db, 'schools'))
      batch.set(docRef, {
        ...school,
        createdAt: Timestamp.now()
      })
    })

    await batch.commit()
  }

  const itemsSnapshot = await getDocs(collection(db, 'items'))
  if (itemsSnapshot.empty) {
    const batch = writeBatch(db)

    // Seed some items
    const itemSeeds = [
      { name: 'Basmati Rice', unit: 'kg', isGstApplicable: false, gstPercentage: null, isActive: true },
      { name: 'Edible Mustard Oil', unit: 'liter', isGstApplicable: true, gstPercentage: 5, isActive: true },
      { name: 'Premium Wheat Flour (Atta)', unit: 'kg', isGstApplicable: false, gstPercentage: null, isActive: true },
      { name: 'Salted Butter Packs', unit: 'unit', isGstApplicable: true, gstPercentage: 12, isActive: true },
      { name: 'Dehydrated Pulses', unit: 'kg', isGstApplicable: false, gstPercentage: null, isActive: false }
    ]

    itemSeeds.forEach((item) => {
      const docRef = doc(collection(db, 'items'))
      batch.set(docRef, {
        ...item,
        createdAt: Timestamp.now()
      })
    })

    await batch.commit()
  }
}
