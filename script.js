"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");

  /* =========================================
     ハンバーガーメニュー
     ========================================= */
  const toggleMenu = (open) => {
    hamburger.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-menu-open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  };

  hamburger.addEventListener("click", () => {
    toggleMenu(!nav.classList.contains("is-open"));
  });

  // メニュー内のリンクをクリックしたら閉じる
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleMenu(false);
  });

  /* =========================================
     スクロール時のヘッダー・トップへ戻るボタン
     ========================================= */
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    toTop.classList.toggle("is-show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* =========================================
     現在のセクションに合わせてナビを強調
     ========================================= */
  const navLinks = document.querySelectorAll(".nav__link");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("section[id]").forEach((sec) => sectionObserver.observe(sec));

  /* =========================================
     スクロールでふわっと表示
     ========================================= */
  const fadeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  // 同じ親の中の要素は少しずつ遅らせて表示
  document.querySelectorAll(".fade-in").forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("fade-in"));
    el.style.transitionDelay = `${siblings.indexOf(el) * 0.12}s`;
    fadeObserver.observe(el);
  });

  /* =========================================
     数字のカウントアップ
     ========================================= */
  const animateCounter = (el) => {
    const target = Number(el.dataset.target);
    const duration = 1500;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      el.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".counter").forEach((el) => counterObserver.observe(el));

  /* =========================================
     FAQ アコーディオン
     ========================================= */
  document.querySelectorAll(".faq__item").forEach((item) => {
    const question = item.querySelector(".faq__q");
    const answer = item.querySelector(".faq__a");

    question.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      question.setAttribute("aria-expanded", String(isOpen));
      answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0";
    });
  });

  /* =========================================
     料金プランのボタン → フォームのプランを自動選択
     ========================================= */
  const planSelect = document.getElementById("plan");
  document.querySelectorAll("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", () => {
      planSelect.value = btn.dataset.plan;
    });
  });

  /* =========================================
     お問い合わせフォームのチェック
     ========================================= */
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");

  const rules = {
    name: (v) => (v.trim() ? "" : "お名前を入力してください。"),
    email: (v) => {
      if (!v.trim()) return "メールアドレスを入力してください。";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "メールアドレスの形式が正しくありません。";
    },
    message: (v) => (v.trim().length >= 10 ? "" : "ご相談内容を10文字以上で入力してください。"),
  };

  const validateField = (name) => {
    const input = form.elements[name];
    const message = rules[name](input.value);
    form.querySelector(`.form__error[data-for="${name}"]`).textContent = message;
    input.classList.toggle("is-error", Boolean(message));
    return !message;
  };

  // 入力中にエラーが消えるように
  Object.keys(rules).forEach((name) => {
    form.elements[name].addEventListener("input", () => {
      if (form.elements[name].classList.contains("is-error")) validateField(name);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    success.textContent = "";

    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      form.querySelector(".is-error").focus();
      return;
    }

    // ※ 実際の送信処理（メール送信サービスやサーバー連携）はここに追加します
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "送信中...";

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "送信する";
      success.textContent = "お問い合わせありがとうございます！担当者よりご連絡いたします。";
    }, 1000);
  });

  /* =========================================
     コピーライトの年を自動更新
     ========================================= */
  document.getElementById("year").textContent = new Date().getFullYear();
});
