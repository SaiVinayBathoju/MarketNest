import { supabase } from '../lib/supabase'
import type { CartItem, Product } from '../types/database'

export interface CartItemWithProduct extends CartItem {
  products: Product
}

export async function fetchCartItems(userId: string): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as CartItemWithProduct[]
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<CartItem> {

  const { data: existing, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()

  if (fetchError) throw fetchError

  const existingItem = existing as CartItem | null

  if (existingItem) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: existingItem.quantity + quantity,
      })
      .eq('id', existingItem.id)
      .select()
      .single()

    if (error) throw error
    return data as CartItem
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: userId,
      product_id: productId,
      quantity,
    })
    .select()
    .single()

  if (error) throw error
  return data as CartItem
}


export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItem> {

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select()
    .single()

  if (error) throw error
  return data as CartItem
}


export async function removeFromCart(cartItemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) throw error
}

export async function clearCart(userId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

export async function getCartItemCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}
