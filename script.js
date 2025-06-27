const API_KEYS = [
  "pub_479521869e790a727903df673ac804ca5f7dc", // Your current key
  "demo" // Fallback demo key (limited)
];

let currentApiKeyIndex = 0;
let currentCategory = "general";
let currentPage = 1;
const pageSize = 12;
let isFetching = false;

// DOM Elements
const sectionTitle = document.getElementById("sectionTitle");
const newsGrid = document.getElementById("newsGrid");
const featuredArticle = document.getElementById("featuredArticle");
const articleCount = document.getElementById("articleCount");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMoreContainer = document.getElementById("loadMoreContainer");

// Show today's date
document.getElementById("currentDate").textContent = new Date().toDateString();

// Sample fallback data
const fallbackNews = {
  general: [
    {
      title: "Important News Update",
      description: "This is a sample news article when the API is unavailable.",
      image_url: "https://via.placeholder.com/600x400",
      source_id: "Classic News",
      pubDate: new Date().toISOString(),
      link: "#"
    }
  ]
};

async function fetchNews(category = "general", page = 1) {
  if (isFetching) return;
  isFetching = true;
  
  loading.style.display = "block";
  error.style.display = "none";
  loadMoreBtn.disabled = true;

  try {
    const validCategories = ["general", "world", "sports", "technology", "business", "entertainment"];
    if (!validCategories.includes(category)) {
      category = "general";
    }

    const apiUrl = `https://newsdata.io/api/1/news?apikey=${API_KEYS[currentApiKeyIndex]}&country=in&language=en&category=${category}&page=${page}`;
    
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.status === "error") {
      throw new Error(data.results?.message || "API returned an error");
    }

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Unexpected response format");
    }

    const articles = data.results.filter(a => a.title && a.link);

    if (articles.length === 0 && page === 1) {
      if (currentApiKeyIndex < API_KEYS.length - 1) {
        currentApiKeyIndex++;
        return fetchNews(category, page);
      }
      showFallbackNews(category);
      return;
    }

    if (page === 1) {
      newsGrid.innerHTML = "";
      if (articles.length > 0) {
        showFeaturedArticle(articles[0]);
        renderNewsCards(articles.slice(1));
      }
    } else {
      renderNewsCards(articles);
    }

    articleCount.textContent = document.querySelectorAll(".news-card").length;
    loadMoreContainer.style.display = articles.length >= pageSize ? "block" : "none";
  } catch (err) {
    console.error("API Error:", err);
    
    if (currentApiKeyIndex < API_KEYS.length - 1) {
      currentApiKeyIndex++;
      return fetchNews(category, page);
    }
    
    showFallbackNews(category);
    error.style.display = "block";
    error.innerHTML = `
      <p>Failed to load news articles</p>
      <p><small>${err.message || "Service temporarily unavailable"}</small></p>
      <button class="btn-primary" onclick="location.reload()">Try Again</button>
    `;
  } finally {
    loading.style.display = "none";
    loadMoreBtn.disabled = false;
    isFetching = false;
  }
}

function showFallbackNews(category) {
  const articles = fallbackNews[category] || fallbackNews.general;
  newsGrid.innerHTML = "";
  showFeaturedArticle(articles[0]);
  if (articles.length > 1) {
    renderNewsCards(articles.slice(1));
  }
  loadMoreContainer.style.display = "none";
  articleCount.textContent = articles.length;
}

function showFeaturedArticle(article) {
  featuredArticle.style.display = "block";
  featuredArticle.innerHTML = `
    <div class="featured-grid">
      <img class="featured-image" src="${article.image_url || "https://via.placeholder.com/600x400"}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/600x400'"/>
      <div class="featured-content">
        <div class="featured-tag">${article.source_id || "Source"}</div>
        <h2 class="featured-title">${article.title}</h2>
        <p class="featured-description">${article.description || ""}</p>
        <div class="featured-meta">
          <div class="article-meta">${new Date(article.pubDate).toLocaleDateString() || "Today"}</div>
          <a href="${article.link}" target="_blank" class="read-more-btn">Read More</a>
        </div>
      </div>
    </div>
  `;
}

function renderNewsCards(articles) {
  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <div class="news-image-container">
        <img class="news-image" src="${article.image_url || "https://via.placeholder.com/400x200"}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x200'"/>
        <div class="news-source-tag">${article.source_id || "Source"}</div>
      </div>
      <div class="news-content">
        <h3 class="news-title">${article.title}</h3>
        <p class="news-description">${article.description || ""}</p>
        <div class="news-footer">
          <span class="news-date">${new Date(article.pubDate).toLocaleDateString() || "Today"}</span>
          <a href="${article.link}" target="_blank" class="read-more-btn">Read More</a>
        </div>
      </div>
    `;
    newsGrid.appendChild(card);
  });
}

// Event Listeners
document.querySelectorAll(".nav-btn, .category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    currentCategory = category;
    currentPage = 1;
    sectionTitle.textContent = category.toUpperCase();
    fetchNews(category, 1);
    document.querySelectorAll(".nav-btn, .category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchNews(currentCategory, currentPage);
});

// Overlays for search and contact
document.getElementById("searchBtn").onclick = () => {
  document.getElementById("searchOverlay").classList.add("active");
};
document.getElementById("closeSearch").onclick = () => {
  document.getElementById("searchOverlay").classList.remove("active");
};

document.getElementById("contactBtn").onclick = () => {
  document.getElementById("contactOverlay").classList.add("active");
};
document.getElementById("closeContact").onclick = () => {
  document.getElementById("contactOverlay").classList.remove("active");
};

// Go to top
const goToTopBtn = document.getElementById("goToTopBtn");
window.addEventListener("scroll", () => {
  goToTopBtn.classList.toggle("visible", window.scrollY > 300);
});
goToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Initial load
fetchNews(currentCategory, currentPage);
