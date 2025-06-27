const API_KEY = "pub_479521869e790a727903df673ac804ca5f7dc";
let currentCategory = "general";
let currentPage = 1;
const pageSize = 12;
let totalResults = 0;

// DOM Elements
const sectionTitle = document.getElementById("sectionTitle");
const newsGrid = document.getElementById("newsGrid");
const featuredArticle = document.getElementById("featuredArticle");
const articleCount = document.getElementById("articleCount");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMoreContainer = document.getElementById("loadMoreContainer");
const searchBtn = document.getElementById("searchBtn");
const closeSearch = document.getElementById("closeSearch");
const searchOverlay = document.getElementById("searchOverlay");
const contactBtn = document.getElementById("contactBtn");
const closeContact = document.getElementById("closeContact");
const contactOverlay = document.getElementById("contactOverlay");
const navBtns = document.querySelectorAll(".nav-btn");
const categoryBtns = document.querySelectorAll(".category-btn");

// Show today's date
document.getElementById("currentDate").textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Fallback news data
const fallbackNews = {
  results: [
    {
      title: "Breaking News Updates",
      link: "#",
      description: "Stay informed with the latest news coverage from our team.",
      image_url: "https://via.placeholder.com/600x400",
      source_id: "Classic Times",
      pubDate: new Date().toISOString()
    },
    {
      title: "Important Developments",
      link: "#",
      description: "Our journalists are working around the clock to bring you updates.",
      image_url: "https://via.placeholder.com/400x200",
      source_id: "Classic Times",
      pubDate: new Date().toISOString()
    }
  ]
};

// Event Listeners
searchBtn.addEventListener("click", () => searchOverlay.classList.add("active"));
closeSearch.addEventListener("click", () => searchOverlay.classList.remove("active"));
contactBtn.addEventListener("click", () => contactOverlay.classList.add("active"));
closeContact.addEventListener("click", () => contactOverlay.classList.remove("active"));

// Navigation buttons
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    navBtns.forEach(b => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");
    
    const category = btn.dataset.category;
    currentCategory = mapCategoryToApi(category);
    currentPage = 1;
    fetchNews(currentCategory, currentPage);
  });
});

// Category buttons
categoryBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    categoryBtns.forEach(b => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");
    
    const category = btn.dataset.category;
    currentCategory = mapCategoryToApi(category);
    currentPage = 1;
    fetchNews(currentCategory, currentPage);
  });
});

// Load more button
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchNews(currentCategory, currentPage, true);
});

// Map UI categories to API categories
function mapCategoryToApi(category) {
  const categoryMap = {
    "top": "general",
    "world": "world",
    "sports": "sports",
    "technology": "technology",
    "business": "business",
    "entertainment": "entertainment"
  };
  return categoryMap[category] || "general";
}

async function fetchNews(category = "general", page = 1, append = false) {
  loading.style.display = "block";
  error.style.display = "none";
  loadMoreBtn.disabled = true;

  try {
    // Validate and normalize category
    const validCategories = ["general", "world", "sports", "technology", "business", "entertainment"];
    const normalizedCategory = validCategories.includes(category) ? category : "general";

    // Build API URL with required parameters
    const apiUrl = new URL("https://newsdata.io/api/1/news");
    apiUrl.searchParams.append("apikey", API_KEY);
    apiUrl.searchParams.append("country", "us,in,gb"); // Multiple countries for better results
    apiUrl.searchParams.append("language", "en");
    
    // Only add category if not 'general'
    if (normalizedCategory !== "general") {
      apiUrl.searchParams.append("category", normalizedCategory);
    }
    
    // Add pagination parameters
    apiUrl.searchParams.append("page", page);
    
    console.log("Fetching:", apiUrl.toString());

    const response = await fetchWithTimeout(apiUrl.toString(), 8000);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid data format from API");
    }

    const articles = data.results.filter(a => a.title && a.link);

    if (articles.length === 0 && page === 1) {
      throw new Error("No articles found for this category");
    }

    renderNews(data, normalizedCategory, page, append);
  } catch (err) {
    console.error("News fetch error:", err);
    error.style.display = "block";
    error.innerHTML = `
      <p>Failed to load news</p>
      <p><small>${err.message}</small></p>
      <button class="btn-primary" onclick="fetchNews(currentCategory, 1)">Try Again</button>
    `;
    
    // Only show fallback if it's the first page load
    if (page === 1 && !append) {
      renderNews(fallbackNews, category, page, append);
    }
  } finally {
    loading.style.display = "none";
    loadMoreBtn.disabled = false;
  }
}

async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function renderNews(data, category, page, append = false) {
  if (!append) {
    newsGrid.innerHTML = "";
  }

  const articles = data.results || [];
  const categoryTitles = {
    "general": "Latest News",
    "world": "International News",
    "sports": "Sports News",
    "technology": "Technology News",
    "business": "Business News",
    "entertainment": "Entertainment News"
  };

  // Update section title
  sectionTitle.textContent = categoryTitles[category] || "Latest News";
  
  // Update article count
  articleCount.textContent = articles.length;

  // Show featured article if it's the first page
  if (page === 1 && articles.length > 0) {
    showFeaturedArticle(articles[0]);
  }

  // Render news cards
  const startIndex = page === 1 ? 1 : 0;
  for (let i = startIndex; i < articles.length; i++) {
    const article = articles[i];
    renderNewsCard(article);
  }

  // Show/hide load more button
  if (articles.length >= pageSize) {
    loadMoreContainer.style.display = "block";
  } else {
    loadMoreContainer.style.display = "none";
  }
}

function showFeaturedArticle(article) {
  featuredArticle.style.display = "block";
  featuredArticle.innerHTML = `
    <div class="featured-grid">
      <div class="featured-image-container">
        <img src="${article.image_url || 'https://via.placeholder.com/800x450'}" 
             alt="${article.title}" 
             class="featured-image" 
             onerror="this.src='https://via.placeholder.com/800x450'">
      </div>
      <div class="featured-content">
        <span class="featured-tag">FEATURED</span>
        <h2 class="featured-title">${article.title}</h2>
        <p class="featured-description">${article.description || 'No description available'}</p>
        <div class="featured-meta">
          <span class="article-meta">${formatDate(article.pubDate)} • ${article.source_id || 'Unknown Source'}</span>
          <a href="${article.link}" target="_blank" class="read-more-btn">Read Full Story →</a>
        </div>
      </div>
    </div>
  `;
}

function renderNewsCard(article) {
  const card = document.createElement("div");
  card.className = "news-card";
  card.innerHTML = `
    <div class="news-image-container">
      <img src="${article.image_url || 'https://via.placeholder.com/400x225'}" 
           alt="${article.title}" 
           class="news-image" 
           onerror="this.src='https://via.placeholder.com/400x225'">
      <span class="news-source-tag">${article.source_id || 'News'}</span>
    </div>
    <div class="news-content">
      <h3 class="news-title">${article.title}</h3>
      <p class="news-description">${article.description || 'No description available'}</p>
      <div class="news-footer">
        <span class="news-date">${formatDate(article.pubDate)}</span>
        <a href="${article.link}" target="_blank" class="read-more-btn">Read More →</a>
      </div>
    </div>
  `;
  newsGrid.appendChild(card);
}

function formatDate(dateString) {
  if (!dateString) return "Today";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Go to top button
const goToTopBtn = document.getElementById("goToTopBtn");
window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    goToTopBtn.classList.add("visible");
  } else {
    goToTopBtn.classList.remove("visible");
  }
});

goToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  fetchNews(currentCategory, currentPage);
});
