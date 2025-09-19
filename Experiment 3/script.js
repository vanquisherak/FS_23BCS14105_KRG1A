const products = [
  { name: "Laptop", category: "electronics", price: 1200 },
  { name: "Headphones", category: "electronics", price: 80 },
  { name: "T-Shirt", category: "clothing", price: 25 },
  { name: "Jeans", category: "clothing", price: 60 },
  { name: "Novel Book", category: "books", price: 15 },
  { name: "Textbook", category: "books", price: 90 },
];

const categorySelect = document.getElementById("category");
const priceSelect = document.getElementById("price");
const productsContainer = document.getElementById("products");

function filterProducts() {
  const selectedCategory = categorySelect.value;
  const selectedPrice = priceSelect.value;

  const filtered = products.filter(product => {
    let categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    let priceMatch = false;

    if(selectedPrice === "all") priceMatch = true;
    else if(selectedPrice === "low") priceMatch = product.price < 50;
    else if(selectedPrice === "medium") priceMatch = product.price >= 50 && product.price <= 100;
    else if(selectedPrice === "high") priceMatch = product.price > 100;

    return categoryMatch && priceMatch;
  });

  displayProducts(filtered);
}

function displayProducts(productsList) {
  productsContainer.innerHTML = productsList.length ? productsList.map(product => `
    <div class="product-card">
      <h3>${product.name}</h3>
      <p>Category: ${product.category}</p>
      <p>Price: $${product.price}</p>
    </div>
  `).join('') : "<p>No products found.</p>";
}

categorySelect.addEventListener("change", filterProducts);
priceSelect.addEventListener("change", filterProducts);

// Initial display
displayProducts(products);