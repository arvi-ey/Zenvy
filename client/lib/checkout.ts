import type { CartItem } from '@/types'

export function getSingleItemCheckoutHref(item: CartItem) {
  const params = new URLSearchParams({
    productId: item.product.id,
    size: item.selectedSize.toLowerCase(),
    color: item.selectedColor,
  })
  return `/checkout?${params.toString()}`
}

export function getSingleCheckoutItem(
  items: CartItem[],
  productId: string | null,
  size: string | null,
  color: string | null
) {
  if (!productId || !size || !color) return null
  return items.find(
    (item) =>
      item.product.id === productId &&
      item.selectedSize.toLowerCase() === size.toLowerCase() &&
      item.selectedColor === color
  ) ?? null
}
