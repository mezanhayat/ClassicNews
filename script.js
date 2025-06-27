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

// Fallback news data in case API fails
const fallbackNews = {
  results: [
    {
      title: "Important News Update",
      link: "#",
      description: "Our news service is currently experiencing high demand. Please check back soon for the latest updates.",
      image_url: "https://via.placeholder.com/600x400",
      source_id: "Classic Times",
      pubDate: new Date().toISOString()
    },
    {
      title: "Stay Informed",
      link: "#",
      description: "We're working to bring you the latest news as quickly as possible.",
      image_url: "https://via.placeholder.com/400x200",
      source_id: "Classic Times",
      pubDate: new Date().toISOString()
    }
  ]
};

async function fetchNews(category = "general", page = 1) {
  loading.style.display = "block";
  error.style.display = "none";
  loadMoreBtn.disabled = true;

  try {
    // Try both with and without CORS proxy
    let apiUrl = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&category=${category}&page=${page}`;
    
    // First try direct API call
    let response = await fetchWithTimeout(apiUrl);
    
    // If direct call fails, try with CORS proxy
    if (!response.ok) {
      apiUrl = `https://cors-anywhere.herokuapp.com/${apiUrl}`;
      response = await fetchWithTimeout(apiUrl);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      // If no results, use fallback data
      console.log("Using fallback news data");
      renderNews(fallbackNews, category, page);
    } else {
      renderNews(data, category, page);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    // Use fallback data if API fails
    renderNews(fallbackNews, category, page);
    showPopup("Couldn't load latest news. Showing cached content.", true);
  } finally {
    loading.style.display = "none";
    loadMoreBtn.disabled = false;
  }
}

async function fetchWithTimeout(url, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    signal: controller.signal
  });
  
  clearTimeout(timeoutId);
  return response;
}

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

  articleCount.textContent = document.querySelectorAll(".news-card").length + 
                           (featuredArticle.style.display !== "none" ? 1 : 0);
  loadMoreContainer.style.display = articles.length >= pageSize ? "block" : "none";
}

function showFeaturedArticle(article) {
  featuredArticle.style.display = "block";
  featuredArticle.innerHTML = `
    <div class="featured-grid">
      <img class="featured-image" src="${article.image_url || "https://via.placeholder.com/600x400"}" 
           alt="${article.title}" onerror="this.src='https://via.placeholder.com/600x400'">
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

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recent" : date.toLocaleDateString();
  } catch {
    return "Recent";
  }
}

// Message notification system
function showPopup(message, isError = false) {
  const popup = document.createElement("div");
  popup.className = `popup-message ${isError ? 'error' : ''}`;
  popup.innerHTML = `
    <span>${message}</span>
    <span class="popup-close">&times;</span>
  `;
  document.body.appendChild(popup);
  
  // Close button functionality
  popup.querySelector(".popup-close").addEventListener("click", () => {
    popup.remove();
  });
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 300);
    }, 5000);
  }, 10);
}

// Contact form submission
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
      throw new Error("Failed to send message");
    }
  } catch (err) {
    console.error("Form error:", err);
    showPopup("Failed to send message. Please try again.", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});

// Rest of your existing navigation and UI code...
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

// Initial load
fetchNews(currentCategory, currentPage);

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
  if (window.scrollY > 300) {
    goToTopBtn.classList.add("visible");
  } else {
    goToTopBtn.classList.remove("visible");
  }
});
goToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
