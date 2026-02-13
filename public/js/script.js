// Optional: Scroll to top button
const scrollBtn = document.createElement("button");
scrollBtn.innerHTML = "↑";
scrollBtn.style.position = "fixed";
scrollBtn.style.bottom = "20px";
scrollBtn.style.right = "40px";
scrollBtn.style.padding = "10px 15px";
scrollBtn.style.border = "none";
scrollBtn.style.borderRadius = "30px";
scrollBtn.style.backgroundColor = "#ff7700";
scrollBtn.style.color = "#fff";
scrollBtn.style.cursor = "pointer";
scrollBtn.style.display = "none";
scrollBtn.style.zIndex = "1000";
document.body.appendChild(scrollBtn);

window.addEventListener("scroll", () => {
  scrollBtn.style.display = window.scrollY > 500 ? "block" : "none";
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// for the sidebar
function showSideBar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "flex";
}

function closeSideBar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "none";
}

// Animate the main headline and first button
ScrollReveal().reveal("h1", {
  origin: "bottom",
  distance: "40px",
  duration: 900,
  easing: "ease-in-out",
  opacity: 0,
  reset: true,
});

// Animate the main description paragraph
ScrollReveal().reveal(".h-p", {
  origin: "bottom",
  distance: "30px",
  duration: 800,
  delay: 200,
  opacity: 0,
  reset: true,
});

// Animate the "Book a Truck" buttons
ScrollReveal().reveal(".color4", {
  origin: "bottom",
  distance: "40px",
  duration: 900,
  delay: 300,
  opacity: 0,
  reset: true,
});

// Animate the fakeimg
ScrollReveal().reveal("fakeimg", {
  origin: "right",
  distance: "30px",
  duration: 900,
  opacity: 0,
  reset: true,
});

// Animate the feature columns
ScrollReveal().reveal(".column", {
  origin: "bottom",
  distance: "60px",
  duration: 1000,
  interval: 250,
  opacity: 0,
  reset: true,
});

// Animate the truck image columns
ScrollReveal().reveal(".img-column", {
  origin: "left",
  distance: "60px",
  duration: 900,
  interval: 200,
  opacity: 0,
  reset: true,
});

// Animate the footer section
ScrollReveal().reveal(".footer", {
  origin: "bottom",
  distance: "60px",
  duration: 1000,
  delay: 400,
  opacity: 0,
  reset: true,
});

// // Hide sidebar when clicking outside of it
// document.addEventListener("click", function (event) {
//   const sidebar = document.querySelector(".sidebar");
//   // Only run if sidebar is visible
//   if (sidebar && sidebar.style.display === "flex") {
//     // If the click is NOT inside the sidebar or the menu button
//     if (
//       !sidebar.contains(event.target) &&
//       !event.target.closest(".menu-button")
//     ) {
//       sidebar.style.display = "none";
//     }
//   }
// });
