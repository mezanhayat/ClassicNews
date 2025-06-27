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
const searchBtn = document.getElementById("searchBtn");
const searchOverlay = document.getElementById("searchOverlay");
const closeSearch = document.getElementById("closeSearch");
const contactBtn = document.getElementById("contactBtn");
const contactOverlay = document.getElementById("contactOverlay");
const closeContact = document.getElementById("closeContact");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenuOverlay = document.createElement("div");
const mobileMenu = document.createElement("div");
const navDesktop = document.querySelector(".nav-desktop");

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

// Initialize mobile menu
function initMobileMenu() {
  mobileMenuOverlay.className = "mobile-menu-overlay";
  mobileMenu.className = "mobile-menu";
  
  const menuHeader = document.createElement("div");
  menuHeader.className = "mobile-menu-header";
  menuHeader.innerHTML = `
    <h3>Menu</h3>
    <button class="close-btn">&times;</button>
  `;
  
  const menuContent = document.createElement("div");
  menuContent.className = "mobile-menu-content";
  menuContent.innerHTML = `
    <button class="mobile-nav-btn active" data-category="top">HOME</button>
    <button class="mobile-nav-btn" data-category="world">INTERNATIONAL</button>
    <button class="mobile-nav-btn" data-category="sports">SPORTS</button>
    <button class="mobile-nav-btn" data-category="technology">TECHNOLOGY</button>
    <button class="mobile-nav-btn" data-category="business">BUSINESS</button>
    <button class="mobile-nav-btn" data-category="entertainment">ENTERTAINMENT</button>
  `;
  
  mobileMenu.appendChild(menuHeader);
  mobileMenu.appendChild(menuContent);
  mobileMenuOverlay.appendChild(mobileMenu);
  document.body.appendChild(mobileMenuOverlay);
  
  // Close mobile menu
  menuHeader.querySelector(".close-btn").addEventListener("click", () => {
    mobileMenuOverlay.classList.remove("active");
  });
  
  // Mobile menu category buttons
  menuContent.querySelectorAll(".mobile-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      currentCategory = category === "top" ? "general" : category;
      currentPage = 1;
      fetchNews(currentCategory, currentPage);
      mobileMenuOverlay.classList.remove("active");
    });
  });
}

// Event listeners
function setupEventListeners() {
  // Navigation buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".nav-btn.active").classList.remove("active");
      btn.classList.add("active");
      
      const category = btn.dataset.category;
      currentCategory = category === "top" ? "general" : category;
      currentPage = 1;
      fetchNews(currentCategory, currentPage);
    });
  });
  
  // Category buttons
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".category-btn.active").classList.remove("active");
      btn.classList.add("active");
      
      const category = btn.dataset.category;
      currentCategory = category === "top" ? "general" : category;
      currentPage = 1;
      fetchNews(currentCategory, currentPage);
    });
  });
  
