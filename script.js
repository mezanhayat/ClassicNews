const API_KEY = "d44f128c378c43722a831cc284370e0b";
let currentPage = 1;
let currentCategory = "general";
const pageSize = 10;

// DOM elements
const newsGrid = document.getElementById("newsGrid");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const articleCount = document.getElementById("articleCount");

const GNEWS_TOPICS = ["world", "nation", "business", "technology", "entertainment", "sports", "science", "health"];

async function fetchNews(category = "general") {
  loading.style.display = "block";
  error.style.display = "none";
  newsGrid.innerHTML = "";

  try {
    const url = new URL("https://gnews.io/api/v4/top-headlines");
    url.searchParams.append("token", API_KEY);
    url.searchParams.append("lang", "en");
    url.searchParams.append("country", "us");
    url.searchParams.append("max", pageSize.toString());

    if (GNEWS_TOPICS.includes(category)) {
      url.searchParams.append("topic", category);
    }

    console.log("Fetching:", url.toString());
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      throw new Error("No news articles found.");
    }

    articleCount.textContent = data.articles.length;

    data.articles.forEach(article => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <div class="news-image-container">
          <img class="news-image" src="${article.image || 'https://via.placeholder.com/300x200'}" alt="News Image">
        </div>
        <div class="news-content">
          <h3 class="news-title">${article.title}</h3>
          <p class="news-description">${article.description || ''}</p>
          <div class="news-footer">
            <span class="news-date">${new Date(article.publishedAt).toLocaleDateString()}</span>
            <a href="${article.url}" target="_blank" class="read-more-btn">Read More</a>
          </div>
        </div>
      `;
      newsGrid.appendChild(card);
    });

  } catch (err) {
    console.error("News fetch error:", err.message);
    error.style.display = "block";
    error.innerHTML = `
      <p>Failed to load news</p>
      <p><small>${err.message}</small></p>
    `;
  } finally {
    loading.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchNews(currentCategory);
});
