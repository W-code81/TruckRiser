document.addEventListener("DOMContentLoaded", function () {

  // Cookie banner
  (function () {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptCookiesBtn = document.getElementById("accept-cookies-btn");
    const manageCookiesBtn = document.getElementById("manage-cookies-btn");

    if (acceptCookiesBtn) {
      acceptCookiesBtn.addEventListener("click", function () {
        if (cookieBanner) {
          cookieBanner.classList.add("cookie-hide");
          setTimeout(() => cookieBanner.style.display = "none", 260);
        }
        fetch("/accept-cookies", { method: "POST", credentials: "same-origin" })
          .catch(() => { document.cookie = "cookieConsent=true; max-age=86400; path=/"; });
      });
    }

    if (cookieBanner && !cookieBanner.classList.contains("cookie-show")) {
      requestAnimationFrame(() => {
        setTimeout(() => cookieBanner.classList.add("cookie-show"), 20);
      });
    }

    if (manageCookiesBtn) {
      manageCookiesBtn.addEventListener("click", () => window.location.href = "/privacy");
    }

    document.getElementById("close-cookies-btn")?.addEventListener("click", () => {
      cookieBanner.classList.add("cookie-hide");
      setTimeout(() => cookieBanner.remove(), 300);
    });
  })();

  // Scroll to top button
  const scrollBtn = document.createElement("button");
  scrollBtn.innerHTML = "↑";
  Object.assign(scrollBtn.style, {
    position: "fixed", bottom: "20px", right: "40px",
    padding: "10px 15px", border: "none", borderRadius: "30px",
    backgroundColor: "#ff7700", color: "#fff",
    cursor: "pointer", display: "none", zIndex: "1000"
  });
  document.body.appendChild(scrollBtn);

  window.addEventListener("scroll", () => {
    scrollBtn.style.display = window.scrollY > 500 ? "block" : "none";
  });
  scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Sidebar
  const openMenu = document.getElementById("openMenu");
  const closeMenu = document.getElementById("closeMenu");
  const sidebar = document.querySelector(".sidebar");

  openMenu?.addEventListener("click", () => sidebar.style.display = "flex");
  closeMenu?.addEventListener("click", () => sidebar.style.display = "none");

  // Contact form
  const homeForm = document.getElementById("homeForm");
  const alertBox = document.getElementById("form-alert");

  if (homeForm && alertBox) {
    homeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      try {
        const res = await fetch("/home", {
          method: "POST",
          body: new URLSearchParams(formData),
          credentials: "same-origin",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const data = await res.json();
        alertBox.style.display = "block";

        if (data.success) {
          alertBox.textContent = data.success;
          alertBox.className = "alert success";
          e.target.reset();
        } else {
          alertBox.textContent = data.error;
          alertBox.className = "alert error";
        }
      } catch (err) {
        alertBox.style.display = "block";
        alertBox.textContent = "Something went wrong. Please try again.";
        alertBox.className = "alert error";
      }
    });
  }

  // ScrollReveal
  ScrollReveal().reveal("h1", { origin: "bottom", distance: "40px", duration: 900, opacity: 0, reset: true });
  ScrollReveal().reveal(".h-p", { origin: "bottom", distance: "30px", duration: 800, delay: 200, opacity: 0, reset: true });
  ScrollReveal().reveal(".color4", { origin: "bottom", distance: "40px", duration: 900, delay: 300, opacity: 0, reset: true });
  ScrollReveal().reveal(".col-reveal", { origin: "bottom", distance: "60px", duration: 1000, interval: 250, opacity: 0, reset: true });
  ScrollReveal().reveal(".card-reveal", { origin: "left", distance: "60px", duration: 900, interval: 200, opacity: 0, reset: true });

  // Count up
  function animateCountUp(element, target, duration = 2000) {
    let startTime = null;
    target = +target;
    function update(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      element.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(update);
      else element.textContent = target + "+";
    }
    requestAnimationFrame(update);
  }

  ScrollReveal().reveal("#counter > div", {
    origin: "bottom", distance: "40px", duration: 900,
    opacity: 0, interval: 200, reset: true,
    afterReveal: function (el) {
      const countEl = el.querySelector(".count");
      if (countEl && !countEl.dataset.animated) {
        animateCountUp(countEl, countEl.dataset.target);
        countEl.dataset.animated = "true";
      }
    }
  });

});