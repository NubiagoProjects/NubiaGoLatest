'use client'

import { useState, useEffect } from 'react'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  MoreHorizontal,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  User,
  Tag
} from 'lucide-react'

interface Image {
  id: string
  filename: string
  url: string
  size: string
  dimensions: string
  category: string
  status: 'approved' | 'pending' | 'rejected'
  uploadedBy: string
  uploadDate: string
  tags: string[]
  views: number
  downloads: number
}

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState<string | null>(null)

  // Mock data
  useEffect(() => {
    const mockImages: Image[] = [
      {
        id: '1',
        filename: 'product_hero_001.jpg',
        url: '/api/product_hero_001.jpg',
        size: '2.4 MB',
        dimensions: '1920x1080',
        category: 'Product',
        status: 'approved',
        uploadedBy: 'John Doe',
        uploadDate: '2024-01-15',
        tags: ['hero', 'product', 'main'],
        views: 1247,
        downloads: 89
      },
      {
        id: '2',
        filename: 'supplier_logo_002.png',
        url: '/api/supplier_logo_002.png',
        size: '156 KB',
        dimensions: '512x512',
        category: 'Logo',
        status: 'pending',
        uploadedBy: 'Jane Smith',
        uploadDate: '2024-01-14',
        tags: ['logo', 'supplier', 'brand'],
        views: 89,
        downloads: 12
      },
      {
        id: '3',
        filename: 'banner_promo_003.jpg',
        url: '/api/banner_promo_003.jpg',
        size: '1.8 MB',
        dimensions: '1200x400',
        category: 'Banner',
        status: 'approved',
        uploadedBy: 'Mike Johnson',
        uploadDate: '2024-01-13',
        tags: ['banner', 'promo', 'marketing'],
        views: 2156,
        downloads: 234
      },
      {
        id: '4',
        filename: 'category_icon_004.svg',
        url: '/api/category_icon_004.svg',
        size: '23 KB',
        dimensions: '64x64',
        category: 'Icon',
        status: 'rejected',
        uploadedBy: 'Sarah Wilson',
        uploadDate: '2024-01-12',
        tags: ['icon', 'category', 'ui'],
        views: 45,
        downloads: 8
      },
      {
        id: '5',
        filename: 'gallery_thumb_005.jpg',
        url: '/api/gallery_thumb_005.jpg',
        size: '890 KB',
        dimensions: '300x300',
        category: 'Gallery',
        status: 'approved',
        uploadedBy: 'Tom Brown',
        uploadDate: '2024-01-11',
        tags: ['gallery', 'thumbnail', 'preview'],
        views: 567,
        downloads: 45
      }
    ]

    setTimeout(() => {
      setImages(mockImages)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterToggle = () => {
    setShowFilterDropdown(!showFilterDropdown)
  }

  const handleImageSelection = (imageId: string, checked: boolean) => {
    if (checked) {
      setSelectedImages([...selectedImages, imageId])
    } else {
      setSelectedImages(selectedImages.filter(id => id !== imageId))
    }
  }

  const handleSelectAllImages = (checked: boolean) => {
    if (checked) {
      setSelectedImages(images.map(img => img.id))
    } else {
      setSelectedImages([])
    }
  }

  const handleImageAction = (action: string, imageId: string) => {
    switch (action) {
      case 'view':
        setShowImageModal(imageId)
        break
      case 'edit':
        // Handle edit
        break
      case 'delete':
        setImages(images.filter(img => img.id !== imageId))
        setSelectedImages(selectedImages.filter(id => id !== imageId))
        break
      case 'approve':
        setImages(images.map(img => 
          img.id === imageId ? { ...img, status: 'approved' as const } : img
        ))
        break
      case 'reject':
        setImages(images.map(img => 
          img.id === imageId ? { ...img, status: 'rejected' as const } : img
        ))
        break
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'approve':
        setImages(images.map(img => 
          selectedImages.includes(img.id) ? { ...img, status: 'approved' as const } : img
        ))
        break
      case 'reject':
        setImages(images.map(img => 
          selectedImages.includes(img.id) ? { ...img, status: 'rejected' as const } : img
        ))
        break
      case 'delete':
        setImages(images.filter(img => !selectedImages.includes(img.id)))
        break
    }
    setSelectedImages([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Product':
        return 'bg-blue-100 text-blue-800'
      case 'Logo':
        return 'bg-purple-100 text-purple-800'
      case 'Banner':
        return 'bg-green-100 text-green-800'
      case 'Icon':
        return 'bg-orange-100 text-orange-800'
      case 'Gallery':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || image.category === filterCategory
    const matchesStatus = filterStatus === 'all' || image.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading images...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Management</h1>
          <p className="text-gray-600">Manage and organize all marketplace images, logos, and media assets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Images</p>
                <p className="text-2xl font-bold text-gray-900">{images.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {images.filter(img => img.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {images.filter(img => img.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {images.reduce((sum, img) => sum + img.downloads, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              <div className="relative">
                <button 
                  onClick={handleFilterToggle}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Category</div>
                    <button
                      onClick={() => { setFilterCategory('all'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      All Categories
                    </button>
                    {['Product', 'Logo', 'Banner', 'Icon', 'Gallery'].map(category => (
                      <button
                        key={category}
                        onClick={() => { setFilterCategory(category); setShowFilterDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        {category}
                      </button>
                    ))}
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase mt-2">Status</div>
                    <button
                      onClick={() => { setFilterStatus('all'); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      All Status
                    </button>
                    {['approved', 'pending', 'rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {selectedImages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedImages.length} selected</span>
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Images</span>
              </button>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Images ({filteredImages.length})
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Showing {filteredImages.length} of {images.length}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedImages.length === images.length && images.length > 0}
                      onChange={(e) => handleSelectAllImages(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredImages.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedImages.includes(image.id)}
                        onChange={(e) => handleImageSelection(image.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{image.filename}</p>
                          <p className="text-xs text-gray-500">{image.size} • {image.dimensions}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{image.uploadedBy}</p>
                        <p className="text-xs text-gray-500">{image.uploadDate}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {image.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(image.category)}`}>
                        {image.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(image.status)}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          image.status === 'approved' ? 'bg-green-500' :
                          image.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        {image.status.charAt(0).toUpperCase() + image.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1 text-gray-400" />
                            {image.views.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Download className="h-3 w-3 mr-1 text-gray-400" />
                            {image.downloads.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => handleImageAction('view', image.id)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="View image"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleImageAction('edit', image.id)}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        title="Edit image"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleImageAction('delete', image.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      {image.status === 'pending' && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => handleImageAction('approve', image.id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-green-600"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleImageAction('reject', image.id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Images</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop images here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700">
                Upload Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Image Preview</h3>
              <button onClick={() => setShowImageModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center py-8">
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-24 w-24 text-gray-400" />
              </div>
              <p className="text-gray-500">Image preview coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
