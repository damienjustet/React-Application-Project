/**
 * Storage Service
 * 
 * Handles localStorage persistence for dashboard configuration,
 * user preferences, and cached data.
 */

const STORAGE_KEYS = {
  DASHBOARD_WIDGETS: 'shoots_dashboard_widgets',
  USER_PREFERENCES: 'shoots_user_preferences',
  BANNER_URL: 'shoots_banner_url',
  CACHED_TRANSACTIONS: 'shoots_cached_transactions',
  LAST_SYNC: 'shoots_last_sync'
}

/**
 * Generic storage operations
 */
function getItem(key) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return null
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
    return false
  }
}

function removeItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error)
    return false
  }
}

/**
 * Dashboard Widget Storage
 */
export function saveDashboardWidgets(widgets) {
  return setItem(STORAGE_KEYS.DASHBOARD_WIDGETS, widgets)
}

// Debounced version to prevent excessive writes
let saveTimeout = null
export function debouncedSaveDashboardWidgets(widgets) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    setItem(STORAGE_KEYS.DASHBOARD_WIDGETS, widgets)
  }, 300)
}

export function loadDashboardWidgets() {
  return getItem(STORAGE_KEYS.DASHBOARD_WIDGETS) || []
}

export function clearDashboardWidgets() {
  return removeItem(STORAGE_KEYS.DASHBOARD_WIDGETS)
}

/**
 * User Preferences Storage
 */
export function saveUserPreferences(preferences) {
  const current = loadUserPreferences()
  return setItem(STORAGE_KEYS.USER_PREFERENCES, { ...current, ...preferences })
}

export function loadUserPreferences() {
  return getItem(STORAGE_KEYS.USER_PREFERENCES) || {
    sidebarExpanded: true,
    selectedMonth: null,
    showGridLines: true,
    compactMode: false
  }
}

export function clearUserPreferences() {
  return removeItem(STORAGE_KEYS.USER_PREFERENCES)
}

/**
 * Banner URL Storage
 */
export function saveBannerUrl(url) {
  return setItem(STORAGE_KEYS.BANNER_URL, url)
}

export function loadBannerUrl() {
  return getItem(STORAGE_KEYS.BANNER_URL)
}

/**
 * Transaction Cache Storage (for offline support)
 */
export function cacheTransactions(transactions) {
  return setItem(STORAGE_KEYS.CACHED_TRANSACTIONS, {
    data: transactions,
    timestamp: Date.now()
  })
}

export function loadCachedTransactions() {
  const cached = getItem(STORAGE_KEYS.CACHED_TRANSACTIONS)
  return cached ? cached.data : null
}

export function getCacheTimestamp() {
  const cached = getItem(STORAGE_KEYS.CACHED_TRANSACTIONS)
  return cached ? cached.timestamp : null
}

export function isCacheStale(maxAge = 3600000) { // Default 1 hour
  const timestamp = getCacheTimestamp()
  if (!timestamp) return true
  return Date.now() - timestamp > maxAge
}

/**
 * Last Sync Timestamp
 */
export function saveLastSync() {
  return setItem(STORAGE_KEYS.LAST_SYNC, Date.now())
}

export function getLastSync() {
  return getItem(STORAGE_KEYS.LAST_SYNC)
}

export function getTimeSinceLastSync() {
  const lastSync = getLastSync()
  if (!lastSync) return null
  
  const diff = Date.now() - lastSync
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

/**
 * Clear all app data
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key)
  })
}

/**
 * Export all data for backup
 */
export function exportAllData() {
  const data = {}
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = getItem(key)
  })
  return data
}

/**
 * Import data from backup
 */
export function importData(data) {
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    if (data[name] !== undefined) {
      setItem(key, data[name])
    }
  })
}

export default {
  saveDashboardWidgets,
  loadDashboardWidgets,
  clearDashboardWidgets,
  saveUserPreferences,
  loadUserPreferences,
  clearUserPreferences,
  saveBannerUrl,
  loadBannerUrl,
  cacheTransactions,
  loadCachedTransactions,
  isCacheStale,
  saveLastSync,
  getLastSync,
  getTimeSinceLastSync,
  clearAllData,
  exportAllData,
  importData
}
