import api from './axios'

export async function getProtectedFileBlob(fileUrl: string): Promise<Blob> {
  const response = await api.get(fileUrl, {
    responseType: 'blob',
  })

  return response.data
}