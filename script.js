const GNEWS_API_KEYS = [
  "d44f128c378c43722a831cc284370e0b", // Your key
  "YOUR_SECONDARY_KEY", // Backup key
  "demo" // Fallback (if available)
];

let currentApiKeyIndex = 0;
let currentCategory = "general";
const pageSize = 10; // GNews default/max

// DOM Elements
const elements = {
  sectionTitle: document.getElementById("sectionTitle"),
  newsGrid: document.getElementById("newsGrid"),
  featuredArticle: document.getElementById("featuredArticle"),
  articleCount: document.getElementById("articleCount"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  loadMoreBtn: document.getElementById("loadMoreBtn")
};

// Initialize
document.getElementById("currentDate").textContent = new Date().toLocaleDateString();

// GNews API Endpoint Builder
function buildGNewsUrl(category, pageToken = null) {
  const baseUrl = "https://gnews.io/api/v4/top-headlines";
  const params = new URLSearchParams({
    category: category === "general" ? "" : category,
    country: "in",
    lang: "en",
    max: pageSize,
    apikey: GNEWS_API_KEYS[currentApiKeyIndex],
    ...(pageToken && { page: pageToken })
  });
  return `${baseUrl}?${params}`;
}

// Main Fetch Function
async function fetchGNews(category = "general") {
  elements.loading.style.display = "block";
  elements.error.style.display = "none";

  try {
    const url = buildGNewsUrl(category);
    const response = await fetch(url);

    // Handle HTTP errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      throw new Error("No articles found");
    }

    renderNews(data.articles);
    elements.articleCount.textContent = data.articles.length;

  } catch (err) {
    handleGNewsError(err);
  } finally {
    elements.loading.style.display = "none";
  }
}

// Render News
function renderNews(articles) {
  // Clear existing content
  elements.newsGrid.innerHTML = "";
  elements.featuredArticle.innerHTML = "";

  // Featured article (first item)
  if (articles.length > 0) {
    const featured = articles[0];
    elements.featuredArticle.innerHTML = `
      <div class="featured-grid">
        <div class="featured-image-container">
          <img src="${getOptimizedImageUrl(featured.image, 'featured')}" 
               alt="${featured.title}" 
               onerror="this.src='${getPlaceholderImage('featured')}'"
               loading="lazy">
          <div class="featured-tag">${featured.source?.name || "Source"}</div>
        </div>
        <div class="featured-content">
          <h2>${featured.title}</h2>
          <p>${featured.description || ""}</p>
          <div class="featured-meta">
            <span>${formatDate(featured.publishedAt)}</span>
            <a href="${featured.url}" target="_blank">Read Full Story</a>
          </div>
        </div>
      </div>
    `;
    elements.featuredArticle.style.display = "block";
  }

  // Regular articles
  const newsGridFragment = document.createDocumentFragment();
  
  articles.slice(1).forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <div class="news-image-container">
        <img src="${getOptimizedImageUrl(article.image, 'card')}" 
             alt="${article.title}"
             onerror="this.src='${getPlaceholderImage('card')}'"
             loading="lazy">
        <div class="news-source-tag">${article.source?.name || "Source"}</div>
      </div>
      <div class="news-content">
        <h3>${article.title}</h3>
        <p>${truncateText(article.description || "", 100)}</p>
        <div class="news-footer">
          <span>${formatDate(article.publishedAt)}</span>
          <a href="${article.url}" target="_blank">Read More</a>
        </div>
      </div>
    `;
    newsGridFragment.appendChild(card);
  });
  
  elements.newsGrid.appendChild(newsGridFragment);
}

// New helper functions
function getOptimizedImageUrl(imageUrl, type) {
  if (!imageUrl) return getPlaceholderImage(type);
  
  // If using an image service that supports resizing:
  // return `${imageUrl}?width=${type === 'featured' ? 800 : 400}&height=300&fit=cover`;
  
  return imageUrl; // Fallback to original URL
}

function getPlaceholderImage(type) {
  const aspectRatios = {
    featured: '16/9',
    card: '4/3'
  };
  const color = type === 'featured' ? '6366f1' : '64748b';
  return `https://placehold.co/${type === 'featured' ? 800 : 400}x${type === 'featured' ? 450 : 300}@${aspectRatios[type]}/${color}/ffffff?text=Classic+News`;
}

// Error Handling
function handleGNewsError(error) {
  console.error("GNews Error:", error);
  
  // Key rotation
  if (error.message.includes("API key") && currentApiKeyIndex < GNEWS_API_KEYS.length - 1) {
    currentApiKeyIndex++;
    return fetchGNews(currentCategory);
  }

  // Show error to user
  elements.error.innerHTML = `
    <div class="error-content">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${getUserFriendlyError(error)}</p>
      <button class="retry-btn" onclick="fetchGNews(currentCategory)">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>
  `;
  elements.error.style.display = "block";

  // Fallback content
  if (elements.newsGrid.children.length === 0) {
    showFallbackContent();
  }
}

// Helper Functions
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

function getUserFriendlyError(error) {
  if (error.message.includes("quota")) return "Daily limit reached";
  if (error.message.includes("API key")) return "Service unavailable";
  if (error.message.includes("No articles")) return "No news found for this category";
  return "Failed to load news. Please try again later.";
}

function showFallbackContent() {
  elements.newsGrid.innerHTML = `
    <div class="fallback-news">
      <h3>Latest Updates</h3>
      <ul>
        <li>Global leaders meet for climate summit</li>
        <li>Tech innovations announced at CES</li>
        <li>Sports team wins national championship</li>
      </ul>
      <p>Full news service will resume shortly</p>
    </div>
  `;
}

// Event Listeners
document.querySelectorAll(".nav-btn, .category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    elements.sectionTitle.textContent = btn.textContent;
    fetchGNews(currentCategory);
    
    // Update active state
    document.querySelectorAll(".nav-btn, .category-btn").forEach(b => 
      b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Initialize
fetchGNews(currentCategory);
