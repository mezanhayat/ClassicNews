const API_KEY = "pub_479521869e790a727903df673ac804ca5f7dc";
let currentCategory = "general";
let currentPage = 1;
const pageSize = 12;



const sectionTitle = document.getElementById("sectionTitle");
const newsGrid = document.getElementById("newsGrid");
const featuredArticle = document.getElementById("featuredArticle");
const articleCount = document.getElementById("articleCount");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadMoreContainer = document.getElementById("loadMoreContainer");

// Show today's date with better formatting
document.getElementById("currentDate").textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

async function fetchNews(category = "general", page = 1) {
  loading.style.display = "block";
  error.style.display = "none";
  loadMoreBtn.disabled = true;

  try {
    // Added timeout and error handling for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const res = await fetch(`https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&category=${category}&page=${page}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Check if response is OK
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // More robust check for results
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid data format from API");
    }

    const articles = data.results.filter(a => a.title && a.link);

    if (articles.length === 0 && page === 1) {
      newsGrid.innerHTML = "<p class='no-articles'>No articles found. Please try another category.</p>";
      featuredArticle.style.display = "none";
      loadMoreContainer.style.display = "none";
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

    // More accurate article count
    const totalArticles = document.querySelectorAll(".news-card").length + 
                         (featuredArticle.style.display !== "none" ? 1 : 0);
    articleCount.textContent = totalArticles;
    
    // Only show load more if we got a full page of results
    loadMoreContainer.style.display = articles.length >= pageSize ? "block" : "none";
  } catch (err) {
    console.error("News fetch error:", err);
    error.style.display = "block";
    error.innerHTML = `
      <p>Failed to load news articles</p>
      <p><small>${err.message}</small></p>
      <button class="btn-primary" onclick="fetchNews(currentCategory, currentPage)">Try Again</button>
    `;
  } finally {
    loading.style.display = "none";
    loadMoreBtn.disabled = false;
  }
}

function showFeaturedArticle(article) {
  featuredArticle.style.display = "block";
  featuredArticle.innerHTML = `
    <div class="featured-grid">
      <img class="featured-image" 
           src="${article.image_url || "https://via.placeholder.com/600x400"}" 
           alt="${article.title}"
           onerror="this.src='https://via.placeholder.com/600x400'">
      <div class="featured-content">
        <div class="featured-tag">${article.source_id || "Source"}</div>
        <h2 class="featured-title">${article.title}</h2>
        <p class="featured-description">${article.description || "No description available."}</p>
        <div class="featured-meta">
          <div class="article-meta">${formatDate(article.pubDate)}</div>
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
        <img class="news-image" 
             src="${article.image_url || "https://via.placeholder.com/400x200"}" 
             alt="${article.title}"
             onerror="this.src='https://via.placeholder.com/400x200'">
        <div class="news-source-tag">${article.source_id || "Source"}</div>
      </div>
      <div class="news-content">
        <h3 class="news-title">${article.title}</h3>
        <p class="news-description">${article.description || "No description available."}</p>
        <div class="news-footer">
          <span class="news-date">${formatDate(article.pubDate)}</span>
          <a href="${article.link}" target="_blank" class="read-more-btn">Read More</a>
        </div>
      </div>
    `;
    newsGrid.appendChild(card);
  });
}

// Helper function for better date formatting
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recent" : date.toLocaleDateString();
  } catch {
    return "Recent";
  }
}

// Navigation buttons with better active state handling
document.querySelectorAll(".nav-btn, .category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    currentCategory = category;
    currentPage = 1;
    sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    fetchNews(category, 1);
    
    // Update active states more efficiently
    document.querySelectorAll(".nav-btn, .category-btn").forEach(b => {
      b.classList.toggle("active", b === btn);
    });
  });
});

loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchNews(currentCategory, currentPage);
});

// Initial load with error handling
document.addEventListener('DOMContentLoaded', () => {
  try {
    fetchNews(currentCategory, currentPage);
  } catch (err) {
    console.error("Initial load error:", err);
    error.style.display = "block";
    error.innerHTML = `
      <p>Failed to load initial news</p>
      <button class="btn-primary" onclick="fetchNews(currentCategory, currentPage)">Retry</button>
    `;
  }
});

// Rest of your existing code for overlays and go-to-top...
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

const goToTopBtn = document.getElementById("goToTopBtn");
window.addEventListener("scroll", () => {
  goToTopBtn.classList.toggle("visible", window.scrollY > 300);
});
goToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
