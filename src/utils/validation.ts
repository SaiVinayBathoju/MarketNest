export function validateEmail(email: string): string | null {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.trim()) return 'Email is required'
  if (!re.test(email)) return 'Enter a valid email address'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value?.trim()) return `${fieldName} is required`
  return null
}

export function validatePrice(price: string | number): string | null {
  const n = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(n) || n < 0) return 'Enter a valid price'
  return null
}
