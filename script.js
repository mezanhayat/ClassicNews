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

async function fetchNews(category = "general", page = 1) {
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
      // Try to get error details from response
      let errorMsg = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch (e) {
        console.log("Couldn't parse error response");
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid data format from API");
    }

    const articles = data.results.filter(a => a.title && a.link);

    if (articles.length === 0 && page === 1) {
      throw new Error("No articles found for this category");
    }

    renderNews(data, normalizedCategory, page);
  } catch (err) {
    console.error("News fetch error:", err);
    error.style.display = "block";
    error.innerHTML = `
      <p>${err.message.includes("422") ? "News service configuration issue" : "Failed to load news"}</p>
      <p><small>${err.message.replace("HTTP error! Status: 422", "Please try a different category")}</small></p>
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

// [Include all other existing functions: renderNews, showFeaturedArticle, 
// renderNewsCards, formatDate, showPopup, etc. exactly as shown in previous examples]

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  fetchNews(currentCategory, currentPage);
});
