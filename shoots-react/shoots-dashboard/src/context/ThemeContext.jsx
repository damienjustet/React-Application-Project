import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import ColorThief from 'colorthief'

const ThemeContext = createContext(null)

// Default banner image URL
const DEFAULT_BANNER_URL = "https://images.unsplash.com/photo-1632307941173-5d541ea1d940?q=80&w=1792&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

// Convert RGB array to hex
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Convert RGB to HSL for better color manipulation
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
      default: h = 0
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Adjust color for dark theme (Samsung One UI style)
const adjustForDarkTheme = (rgb, index) => {
  const [r, g, b] = rgb
  const hsl = rgbToHsl(r, g, b)
  
  // Create variations based on position in palette
  // Primary colors: more saturated, slightly darker
  // Secondary colors: less saturated, good for backgrounds/accents
  let adjustedL = hsl.l
  let adjustedS = hsl.s
  
  if (index === 0) {
    // Primary - vibrant but not too bright
    adjustedL = Math.min(Math.max(hsl.l, 35), 55)
    adjustedS = Math.min(hsl.s * 1.1, 80)
  } else if (index === 1) {
    // Secondary - slightly muted
    adjustedL = Math.min(Math.max(hsl.l, 40), 60)
    adjustedS = Math.min(hsl.s * 0.9, 70)
  } else if (index === 2) {
    // Tertiary - softer
    adjustedL = Math.min(Math.max(hsl.l, 45), 65)
    adjustedS = Math.min(hsl.s * 0.8, 60)
  } else {
    // Additional colors - progressively more muted
    adjustedL = Math.min(Math.max(hsl.l, 50), 70)
    adjustedS = Math.min(hsl.s * (0.7 - index * 0.05), 50)
  }
  
  return `hsl(${hsl.h}, ${adjustedS}%, ${adjustedL}%)`
}

// Create a muted/subtle version for backgrounds
const createSubtleColor = (rgb) => {
  const [r, g, b] = rgb
  const hsl = rgbToHsl(r, g, b)
  // Very desaturated and dark for backgrounds
  return `hsla(${hsl.h}, ${Math.min(hsl.s * 0.3, 20)}%, ${Math.min(hsl.l * 0.3, 15)}%, 0.5)`
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNER_URL)
  const [palette, setPalette] = useState({
    primary: '#6a8a6d',      // Default muted green
    secondary: '#8b9e8c',    // Default secondary
    tertiary: '#a5b5a6',     // Default tertiary
    accent1: '#7d9a7f',      // Additional accent
    accent2: '#92a893',      // Additional accent
    accent3: '#a8b8a9',      // Additional accent
    subtle: 'rgba(106, 138, 109, 0.15)', // Subtle background tint
    raw: []                  // Raw RGB values
  })
  const [isLoading, setIsLoading] = useState(true)

  // Extract colors from banner image
  const extractColors = useCallback((imageUrl) => {
    setIsLoading(true)
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const colorThief = new ColorThief()
        // Get a palette of 6 colors
        const extractedPalette = colorThief.getPalette(img, 6)
        
        if (extractedPalette && extractedPalette.length >= 6) {
          const newPalette = {
            primary: adjustForDarkTheme(extractedPalette[0], 0),
            secondary: adjustForDarkTheme(extractedPalette[1], 1),
            tertiary: adjustForDarkTheme(extractedPalette[2], 2),
            accent1: adjustForDarkTheme(extractedPalette[3], 3),
            accent2: adjustForDarkTheme(extractedPalette[4], 4),
            accent3: adjustForDarkTheme(extractedPalette[5], 5),
            subtle: createSubtleColor(extractedPalette[0]),
            raw: extractedPalette
          }
          
          setPalette(newPalette)
          
          // Apply CSS custom properties to root
          const root = document.documentElement
          root.style.setProperty('--theme-primary', newPalette.primary)
          root.style.setProperty('--theme-secondary', newPalette.secondary)
          root.style.setProperty('--theme-tertiary', newPalette.tertiary)
          root.style.setProperty('--theme-accent1', newPalette.accent1)
          root.style.setProperty('--theme-accent2', newPalette.accent2)
          root.style.setProperty('--theme-accent3', newPalette.accent3)
          root.style.setProperty('--theme-subtle', newPalette.subtle)
        }
      } catch (error) {
        console.error('Error extracting colors:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    img.onerror = () => {
      console.error('Error loading image for color extraction')
      setIsLoading(false)
    }
    
    img.src = imageUrl
  }, [])

  // Extract colors when banner URL changes
  useEffect(() => {
    extractColors(bannerUrl)
  }, [bannerUrl, extractColors])

  // Update banner and trigger color extraction
  const updateBanner = useCallback((newUrl) => {
    setBannerUrl(newUrl)
  }, [])

  // Get category colors based on palette
  const getCategoryColors = useCallback(() => {
    return {
      'Dining': palette.primary,
      'Shopping': palette.secondary,
      'Groceries': palette.tertiary,
      'Transportation': palette.accent1,
      'Entertainment': palette.accent2,
      'Bills and Utilities': palette.accent3,
      'Other': palette.secondary
    }
  }, [palette])

  const value = {
    bannerUrl,
    updateBanner,
    palette,
    isLoading,
    getCategoryColors
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
