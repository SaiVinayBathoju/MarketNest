import { supabase } from '../lib/supabase'
import type { Product } from '../types/database'

const PAGE_SIZE = 12

export async function fetchProducts(options?: {
  page?: number
  category?: string
  brandId?: string
}): Promise<{ products: Product[]; hasMore: boolean }> {
  const page = options?.page ?? 1
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (options?.category) {
    query = query.eq('category', options.category)
  }
  if (options?.brandId) {
    query = query.eq('brand_id', options.brandId)
  }

  const { data, error, count } = await query
  if (error) throw error

  const hasMore = count ? offset + data.length < count : false
  return { products: data as Product[], hasMore }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Product
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      updated_at: new Date().toISOString()
    } as never)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function updateProduct(
  id: string,
  updates: Partial<Pick<Product, 'name' | 'description' | 'price' | 'category' | 'image_url'>>
) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
