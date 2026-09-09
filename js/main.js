/* ==========================================================================
   Bózeo Advocacia — main.js
   JavaScript vanilla, sem dependências. Organizado por feature:
   1. Header sticky (transparente -> sólido)
   2. Menu mobile off-canvas
   3. Busca (toggle do formulário no header)
   4. Scroll suave nos links do menu
   5. Scroll-reveal (IntersectionObserver)
   6. Contadores animados (estatísticas)
   7. Carrossel genérico (usado na equipe)
   8. Links de WhatsApp (data-whatsapp -> href com número real)
   9. Modal de biografia da equipe
   10. Entrada / sequência de abertura (a decisão de pular já roda inline no HTML)
   11. Formulário de contato (validação client-side + envio via WhatsApp)
   12. Ano do rodapé
   13. Painel de detalhe das áreas de atuação ("Saiba mais")
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATSAPP_NUMBER = '5522992610154';

  /* ------------------------------------------------------------------ */
  /* 1. Header sticky                                                    */
  /* ------------------------------------------------------------------ */
  var header = document.getElementById('header');

  function updateHeaderState() {
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ------------------------------------------------------------------ */
  /* 2. Menu mobile off-canvas                                          */
  /* ------------------------------------------------------------------ */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileMenuClose = document.getElementById('mobileMenuClose');
  var overlay = document.getElementById('overlay');

  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    mobileMenuClose.focus();
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  hamburger.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.contains('is-open');
    if (isOpen) { closeMobileMenu(); } else { openMobileMenu(); }
  });
  mobileMenuClose.addEventListener('click', closeMobileMenu);
  overlay.addEventListener('click', function () {
    closeMobileMenu();
    closeSearch();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeSearch();
      closeBioModal();
      closeServiceDetail();
    }
  });
  document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ------------------------------------------------------------------ */
  /* 3. Busca                                                            */
  /* ------------------------------------------------------------------ */
  var search = document.getElementById('search');
  var searchToggle = document.getElementById('searchToggle');
  var searchForm = document.getElementById('searchForm');
  var searchInput = document.getElementById('searchInput');

  function openSearch() {
    search.classList.add('is-open');
    searchToggle.setAttribute('aria-expanded', 'true');
    setTimeout(function () { searchInput.focus(); }, 150);
  }
  function closeSearch() {
    search.classList.remove('is-open');
    searchToggle.setAttribute('aria-expanded', 'false');
  }
  searchToggle.addEventListener('click', function () {
    var isOpen = search.classList.contains('is-open');
    if (isOpen) { closeSearch(); } else { openSearch(); }
  });
  document.addEventListener('click', function (e) {
    if (!search.contains(e.target)) { closeSearch(); }
  });
  searchForm.addEventListener('submit', function (e) {
    // Site estático sem índice de conteúdo/backend de busca — evita navegação
    // para lugar nenhum. Plugue aqui uma busca real (Algolia, Lunr.js, endpoint
    // próprio) quando fizer sentido para o volume de conteúdo do blog.
    e.preventDefault();
    closeSearch();
  });

  /* ------------------------------------------------------------------ */
  /* 4. Scroll suave + fechar menu mobile ao navegar                    */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]:not([data-whatsapp]):not([data-service-jump])').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length <= 1) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 900 ? 64 : 84);
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------------ */
  /* 5. Scroll-reveal                                                    */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 6. Contadores animados                                              */
  /* ------------------------------------------------------------------ */
  function animateCount(el) {
    var raw = el.getAttribute('data-count-to');
    var suffix = el.getAttribute('data-suffix') || '';
    var target = parseInt(raw, 10);

    if (isNaN(target)) {
      el.textContent = raw + suffix;
      return;
    }

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    if (reduceMotion) {
      el.textContent = target + suffix;
    } else {
      window.requestAnimationFrame(step);
    }
  }

  // Badges com data-static (ex: ano de fundação) não contam — só ficam
  // visíveis via scroll-reveal, o número já é o valor final.
  var statNumbers = document.querySelectorAll('.stat__number[data-count-to]');
  if (statNumbers.length) {
    var statsObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(function (el) { statsObserver.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 7. Carrossel genérico (equipe)                                      */
  /* ------------------------------------------------------------------ */
  function initCarousel(root) {
    var track = root.querySelector('.carousel__track');
    var slides = Array.prototype.slice.call(track.children);
    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');
    var index = 0;

    function perView() {
      var w = window.innerWidth;
      if (w >= 1025) return parseInt(root.getAttribute('data-per-view-desktop'), 10) || 3;
      if (w >= 641) return parseInt(root.getAttribute('data-per-view-tablet'), 10) || 2;
      return parseInt(root.getAttribute('data-per-view-mobile'), 10) || 1;
    }

    function maxIndex() {
      return Math.max(0, slides.length - perView());
    }

    function update() {
      index = Math.min(index, maxIndex());
      var slideWidth = slides[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      var offset = index * (slideWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex();
    }

    prevBtn.addEventListener('click', function () { index = Math.max(0, index - 1); update(); });
    nextBtn.addEventListener('click', function () { index = Math.min(maxIndex(), index + 1); update(); });

    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { index = Math.min(maxIndex(), index + 1); update(); }
      if (e.key === 'ArrowLeft') { index = Math.max(0, index - 1); update(); }
    });

    var startX = 0;
    var currentX = 0;
    var dragging = false;

    function pointerDown(x) { dragging = true; startX = x; currentX = x; track.style.transition = 'none'; }
    function pointerMove(x) { if (!dragging) return; currentX = x; }
    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      var delta = currentX - startX;
      if (Math.abs(delta) > 50) {
        if (delta < 0) { index = Math.min(maxIndex(), index + 1); }
        else { index = Math.max(0, index - 1); }
      }
      update();
    }

    root.addEventListener('touchstart', function (e) { pointerDown(e.touches[0].clientX); }, { passive: true });
    root.addEventListener('touchmove', function (e) { pointerMove(e.touches[0].clientX); }, { passive: true });
    root.addEventListener('touchend', pointerUp);

    window.addEventListener('resize', update);
    update();
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* ------------------------------------------------------------------ */
  /* 8. Links de WhatsApp                                                */
  /* ------------------------------------------------------------------ */
  function buildWaHref(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
    el.setAttribute('href', buildWaHref(el.getAttribute('data-whatsapp')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ------------------------------------------------------------------ */
  /* 9. Modal de biografia da equipe                                     */
  /* ------------------------------------------------------------------ */
  var bios = {
    romulo: {
      name: 'Rômulo Bózeo',
      role: 'Imobiliário, Cível, Tributário e Empresarial',
      photo: 'img/romulo.webp',
      html:
        '<p>Advogado especialista em Direito Imobiliário, começou sua carreira jurídica aos 18 anos, no Cartório de Registro de Imóveis e Notas, onde exerceu o cargo de Substituto. Após a experiência no cartório, atuou como Despachante Imobiliário por mais 10 anos, adquirindo mais habilidades para regularização imobiliária de imóveis rurais e urbanos. Atualmente é advogado, atuando em Contencioso, legalização imobiliária, incorporação imobiliária, usucapião, e outros instrumentos jurídicos necessários para garantir a segurança jurídica do cliente.</p>' +
        '<p>É pós-graduando em Direito Tributário e Processo e Direito Civil e pós-graduando em Direito Empresarial pela PUC-RS, além de aluno do IBRADIM – Instituto Brasileiro de Direito Imobiliário. Tem uma vasta experiência empreendendo, o que permite ter uma visão mais resoluta para problemas, bem como uma capacidade de negociação e solução mais rápida de conflito.</p>' +
        '<p>Está à frente da Bózeo Advocacia e atua com profundidade em Direito Imobiliário, Cível, Família e Sucessões, Tributário e Empresarial.</p>'
    },
    ingrid: {
      name: 'Ingrid Fonseca',
      role: 'Empresarial, Cível e Tributário',
      photo: 'img/ingrid.webp',
      html:
        '<p>Começou sua trajetória profissional na área contábil há 7 anos, atuando diretamente com legalização e estruturação de empresas, experiência que proporcionou uma compreensão prática da realidade empresarial e dos desafios enfrentados por empreendedores.</p>' +
        '<p>Pós-graduada em Direito Civil e Processo Civil, e atualmente cursa especialização em Direito Empresarial pela Fundação Getulio Vargas (FGV).</p>' +
        '<p>Acredita que o Direito deve ser uma ferramenta para solucionar problemas e gerar segurança, permitindo que pessoas e empresas tomem decisões com mais tranquilidade e previsibilidade.</p>'
    },
    juliana: {
      name: 'Juliana Miranda',
      role: 'Direito Médico e Trabalhista',
      photo: 'img/juliana.webp',
      html:
        '<p>Advogada especialista em Direito Médico, com sólida experiência em Direito da Saúde e Direito do Trabalho. Iniciou sua trajetória jurídica ainda na graduação, com experiências em dois escritórios de advocacia e na Procuradoria Geral do Estado do Rio de Janeiro (PGERJ).</p>' +
        '<p>Desenvolveu ampla experiência em Direito do Trabalho, especialmente como correspondente jurídica de empresas, participando de inúmeras audiências e atuando em demandas consultivas e contenciosas. Na área de Direito da Saúde, atua na defesa dos direitos de pacientes e beneficiários de planos de saúde.</p>'
    },
    amanda: {
      name: 'Amanda Figueira',
      role: 'Previdenciário e Família',
      photo: 'img/amanda.webp',
      html:
        '<p>Dra. Amanda Figueira conta com uma trajetória construída a partir da experiência prática e do constante aperfeiçoamento técnico, atuando com especial dedicação ao <strong>Direito Previdenciário</strong>, unindo conhecimento jurídico, análise estratégica e olhar individualizado para cada caso.</p>' +
        '<p>Sua formação prática inclui <strong>dois anos de estágio na Vara de Família e Sucessões de Macaé</strong>, período em que desenvolveu sólida vivência com demandas relacionadas às relações familiares, sucessórias e às particularidades do atendimento jurídico ao cliente.</p>' +
        '<p>Posteriormente, ampliou sua experiência no âmbito federal, com <strong>um ano de atuação na Justiça Federal</strong>, adquirindo contato direto com demandas previdenciárias e com a dinâmica dos processos e procedimentos que envolvem o sistema de seguridade social.</p>' +
        '<p>Atualmente, é <strong>pós-graduanda em Direito Previdenciário e Direito do Consumidor</strong>, mantendo formação contínua e aprofundamento técnico nas áreas em que atua.</p>' +
        '<p>No <strong>Direito Previdenciário</strong>, sua experiência concentra-se especialmente na análise de CNIS, identificação de vínculos e períodos contributivos, conferência do histórico previdenciário, elaboração e acompanhamento de pedidos administrativos perante o INSS e planejamento previdenciário.</p>' +
        '<p>Mais do que analisar documentos, busca compreender a trajetória de cada segurado para identificar oportunidades, corrigir inconsistências e construir, de forma estratégica, o caminho mais seguro para a obtenção do benefício adequado.</p>' +
        '<p><strong>Precisão técnica, estratégia e atendimento individualizado são os pilares de sua atuação.</strong></p>'
    }
  };

  var bioModal = document.getElementById('bioModal');
  var bioModalPhoto = document.getElementById('bioModalPhoto');
  var bioModalName = document.getElementById('bioModalName');
  var bioModalRole = document.getElementById('bioModalRole');
  var bioModalText = document.getElementById('bioModalText');
  var bioTrigger = null;

  function openBioModal(key) {
    var bio = bios[key];
    if (!bio || !bioModal) return;
    bioModalPhoto.src = bio.photo;
    bioModalPhoto.alt = 'Retrato de ' + bio.name;
    bioModalName.textContent = bio.name;
    bioModalRole.textContent = bio.role;
    bioModalText.innerHTML = bio.html;
    bioModal.classList.add('is-open');
    bioModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    bioModal.querySelector('.bio-modal__close').focus();
  }

  function closeBioModal() {
    if (!bioModal || !bioModal.classList.contains('is-open')) return;
    bioModal.classList.remove('is-open');
    bioModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (bioTrigger) bioTrigger.focus();
  }

  document.querySelectorAll('[data-bio]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      bioTrigger = btn;
      openBioModal(btn.getAttribute('data-bio'));
    });
  });
  if (bioModal) {
    bioModal.querySelectorAll('[data-bio-close]').forEach(function (el) {
      el.addEventListener('click', closeBioModal);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 10. Entrada / sequência de abertura                                 */
  /* ------------------------------------------------------------------ */
  // A decisão de pular (sessão já vista / prefers-reduced-motion) roda inline
  // no <head> do HTML, antes deste arquivo carregar, pra evitar flash. Aqui só
  // cuidamos da saída (curtain) de quem está realmente vendo a entrada agora.
  var introOverlay = document.getElementById('introOverlay');
  var introSkip = document.getElementById('introSkip');
  var INTRO_TOTAL_MS = 3450;

  function finishIntro() {
    if (!introOverlay || introOverlay.style.display === 'none') return;
    introOverlay.classList.add('is-leaving');
    document.documentElement.style.overflow = '';
    setTimeout(function () {
      introOverlay.style.display = 'none';
    }, 750);
  }

  if (introOverlay && introOverlay.style.display !== 'none') {
    var introTimer = setTimeout(finishIntro, INTRO_TOTAL_MS);
    introSkip.addEventListener('click', function () {
      clearTimeout(introTimer);
      finishIntro();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 11. Formulário de contato                                           */
  /* ------------------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  if (form) {
  var feedback = document.getElementById('formFeedback');

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phonePattern = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;

  var validators = {
    firstName: function (v) { return v.trim().length > 0 ? '' : 'Informe seu nome.'; },
    lastName: function (v) { return v.trim().length > 0 ? '' : 'Informe seu sobrenome.'; },
    email: function (v) { return emailPattern.test(v.trim()) ? '' : 'Informe um e-mail válido.'; },
    phone: function (v) { return phonePattern.test(v.trim()) ? '' : 'Informe um telefone válido, ex: (00) 00000-0000.'; },
    message: function (v) { return v.trim().length >= 10 ? '' : 'Descreva seu caso com pelo menos 10 caracteres.'; }
  };

  function validateField(name) {
    var input = form.elements[name];
    var errorEl = document.getElementById(name + 'Error');
    var message = validators[name](input.value);
    input.closest('.field').classList.toggle('has-error', !!message);
    errorEl.textContent = message;
    return !message;
  }

  Object.keys(validators).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { validateField(name); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var isValid = Object.keys(validators).reduce(function (acc, name) {
      var ok = validateField(name);
      return acc && ok;
    }, true);

    if (!isValid) {
      feedback.textContent = 'Verifique os campos destacados antes de enviar.';
      feedback.className = 'contact-form__feedback is-error';
      return;
    }

    // Site estático sem backend próprio: o "envio" abre o WhatsApp já com a
    // mensagem preenchida a partir do formulário (mesmo padrão do site
    // institucional em produção). Para trocar por e-mail/CRM próprio, troque
    // este bloco por um fetch('/api/contato', { method:'POST', body:new FormData(form) })
    // ou plugue Formspree/EmailJS aqui.
    var data = {
      firstName: form.elements.firstName.value.trim(),
      lastName: form.elements.lastName.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      message: form.elements.message.value.trim()
    };
    var text = 'Olá! Meu nome é ' + data.firstName + ' ' + data.lastName + '.\n' +
      'E-mail: ' + data.email + '\n' +
      'Telefone: ' + data.phone + '\n\n' +
      data.message;
    var waUrl = buildWaHref(text);

    feedback.textContent = 'Tudo certo! Abrindo o WhatsApp com sua mensagem preenchida — é só confirmar o envio.';
    feedback.className = 'contact-form__feedback is-success';
    window.open(waUrl, '_blank', 'noopener');
    form.reset();
  });
  } // fim do if (form) — a página pode não ter o formulário (ex: /blog)

  /* ------------------------------------------------------------------ */
  /* 12. Ano do rodapé                                                    */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById('footerYear');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ------------------------------------------------------------------ */
  /* 13. Painel de detalhe das áreas de atuação ("Saiba mais")           */
  /* ------------------------------------------------------------------ */
  var serviceDetails = {
    imobiliario:
      '<p>Atuamos na estruturação segura de negócios imobiliários e no patrocínio de demandas complexas, combinando inteligência de mercado e técnica processual para proteger investidores, empresas e adquirentes.</p>' +
      '<ul>' +
      '<li>Assessoria completa em transações imobiliárias e Due Diligence (auditoria de riscos) para compra, venda e locação segura;</li>' +
      '<li>Regularização imobiliária e fundiária em vias judiciais e extrajudiciais (usucapião, retificação de área e adjudicação compulsória);</li>' +
      '<li>Assessoria especializada em leilões de imóveis, da análise de viabilidade e riscos até a imissão na posse do bem;</li>' +
      '<li>Atuação incisiva em litígios imobiliários complexos, ações possessórias (reintegração, manutenção de posse) e reivindicatórias;</li>' +
      '<li>Patrocínio em demandas envolvendo vícios construtivos, atrasos na entrega de obras, distratos, execução de garantias e conflitos condominiais.</li>' +
      '</ul>',
    civel:
      '<p>Representamos nossos clientes na prevenção e resolução de litígios civis, buscando a melhor equação financeira e legal, seja na mesa de negociação ou no contencioso judicial.</p>' +
      '<ul>' +
      '<li>Ações de responsabilidade civil e reparações por danos morais e materiais;</li>' +
      '<li>Estratégias de mediação, conciliação e negociação extrajudicial de conflitos;</li>' +
      '<li>Rescisão, revisão e execução de contratos civis;</li>' +
      '<li>Atuação incisiva em cobranças (pré-judiciais e cautelares) e execuções judiciais para recuperação de crédito.</li>' +
      '</ul>',
    empresarial:
      '<p>Oferecemos suporte jurídico integral ao ciclo de vida da empresa, da sua fundação à sucessão, desenhando estruturas societárias seguras, mitigando riscos e garantindo a conformidade regulatória.</p>' +
      '<ul>' +
      '<li>Consultoria na escolha da estrutura societária, abertura e constituição de empresas;</li>' +
      '<li>Elaboração de contratos sociais, acordos entre sócios e políticas de Governança Corporativa e Compliance;</li>' +
      '<li>Gestão de crises e operações societárias: fusões, cisões, incorporações (M&A), compra/venda de participações, estruturação de contratos de vesting e entrada/saída de sócios;</li>' +
      '<li>Resolução de conflitos societários, apuração de haveres, dissolução e liquidação de empresas;</li>' +
      '<li>Revisão de contratos comerciais, análise de exposição legal e planejamento de sucessão empresarial.</li>' +
      '</ul>',
    tributario:
      '<p>Focamos na eficiência fiscal e na defesa combativa dos contribuintes, aliando profundo domínio da legislação e da transição legislativa para reduzir impactos financeiros e viabilizar operações.</p>' +
      '<ul>' +
      '<li>Contencioso estratégico tributário: defesa técnica contundente em execuções fiscais e atuação nos tribunais administrativos (incluindo CARF);</li>' +
      '<li>Planejamento tributário, Compliance e consultoria na transição para os novos tributos da Reforma Tributária (IBS, CBS e Imposto Seletivo), além dos impostos atuais;</li>' +
      '<li>Ações judiciais estratégicas para o reconhecimento de imunidade e isenção tributária, bem como ações declaratórias de inexistência de débito;</li>' +
      '<li>Estruturação de negócios com foco em desoneração, com forte atuação no reconhecimento da não incidência de ITBI (fundamental em integralizações e holdings);</li>' +
      '<li>Ações de repetição de indébito para recuperação de tributos pagos indevidamente e condução de transações tributárias/parcelamentos para regularização de passivos.</li>' +
      '</ul>',
    familia:
      '<p>Conduzimos demandas familiares e sucessórias com discrição, empatia e firmeza. Nosso objetivo é garantir a organização do patrimônio e a resolução ágil de conflitos.</p>' +
      '<ul>' +
      '<li>Inventários judiciais e extrajudiciais, incluindo partilha de cotas empresariais e bens imóveis;</li>' +
      '<li>Planejamento sucessório, testamentos e estruturação de proteção patrimonial;</li>' +
      '<li>Divórcios consensuais e litigiosos, reconhecimento e dissolução de união estável;</li>' +
      '<li>Ações envolvendo partilha de bens, pensão alimentícia e guarda.</li>' +
      '</ul>',
    trabalhista:
      '<p>Atuamos de forma estratégica no consultivo e contencioso, buscando a mitigação de riscos estruturais para empresas e a garantia inegociável dos direitos trabalhistas.</p>' +
      '<ul>' +
      '<li>Consultoria preventiva, auditoria trabalhista e adequação de rotinas de RH e regulamentos internos;</li>' +
      '<li>Defesa empresarial em reclamações trabalhistas, inquéritos e fiscalizações;</li>' +
      '<li>Ações judiciais para reconhecimento de vínculo, rescisão indireta, assédio moral e reversão de justa causa.</li>' +
      '</ul>',
    previdenciario:
      '<p>Atuamos de forma diligente para garantir a concessão do seu benefício junto ao INSS e combater abusos cometidos por operadoras de planos de saúde.</p>' +
      '<ul>' +
      '<li>Planejamento previdenciário e concessão/revisão de aposentadorias e auxílios (INSS e judicial);</li>' +
      '<li>Medidas liminares de urgência para fornecimento de medicamentos de alto custo, órteses, próteses e terapias;</li>' +
      '<li>Reversão de negativas de cirurgias, internações e combate a reajustes abusivos ou cancelamentos de planos de saúde;</li>' +
      '<li>Ações indenizatórias decorrentes de erro médico e falha na prestação de serviços.</li>' +
      '</ul>'
  };

  var serviceDetail = document.getElementById('serviceDetail');
  var serviceDetailPanel = serviceDetail ? serviceDetail.querySelector('.service-detail__panel') : null;
  var serviceDetailIcon = document.getElementById('serviceDetailIcon');
  var serviceDetailTitle = document.getElementById('serviceDetailTitle');
  var serviceDetailResult = document.getElementById('serviceDetailResult');
  var serviceDetailBody = document.getElementById('serviceDetailBody');
  var serviceDetailCta = document.getElementById('serviceDetailCta');
  var serviceTrigger = null;

  function getFocusable(container) {
    if (!container) return [];
    return Array.prototype.slice
      .call(container.querySelectorAll('a[href], button:not([disabled])'))
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openServiceDetail(btn) {
    var li = btn.closest('.service-item');
    var slug = btn.getAttribute('data-service');
    var body = serviceDetails[slug];
    if (!li || !body || !serviceDetail) return;

    var link = li.querySelector('[data-wa-message]');
    var icon = li.querySelector('.service-item__icon');

    serviceDetailIcon.innerHTML = icon ? icon.innerHTML : '';
    serviceDetailTitle.textContent = li.querySelector('.service-item__text strong').textContent;
    serviceDetailResult.textContent = li.querySelector('.service-item__result').textContent;
    serviceDetailBody.innerHTML = body;
    if (link) {
      serviceDetailCta.setAttribute('href', buildWaHref(link.getAttribute('data-wa-message')));
      serviceDetailCta.setAttribute('target', '_blank');
      serviceDetailCta.setAttribute('rel', 'noopener');
    }

    serviceTrigger = btn;
    serviceDetail.classList.add('is-open');
    serviceDetail.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    serviceDetailPanel.scrollTop = 0;
    serviceDetail.querySelector('.service-detail__close').focus();
  }

  function closeServiceDetail() {
    if (!serviceDetail || !serviceDetail.classList.contains('is-open')) return;
    serviceDetail.classList.remove('is-open');
    serviceDetail.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (serviceTrigger) serviceTrigger.focus();
    serviceTrigger = null;
  }

  document.querySelectorAll('[data-service]').forEach(function (btn) {
    btn.addEventListener('click', function () { openServiceDetail(btn); });
  });

  /* Links de "Áreas de atuação" no rodapé: sobem até o card específico   */
  /* (não só o topo da seção) e abrem a aba lateral com a descrição.      */
  document.querySelectorAll('a[data-service-jump]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var slug = link.getAttribute('data-service-jump');
      var trigger = document.querySelector('.service-item__more[data-service="' + slug + '"]');
      var li = trigger ? trigger.closest('.service-item') : null;
      if (!li || !trigger) return;
      var offset = window.innerWidth < 900 ? 64 : 84;
      var top = li.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      window.setTimeout(function () { openServiceDetail(trigger); }, reduceMotion ? 0 : 550);
    });
  });

  if (serviceDetail) {
    serviceDetail.querySelectorAll('[data-service-close]').forEach(function (el) {
      el.addEventListener('click', closeServiceDetail);
    });
    serviceDetail.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = getFocusable(serviceDetailPanel);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

})();
