document.addEventListener("DOMContentLoaded", () => {
  const pages = {
    top: document.getElementById("page-top"),
    about: document.getElementById("page-about"),
    contact: document.getElementById("page-contact"),
  };

  const navLinks = document.querySelectorAll(".nav-link");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinksContainer = document.getElementById("nav-links");

  function setMenuOpen(open) {
    navLinksContainer.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinksContainer.classList.contains("is-open");
    setMenuOpen(!isOpen);
  });

  function navigateTo(pageId) {
    if (!pageId || !pages[pageId]) {
      pageId = "top";
    }

    Object.values(pages).forEach((page) => {
      page.classList.add("hidden");
    });

    pages[pageId].classList.remove("hidden");

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("data-page") === pageId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (pageId === "contact") {
      resetContactForm();
    }

    closeMenu();
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", () => {
    navigateTo(window.location.hash.replace("#", ""));
  });

  navigateTo(window.location.hash.replace("#", "") || "top");

  const contactForm = document.getElementById("contact-form");
  const formContainer = document.getElementById("contact-form-container");
  const successMessage = document.getElementById("contact-success");

  const inputs = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    message: document.getElementById("message"),
  };

  const errors = {
    name: document.getElementById("error-name"),
    email: document.getElementById("error-email"),
    message: document.getElementById("error-message"),
  };

  function resetContactForm() {
    contactForm.reset();
    formContainer.classList.remove("hidden");
    successMessage.classList.add("hidden");
    Object.values(errors).forEach((err) => err.classList.add("hidden"));
    Object.values(inputs).forEach((input) => input.classList.remove("is-invalid"));
  }

  function validate() {
    let isValid = true;

    if (!inputs.name.value.trim()) {
      errors.name.classList.remove("hidden");
      inputs.name.classList.add("is-invalid");
      isValid = false;
    } else {
      errors.name.classList.add("hidden");
      inputs.name.classList.remove("is-invalid");
    }

    if (!inputs.email.value.trim()) {
      errors.email.classList.remove("hidden");
      inputs.email.classList.add("is-invalid");
      isValid = false;
    } else {
      errors.email.classList.add("hidden");
      inputs.email.classList.remove("is-invalid");
    }

    if (!inputs.message.value.trim()) {
      errors.message.classList.remove("hidden");
      inputs.message.classList.add("is-invalid");
      isValid = false;
    } else {
      errors.message.classList.add("hidden");
      inputs.message.classList.remove("is-invalid");
    }

    return isValid;
  }

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    formContainer.classList.add("hidden");
    successMessage.classList.remove("hidden");
    window.scrollTo(0, 0);
  });
});
