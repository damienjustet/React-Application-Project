/**
 * API Service
 * 
 * Clean data fetching layer for future backend/API integration.
 * Currently uses mock data, but structured for easy swap to real APIs.
 */

// ============================================
// API CONFIGURATION
// ============================================

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
}

// ============================================
// REQUEST HELPERS
// ============================================

/**
 * Generic fetch wrapper with error handling and retries
 */
async function request(endpoint, options = {}, attempt = 1) {
  const url = `${API_CONFIG.baseUrl}${endpoint}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    
    // Retry on network errors
    if (attempt < API_CONFIG.retryAttempts && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt))
      return request(endpoint, options, attempt + 1)
    }
    
    throw error
  }
}

// ============================================
// TRANSACTION API
// ============================================

export const TransactionAPI = {
  /**
   * Fetch all transactions
   */
  async getAll() {
    // TODO: Replace with real API call
    // return request('/transactions')
    return { success: true, data: [], message: 'Using local data' }
  },
  
  /**
   * Fetch transactions for a specific month
   * @param {string} month - Month abbreviation (e.g., 'Dec')
   */
  async getByMonth(month) {
    // TODO: Replace with real API call
    // return request(`/transactions?month=${month}`)
    return { success: true, data: [], message: 'Using local data' }
  },
  
  /**
   * Create a new transaction
   * @param {object} transaction 
   */
  async create(transaction) {
    // TODO: Replace with real API call
    // return request('/transactions', { method: 'POST', body: JSON.stringify(transaction) })
    return { success: true, data: transaction, message: 'Using local data' }
  },
  
  /**
   * Update a transaction
   * @param {string} id 
   * @param {object} updates 
   */
  async update(id, updates) {
    // TODO: Replace with real API call
    // return request(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    return { success: true, data: updates, message: 'Using local data' }
  },
  
  /**
   * Delete a transaction
   * @param {string} id 
   */
  async delete(id) {
    // TODO: Replace with real API call
    // return request(`/transactions/${id}`, { method: 'DELETE' })
    return { success: true, message: 'Using local data' }
  }
}

// ============================================
// BUDGET API
// ============================================

export const BudgetAPI = {
  /**
   * Fetch all budgets
   */
  async getAll() {
    // TODO: Replace with real API call
    return { success: true, data: [], message: 'Using local data' }
  },
  
  /**
   * Update a budget limit
   * @param {string} category 
   * @param {number} limit 
   */
  async updateLimit(category, limit) {
    // TODO: Replace with real API call
    return { success: true, data: { category, limit }, message: 'Using local data' }
  }
}

// ============================================
// SAVINGS API
// ============================================

export const SavingsAPI = {
  /**
   * Fetch all savings goals
   */
  async getAll() {
    // TODO: Replace with real API call
    return { success: true, data: [], message: 'Using local data' }
  },
  
  /**
   * Create a savings goal
   * @param {object} goal 
   */
  async create(goal) {
    // TODO: Replace with real API call
    return { success: true, data: goal, message: 'Using local data' }
  },
  
  /**
   * Update a savings goal
   * @param {string} id 
   * @param {object} updates 
   */
  async update(id, updates) {
    // TODO: Replace with real API call
    return { success: true, data: updates, message: 'Using local data' }
  },
  
  /**
   * Add funds to a savings goal
   * @param {string} id 
   * @param {number} amount 
   */
  async addFunds(id, amount) {
    // TODO: Replace with real API call
    return { success: true, data: { id, amount }, message: 'Using local data' }
  },
  
  /**
   * Delete a savings goal
   * @param {string} id 
   */
  async delete(id) {
    // TODO: Replace with real API call
    return { success: true, message: 'Using local data' }
  }
}

// ============================================
// RECURRING BILLS API
// ============================================

export const RecurringAPI = {
  /**
   * Fetch all recurring bills
   */
  async getAll() {
    // TODO: Replace with real API call
    return { success: true, data: [], message: 'Using local data' }
  },
  
  /**
   * Create a recurring bill
   * @param {object} bill 
   */
  async create(bill) {
    // TODO: Replace with real API call
    return { success: true, data: bill, message: 'Using local data' }
  },
  
  /**
   * Update a recurring bill
   * @param {string} id 
   * @param {object} updates 
   */
  async update(id, updates) {
    // TODO: Replace with real API call
    return { success: true, data: updates, message: 'Using local data' }
  },
  
  /**
   * Mark a bill as paid/unpaid
   * @param {string} id 
   * @param {boolean} isPaid 
   */
  async togglePaid(id, isPaid) {
    // TODO: Replace with real API call
    return { success: true, data: { id, isPaid }, message: 'Using local data' }
  },
  
  /**
   * Delete a recurring bill
   * @param {string} id 
   */
  async delete(id) {
    // TODO: Replace with real API call
    return { success: true, message: 'Using local data' }
  }
}

// ============================================
// SYNC API
// ============================================

export const SyncAPI = {
  /**
   * Sync all local data with backend
   * @param {object} localData 
   */
  async syncAll(localData) {
    // TODO: Replace with real API call
    // This would send local changes and receive server changes
    return { 
      success: true, 
      data: localData, 
      conflicts: [],
      message: 'Sync not implemented - using local data'
    }
  },
  
  /**
   * Check if server has newer data
   */
  async checkForUpdates(lastSyncTimestamp) {
    // TODO: Replace with real API call
    return { hasUpdates: false, message: 'Using local data' }
  }
}

// ============================================
// EXPORT DEFAULT API OBJECT
// ============================================

export default {
  transactions: TransactionAPI,
  budgets: BudgetAPI,
  savings: SavingsAPI,
  recurring: RecurringAPI,
  sync: SyncAPI,
  config: API_CONFIG
}
