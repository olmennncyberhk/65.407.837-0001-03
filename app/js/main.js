(function () {
  'use strict';

  const WHATSAPP_URL = 'https://wa.me/554197880145?text=';
  const WHATSAPP_MSG = encodeURIComponent(
    'Olá! Vim pelo blog Águas Abertas e gostaria de saber mais sobre pesca amadora.'
  );

  document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
    const custom = el.getAttribute('data-whatsapp-msg');
    const msg = custom ? encodeURIComponent(custom) : WHATSAPP_MSG;
    el.setAttribute('href', WHATSAPP_URL + msg);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('is-open', !expanded);
      document.body.style.overflow = expanded ? '' : 'hidden';
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  document.querySelectorAll('.newsletter-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const messageEl = form.querySelector('.form-message');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (messageEl) {
          messageEl.textContent = 'Por favor, informe um e-mail válido.';
          messageEl.className = 'form-message error';
        }
        return;
      }

      if (messageEl) {
        messageEl.textContent =
          'Obrigado! Em breve você receberá nossas dicas e guias gratuitos.';
        messageEl.className = 'form-message success';
      }
      form.reset();
    });
  });

  document.querySelectorAll('.contact-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const messageEl = form.querySelector('.form-message');
      if (messageEl) {
        messageEl.textContent =
          'Mensagem registrada! Responderemos em até 48 horas úteis.';
        messageEl.className = 'form-message success';
      }
      form.reset();
    });
  });

  document.querySelectorAll('.download-guide').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const email = prompt(
        'Informe seu e-mail para receber o Guia de Iscas Naturais (PDF):'
      );
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        alert(
          'Obrigado! O guia será enviado para ' +
            email.trim() +
            '. Verifique também a caixa de spam.'
        );
      }
    });
  });

  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener(
      'scroll',
      function () {
        header.classList.toggle('is-scrolled', window.scrollY > 20);
      },
      { passive: true }
    );
  }

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
