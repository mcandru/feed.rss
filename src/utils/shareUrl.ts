import type { Feed } from '../types'

/**
 * Encode feeds array to a URL-safe base64 string
 */
export function encodeFeeds(feeds: Feed[]): string {
  const json = JSON.stringify(feeds)
  // Use base64 encoding, then make it URL-safe
  return btoa(encodeURIComponent(json))
}

/**
 * Decode feeds from a base64 encoded string
 * Returns null if decoding fails
 */
export function decodeFeeds(encoded: string): Feed[] | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const parsed = JSON.parse(json)
    
    // Validate the structure
    if (!Array.isArray(parsed)) return null
    
    // Validate each feed has required properties
    for (const feed of parsed) {
      if (typeof feed.name !== 'string' || typeof feed.url !== 'string') {
        return null
      }
    }
    
    return parsed as Feed[]
  } catch {
    return null
  }
}

/**
 * Check if current URL contains a share parameter
 */
export function isShareUrl(): boolean {
  return window.location.hash.startsWith('#share=')
}

/**
 * Get the encoded share parameter from the URL hash
 * Returns null if not a share URL
 */
export function getShareParam(): string | null {
  const hash = window.location.hash
  if (hash.startsWith('#share=')) {
    return hash.slice(7) // Remove '#share='
  }
  return null
}

/**
 * Generate a full share URL for the given feeds
 */
export function generateShareUrl(feeds: Feed[]): string {
  const encoded = encodeFeeds(feeds)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#share=${encoded}`
}

/**
 * Clear the share parameter from the URL without triggering a page reload
 */
export function clearShareParam(): void {
  history.replaceState(null, '', window.location.pathname)
}
