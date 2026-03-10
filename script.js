const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const links = document.querySelectorAll("[data-scroll]");
const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeMenu = () => {
  if (!menu || !menuToggle) return;
  menu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  document.body.classList.remove("menu-open");
};

const toggleMenu = () => {
  if (!menu || !menuToggle) return;
  const isOpen = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  document.body.classList.toggle("menu-open", isOpen);
};

const scrollToTarget = (target) => {
  if (!target) return;
  const offset = topbar ? topbar.offsetHeight + 30 : 0;
  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({
    top,
    behavior: reducedMotion ? "auto" : "smooth"
  });
};

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMenu);
}

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || !hash.startsWith("#")) return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    scrollToTarget(target);
  });
});

document.addEventListener("click", (event) => {
  if (!menu || !menuToggle) return;
  if (!menu.classList.contains("open")) return;
  const insideMenu = menu.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);
  if (!insideMenu && !clickedToggle) {
    closeMenu();
  }
});

if (menu) {
  menu.addEventListener("click", (event) => {
    if (!menu.classList.contains("open")) return;
    if (event.target === menu) {
      closeMenu();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.classList.contains("open")) {
    closeMenu();
  }
});

window.addEventListener("scroll", () => {
  if (!topbar) return;
  topbar.classList.toggle("scrolled", window.scrollY > 8);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeMenu();
  }
});

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

const carousels = document.querySelectorAll("[data-carousel]");

carousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".eco-slide"));
  const dots = Array.from(carousel.querySelectorAll(".eco-dot"));
  const prevButton = carousel.querySelector(".eco-carousel-btn.prev");
  const nextButton = carousel.querySelector(".eco-carousel-btn.next");
  if (!slides.length) return;

  let current = 0;
  let timerId = null;
  let touchStartX = 0;
  let touchEndX = 0;

  const setSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  const nextSlide = () => setSlide(current + 1);
  const prevSlide = () => setSlide(current - 1);

  const stopAuto = () => {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = null;
  };

  const startAuto = () => {
    if (reducedMotion) return;
    stopAuto();
    timerId = setInterval(nextSlide, 4200);
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      prevSlide();
      startAuto();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      nextSlide();
      startAuto();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setSlide(index);
      startAuto();
    });
  });

  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);
  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 45) return;
    if (delta < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
    startAuto();
  }, { passive: true });

  setSlide(0);
  startAuto();
});
