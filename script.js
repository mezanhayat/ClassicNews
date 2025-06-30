const API_KEY = "d44f128c378c43722a831cc284370e0b";
let currentPage = 1;
let currentCategory = "general";
const pageSize = 10;
const newsGrid = document.getElementById("newsGrid");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const articleCount = document.getElementById("articleCount");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const sectionTitle = document.getElementById("sectionTitle");
const searchBtn = document.getElementById("searchBtn");
const closeSearch = document.getElementById("closeSearch");
const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchSubmitBtn = document.getElementById("searchSubmitBtn");
const searchResults = document.getElementById("searchResults");
const contactBtn = document.getElementById("contactBtn");
const closeContact = document.getElementById("closeContact");
const contactOverlay = document.getElementById("contactOverlay");
const contactForm = document.getElementById("contactForm");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenuOverlay = document.createElement("div");
mobileMenuOverlay.className = "mobile-menu-overlay";
document.body.appendChild(mobileMenuOverlay);
const GNEWS_TOPICS = ["general", "world", "nation", "business", "technology", "entertainment", "sports", "science", "health"];
function initMobileMenu() {
  const navDesktop = document.querySelector(".nav-desktop");
  const mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu";
  const buttons = Array.from(navDesktop.querySelectorAll(".nav-btn")).map(btn => {
    const mobileBtn = btn.cloneNode(true);
    mobileBtn.className = "mobile-nav-btn";
    return mobileBtn;
  });
  mobileMenu.innerHTML = `
    <div class="mobile-menu-header">
      <h3>Menu</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="mobile-menu-content"></div>
  `;
  const content = mobileMenu.querySelector(".mobile-menu-content");
  buttons.forEach(btn => content.appendChild(btn));
  mobileMenuOverlay.appendChild(mobileMenu);
  mobileMenu.querySelector(".close-btn").addEventListener("click", () => {
    mobileMenuOverlay.classList.remove("active");
  });
  mobileMenu.querySelectorAll(".mobile-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      currentCategory = category;
      currentPage = 1;
      updateActiveButtons(category);
      fetchNews(category);
      mobileMenuOverlay.classList.remove("active");
    });
  });
}
mobileMenuBtn.addEventListener("click", () => {
  mobileMenuOverlay.classList.add("active");
});
function updateActiveButtons(category) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  const categoryTitles = {
    "general": "Latest News",
    "world": "International News",
    "sports": "Sports News",
    "technology": "Technology News",
    "business": "Business News",
    "entertainment": "Entertainment News"
  };
  sectionTitle.textContent = categoryTitles[category] || "Latest News";
}
function initEventListeners() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      currentCategory = category;
      currentPage = 1;
      updateActiveButtons(category);
      fetchNews(category);
    });
  });
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      currentCategory = category;
      currentPage = 1;
      updateActiveButtons(category);
      fetchNews(category);
    });
  });
  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    fetchNews(currentCategory, false);
  });
  searchBtn.addEventListener("click", () => {
    searchOverlay.classList.add("active");
    searchInput.focus();
  });
  closeSearch.addEventListener("click", () => {
    searchOverlay.classList.remove("active");
  });
  searchSubmitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    performSearch();
  });
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });
  contactBtn.addEventListener("click", () => {
    contactOverlay.classList.add("active");
  });
  closeContact.addEventListener("click", () => {
    contactOverlay.classList.remove("active");
  });
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    })
    .then(response => {
      if (response.ok) {
        showPopup("Message sent successfully!", "success");
        contactForm.reset();
        contactOverlay.classList.remove("active");
      } else {
        throw new Error("Failed to send message");
      }
    })
    .catch(err => {
      showPopup("Failed to send message. Please try again.", "error");
      console.error(err);
    });
  });
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
}
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup-message ${type}`;
  popup.innerHTML = `
    <span>${message}</span>
    <span class="popup-close">&times;</span>
  `;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.classList.add("show");
  }, 10);
  popup.querySelector(".popup-close").addEventListener("click", () => {
    popup.remove();
  });
  setTimeout(() => {
    popup.remove();
  }, 5000);
}
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  try {
    searchResults.innerHTML = "<div class='loading'><p>Searching...</p></div>";
    const url = new URL("https:
    url.searchParams.append("token", API_KEY);
    url.searchParams.append("lang", "en");
    url.searchParams.append("country", "us");
    url.searchParams.append("q", query);
    url.searchParams.append("max", "10");
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.articles || data.articles.length === 0) {
      searchResults.innerHTML = "<div class='no-results'><p>No results found for your search.</p></div>";
      return;
    }
    searchResults.innerHTML = "";
    data.articles.forEach(article => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <h4 class="search-result-title">${article.title}</h4>
        <p class="search-result-description">${article.description || ""}</p>
        <div class="search-result-footer">
          <span class="search-result-source">${article.source.name || "Unknown source"}</span>
          <a href="${article.url}" target="_blank" class="read-more-btn">Read More</a>
        </div>
      `;
      searchResults.appendChild(item);
    });
  } catch (err) {
    console.error("Search error:", err);
    searchResults.innerHTML = `
      <div class="error">
        <p>Failed to perform search</p>
        <p><small>${err.message}</small></p>
      </div>
    `;
  }
}
async function fetchNews(category = "general", clear = true) {
  if (clear) {
    loading.style.display = "block";
    error.style.display = "none";
    newsGrid.innerHTML = "";
  } else {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = "Loading...";
  }
  try {
    const url = new URL("https:
    url.searchParams.append("token", API_KEY);
    url.searchParams.append("lang", "en");
    url.searchParams.append("country", "us");
    url.searchParams.append("max", pageSize.toString());
    url.searchParams.append("page", currentPage.toString());
    if (GNEWS_TOPICS.includes(category)) {
      url.searchParams.append("topic", category);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.articles || data.articles.length === 0) {
      if (!clear) {
        loadMoreBtn.textContent = "No more articles";
        loadMoreBtn.disabled = true;
      } else {
        throw new Error("No news articles found.");
      }
      return;
    }
    if (clear) {
      articleCount.textContent = data.articles.length;
    } else {
      articleCount.textContent = parseInt(articleCount.textContent) + data.articles.length;
    }
    data.articles.forEach(article => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <div class="news-image-container">
          <img class="news-image" src="${article.image || 'https:
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
    if (data.articles.length < pageSize) {
      loadMoreBtn.textContent = "No more articles";
      loadMoreBtn.disabled = true;
    } else {
      loadMoreBtn.textContent = "Load More Articles";
      loadMoreBtn.disabled = false;
    }
  } catch (err) {
    console.error("News fetch error:", err.message);
    error.style.display = "block";
    error.innerHTML = `
      <p>Failed to load news</p>
      <p><small>${err.message}</small></p>
      <button class="btn-primary" onclick="location.reload()">Try Again</button>
    `;
  } finally {
    loading.style.display = "none";
    if (!clear) {
      loadMoreBtn.textContent = "Load More Articles";
      loadMoreBtn.disabled = false;
    }
  }
}
function setCurrentDate() {
  const dateElement = document.getElementById("currentDate");
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = new Date().toLocaleDateString('en-US', options);
}
document.addEventListener("DOMContentLoaded", () => {
  setCurrentDate();
  initMobileMenu();
  initEventListeners();
  fetchNews(currentCategory);
});
