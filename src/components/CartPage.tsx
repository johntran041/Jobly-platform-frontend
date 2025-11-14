import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../contexts/CartContext"; // ← Add this
import { productAPI } from "../services/api";

interface CartItem {
  productId: number;
  quantity: number;
  addedAt: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  description: string;
  rating: number;
  stock: number;
}

interface CartPageProps {
  user: any;
  onLogout: () => void;
}

export function CartPage({ user, onLogout }: CartPageProps) {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCartContext();

  // TODO: State for loading full product details
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // TODO: useEffect to fetch product details for cart items
  // Fetch product details for all cart items
  useEffect(() => {
    if (cart.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    //Fetch all products in parallel
    const fetchPromises = cart.map((cartItem) =>
      productAPI.getProductById(cartItem.productId).then((res) => res.json())
    );
    //Returns: [Promise, Promise, Promise]

    Promise.all(fetchPromises) //Waits for ALL promises to complete
      .then((productsData) => {
        setProducts(productsData);
        setLoading(false);
      })
      // Then, Returns: [product1, product2, product3]

      .catch((error) => {
        console.error("Failed to fetch cart products: ", error);
        setLoading(false);
      });
  }, [cart]);

  // Calculate total PRICE
  const calculateSubtotal = () => {
    return cart.reduce((total, cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      if (product) {
        return total + product.price * cartItem.quantity;
      }
      return total;
    }, 0);
  };

  // Calculate total QUANTITY
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate values before rendering
  const subtotal = calculateSubtotal();
  const totalItems = getTotalItems();

  return (
    <div className="container mt-5">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">🛒 Shopping Cart</span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/products")}
            >
              🛍️ Continue Shopping
            </button>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              👤 Dashboard
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your cart...</p>
        </div>
      )}

      {/* Empty Cart State */}
      {!loading && cart.length === 0 && (
        <div className="text-center my-5">
          <h3>Your cart is empty</h3>
          <p className="text-muted">Add some products to get started!</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      )}

      {/* Cart with Items */}
      {!loading && cart.length > 0 && (
        <div className="row">
          {/* Left Column: Cart Items */}
          <div className="col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Cart Items ({totalItems})</h3>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            {/* Cart Items List */}
            {cart.map((cartItem) => {
              const product = products.find((p) => p.id === cartItem.productId);

              if (!product) return null;

              return (
                <div key={cartItem.productId} className="card mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      {/* Product Image */}
                      <div className="col-md-2">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="img-fluid rounded"
                          style={{ maxHeight: "100px", objectFit: "cover" }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="col-md-4">
                        <h5 className="mb-1">{product.title}</h5>
                        <p className="text-muted small mb-1">
                          {product.category}
                        </p>
                        <p className="fw-bold text-success mb-0">
                          ${product.price}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-md-3">
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              updateQuantity(
                                cartItem.productId,
                                cartItem.quantity - 1
                              )
                            }
                          >
                            -
                          </button>
                          <span className="px-3">{cartItem.quantity}</span>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              updateQuantity(
                                cartItem.productId,
                                cartItem.quantity + 1
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="col-md-3 text-end">
                        <p className="fw-bold mb-2">
                          ${(product.price * cartItem.quantity).toFixed(2)}
                        </p>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeFromCart(cartItem.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Order Summary</h4>

                <div className="d-flex justify-content-between mb-2">
                  <span>Items ({totalItems}):</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span className="text-success">FREE</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-4">
                  <strong>Total:</strong>
                  <strong className="text-primary">
                    ${subtotal.toFixed(2)}
                  </strong>
                </div>

                <button className="btn btn-primary w-100 mb-2">
                  Proceed to Checkout
                </button>

                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
