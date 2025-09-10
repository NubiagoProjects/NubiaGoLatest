import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AdminUserService, AdminUser, UserStats, UserFilters } from '@/lib/services/admin/admin-user.service'
import { AdminProductService, AdminProduct, ProductStats, ProductFilters } from '@/lib/services/admin/admin-product.service'
import { AdminOrderService, AdminOrder, OrderStats, OrderFilters } from '@/lib/services/admin/admin-order.service'
import { AdminSupplierService, AdminSupplier, SupplierStats, SupplierFilters } from '@/lib/services/admin/admin-supplier.service'

interface AdminDashboardState {
  // User Management
  users: AdminUser[]
  userStats: UserStats
  userFilters: UserFilters
  selectedUsers: string[]
  userLoading: boolean
  userError: string | null

  // Product Management
  products: AdminProduct[]
  productStats: ProductStats
  productFilters: ProductFilters
  selectedProducts: string[]
  productLoading: boolean
  productError: string | null

  // Order Management
  orders: AdminOrder[]
  orderStats: OrderStats
  orderFilters: OrderFilters
  selectedOrders: string[]
  orderLoading: boolean
  orderError: string | null

  // Supplier Management
  suppliers: AdminSupplier[]
  supplierStats: SupplierStats
  supplierFilters: SupplierFilters
  selectedSuppliers: string[]
  supplierLoading: boolean
  supplierError: string | null

  // UI State
  activeTab: string
  searchQuery: string
  showFilters: boolean
  darkMode: boolean
  loading: boolean

  // Actions
  // User Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>
  updateUserRole: (uid: string, newRole: 'customer' | 'supplier' | 'admin', newStatus: 'active' | 'pending' | 'suspended', adminId: string, reason?: string) => Promise<void>
  bulkUpdateUsers: (userIds: string[], updates: Partial<AdminUser>, adminId: string, reason?: string) => Promise<void>
  deleteUser: (uid: string, adminId: string, reason?: string) => Promise<void>
  setUserFilters: (filters: UserFilters) => void
  setSelectedUsers: (userIds: string[]) => void
  clearUserSelection: () => void

  // Product Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  updateProductApproval: (productId: string, approvalStatus: 'approved' | 'rejected', adminId: string, notes?: string) => Promise<void>
  updateProductStatus: (productId: string, newStatus: 'active' | 'inactive' | 'draft' | 'archived', adminId: string, reason?: string) => Promise<void>
  bulkUpdateProducts: (productIds: string[], updates: Partial<AdminProduct>, adminId: string, reason?: string) => Promise<void>
  deleteProduct: (productId: string, adminId: string, reason?: string) => Promise<void>
  setProductFilters: (filters: ProductFilters) => void
  setSelectedProducts: (productIds: string[]) => void
  clearProductSelection: () => void

  // Order Actions
  fetchOrders: (filters?: OrderFilters) => Promise<void>
  updateOrderStatus: (orderId: string, newStatus: AdminOrder['status'], adminId: string, notes?: string, trackingNumber?: string) => Promise<void>
  cancelOrder: (orderId: string, adminId: string, reason: string, refundAmount?: number) => Promise<void>
  processRefund: (orderId: string, adminId: string, refundAmount: number, reason: string) => Promise<void>
  bulkUpdateOrders: (orderIds: string[], updates: Partial<AdminOrder>, adminId: string, reason?: string) => Promise<void>
  setOrderFilters: (filters: OrderFilters) => void
  setSelectedOrders: (orderIds: string[]) => void
  clearOrderSelection: () => void

  // Supplier Actions
  fetchSuppliers: (filters?: SupplierFilters) => Promise<void>
  updateSupplierApproval: (supplierId: string, approvalStatus: 'approved' | 'rejected', adminId: string, notes?: string) => Promise<void>
  suspendSupplier: (supplierId: string, adminId: string, reason: string, duration?: number) => Promise<void>
  reactivateSupplier: (supplierId: string, adminId: string, reason?: string) => Promise<void>
  updateVerificationStatus: (supplierId: string, verificationType: keyof AdminSupplier['verificationStatus'], verified: boolean, adminId: string, notes?: string) => Promise<void>
  bulkUpdateSuppliers: (supplierIds: string[], updates: Partial<AdminSupplier>, adminId: string, reason?: string) => Promise<void>
  setSupplierFilters: (filters: SupplierFilters) => void
  setSelectedSuppliers: (supplierIds: string[]) => void
  clearSupplierSelection: () => void

  // UI Actions
  setActiveTab: (tab: string) => void
  setSearchQuery: (query: string) => void
  toggleFilters: () => void
  toggleDarkMode: () => void
  setLoading: (loading: boolean) => void

  // Real-time subscriptions
  subscribeToRealTimeUpdates: () => void
  unsubscribeFromRealTimeUpdates: () => void
}

// Service instances
const userService = new AdminUserService()
const productService = new AdminProductService()
const orderService = new AdminOrderService()
const supplierService = new AdminSupplierService()

// Subscription cleanup functions
let userSubscription: (() => void) | null = null
let productSubscription: (() => void) | null = null
let orderSubscription: (() => void) | null = null
let supplierSubscription: (() => void) | null = null

export const useAdminDashboardStore = create<AdminDashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        users: [],
        userStats: {
          totalUsers: 0,
          activeUsers: 0,
          pendingUsers: 0,
          suspendedUsers: 0,
          totalSuppliers: 0,
          totalAdmins: 0,
          totalCustomers: 0,
          newUsersThisMonth: 0,
          activeUsersThisWeek: 0
        },
        userFilters: {},
        selectedUsers: [],
        userLoading: false,
        userError: null,

        products: [],
        productStats: {
          totalProducts: 0,
          activeProducts: 0,
          pendingApproval: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          totalCategories: 0,
          totalSuppliers: 0,
          averagePrice: 0,
          totalSales: 0,
          featuredProducts: 0
        },
        productFilters: {},
        selectedProducts: [],
        productLoading: false,
        productError: null,

        orders: [],
        orderStats: {
          totalOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          totalCommission: 0,
          ordersThisMonth: 0,
          revenueThisMonth: 0,
          ordersThisWeek: 0,
          revenueThisWeek: 0
        },
        orderFilters: {},
        selectedOrders: [],
        orderLoading: false,
        orderError: null,

        suppliers: [],
        supplierStats: {
          totalSuppliers: 0,
          approvedSuppliers: 0,
          pendingSuppliers: 0,
          rejectedSuppliers: 0,
          suspendedSuppliers: 0,
          totalRevenue: 0,
          averageRating: 0,
          totalProducts: 0,
          activeCategories: 0,
          newSuppliersThisMonth: 0,
          topPerformingSuppliers: 0
        },
        supplierFilters: {},
        selectedSuppliers: [],
        supplierLoading: false,
        supplierError: null,

        activeTab: 'overview',
        searchQuery: '',
        showFilters: false,
        darkMode: false,
        loading: false,

        // User Actions
        fetchUsers: async (filters = {}) => {
          try {
            set({ userLoading: true, userError: null })
            const result = await userService.getUsers(filters)
            set({ 
              users: result.users, 
              userLoading: false 
            })
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to fetch users', 
              userLoading: false 
            })
          }
        },

        updateUserRole: async (uid, newRole, newStatus, adminId, reason) => {
          try {
            await userService.updateUserRole(uid, newRole, newStatus, adminId, reason)
            // Refresh users after update
            await get().fetchUsers(get().userFilters)
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to update user role' 
            })
            throw error
          }
        },

        bulkUpdateUsers: async (userIds, updates, adminId, reason) => {
          try {
            await userService.bulkUpdateUsers(userIds, updates, adminId, reason)
            // Refresh users after update
            await get().fetchUsers(get().userFilters)
            set({ selectedUsers: [] })
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to bulk update users' 
            })
            throw error
          }
        },

        deleteUser: async (uid, adminId, reason) => {
          try {
            await userService.deleteUser(uid, adminId, reason)
            // Refresh users after delete
            await get().fetchUsers(get().userFilters)
          } catch (error) {
            set({ 
              userError: error instanceof Error ? error.message : 'Failed to delete user' 
            })
            throw error
          }
        },

        setUserFilters: (filters) => set({ userFilters: filters }),
        setSelectedUsers: (userIds) => set({ selectedUsers: userIds }),
        clearUserSelection: () => set({ selectedUsers: [] }),

        // Product Actions
        fetchProducts: async (filters = {}) => {
          try {
            set({ productLoading: true, productError: null })
            const result = await productService.getProducts(filters)
            set({ 
              products: result.products, 
              productLoading: false 
            })
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to fetch products', 
              productLoading: false 
            })
          }
        },

        updateProductApproval: async (productId, approvalStatus, adminId, notes) => {
          try {
            await productService.updateProductApproval(productId, approvalStatus, adminId, notes)
            // Refresh products after update
            await get().fetchProducts(get().productFilters)
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to update product approval' 
            })
            throw error
          }
        },

        updateProductStatus: async (productId, newStatus, adminId, reason) => {
          try {
            await productService.updateProductStatus(productId, newStatus, adminId, reason)
            // Refresh products after update
            await get().fetchProducts(get().productFilters)
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to update product status' 
            })
            throw error
          }
        },

        bulkUpdateProducts: async (productIds, updates, adminId, reason) => {
          try {
            await productService.bulkUpdateProducts(productIds, updates, adminId, reason)
            // Refresh products after update
            await get().fetchProducts(get().productFilters)
            set({ selectedProducts: [] })
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to bulk update products' 
            })
            throw error
          }
        },

        deleteProduct: async (productId, adminId, reason) => {
          try {
            await productService.deleteProduct(productId, adminId, reason)
            // Refresh products after delete
            await get().fetchProducts(get().productFilters)
          } catch (error) {
            set({ 
              productError: error instanceof Error ? error.message : 'Failed to delete product' 
            })
            throw error
          }
        },

        setProductFilters: (filters) => set({ productFilters: filters }),
        setSelectedProducts: (productIds) => set({ selectedProducts: productIds }),
        clearProductSelection: () => set({ selectedProducts: [] }),

        // Order Actions
        fetchOrders: async (filters = {}) => {
          try {
            set({ orderLoading: true, orderError: null })
            const result = await orderService.getOrders(filters)
            set({ 
              orders: result.orders, 
              orderLoading: false 
            })
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to fetch orders', 
              orderLoading: false 
            })
          }
        },

        updateOrderStatus: async (orderId, newStatus, adminId, notes, trackingNumber) => {
          try {
            await orderService.updateOrderStatus(orderId, newStatus, adminId, notes, trackingNumber)
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to update order status' 
            })
            throw error
          }
        },

        cancelOrder: async (orderId, adminId, reason, refundAmount) => {
          try {
            await orderService.cancelOrder(orderId, adminId, reason, refundAmount)
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to cancel order' 
            })
            throw error
          }
        },

        processRefund: async (orderId, adminId, refundAmount, reason) => {
          try {
            await orderService.processRefund(orderId, adminId, refundAmount, reason)
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to process refund' 
            })
            throw error
          }
        },

        bulkUpdateOrders: async (orderIds, updates, adminId, reason) => {
          try {
            await orderService.bulkUpdateOrders(orderIds, updates, adminId, reason)
            // Refresh orders after update
            await get().fetchOrders(get().orderFilters)
            set({ selectedOrders: [] })
          } catch (error) {
            set({ 
              orderError: error instanceof Error ? error.message : 'Failed to bulk update orders' 
            })
            throw error
          }
        },

        setOrderFilters: (filters) => set({ orderFilters: filters }),
        setSelectedOrders: (orderIds) => set({ selectedOrders: orderIds }),
        clearOrderSelection: () => set({ selectedOrders: [] }),

        // Supplier Actions
        fetchSuppliers: async (filters = {}) => {
          try {
            set({ supplierLoading: true, supplierError: null })
            const result = await supplierService.getSuppliers(filters)
            set({ 
              suppliers: result.suppliers, 
              supplierLoading: false 
            })
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to fetch suppliers', 
              supplierLoading: false 
            })
          }
        },

        updateSupplierApproval: async (supplierId, approvalStatus, adminId, notes) => {
          try {
            await supplierService.updateSupplierApproval(supplierId, approvalStatus, adminId, notes)
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to update supplier approval' 
            })
            throw error
          }
        },

        suspendSupplier: async (supplierId, adminId, reason, duration) => {
          try {
            await supplierService.suspendSupplier(supplierId, adminId, reason, duration)
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to suspend supplier' 
            })
            throw error
          }
        },

        reactivateSupplier: async (supplierId, adminId, reason) => {
          try {
            await supplierService.reactivateSupplier(supplierId, adminId, reason)
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to reactivate supplier' 
            })
            throw error
          }
        },

        updateVerificationStatus: async (supplierId, verificationType, verified, adminId, notes) => {
          try {
            await supplierService.updateVerificationStatus(supplierId, verificationType, verified, adminId, notes)
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to update verification status' 
            })
            throw error
          }
        },

        bulkUpdateSuppliers: async (supplierIds, updates, adminId, reason) => {
          try {
            await supplierService.bulkUpdateSuppliers(supplierIds, updates, adminId, reason)
            // Refresh suppliers after update
            await get().fetchSuppliers(get().supplierFilters)
            set({ selectedSuppliers: [] })
          } catch (error) {
            set({ 
              supplierError: error instanceof Error ? error.message : 'Failed to bulk update suppliers' 
            })
            throw error
          }
        },

        setSupplierFilters: (filters) => set({ supplierFilters: filters }),
        setSelectedSuppliers: (supplierIds) => set({ selectedSuppliers: supplierIds }),
        clearSupplierSelection: () => set({ selectedSuppliers: [] }),

        // UI Actions
        setActiveTab: (tab) => set({ activeTab: tab }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        setLoading: (loading) => set({ loading }),

        // Real-time subscriptions
        subscribeToRealTimeUpdates: () => {
          // Subscribe to user updates
          userSubscription = userService.subscribeToUsers(get().userFilters, (users) => {
            set({ users })
          })

          // Subscribe to product updates
          productSubscription = productService.subscribeToProducts(get().productFilters, (products) => {
            set({ products })
          })

          // Subscribe to order updates
          orderSubscription = orderService.subscribeToOrders(get().orderFilters, (orders) => {
            set({ orders })
          })

          // Subscribe to supplier updates
          supplierSubscription = supplierService.subscribeToSuppliers(get().supplierFilters, (suppliers) => {
            set({ suppliers })
          })

          // Subscribe to stats updates
          userService.subscribeToUserStats((stats) => {
            set({ userStats: stats })
          })

          productService.subscribeToProductStats((stats) => {
            set({ productStats: stats })
          })

          orderService.subscribeToOrderStats((stats) => {
            set({ orderStats: stats })
          })

          supplierService.subscribeToSupplierStats((stats) => {
            set({ supplierStats: stats })
          })
        },

        unsubscribeFromRealTimeUpdates: () => {
          if (userSubscription) {
            userSubscription()
            userSubscription = null
          }
          if (productSubscription) {
            productSubscription()
            productSubscription = null
          }
          if (orderSubscription) {
            orderSubscription()
            orderSubscription = null
          }
          if (supplierSubscription) {
            supplierSubscription()
            supplierSubscription = null
          }
        }
      }),
      {
        name: 'admin-dashboard-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          darkMode: state.darkMode,
          userFilters: state.userFilters,
          productFilters: state.productFilters,
          orderFilters: state.orderFilters,
          supplierFilters: state.supplierFilters
        })
      }
    ),
    {
      name: 'admin-dashboard-store'
    }
  )
)
