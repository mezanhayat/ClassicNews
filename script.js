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
  articles: [
    {
      title: "Breaking News Updates",
      url: "#",
      description: "Stay informed with the latest news coverage from our team.",
      image: "https://via.placeholder.com/600x400",
      source: { name: "Classic Times" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Important Developments",
      url: "#",
      description: "Our journalists are working around the clock to bring you updates.",
      image: "https://via.placeholder.com/400x200",
      source: { name: "Classic Times" },
      publishedAt: new Date().toISOString()
    }
  ]
};

async function fetchNews(category = "general", page = 1) {
  loading.style.display = "block";
  error.style.display = "none";
  loadMoreBtn.disabled = true;

  try {
    const validCategories = ["general", "world", "nation", "business", "technology", "entertainment", "sports", "science", "health"];
    const normalizedCategory = validCategories.includes(category) ? category : "general";

    const apiUrl = new URL("https://gnews.io/api/v4/top-headlines");
    apiUrl.searchParams.append("token", API_KEY);
    apiUrl.searchParams.append("lang", "en");
    apiUrl.searchParams.append("country", "us");
    apiUrl.searchParams.append("max", pageSize.toString());

    if (normalizedCategory !== "general") {
      apiUrl.searchParams.append("topic", normalizedCategory);
    }

    const response = await fetchWithTimeout(apiUrl.toString(), 8000);

    if (!response.ok) {
      let errorMsg = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error("Invalid data format from API");
    }

    const articles = data.articles.filter(a => a.title && a.url);

    if (articles.length === 0 && page === 1) {
      throw new Error("No articles found for this category");
    }

    renderNews({ articles }, normalizedCategory, page);
  } catch (err) {
    console.error("News fetch error:", err);
    error.style.display = "block";
    error.innerHTML = `
      <p>${err.message.includes("422") ? "GNews API request error" : "Failed to load news"}</p>
      <p><small>${err.message}</small></p>
      <button class="btn-primary" onclick="fetchNews(currentCategory, 1)">Try Again</button>
    `;
    renderNews(fallbackNews, category, page);
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
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Add your existing renderNews, renderNewsCards, etc.

document.addEventListener('DOMContentLoaded', () => {
  fetchNews(currentCategory, currentPage);
});
