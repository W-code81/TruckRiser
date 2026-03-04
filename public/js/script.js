// Auto-dismiss alerts after 5 seconds
document.addEventListener("DOMContentLoaded", function () {
  const errorAlert = document.getElementById("errorAlert");
  const successAlert = document.getElementById("successAlert");

  if (errorAlert) {
    setTimeout(() => {
      errorAlert.style.opacity = "0";
      errorAlert.style.transition = "opacity 0.5s ease";
      setTimeout(() => errorAlert.remove(), 500);
    }, 5000);
  }

  if (successAlert) {
    setTimeout(() => {
      successAlert.style.opacity = "0";
      successAlert.classList.add("success");
      successAlert.style.transition = "opacity 0.5s ease";
      setTimeout(() => successAlert.remove(), 500);
    }, 5000);
  }
});

// Cookie banner handlers: animate hide, call server, fallback, Manage button
(function () {
  function setupCookieHandlers() {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptCookiesBtn = document.getElementById("accept-cookies-btn");
    const manageCookiesBtn = document.getElementById("manage-cookies-btn");

    if (acceptCookiesBtn) {
      acceptCookiesBtn.addEventListener("click", function () {
        if (cookieBanner) {
          cookieBanner.classList.add("cookie-hide");
          setTimeout(() => {
            cookieBanner.style.display = "none";
          }, 260);
        }

        fetch("/accept-cookies", {
          method: "POST",
          credentials: "same-origin",
        }).catch((err) => {
          console.error("accept-cookies error:", err);
          // Fallback: set cookie client-side if server call fails
          try {
            document.cookie = "cookieConsent=true; max-age=86400; path=/";
          } catch (e) {
            console.error("Failed to set cookie fallback:", e);
          }
        });
      });
    }

    // Trigger slide-in animation after a short delay so transition applies
    if (cookieBanner && !cookieBanner.classList.contains('cookie-show')) {
      // Allow the browser to paint initial state
      requestAnimationFrame(() => { 
        setTimeout(() => cookieBanner.classList.add('cookie-show'), 20);
      });
    }

    if (manageCookiesBtn) {
      manageCookiesBtn.addEventListener("click", function () {
        // Send user to privacy or preferences. Fallback to /privacy
        window.location.href = "/privacy";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupCookieHandlers);
  } else {
    setupCookieHandlers();
  }
})();


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

let icon = document.getElementById("show-password");
if (icon){
  icon.addEventListener("click", function () {
    let passwordInput = document.getElementById("password");
    if (passwordInput.type === "password") { //change to text to show password
      passwordInput.type = "text";
      icon.innerHTML = '<i class="fas fa-eye-slash"></i>'; //change icon to indicate password is visible
    } else {
      passwordInput.type = "password";
      icon.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });
}
  