const { initializeApp } = require('firebase/app')
const { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } = require('firebase/firestore')
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth')

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBOkKPN3viR75p4BLuXrmqR_4zlc0X_qL0",
  authDomain: "nubiago-aa411.firebaseapp.com",
  projectId: "nubiago-aa411",
  storageBucket: "nubiago-aa411.firebasestorage.app",
  messagingSenderId: "618017989773",
  appId: "1:618017989773:web:2b1d1c14c2b9e086b52ec4"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Mock data to populate
const mockUsers = [
  {
    uid: 'USR-001',
    email: 'john@example.com',
    displayName: 'John Doe',
    role: 'customer',
    status: 'active',
    emailVerified: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    lastLoginAt: new Date('2024-01-20'),
    loginCount: 15
  },
  {
    uid: 'USR-002',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    role: 'supplier',
    status: 'pending',
    emailVerified: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    lastLoginAt: new Date('2024-01-25'),
    loginCount: 8
  },
  {
    uid: 'USR-003',
    email: 'bob@example.com',
    displayName: 'Bob Wilson',
    role: 'customer',
    status: 'active',
    emailVerified: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    lastLoginAt: new Date('2024-01-22'),
    loginCount: 12
  },
  {
    uid: 'USR-004',
    email: 'admin@homebase.com',
    displayName: 'Admin User',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-26'),
    loginCount: 45
  }
]

const mockSuppliers = [
  {
    uid: 'USR-002',
    businessName: 'Tech Store',
    businessType: 'Electronics Retail',
    businessDescription: 'Premium electronics and gadgets store',
    ownerName: 'Jane Smith',
    ownerEmail: 'jane@example.com',
    ownerPhone: '+1-555-0123',
    businessAddress: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102'
    },
    businessPhone: '+1-555-0124',
    businessEmail: 'contact@techstore.com',
    website: 'https://techstore.com',
    status: 'pending',
    approvalStatus: 'pending',
    submittedAt: new Date('2024-01-20'),
    documents: {
      businessLicense: 'https://example.com/license1.pdf',
      taxCertificate: 'https://example.com/tax1.pdf'
    },
    verificationStatus: {
      emailVerified: true,
      phoneVerified: true,
      documentsVerified: false,
      businessVerified: false
    },
    businessMetrics: {
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
      reviewCount: 0,
      responseRate: 0,
      averageResponseTime: 0
    },
    commissionRate: 15,
    categories: ['Electronics', 'Gadgets', 'Computers'],
    tags: ['tech', 'electronics', 'gadgets'],
    isFeatured: false,
    isVerified: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    uid: 'USR-005',
    businessName: 'Fashion Hub',
    businessType: 'Fashion Retail',
    businessDescription: 'Trendy fashion and accessories store',
    ownerName: 'Mike Johnson',
    ownerEmail: 'mike@fashionhub.com',
    ownerPhone: '+1-555-0125',
    businessAddress: {
      street: '456 Fashion Avenue',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    businessPhone: '+1-555-0126',
    businessEmail: 'contact@fashionhub.com',
    website: 'https://fashionhub.com',
    status: 'approved',
    approvalStatus: 'approved',
    submittedAt: new Date('2024-01-10'),
    approvedAt: new Date('2024-01-12'),
    approvedBy: 'USR-004',
    documents: {
      businessLicense: 'https://example.com/license2.pdf',
      taxCertificate: 'https://example.com/tax2.pdf'
    },
    verificationStatus: {
      emailVerified: true,
      phoneVerified: true,
      documentsVerified: true,
      businessVerified: true
    },
    businessMetrics: {
      totalProducts: 45,
      activeProducts: 42,
      totalOrders: 156,
      completedOrders: 145,
      totalRevenue: 25000,
      averageRating: 4.5,
      reviewCount: 89,
      responseRate: 95,
      averageResponseTime: 2.5
    },
    commissionRate: 12,
    categories: ['Fashion', 'Accessories', 'Shoes'],
    tags: ['fashion', 'style', 'trendy'],
    isFeatured: true,
    isVerified: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    uid: 'USR-006',
    businessName: 'Home Decor',
    businessType: 'Home & Garden',
    businessDescription: 'Beautiful home decoration and garden supplies',
    ownerName: 'Sarah Wilson',
    ownerEmail: 'sarah@homedecor.com',
    ownerPhone: '+1-555-0127',
    businessAddress: {
      street: '789 Home Street',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90210'
    },
    businessPhone: '+1-555-0128',
    businessEmail: 'contact@homedecor.com',
    website: 'https://homedecor.com',
    status: 'pending',
    approvalStatus: 'pending',
    submittedAt: new Date('2024-01-22'),
    documents: {
      businessLicense: 'https://example.com/license3.pdf',
      taxCertificate: 'https://example.com/tax3.pdf'
    },
    verificationStatus: {
      emailVerified: true,
      phoneVerified: true,
      documentsVerified: false,
      businessVerified: false
    },
    businessMetrics: {
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
      reviewCount: 0,
      responseRate: 0,
      averageResponseTime: 0
    },
    commissionRate: 14,
    categories: ['Home & Garden', 'Decor', 'Furniture'],
    tags: ['home', 'decor', 'garden'],
    isFeatured: false,
    isVerified: false,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  }
]

const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    originalPrice: 349.99,
    stock: 25,
    minStock: 5,
    maxStock: 100,
    status: 'active',
    category: 'Electronics',
    subcategory: 'Audio',
    supplier: {
      id: 'USR-005',
      name: 'Fashion Hub',
      email: 'contact@fashionhub.com'
    },
    sales: 45,
    rating: 4.8,
    reviewCount: 23,
    images: ['/headphones1.jpg', '/headphones2.jpg'],
    mainImage: '/headphones1.jpg',
    approvalStatus: 'approved',
    submittedAt: new Date('2024-01-15'),
    approvedAt: new Date('2024-01-16'),
    approvedBy: 'USR-004',
    isFeatured: true,
    isPromoted: false,
    commissionRate: 15,
    tags: ['wireless', 'noise-cancelling', 'premium'],
    specifications: {
      brand: 'AudioTech',
      model: 'AT-2000',
      connectivity: 'Bluetooth 5.0',
      batteryLife: '30 hours'
    },
    shipping: {
      weight: 0.5,
      dimensions: { length: 20, width: 15, height: 8 },
      freeShipping: true,
      shippingCost: 0
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'PROD-002',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking smartwatch with health monitoring',
    price: 199.99,
    originalPrice: 249.99,
    stock: 15,
    minStock: 3,
    maxStock: 50,
    status: 'active',
    category: 'Electronics',
    subcategory: 'Wearables',
    supplier: {
      id: 'USR-005',
      name: 'Fashion Hub',
      email: 'contact@fashionhub.com'
    },
    sales: 32,
    rating: 4.6,
    reviewCount: 18,
    images: ['/watch1.jpg', '/watch2.jpg'],
    mainImage: '/watch1.jpg',
    approvalStatus: 'approved',
    submittedAt: new Date('2024-01-10'),
    approvedAt: new Date('2024-01-11'),
    approvedBy: 'USR-004',
    isFeatured: false,
    isPromoted: true,
    commissionRate: 12,
    tags: ['fitness', 'smartwatch', 'health'],
    specifications: {
      brand: 'FitTech',
      model: 'FT-100',
      connectivity: 'Bluetooth 5.0, WiFi',
      batteryLife: '7 days'
    },
    shipping: {
      weight: 0.3,
      dimensions: { length: 15, width: 12, height: 5 },
      freeShipping: false,
      shippingCost: 9.99
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: 'PROD-003',
    name: 'Laptop Stand',
    description: 'Adjustable laptop stand for ergonomic workspace',
    price: 49.99,
    originalPrice: 59.99,
    stock: 8,
    minStock: 10,
    maxStock: 200,
    status: 'draft',
    category: 'Accessories',
    subcategory: 'Computer',
    supplier: {
      id: 'USR-007',
      name: 'OfficePro',
      email: 'contact@officepro.com'
    },
    sales: 0,
    rating: 0,
    reviewCount: 0,
    images: ['/laptop-stand1.jpg'],
    mainImage: '/laptop-stand1.jpg',
    approvalStatus: 'pending',
    submittedAt: new Date('2024-01-20'),
    isFeatured: false,
    isPromoted: false,
    commissionRate: 10,
    tags: ['laptop', 'ergonomic', 'workspace'],
    specifications: {
      brand: 'OfficePro',
      model: 'OP-LS100',
      material: 'Aluminum',
      maxWeight: '15 lbs'
    },
    shipping: {
      weight: 1.2,
      dimensions: { length: 25, width: 20, height: 15 },
      freeShipping: false,
      shippingCost: 12.99
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
]

const mockOrders = [
  {
    id: 'ORD-001',
    orderNumber: 'ORD_000076',
    customer: {
      id: 'USR-001',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-555-0101'
    },
    supplier: {
      id: 'USR-005',
      name: 'Fashion Hub',
      email: 'contact@fashionhub.com'
    },
    items: [
      {
        productId: 'PROD-001',
        productName: 'Premium Wireless Headphones',
        productImage: '/headphones1.jpg',
        quantity: 1,
        unitPrice: 299.99,
        totalPrice: 299.99,
        commission: 44.99
      }
    ],
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    shippingAddress: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102',
      phone: '+1-555-0101'
    },
    billingAddress: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102'
    },
    subtotal: 299.99,
    shippingCost: 0,
    taxAmount: 29.99,
    discountAmount: 0,
    totalAmount: 329.98,
    commissionAmount: 44.99,
    currency: 'USD',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: new Date('2024-01-25'),
    actualDelivery: new Date('2024-01-24'),
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: 'ORD-002',
    orderNumber: 'ORD_000075',
    customer: {
      id: 'USR-003',
      name: 'Mike Davis',
      email: 'mike@example.com',
      phone: '+1-555-0102'
    },
    supplier: {
      id: 'USR-005',
      name: 'Fashion Hub',
      email: 'contact@fashionhub.com'
    },
    items: [
      {
        productId: 'PROD-002',
        productName: 'Smart Fitness Watch',
        productImage: '/watch1.jpg',
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99,
        commission: 23.99
      }
    ],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'paypal',
    shippingAddress: {
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
      phone: '+1-555-0102'
    },
    billingAddress: {
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    subtotal: 199.99,
    shippingCost: 9.99,
    taxAmount: 20.99,
    discountAmount: 0,
    totalAmount: 230.97,
    commissionAmount: 23.99,
    currency: 'USD',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]

// Function to populate users
async function populateUsers() {
  console.log('Populating users...')
  
  for (const user of mockUsers) {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log(`✅ User ${user.displayName} created successfully`)
    } catch (error) {
      console.error(`❌ Error creating user ${user.displayName}:`, error.message)
    }
  }
}

// Function to populate suppliers
async function populateSuppliers() {
  console.log('Populating suppliers...')
  
  for (const supplier of mockSuppliers) {
    try {
      await setDoc(doc(db, 'suppliers', supplier.uid), {
        ...supplier,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log(`✅ Supplier ${supplier.businessName} created successfully`)
    } catch (error) {
      console.error(`❌ Error creating supplier ${supplier.businessName}:`, error.message)
    }
  }
}

// Function to populate products
async function populateProducts() {
  console.log('Populating products...')
  
  for (const product of mockProducts) {
    try {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log(`✅ Product ${product.name} created successfully`)
    } catch (error) {
      console.error(`❌ Error creating product ${product.name}:`, error.message)
    }
  }
}

// Function to populate orders
async function populateOrders() {
  console.log('Populating orders...')
  
  for (const order of mockOrders) {
    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log(`✅ Order ${order.orderNumber} created successfully`)
    } catch (error) {
      console.error(`❌ Error creating order ${order.orderNumber}:`, error.message)
    }
  }
}

// Function to create categories collection
async function populateCategories() {
  console.log('Populating categories...')
  
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Fashion', description: 'Clothing and accessories' },
    { name: 'Home & Garden', description: 'Home decoration and garden supplies' },
    { name: 'Accessories', description: 'Various accessories and add-ons' },
    { name: 'Wearables', description: 'Wearable technology devices' },
    { name: 'Computer', description: 'Computer hardware and accessories' }
  ]
  
  for (const category of categories) {
    try {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log(`✅ Category ${category.name} created successfully`)
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error.message)
    }
  }
}

// Main function to populate all data
async function populateAllData() {
  try {
    console.log('🚀 Starting Firebase data population...')
    
    // Check if admin user exists and sign in
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('🔐 Signing in as admin...')
      await signInWithEmailAndPassword(auth, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
      console.log('✅ Admin authentication successful')
    }
    
    // Populate data in order (users first, then suppliers, products, orders)
    await populateUsers()
    await populateSuppliers()
    await populateProducts()
    await populateOrders()
    await populateCategories()
    
    console.log('🎉 All data populated successfully!')
    console.log('📊 Summary:')
    console.log(`   - Users: ${mockUsers.length}`)
    console.log(`   - Suppliers: ${mockSuppliers.length}`)
    console.log(`   - Products: ${mockProducts.length}`)
    console.log(`   - Orders: ${mockOrders.length}`)
    console.log(`   - Categories: 6`)
    
  } catch (error) {
    console.error('❌ Error populating data:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  populateAllData()
}

module.exports = {
  populateUsers,
  populateSuppliers,
  populateProducts,
  populateOrders,
  populateCategories,
  populateAllData
}
