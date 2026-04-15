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

// Password validation for signup form
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

// Reset password form validation
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", function (event) {
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if(password.length < 8) {
    event.preventDefault();
    showValidationError("Password must be at least 8 characters long.");
    return;
  }

  if (password !== confirmPassword){
    event.preventDefault();
    showValidationError("Passwords do not match.");
    return;
  }
});
}

// Show/hide icon for confirm password field in reset password form
const confirmIcon = document.getElementById("show-confirm-password");
if (confirmIcon) {
  confirmIcon.addEventListener("click", function () {
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput.type === "password") {
      confirmPasswordInput.type = "text";
      confirmIcon.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      confirmPasswordInput.type = "password";
      confirmIcon.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });
}

//function to show validation errors on the form (used for password validation on client side before submission)
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
