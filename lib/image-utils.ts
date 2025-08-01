/**
 * Ensures a URL is absolute by adding the origin if it's a relative URL
 */
export function ensureAbsoluteUrl(url: string): string {
  if (typeof window === "undefined") return url

  // If it's already absolute, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // If it's a data URL, return it
  if (url.startsWith("data:")) {
    return url
  }

  // Otherwise, make it absolute
  return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`
}

/**
 * Checks if an image URL is valid by attempting to load it
 */
export function checkImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
