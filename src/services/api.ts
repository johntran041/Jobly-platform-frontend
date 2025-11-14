// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const productAPI = {
  // Get all products
  getAllProducts: async (limit = 20, skip = 0) => {
    const response = await fetch(
      `${API_URL}/products?limit=${limit}&skip=${skip}`
    );
    if (!response.ok) throw new Error("Failed to fetch products");
    const json = await response.json();

    // Handle new response format from Day 2
    if (json.data) {
      return {
        products: json.data.products,
        total: json.data.total,
        skip: json.data.skip,
        limit: json.data.limit,
      };
    }

    // Fallback for old format
    return json;
  },

  // Get products by category
  getProductsByCategory: async (category: any, limit = 20, skip = 0) => {
    const response = await fetch(
      `${API_URL}/products?category=${category}&limit=${limit}&skip=${skip}`
    );
    if (!response.ok) throw new Error("Failed to fetch products");
    const json = await response.json();

    // Handle new response format
    if (json.data) {
      return {
        products: json.data.products,
        total: json.data.total,
        skip: json.data.skip,
        limit: json.data.limit,
      };
    }

    return json;
  },

  // Get single product
  getProductById: async (id: any) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error("Product not found");
    const json = await response.json();

    // Handle new response format
    if (json.data && json.data.product) {
      return json.data.product;
    }

    return json;
  },

  searchProducts: async (query: any, limit = 20) => {
    const response = await fetch(
      `${API_URL}/products/search?q=${query}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Search failed");
    const json = await response.json();

    // Handle new response format
    if (json.data) {
      return {
        products: json.data.products,
        total: json.data.total,
        limit: json.data.limit,
      };
    }

    return json;
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/products/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const json = await response.json();

    // Handle new response format
    if (json.data && json.data.categories) {
      return json.data.categories;
    }

    return json;
  },
};

// NEW: Cart API
export const cartAPI = {
  // Get user's cart
  getCart: async (userId: number) => {
    const response = await fetch(`${API_URL}/cart/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch cart");
    const json = await response.json();
    
    // Handle new response format
    if (json.data && json.data.cart) {
      return json.data.cart;
    }
    
    // Fallback for old format
    return json;
  },

  // Add item to cart
  addToCart: async (userId: number, productId: number, quantity: number = 1) => {
    const response = await fetch(`${API_URL}/cart/${userId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add to cart");
    }
    const json = await response.json();
    
    // Handle new response format
    if (json.data && json.data.cart) {
      return json.data.cart;
    }
    
    // Fallback for old format
    return json;
  },

  // Update item quantity
  updateCartItem: async (userId: number, productId: number, quantity: number) => {
    const response = await fetch(`${API_URL}/cart/${userId}/items/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update cart");
    }
    const json = await response.json();
    
    // Handle new response format
    if (json.data && json.data.cart) {
      return json.data.cart;
    }
    
    // Fallback for old format
    return json;
  },

  // Remove item from cart
  removeFromCart: async (userId: number, productId: number) => {
    const response = await fetch(`${API_URL}/cart/${userId}/items/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove from cart");
    const json = await response.json();
    
    // Handle new response format
    if (json.data && json.data.cart) {
      return json.data.cart;
    }
    
    // Fallback for old format
    return json;
  },

  // Clear cart
  clearCart: async (userId: number) => {
    const response = await fetch(`${API_URL}/cart/${userId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to clear cart");
    const json = await response.json();
    
    // Handle new response format
    if (json.data && json.data.cart) {
      return json.data.cart;
    }
    
    // Fallback for old format
    return json;
  },
};

