// Simple client-side auth helpers using localStorage
export const AUTH_KEY = 'surakshabot_auth'

export function setAuth() {
  try {
    localStorage.setItem(AUTH_KEY, 'true')
  } catch (e) {
    console.error('Unable to set auth:', e)
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY)
  } catch (e) {
    console.error('Unable to clear auth:', e)
  }
}

export function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true'
  } catch (e) {
    return false
  }
}
