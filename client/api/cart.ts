import api from "@/api/api";
import type { CartItem, Product, ProductCategory } from "@/types";
import type { Product as ApiProduct } from "@/store/slices/productSlicer";

interface AddToCartPayload {
  product_id: number;
  product_count: number;
}

interface ApiCartItem extends Omit<ApiProduct, "images"> {
  cart_id: number;
  product_count: number;
  category: string;
  featured: boolean;
  images: { url: string; is_main: boolean }[];
  sizes: { size: string; stock: number }[];
}

interface CartResponse {
  success: boolean;
  message: string;
  data: ApiCartItem[];
}

const productCategories: ProductCategory[] = [
  "tshirts",
  "shirts",
  "trousers",
  "jackets",
  "accessories",
];

export async function getCart(): Promise<CartItem[]> {
  const response = await api.get<CartResponse>("cart/get-cart", {
    withCredentials: true,
  });

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || "Unable to load your cart.");
  }

  return response.data.data.map((item) => {
    const category = item.category.toLowerCase().replace(/-/g, "");
    const product: Product = {
      id: String(item.id),
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: Number(item.price),
      images: item.images.map((image) => image.url),
      category: productCategories.includes(category as ProductCategory)
        ? category as ProductCategory
        : "shirts",
      sizes: item.sizes.map((size) => ({
        value: size.size.toLowerCase(),
        label: size.size,
        inStock: size.stock > 0,
      })),
      colors: [{ name: "Black", value: "#000000" }],
      rating: 0,
      reviewCount: 0,
      inStock: Number(item.stock) > 0,
      featured: item.featured,
    };
    const selectedSize =
      item.sizes.find((size) => size.stock > 0)?.size.toLowerCase() ?? "m";

    return {
      product,
      quantity: Number(item.product_count),
      selectedSize,
      selectedColor: "Black",
    };
  });
}

export async function addProductToCart({ product_id, product_count }: AddToCartPayload) {
  if (!Number.isSafeInteger(product_id) || product_id <= 0) {
    throw new Error("Invalid product");
  }
  if (!Number.isInteger(product_count) || product_count < 1 || product_count > 10) {
    throw new Error("Quantity must be between 1 and 10");
  }

  await api.post(
    "cart/add-to-cart",
    { product_id, product_count },
    { withCredentials: true }
  );
}

export async function deleteProductFromCart(productId: string) {
  const parsedId = Number(productId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error("Invalid product");
  }

  await api.delete(`cart/delete-cart/${parsedId}`, {
    withCredentials: true,
  });
}
