// Auto-dismiss alerts
document.addEventListener("DOMContentLoaded", function () {
  const alerts = ["errorAlert", "successAlert"];
  alerts.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => {
        el.style.transition = "opacity 0.5s ease";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 300);
      }, 3000);
    }
  });
});

// Show/hide password
const icon = document.getElementById("show-password");
if (icon) {
  icon.addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordInput.type = "password";
      icon.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });
}

// Password validation
const form = document.getElementById("signupForm");
if (form) {
  form.addEventListener("submit", function (event) {
    const passwordInput = form.querySelector("input[type='password']").value.trim();
    if (passwordInput.length < 8) {
      event.preventDefault();
      showValidationError("Password must be at least 8 characters long.");
    }
  });
}

function showValidationError(message) {
  const existing = document.getElementById("validationError");
  if (existing) existing.remove();

  const flash = document.createElement("div");
  flash.id = "validationError";
  flash.className = "flash flash-error";
  flash.innerHTML = `
    <span class="flash-text">${message}</span>
    <button class="flash-close" onclick="this.parentElement.remove()">✕</button>
  `;
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.style.transition = "opacity 0.5s ease";
    flash.style.opacity = "0";
    setTimeout(() => flash.remove(), 500);
  }, 4000);
}
