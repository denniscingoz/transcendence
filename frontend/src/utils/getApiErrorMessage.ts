//Converts backend errors into readable messages
// Extracts a user-friendly error message from different backend/API error formats.

export function getApiErrorMessage(error: unknown): string {
  const status =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined

  const data =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { data?: unknown } }).response?.data
      : undefined

  if (status === 413) {
    return 'The uploaded file is too large.'
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'errors' in data &&
    typeof (data as { errors?: unknown }).errors === 'object' &&
    (data as { errors?: unknown }).errors !== null
  ) {
    const firstError = Object.values(
      (data as { errors: Record<string, string[]> }).errors
    )[0]?.[0]

    if (firstError) return firstError
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'detail' in data &&
    typeof (data as { detail?: unknown }).detail === 'string' &&
    (data as { detail: string }).detail.trim()
  ) {
    return (data as { detail: string }).detail
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    typeof (data as { title?: unknown }).title === 'string' &&
    (data as { title: string }).title.trim()
  ) {
    return (data as { title: string }).title
  }

  if (typeof data === 'string' && data.includes('413 Request Entity Too Large')) {
    return 'The uploaded file is too large.'
  }

  return 'Request failed.'
}