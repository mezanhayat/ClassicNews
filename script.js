const GNEWS_API_KEYS = [
  "d44f128c378c43722a831cc284370e0b", // Your key
  "YOUR_SECONDARY_KEY", // Backup key
  "demo" // Fallback (if available)
];

let currentApiKeyIndex = 0;
let currentCategory = "general";
let currentPage = 1;
const pageSize = 4; // Load 4 articles at a time

// DOM Elements
const elements = {
  sectionTitle: document.getElementById("sectionTitle"),
  newsGrid: document.getElementById("newsGrid"),
  featuredArticle: document.getElementById("featuredArticle"),
  articleCount: document.getElementById("articleCount"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  loadMoreBtn: document.getElementById("loadMoreBtn"),
  searchOverlay: document.getElementById("searchOverlay"),
  searchInput: document.getElementById("searchInput"),
  searchResults: document.getElementById("searchResults"),
  contactOverlay: document.getElementById("contactOverlay"),
  contactForm: document.getElementById("contactForm")
};

// Initialize
document.getElementById("currentDate").textContent = new Date().toLocaleDateString();

// GNews API Endpoint Builder
function buildGNewsUrl(category, page = null, searchQuery = null) {
  const baseUrl = "https://gnews.io/api/v4/top-headlines";
  const params = new URLSearchParams({
    q: searchQuery || "",
    category: category === "general" ? "" : category,
    country: "in",
    lang: "en",
    max: pageSize,
    page: page || 1,
    apikey: GNEWS_API_KEYS[currentApiKeyIndex]
  });
  return `${baseUrl}?${params}`;
}

// Main Fetch Function
async function fetchGNews(category = "general", page = 1, searchQuery = null) {
  elements.loading.style.display = "block";
  elements.error.style.display = "none";
  elements.loadMoreBtn.disabled = true;

  try {
    const url = buildGNewsUrl(category, page, searchQuery);
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      if (page === 1) throw new Error("No articles found");
      return false; // No more articles
    }

    if (page === 1) {
      elements.newsGrid.innerHTML = "";
      if (data.articles.length > 0) {
        showFeaturedArticle(data.articles[0]);
        renderNewsCards(data.articles.slice(1));
      }
    } else {
      renderNewsCards(data.articles);
    }

    elements.articleCount.textContent = document.querySelectorAll(".news-card").length + 1;
    return true;

  } catch (err) {
    handleGNewsError(err);
    return false;
  } finally {
    elements.loading.style.display = "none";
    elements.loadMoreBtn.disabled = false;
  }
}

// Search Functionality
async function searchNews(query) {
  elements.loading.style.display = "block";
  elements.searchResults.innerHTML = "";

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=10&apikey=${GNEWS_API_KEYS[currentApiKeyIndex]}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      elements.searchResults.innerHTML = `<p class="no-results">No results found for "${query}"</p>`;
      return;
    }

    data.articles.forEach(article => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";
      resultItem.innerHTML = `
        <h4 class="search-result-title">${article.title}</h4>
        <p class="search-result-description">${truncateText(article.description || "", 120)}</p>
        <div class="search-result-footer">
          <span class="search-result-source">${article.source.name || "Unknown"}</span>
          <a href="${article.url}" target="_blank" class="read-more-btn">Read More</a>
        </div>
      `;
      elements.searchResults.appendChild(resultItem);
    });

  } catch (err) {
    elements.searchResults.innerHTML = `<p class="error-message">Failed to search: ${err.message}</p>`;
  } finally {
    elements.loading.style.display = "none";
  }
}

// Contact Form Handling
function setupContactForm() {
  elements.contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const formData = new FormData(elements.contactForm);
      const response = await fetch("https://formspree.io/f/mkgbqjoo", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showPopupMessage("Message sent successfully!");
        elements.contactForm.reset();
        document.getElementById("contactOverlay").classList.remove("active");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      showPopupMessage("Failed to send message. Please try again.", true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message';
    }
  });
}

// Helper Functions
function showPopupMessage(message, isError = false) {
  const popup = document.createElement("div");
  popup.className = `popup-message ${isError ? 'error' : 'success'}`;
  popup.textContent = message;
  document.body.appendChild(popup);
  
  setTimeout(() => {
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 500);
    }, 3000);
  }, 100);
}

function getPlaceholderImage(type = "card") {
  const sizes = {
    featured: "600x400",
    card: "400x200"
  };
  return `https://via.placeholder.com/${sizes[type]}?text=Classic+News`;
}

function formatDate(dateString) {
  if (!dateString) return "Today";
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function truncateText(text, length) {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

// Initialize Event Listeners
function initEventListeners() {
  // Search functionality
  document.getElementById("searchBtn").addEventListener("click", () => {
    elements.searchOverlay.classList.add("active");
    elements.searchInput.focus();
  });

  document.getElementById("closeSearch").addEventListener("click", () => {
    elements.searchOverlay.classList.remove("active");
  });

  document.getElementById("searchSubmitBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const query = elements.searchInput.value.trim();
    if (query) searchNews(query);
  });

  // Contact functionality
  document.getElementById("contactBtn").addEventListener("click", () => {
    elements.contactOverlay.classList.add("active");
  });

  document.getElementById("closeContact").addEventListener("click", () => {
    elements.contactOverlay.classList.remove("active");
  });

  // Load more button
  elements.loadMoreBtn.addEventListener("click", async () => {
    currentPage++;
    const hasMore = await fetchGNews(currentCategory, currentPage);
    if (!hasMore) {
      elements.loadMoreBtn.disabled = true;
      elements.loadMoreBtn.textContent = "No more articles";
    }
  });

  // Category buttons
  document.querySelectorAll(".nav-btn, .category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.category;
      currentPage = 1;
      elements.sectionTitle.textContent = btn.textContent;
      fetchGNews(currentCategory, 1);
      document.querySelectorAll(".nav-btn, .category-btn").forEach(b => 
        b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// Initialize the app
function init() {
  initEventListeners();
  setupContactForm();
  fetchGNews(currentCategory);
}

// Start the application
init();


// Add this to your script.js
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const closeMobileMenu = document.getElementById("closeMobileMenu");
  const mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");

  // Toggle mobile menu
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenuOverlay.classList.add("active");
  });

  // Close mobile menu
  closeMobileMenu.addEventListener("click", () => {
    mobileMenuOverlay.classList.remove("active");
  });

  // Handle mobile nav clicks
  mobileNavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.category;
      elements.sectionTitle.textContent = btn.textContent;
      fetchGNews(currentCategory);
      mobileMenuOverlay.classList.remove("active");
      
      // Update active state
      document.querySelectorAll(".nav-btn, .category-btn, .mobile-nav-btn").forEach(b => 
        b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// Call this in your init() function
function init() {
  initEventListeners();
  initMobileMenu(); // Add this line
  setupContactForm();
  fetchGNews(currentCategory);
}
