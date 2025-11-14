import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCartContext } from "../contexts/CartContext";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

interface ProductDetailsPageProps {
  user: any;
  onLogout: () => void;
}

export function ProductDetailsPage({
  user,
  onLogout,
}: ProductDetailsPageProps) {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
  const navigate = useNavigate();
  const { cart, addToCart } = useCartContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`https://dummyjson.com/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Handle add to cart with quantity
  const handleAddToCart = () => {
    if (!product) return;

    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    // Show feedback (we'll improve this later)
    alert(`Added ${quantity} ${product.title} to cart!`);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mt-5 text-center">
        <h3>Product Not Found</h3>
        <p className="text-muted">{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/products")}
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">📦 Product Details</span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success btn-sm position-relative"
              onClick={() => navigate("/cart")}
            >
              🛒 Cart
              {cart.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/products")}
            >
              🛍️ Products
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

      {/* Product Details */}
      <div className="row">
        {/* Left: Images */}
        <div className="col-md-6">
          {/* Main Image */}
          <img
            src={product.images[selectedImage] || product.thumbnail}
            alt={product.title}
            className="img-fluid rounded mb-3"
            style={{ width: "100%", height: "400px", objectFit: "cover" }}
          />

          {/* Image Thumbnails */}
          <div className="d-flex gap-2">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.title} ${index + 1}`}
                className={`img-thumbnail ${
                  selectedImage === index ? "border-primary" : ""
                }`}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="col-md-6">
          <h1 className="mb-3">{product.title}</h1>

          <div className="mb-3">
            <span className="badge bg-secondary">{product.brand}</span>
            <span className="badge bg-info ms-2">{product.category}</span>
          </div>

          <div className="mb-3">
            <span className="text-warning">
              {"⭐".repeat(Math.round(product.rating))} {product.rating}
            </span>
          </div>

          <h2 className="text-success mb-3">${product.price}</h2>

          <p className="text-muted">{product.description}</p>

          <div className="alert alert-info">
            <strong>Stock:</strong> {product.stock} available
          </div>

          {/* Quantity Selector */}
          <div className="mb-3">
            <label className="form-label">Quantity:</label>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                className="form-control text-center"
                style={{ width: "80px" }}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                max={product.stock}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className="btn btn-primary btn-lg w-100 mb-3"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? "🛒 Add to Cart" : "Out of Stock"}
          </button>

          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate("/products")}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    </div>
  );
}
