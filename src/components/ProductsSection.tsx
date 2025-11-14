// src/components/ProductsSection.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // TODO: Import useNavigate
import { useCartContext } from "../contexts/CartContext"; // ← Add this line
import { productAPI } from "../services/api";

// ... (keep your existing interfaces and functions)
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

interface ProductsSectionProps {
  user: any;
  onLogout: () => void;
}

interface Category {
  slug: string;
  name: string;
  url: string;
}

interface CartItem {
  productId: number;
  quantity: number;
  addedAt: number;
}

interface APIResponse {
  products: any[];
  total: number;
  skip: number;
  limit: number;
}

//Sanitize the string when retreieving from API
function sanitizeString(str: string): string {
  return String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function validateProduct(product: any): Product | null {
  //TODO: Check if product exists and is an object
  if (!product || typeof product !== "object") {
    console.error("Invalid product: data is missing or not an object");
    return null;
  }
  // TODO: Validate required fields
  // Hint: What fields are absolutely necessary?
  const requiredFields = [
    "id",
    "title",
    "price",
    "thumbnail",
    "category",
    "description",
    "rating",
    "stock",
  ];
  for (const fields of requiredFields) {
    if (!product[fields]) {
      console.log(`Invalid response: missing required field '${fields}'`);
      return null;
    }
  }

  // - id must be a number
  if (typeof product.id !== "number") {
    console.log("Invalid response: Product id must be a number");
    return null;
  }
  // - title must be a non-empty string
  if (typeof product.title !== "string" || product.title.trim() === "") {
    console.log("Invalid response: Product title must be a non-empty string");
    return null;
  }
  // - price must be a number (and > 0?)
  if (typeof product.price !== "number" || product.price <= 0) {
    console.log("Invalid response: Product price must be a number or > 0");
    return null;
  }
  // - thumbnail must be a string (check if it's a valid URL?)
  if (typeof product.thumbnail !== "string") {
    console.log(
      "Invalid response: Product thumbnail must be a valid URL (string)"
    );
    return null;
  }
  // TODO: Return sanitized product object
  // Hint: Use sanitizeString for text fields
  // Hint: Use Number() to ensure numeric fields are numbers
  // Hint: Provide default values for optional fields (rating, stock)
  const sanitizedProduct: Product = {
    id: product.id,
    title: sanitizeString(String(product.title).trim()),
    price: product.price,
    category: sanitizeString(String(product.category).trim()),
    description: sanitizeString(String(product.description).trim()),
    thumbnail: String(product.thumbnail || "").trim(),
    rating: product.rating,
    stock: product.stock,
  };

  //Sanitized Thumbnail/Images
  if (
    sanitizedProduct.thumbnail &&
    !sanitizedProduct.thumbnail.startsWith("http")
  ) {
    console.warn("⚠️ Suspicious image URL detected, removing");
    sanitizedProduct.thumbnail = "";
  }

  console.log("✅ User validation passed:", sanitizedProduct);
  return sanitizedProduct;
}

export function ProductsSection({ user, onLogout }: ProductsSectionProps) {
  // TODO: Add navigate hook
  const navigate = useNavigate();

  //Get cart from context
  const { cart, addToCart } = useCartContext();

  // ... (your existing states)
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  //Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const PRODUCTS_PER_PAGE = 20;

  //Search products function states
  const [searchQuery, setSearchQuery] = useState<string>("");

  //Search - Debounce version states
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  //Category filter states
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  //Sorting state
  const [sortBy, setSortBy] = useState<string>("");

  //useEffect to fetch categories
  useEffect(() => {
    productAPI.getCategories().then((categories: string[]) => {
      // Backend returns simple string array, convert to Category objects
      const categoryObjects = categories.map((cat) => ({
        slug: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        url: `/products?category=${cat}`,
      }));
      setCategories(categoryObjects);
    });
  }, []);

  //useEffect to debounce searchQuery
  useEffect(() => {
    // Wait 500ms after user stops typing
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    // Cleanup: cancel the timer if user keeps typing
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // TODO: Calculate skip value for pagination
    const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;
    // TODO: Set loading to true
    setLoading(true);
    setError("");

    // TODO: Build the correct URL based on selectedCategory and debouncedSearch
    let apiCall;

    if (selectedCategory) {
      // If category is selected, use category endpoint
      apiCall = productAPI.getProductsByCategory(
        selectedCategory,
        PRODUCTS_PER_PAGE,
        skip
      );
    } else if (debouncedSearch) {
      // If searching, use search endpoint
      apiCall = productAPI.searchProducts(debouncedSearch, PRODUCTS_PER_PAGE);
    } else {
      //Default: all products
      apiCall = productAPI.getAllProducts(PRODUCTS_PER_PAGE, skip);
    }

    // TODO: Fetch products
    apiCall
      .then((data: APIResponse) => {
        // API service already handles response checking and returns JSON
        // So we can directly validate the products
        const validatedProduct = (data.products || [])
          .map(validateProduct)
          .filter((p: Product | null): p is Product => p !== null);

        setProducts(validatedProduct);
        setTotalProducts(data.total);
      })
      .catch((error: APIResponse) => {
        // TODO: Set error message
        setError("Failed to load products. Please try again.");
        console.error(error);
      })
      .finally(() => {
        // TODO: Set loading to false
        setLoading(false);
      });
  }, [currentPage, debouncedSearch, selectedCategory]); // Re-run when page changes

  // Sort products based on sortBy value
  function getSortedProducts() {
    // Start with a copy of products array (don't mutate original!)
    const sortedProducts = [...products];

    // TODO: Implement sorting logic
    if (sortBy === "price-asc") {
      // Sort by price: low to high
      // Hint: use .sort() with a comparator function
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      // Sort by price: high to low
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-asc") {
      // Sort by rating: low to high
      sortedProducts.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "rating-desc") {
      // Sort by rating: high to low
      sortedProducts.sort((a, b) => b.rating - a.rating);
    }

    return sortedProducts;
  }

  //RETURNING UI DISPLAY
  return (
    <div className="container mt-5">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">🛍️ Products Store</span>
          <div className="d-flex gap-2">
            <span className="navbar-text me-3">
              Welcome, <strong>{user.firstName}</strong>!
            </span>
            {/* TODO: Update navigation to use navigate() instead of callback */}

            {/*Button for Cart */}
            <button
              className="btn btn-outline-success btn-sm position-relative"
              onClick={() => navigate("/cart")}
            >
              🛒 Cart
              {/*Conditional Rendering - if cart.length > 0 is true -> render the badge, if cart.length > 0 is flase -> render nothing */}
              {cart.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {/*This calculate the total quantity of all items in cart */}
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>

            {/*Button for User's Dashboard */}
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              👤 My Dashboard
            </button>

            {/*Button for Log Out */}
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Search/Filter bar for products */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-asc">Rating: Low to High</option>
            <option value="rating-desc">Rating: High to Low</option>
          </select>
        </div>
      </div>

      {/* TODO: Add Loading State */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading products...</p>
        </div>
      )}

      {/* TODO: Add Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* TODO: Add Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div>
          <h3 className="mb-4">
            Products (Page {currentPage} of{" "}
            {Math.ceil(totalProducts / PRODUCTS_PER_PAGE)})
          </h3>

          {/* Products Grid Container */}
          <div className="row g-4">
            {/* TODO: Map through products and create cards */}
            {getSortedProducts().map((product) => (
              <div
                key={product.id}
                className="col-lg-3 col-md-4 col-sm-6"
                style={{ minWidth: "280px", maxWidth: "350px" }}
              >
                {/* Make entire card clickable with hover effect */}
                <div
                  className="card h-100 product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#28a745";
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(40, 167, 69, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Product Image */}
                  <img
                    src={product.thumbnail}
                    className="card-img-top"
                    alt={product.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />

                  <div className="card-body d-flex flex-column">
                    {/* Product title */}
                    <h5 className="card-title">{product.title}</h5>

                    {/* Category badge */}
                    <p className="text-muted small">{product.category}</p>

                    {/* Price */}
                    <p className="fw-bold text-success">${product.price}</p>

                    {/* Rating and stock */}
                    <div className="small mb-3">
                      <span>⭐ {product.rating}</span>
                      <span className="ms-2">📦 {product.stock} in stock</span>
                    </div>

                    {/* Quick Add to Cart Button */}
                    <button
                      className="btn btn-primary btn-sm mt-auto"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        e.preventDefault(); // Prevent any default behavior
                        addToCart(product);
                        // Optional: Show feedback
                        console.log(`Added ${product.title} to cart!`);
                      }}
                    >
                      🛒 Quick Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TODO: Add Pagination Controls */}
          {/* Pagination Controls */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              className="btn btn-outline-primary"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <span className="align-self-center">
              Page {currentPage} of{" "}
              {Math.ceil(totalProducts / PRODUCTS_PER_PAGE)}
            </span>

            <button
              className="btn btn-outline-primary"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={
                currentPage >= Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
              }
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* TODO: Add "No Products" State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center my-5">
          <p className="text-muted">No products found.</p>
        </div>
      )}
    </div>
  );
}
