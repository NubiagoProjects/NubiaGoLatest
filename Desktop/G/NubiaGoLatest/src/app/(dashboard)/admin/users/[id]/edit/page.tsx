import { ArrowLeft, Save, User, Mail, Phone, Shield } from 'lucide-react'
import Link from 'next/link'
import UserEditForm from './user-edit-form'

// Required for static export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ]
}

interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'supplier' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  joinedAt: string
  phone?: string
  address?: string
}

export default function AdminUserEditPage({ params }: { params: { id: string } }) {
  // Simulate user data - in a real app, this would come from an API or database
  const user: User = {
    id: params.id,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'customer',
    status: 'active',
    joinedAt: '2024-01-15',
    phone: '+1234567890',
    address: '123 Main St, New York, NY 10001'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/admin/users/${user.id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Details
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
              <p className="text-gray-600 mt-2">Update user information</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <UserEditForm user={user} />
      </div>
    </div>
  )
} 