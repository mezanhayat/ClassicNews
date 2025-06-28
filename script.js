
const API_KEY = "d44f128c378c43722a831cc284370e0b";
let currentCategory = "general";
let currentPage = 1;
const pageSize = 10;
const GNEWS_TOPICS = ["world", "nation", "business", "technology", "entertainment", "sports", "science", "health"];

// DOM elements
const newsGrid = document.getElementById("newsGrid");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const articleCount = document.getElementById("articleCount");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("searchInput");
const searchSubmitBtn = document.getElementById("searchSubmitBtn");
const contactForm = document.getElementById("contactForm");

function showPopup(message, isSuccess = true) {
  const popup = document.createElement("div");
  popup.className = `popup-message ${isSuccess ? 'success' : 'error'} show`;
  popup.innerHTML = \`
    <span>\${message}</span>
    <span class="popup-close" onclick="this.parentElement.remove()">×</span>
  \`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 4000);
}

async function fetchNews(category = "general", page = 1, isLoadMore = false) {
  loading.style.display = "block";
  error.style.display = "none";
  if (!isLoadMore) newsGrid.innerHTML = "";

  try {
    const url = new URL("https://gnews.io/api/v4/top-headlines");
    url.searchParams.append("token", API_KEY);
    url.searchParams.append("lang", "en");
    url.searchParams.append("country", "us");
    url.searchParams.append("max", pageSize.toString());

    if (GNEWS_TOPICS.includes(category)) {
      url.searchParams.append("topic", category);
    }

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    if (!data.articles || data.articles.length === 0) throw new Error("No news found");

    if (!isLoadMore) articleCount.textContent = data.articles.length;
    renderArticles(data.articles, isLoadMore);
  } catch (err) {
    error.style.display = "block";
    error.innerHTML = \`
      <p>Failed to load news</p>
      <p><small>\${err.message}</small></p>
    \`;
  } finally {
    loading.style.display = "none";
  }
}

function renderArticles(articles, append = false) {
  if (!append) newsGrid.innerHTML = "";
  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = \`
      <div class="news-image-container">
        <img class="news-image" src="\${article.image || 'https://via.placeholder.com/300x200'}" alt="News">
      </div>
      <div class="news-content">
        <h3 class="news-title">\${article.title}</h3>
        <p class="news-description">\${article.description || ''}</p>
        <div class="news-footer">
          <span class="news-date">\${new Date(article.publishedAt).toLocaleDateString()}</span>
          <a href="\${article.url}" target="_blank" class="read-more-btn">Read More</a>
        </div>
      </div>
    \`;
    newsGrid.appendChild(card);
  });
}

// Load more handler
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    fetchNews(currentCategory, currentPage, true);
  });
}

// Category buttons
document.querySelectorAll(".nav-btn, .category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn, .category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category || "general";
    currentPage = 1;
    fetchNews(currentCategory, currentPage);
  });
});

// Search functionality
if (searchSubmitBtn && searchInput) {
  searchSubmitBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) return;
    loading.style.display = "block";
    error.style.display = "none";
    newsGrid.innerHTML = "";

    try {
      const url = new URL("https://gnews.io/api/v4/search");
      url.searchParams.append("token", API_KEY);
      url.searchParams.append("lang", "en");
      url.searchParams.append("country", "us");
      url.searchParams.append("max", pageSize.toString());
      url.searchParams.append("q", query);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (!data.articles || data.articles.length === 0) throw new Error("No search results");
      articleCount.textContent = data.articles.length;
      renderArticles(data.articles, false);
    } catch (err) {
      error.style.display = "block";
      error.innerHTML = \`
        <p>Failed to load search results</p>
        <p><small>\${err.message}</small></p>
      \`;
    } finally {
      loading.style.display = "none";
    }
  });
}

// Contact form popup message
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then(response => {
        if (response.ok) {
          contactForm.reset();
          showPopup("Message sent successfully!", true);
        } else {
          showPopup("Failed to send message.", false);
        }
      })
      .catch(() => {
        showPopup("Failed to send message.", false);
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchNews(currentCategory, currentPage);
});
