'use server'

// In your server action or API route
import { revalidatePath } from 'next/cache'

export async function revalidatePathAction(path, type='page') {
  try {
    revalidatePath(path, type)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}