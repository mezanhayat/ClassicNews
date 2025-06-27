const API_KEY = "pub_479521869e790a727903df673ac804ca5f7dc"; // Replace if needed
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

// Fallback News Data (in case API fails)
const fallbackNews = {
  "results": [
    {
      "title": "Example News Article 1",
      "link": "https://example.com",
      "description": "This is an example news description when the API fails to load.",
      "image_url": "https://via.placeholder.com/600x400",
      "source_id": "Example",
      "pubDate": new Date().toISOString()
    },
    {
      "title": "Example News Article 2",
      "link": "https://example.com",
      "description": "Another example news description for testing purposes.",
      "image_url": "https://via.placeholder.com/400x200",
      "source_id": "Sample",
      "pubDate": new Date().toISOString()
    }
  ]
};

async function fetchNews(category = "general", page = 1) {
  loading.style.display = "block";
  error.style.display = "none";
  loadMoreBtn.disabled = true;

  try {
    // Try fetching from API first
    const apiUrl = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&category=${category}&page=${page}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();

    // If API returns no results, use fallback data
    if (!data.results || data.results.length === 0) {
      console.warn("API returned no results, using fallback data");
      renderNews(fallbackNews, category, page);
      return;
    }

    renderNews(data, category, page);
  } catch (err) {
    console.error("News fetch error:", err);
    
    // If API fails, use fallback data
    console.warn("Using fallback news data due to API error");
    renderNews(fallbackNews, category, page);
    
    // Show error message but continue with fallback data
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
    loadMoreBtn.disabled = false;
  }
}

function renderNews(data, category, page) {
  const articles = data.results.filter(a => a.title && a.link);

  if (articles.length === 0 && page === 1) {
    newsGrid.innerHTML = "<p class='no-articles'>No articles found. Please try again later.</p>";
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

  // Update article count
  const totalArticles = document.querySelectorAll(".news-card").length + 
                       (featuredArticle.style.display !== "none" ? 1 : 0);
  articleCount.textContent = totalArticles;
  
  // Show load more button only if we got a full page of results
  loadMoreContainer.style.display = articles.length >= pageSize ? "block" : "none";
}

function showFeaturedArticle(article) {
  featuredArticle.style.display = "block";
  featuredArticle.innerHTML = `
    <div class="featured-grid">
      <img class="featured-image" src="${article.image_url || "https://via.placeholder.com/600x400"}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/600x400'"/>
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
        <img class="news-image" src="${article.image_url || "https://via.placeholder.com/400x200"}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x200'"/>
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

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recent" : date.toLocaleDateString();
  } catch {
    return "Recent";
  }
}

// Navigation buttons
document.querySelectorAll(".nav-btn, .category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    currentCategory = category;
    currentPage = 1;
    sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    fetchNews(category, 1);
    
    // Update active states
    document.querySelectorAll(".nav-btn, .category-btn").forEach(b => 
      b.classList.remove("active")
    );
    btn.classList.add("active");
  });
});

// Load more button
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchNews(currentCategory, currentPage);
});

// Mobile Menu Toggle
document.getElementById("mobileMenuBtn").addEventListener("click", () => {
  const mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu-overlay active";
  mobileMenu.innerHTML = `
    <div class="mobile-menu">
      <div class="mobile-menu-header">
        <h3>Menu</h3>
        <button class="close-btn" id="closeMobileMenu">&times;</button>
      </div>
      <div class="mobile-menu-content">
        <button class="mobile-nav-btn ${currentCategory === 'general' ? 'active' : ''}" data-category="general">HOME</button>
        <button class="mobile-nav-btn ${currentCategory === 'world' ? 'active' : ''}" data-category="world">INTERNATIONAL</button>
        <button class="mobile-nav-btn ${currentCategory === 'sports' ? 'active' : ''}" data-category="sports">SPORTS</button>
        <button class="mobile-nav-btn ${currentCategory === 'technology' ? 'active' : ''}" data-category="technology">TECHNOLOGY</button>
        <button class="mobile-nav-btn ${currentCategory === 'business' ? 'active' : ''}" data-category="business">BUSINESS</button>
        <button class="mobile-nav-btn ${currentCategory === 'entertainment' ? 'active' : ''}" data-category="entertainment">ENTERTAINMENT</button>
      </div>
    </div>
  `;
  document.body.appendChild(mobileMenu);
  
  document.getElementById("closeMobileMenu").addEventListener("click", () => {
    document.body.removeChild(mobileMenu);
  });
  
  // Add click handlers for mobile menu items
  mobileMenu.querySelectorAll(".mobile-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      currentCategory = category;
      currentPage = 1;
      sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      fetchNews(category, 1);
      document.body.removeChild(mobileMenu);
    });
  });
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

// Contact form submission
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
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
      throw new Error("Form submission failed");
    }
  } catch (error) {
    showPopup("Failed to send message. Please try again.", true);
  }
});

// Go to top
const goToTopBtn = document.getElementById("goToTopBtn");
window.addEventListener("scroll", () => {
  goToTopBtn.classList.toggle("visible", window.scrollY > 300);
});
goToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Popup message
function showPopup(message, isError = false) {
  const popup = document.createElement("div");
  popup.className = `popup-message ${isError ? 'error' : ''}`;
  popup.textContent = message;
  document.body.appendChild(popup);
  
  setTimeout(() => {
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 400);
    }, 3000);
  }, 100);
}

// Initial load
fetchNews(currentCategory, currentPage);
