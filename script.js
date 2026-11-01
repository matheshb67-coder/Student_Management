/**
 * EduManage - Modern Student Management System
 * Vanilla JavaScript Controller with Theme Switcher Support
 * Clean, Modular, and Zero Dependencies
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. Light / Dark Theme Switcher with LocalStorage Persistence
  // =========================================================================
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const STORAGE_KEY = "edumanage-theme";

  function getSystemPreference() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute("aria-label", "Switch to Light Mode");
        themeToggleBtn.setAttribute("title", "Switch to Light Mode");
      }
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute("aria-label", "Switch to Dark Mode");
        themeToggleBtn.setAttribute("title", "Switch to Dark Mode");
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // LocalStorage disabled or quota exceeded
    }
  }

  // Determine initial theme on load
  let currentTheme = "light";
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    currentTheme = savedTheme || getSystemPreference();
  } catch (e) {
    currentTheme = getSystemPreference();
  }
  applyTheme(currentTheme);

  // Toggle button click handler
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  // Listen for OS system theme changes if user hasn't explicitly set preference
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (!savedTheme) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }

  // =========================================================================
  // 2. Navigation & Smooth Scrolling
  // =========================================================================
  const navLinks = document.querySelectorAll(".nav-link");
  const targetButtons = document.querySelectorAll("[data-target]");
  const siteHeader = document.querySelector(".site-header");

  function getHeaderHeight() {
    return siteHeader ? siteHeader.offsetHeight : 74;
  }

  function scrollToSection(selector) {
    if (!selector || selector === "#") return;
    const targetElement = document.querySelector(selector);
    if (!targetElement) return;

    const headerOffset = getHeaderHeight() + 12;
    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }

  // Nav link click events
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      scrollToSection(href);
    });
  });

  // Action buttons with data-target
  targetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.dataset.target || btn.getAttribute("data-target");
      if (target) {
        scrollToSection(target);
      }
    });
  });

  // Highlight active link on scroll
  const sections = document.querySelectorAll("section[id]");
  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    const headerHeight = getHeaderHeight();

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - headerHeight - 100;
      const sectionId = current.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", updateActiveNavLink, { passive: true });

  // =========================================================================
  // 3. Section Fade-In Reveal Animation
  // =========================================================================
  const allSections = document.querySelectorAll(".section");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-in-view");
        }
      });
    },
    { threshold: 0.15 }
  );

  allSections.forEach((sec) => sectionObserver.observe(sec));

  // =========================================================================
  // 4. Student Management (Directory, Registration, Clear Records)
  // =========================================================================
  const registerStudentBtn = document.getElementById("registerStudentBtn");
  const clearStudentsBtn = document.getElementById("clearStudentsBtn");
  const studentRegisterForm = document.getElementById("studentRegisterForm");
  const submitStudentBtn = document.getElementById("submitStudentBtn");
  const cancelStudentBtn = document.getElementById("cancelStudentBtn");
  const closeFormBtn = document.getElementById("closeFormBtn");
  const studentTableBody = document.getElementById("studentTableBody");
  const studentCountBadge = document.getElementById("studentCountBadge");
  const emptyTableNotice = document.getElementById("emptyTableNotice");
  const studentFormAlert = document.getElementById("studentFormAlert");

  // Helper: sanitize string to prevent XSS
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
  }

  // Helper: email format validator
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Update dynamic count badge and empty state
  function updateStudentDirectoryState() {
    if (!studentTableBody) return;
    const rowCount = studentTableBody.querySelectorAll("tr").length;

    if (studentCountBadge) {
      studentCountBadge.textContent = `Showing ${rowCount} Active ${rowCount === 1 ? "Student" : "Students"}`;
    }

    if (emptyTableNotice) {
      emptyTableNotice.style.display = rowCount === 0 ? "block" : "none";
    }
  }

  // Clear form inputs and hide messages
  function resetStudentForm() {
    const idInput = document.getElementById("studentId");
    const nameInput = document.getElementById("studentName");
    const courseInput = document.getElementById("studentCourse");
    const emailInput = document.getElementById("studentEmail");

    if (idInput) idInput.value = "";
    if (nameInput) nameInput.value = "";
    if (courseInput) courseInput.value = "";
    if (emailInput) emailInput.value = "";

    if (studentFormAlert) {
      studentFormAlert.style.display = "none";
      studentFormAlert.className = "form-alert-msg";
      studentFormAlert.textContent = "";
    }
  }

  function showFormAlert(message, type = "error") {
    if (!studentFormAlert) return;
    studentFormAlert.textContent = message;
    studentFormAlert.className = `form-alert-msg alert-${type}`;
    studentFormAlert.style.display = "flex";
  }

  // Toggle registration form visibility
  if (registerStudentBtn && studentRegisterForm) {
    registerStudentBtn.addEventListener("click", () => {
      const isHidden = studentRegisterForm.style.display === "none" || studentRegisterForm.style.display === "";
      studentRegisterForm.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        studentRegisterForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const firstField = document.getElementById("studentId");
        if (firstField) firstField.focus();
      } else {
        resetStudentForm();
      }
    });
  }

  // Close / Cancel registration form
  function closeRegistrationCard() {
    if (studentRegisterForm) {
      studentRegisterForm.style.display = "none";
      resetStudentForm();
    }
  }

  if (cancelStudentBtn) {
    cancelStudentBtn.addEventListener("click", closeRegistrationCard);
  }

  if (closeFormBtn) {
    closeFormBtn.addEventListener("click", closeRegistrationCard);
  }

  // Submit new student record
  if (submitStudentBtn && studentTableBody) {
    submitStudentBtn.addEventListener("click", () => {
      const id = (document.getElementById("studentId")?.value || "").trim();
      const name = (document.getElementById("studentName")?.value || "").trim();
      const course = (document.getElementById("studentCourse")?.value || "").trim();
      const email = (document.getElementById("studentEmail")?.value || "").trim();

      // Form validation
      if (!id || !name || !course || !email) {
        showFormAlert("Please complete all required student fields before submitting.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showFormAlert("Please enter a valid email address (e.g., student@institution.edu).", "error");
        return;
      }

      // Check for duplicate student ID
      const existingIds = Array.from(studentTableBody.querySelectorAll(".badge-id")).map(
        (el) => el.textContent.trim()
      );

      if (existingIds.includes(id)) {
        showFormAlert(`Student ID "${id}" is already registered. Please use a unique ID.`, "error");
        return;
      }

      // Append new student record to table
      const newRow = studentTableBody.insertRow(-1);
      const initial = name.charAt(0).toUpperCase() || "S";

      newRow.innerHTML = `
        <td><span class="badge-id">${escapeHtml(id)}</span></td>
        <td>
          <div class="student-profile-info">
            <span class="avatar-circle">${escapeHtml(initial)}</span>
            <span class="student-name-text">${escapeHtml(name)}</span>
          </div>
        </td>
        <td><span class="course-chip">${escapeHtml(course)}</span></td>
        <td><a href="mailto:${escapeHtml(email)}" class="email-link">${escapeHtml(email)}</a></td>
      `;

      // Update directory state
      updateStudentDirectoryState();

      // Feedback and form cleanup
      alert(`Student ${name} registered successfully.`);
      closeRegistrationCard();
    });
  }

  // Clear sample students
  if (clearStudentsBtn && studentTableBody) {
    clearStudentsBtn.addEventListener("click", () => {
      const rowCount = studentTableBody.querySelectorAll("tr").length;
      if (rowCount === 0) {
        alert("The student directory is already empty.");
        return;
      }

      const confirmed = confirm("Are you sure you want to clear all student records from the directory?");
      if (confirmed) {
        studentTableBody.innerHTML = "";
        updateStudentDirectoryState();
      }
    });
  }

  // Initialize directory counter on load
  updateStudentDirectoryState();

  // =========================================================================
  // 5. Contact Form Handling & Web3Forms API Submission
  // =========================================================================
  const contactForm = document.getElementById("contactForm");
  const contactFormAlert = document.getElementById("contactFormAlert");
  const contactSubmitBtn = document.getElementById("contactSubmitBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("contactMessage");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !message) {
        if (contactFormAlert) {
          contactFormAlert.textContent = "Please fill in all required fields before submitting.";
          contactFormAlert.className = "form-alert-msg alert-error";
          contactFormAlert.style.display = "flex";
        } else {
          alert("Please fill in all required fields before submitting.");
        }
        return;
      }

      if (!isValidEmail(email)) {
        if (contactFormAlert) {
          contactFormAlert.textContent = "Please enter a valid email address (e.g., student@institution.edu).";
          contactFormAlert.className = "form-alert-msg alert-error";
          contactFormAlert.style.display = "flex";
        } else {
          alert("Please enter a valid email address.");
        }
        return;
      }

      // Indicate loading state on the submit button
      const originalBtnHtml = contactSubmitBtn ? contactSubmitBtn.innerHTML : "Send Message";
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 0.8s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <span>Sending Inquiry...</span>
        `;
      }

      try {
        const formData = new FormData(contactForm);
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          // Success notification
          alert(`Thanks ${name}. Your message was sent.`);

          if (contactFormAlert) {
            contactFormAlert.textContent = `Thank you, ${name}! Your inquiry has been sent to our administration successfully.`;
            contactFormAlert.className = "form-alert-msg alert-success";
            contactFormAlert.style.display = "flex";

            setTimeout(() => {
              contactFormAlert.style.display = "none";
            }, 6000);
          }

          contactForm.reset();
        } else {
          throw new Error(result.message || "Failed to deliver message via Web3Forms.");
        }
      } catch (error) {
        if (contactFormAlert) {
          contactFormAlert.textContent = "Unable to send your message right now. Please check your internet connection or try again later.";
          contactFormAlert.className = "form-alert-msg alert-error";
          contactFormAlert.style.display = "flex";
        } else {
          alert("Failed to send message. Please try again later.");
        }
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }
});
