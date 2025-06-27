const API_KEY = "pub_479521869e790a727903df673ac804ca5f7dc";
let currentCategory = "general";
let currentPage = 1;
const pageSize = 12;

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
      title: "Latest News Updates",
      link: "#",
      description: "Stay tuned for breaking news updates coming soon.",
      image_url: "https://via.placeholder.com/600x400",
      source_id: "Classic Times",
      pubDate: new Date().toISOString()
    },
    {
      title: "Important Announcements",
      link: "#",
      description: "We're working to bring you the latest news coverage.",
      image_url: "https://via.placeholder.com/400x200",
      source_id: "Classic Times",
      pubDate: new Date().toISOString()
    }
  ]
};

// Main news fetching function
async function fetchNews(category = "general", page = 1) {
  loading.style.display = "block";
  error.style.display = "none";
  loadMoreBtn.disabled = true;

  try {
    const encodedCategory = encodeURIComponent(category);
    const apiUrl = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&category=${encodedCategory}&page=${page}`;
    
    console.log("Fetching news from:", apiUrl);
    
    const response = await fetchWithTimeout(apiUrl, 8000);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error("Invalid response format");
    }

    const data = await response.json();
    console.log("API response:", data);

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid data structure");
    }

    const articles = data.results.filter(a => a.title && a.link);

    if (articles.length === 0 && page === 1) {
      throw new Error("No articles found");
    }

    renderNews(data, category, page);
  } catch (err) {
    console.error("News fetch error:", err);
    error.style.display = "block";
    error.innerHTML = `
      <p>Failed to load news articles</p>
      <p><small>${err.message}</small></p>
      <button class="btn-primary" onclick="fetchNews(currentCategory, currentPage)">Try Again</button>
    `;
    renderNews(fallbackNews, category, page);
  } finally {
    loading.style.display = "none";
    loadMoreBtn.disabled = false;
  }
}

// Helper function with timeout
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

// Render news articles
function renderNews(data, category, page) {
  const articles = data.results.filter(a => a.title && a.link);

  if (page === 1) {
    newsGrid.innerHTML = "";
    if (articles.length > 0) {
      showFeaturedArticle(articles[0]);
      renderNewsCards(articles.slice(1));
    }
  } else {
    renderNewsCards(articles);
  }

  const totalArticles = document.querySelectorAll(".news-card").length + 
                       (featuredArticle.style.display !== "none" ? 1 : 0);
  articleCount.textContent = totalArticles;
  loadMoreContainer.style.display = articles.length >= pageSize ? "block" : "none";
}

// Show featured article
function showFeaturedArticle(article) {
  featuredArticle.style.display = "block";
  featuredArticle.innerHTML = `
    <div class="featured-grid">
      <div class="featured-image-container">
        <img class="featured-image" src="${article.image_url || "https://via.placeholder.com/600x400"}" 
             alt="${article.title}" onerror="this.src='https://via.placeholder.com/600x400'">
      </div>
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

// Render news cards
function renderNewsCards(articles) {
  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <div class="news-image-container">
        <img class="news-image" src="${article.image_url || "https://via.placeholder.com/400x200"}" 
             alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x200'">
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

// Format date
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recent" : date.toLocaleDateString();
  } catch {
    return "Recent";
  }
}

// Notification system
function showPopup(message, isError = false) {
  const popup = document.createElement("div");
  popup.className = `popup-message ${isError ? 'error' : ''}`;
  popup.innerHTML = `
    <span>${message}</span>
    <span class="popup-close">&times;</span>
  `;
  document.body.appendChild(popup);
  
  popup.querySelector(".popup-close").addEventListener("click", () => popup.remove());
  
  setTimeout(() => {
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 300);
    }, 5000);
  }, 10);
}

// Contact form handler
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  
  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      showPopup("Message sent successfully!");
      form.reset();
      document.getElementById("contactOverlay").classList.remove("active");
    } else {
      throw new Error("Server responded with error");
    }
  } catch (err) {
    console.error("Form error:", err);
    showPopup("Failed to send message. Please try again.", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});

// Navigation buttons
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

// Load more articles
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchNews(currentCategory, currentPage);
});

// Mobile menu toggle
document.getElementById("mobileMenuBtn").addEventListener("click", () => {
  document.getElementById("mobileMenuOverlay").classList.add("active");
});

// Overlay controls
document.getElementById("closeMobileMenu").addEventListener("click", () => {
  document.getElementById("mobileMenuOverlay").classList.remove("active");
});

document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchOverlay").classList.add("active");
});

document.getElementById("closeSearch").addEventListener("click", () => {
  document.getElementById("searchOverlay").classList.remove("active");
});

document.getElementById("contactBtn").addEventListener("click", () => {
  document.getElementById("contactOverlay").classList.add("active");
});

document.getElementById("closeContact").addEventListener("click", () => {
  document.getElementById("contactOverlay").classList.remove("active");
});

// Scroll to top
const goToTopBtn = document.getElementById("goToTopBtn");
window.addEventListener("scroll", () => {
  goToTopBtn.classList.toggle("visible", window.scrollY > 300);
});

goToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  fetchNews(currentCategory, currentPage);
});
