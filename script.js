// JS simple pour plus tard
(function() {
    'use strict';
    
    // Polyfills pour compatibilité avec anciens navigateurs
    if (!Array.from) {
        Array.from = function(arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        };
    }
    
    if (!Element.prototype.addEventListener) {
        // Fallback pour très anciens navigateurs
        Element.prototype.addEventListener = function(type, listener) {
            this.attachEvent('on' + type, listener);
        };
    }
    
    // Gestion d'erreur globale
    if (window.addEventListener) {
        window.addEventListener('error', function(e) {
            // Empêcher les erreurs de bloquer l'exécution
            e.preventDefault();
        });
    }
    
    // Fonction de log sécurisée pour éviter les erreurs
    function safeLog(message, data) {
        try {
            if (typeof console !== 'undefined' && console.log) {
                if (data) {
                    console.log(message, data);
                } else {
                    console.log(message);
                }
            }
        } catch(e) {
            // Ignorer les erreurs de console
        }
    }
    safeLog("Portfolio chargé");

// Gestion du menu hamburger
const hamburger = document.getElementById('hamburger');
const navList = document.getElementById('nav-list');

function isMobile() {
    return window.innerWidth <= 900;
}

if (hamburger) {
    hamburger.addEventListener('click', function () {
        navList.classList.toggle('open');
    });
}

// Fermer le menu hamburger après clic sur un lien (mobile)
function closeMenuOnClick() {
    if (isMobile()) {
        navList.classList.remove('open');
    }
}

// Onglets à afficher
const tabs = [
    { name: 'Accueil', href: '#' },
    { name: 'À propos', href: '#about' },
    { name: 'Compétences', href: '#skills' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' }
];

// Onglet actif (par défaut : Accueil)
let activeTab = 'Accueil';
// Contrôle d'affichage du titre "À propos" quand on vient de "En Savoir Plus"
let hideAboutTitleOnce = false;

// Liste des sections et leur correspondance avec les onglets
const sectionMap = {
    'Accueil': ['.hero'],
    'À propos': ['.about'],
    'Compétences': ['.skills'],
    'Services': ['.services'],
    'Contact': ['.contact']
};

function showSectionForTab(tabName) {
    // Masquer toutes les sections principales
    document.querySelectorAll('.hero, .about, .skills, .services, .contact').forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });
    // Afficher les sections correspondantes à l'onglet
    if (sectionMap[tabName]) {
        sectionMap[tabName].forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.style.display = '';
                // Déclencher l'animation fade-in lente
                void el.offsetWidth; // reflow
                el.classList.add('active');
            }
        });
    }
    // Masquer ou afficher le titre "À propos" selon le contexte
    if (tabName === 'À propos') {
        const aboutTitle = document.querySelector('#about h2');
        if (aboutTitle) {
            aboutTitle.style.display = hideAboutTitleOnce ? 'none' : '';
        }
        // Consommer le drapeau pour un seul affichage
        hideAboutTitleOnce = false;
        // Déclencher l'animation phrase-par-phrase pour À propos
        if (typeof animateAboutSentences === 'function') {
            animateAboutSentences();
        }
    }
    // Gérer la visibilité du carrousel uniquement sur Accueil
    const homeCarousel = document.getElementById('home-carousel');
    if (homeCarousel) {
        homeCarousel.style.display = (tabName === 'Accueil') ? '' : 'none';
    }
}

function renderNav() {
    navList.innerHTML = '';
    // Si mobile, afficher tous les onglets dans le menu hamburger
    const showAllTabs = isMobile();
    tabs.forEach(tab => {
        if (!showAllTabs && tab.name === 'Accueil' && activeTab === 'Accueil') return;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = tab.name;
        a.href = tab.href;
        if (tab.name === activeTab && !showAllTabs) {
            a.classList.add('active');
        }
        a.addEventListener('click', function (e) {
            // Pour les liens internes, empêcher le scroll automatique
            if (tab.href.startsWith('#')) {
                e.preventDefault();
                activeTab = tab.name;
                renderNav();
                closeMenuOnClick();
                showSectionForTab(tab.name);
                // Scroll vers la section si ce n'est pas Accueil
                if (tab.href !== '#' && !isMobile()) {
                    const section = document.querySelector(tab.href);
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                } else if (!isMobile()) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                if (window.history && window.history.pushState) {
                    const newUrl = (tab.href === '#') ? window.location.pathname : tab.href;
                    history.pushState({ tabName: tab.name }, '', newUrl);
                }
            }
        });
        li.appendChild(a);
        navList.appendChild(li);
    });
    // Afficher la bonne section au rendu initial
    showSectionForTab(activeTab);
}

// (Aucune logique revealOnScroll, .visible, etc.)

// Ouverture app native si possible, sinon fallback web
function openAppOrWeb(appUrl, webUrl, fallbackDelayMs = 300) {
    const timeout = setTimeout(() => {
        window.open(webUrl, '_blank');
    }, fallbackDelayMs);
    // Essayer d'ouvrir l'app
    window.location.href = appUrl;
    // Annuler si l'app s'ouvre (perte de focus probable)
    window.addEventListener('blur', () => clearTimeout(timeout), { once: true });
}

function isMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iphone|ipad|ipod/i.test(ua);
}

function openGmailOrMailto(email, subject = '', body = '') {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    const gmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodedSubject}&body=${encodedBody}`;

    if (isMobileDevice()) {
        // Essayer d'ouvrir l'app Gmail (Android)
        const gmailApp = `googlegmail://co?to=${email}&subject=${encodedSubject}&body=${encodedBody}`;
        openAppOrWeb(gmailApp, gmailWeb, 400);
    } else {
        // Desktop: ouvrir Gmail web compose (ou client mail par défaut via mailto si Gmail non connecté)
        window.open(gmailWeb, '_blank');
    }
}

// Fonction d'initialisation
function initPortfolio() {
    try {
        renderNav();
    // Afficher/masquer le hamburger selon la taille
    function toggleHamburger() {
        if (isMobile()) {
            hamburger.style.display = 'block';
            navList.classList.remove('open');
        } else {
            hamburger.style.display = 'none';
            navList.classList.remove('open');
        }
        renderNav();
    }
    window.addEventListener('resize', toggleHamburger);
    toggleHamburger();

    // ----- Insertion du carrousel juste après le header -----
    const headerEl = document.querySelector('header');
    if (headerEl) {
        const carousel = document.createElement('div');
        carousel.className = 'carousel';
        carousel.id = 'home-carousel';
        carousel.innerHTML = `
            <div class="carousel-track">
                <div class="carousel-slide"><img src="animation1.png" alt="Animation 1"></div>
                <div class="carousel-slide"><img src="animation2.png" alt="Animation 2"></div>
                <div class="carousel-slide"><img src="animation3.png" alt="Animation 3"></div>
                <div class="carousel-slide"><img src="animation4.png" alt="Animation 4"></div>
            </div>
            <div class="carousel-indicators">
                <span class="dot active"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
            <button class="carousel-arrow prev" aria-label="Précédent">&#10094;</button>
            <button class="carousel-arrow next" aria-label="Suivant">&#10095;</button>
            <div class="carousel-hit prev" role="button" tabindex="0" aria-hidden="false" aria-label="Zone précédente"></div>
            <div class="carousel-hit next" role="button" tabindex="0" aria-hidden="false" aria-label="Zone suivante"></div>
        `;
        headerEl.insertAdjacentElement('afterend', carousel);

        // Auto défilement + pause/lecture
        const track = carousel.querySelector('.carousel-track');
        const dots = Array.from(carousel.querySelectorAll('.dot'));
        let currentIndex = 0;
        const total = 4;
        let intervalId = null;
        const intervalMs = 3000;

        function goTo(index) {
            currentIndex = (index + total) % total;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
        }

        function startAuto() {
            if (intervalId !== null) return;
            intervalId = setInterval(() => {
                goTo(currentIndex + 1);
            }, intervalMs);
        }

        function stopAuto() {
            if (intervalId === null) return;
            clearInterval(intervalId);
            intervalId = null;
        }

        // Dots cliquables pour choisir une image et mettre en pause
        dots.forEach((dot, i) => {
            dot.style.cursor = 'pointer';
            dot.addEventListener('click', () => {
                stopAuto();
                goTo(i);
            });
        });

        // Pause au survol, reprise en sortie
        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);

        // Flèches de navigation
        const prevBtn = carousel.querySelector('.carousel-arrow.prev');
        const nextBtn = carousel.querySelector('.carousel-arrow.next');
        const prevHit = carousel.querySelector('.carousel-hit.prev');
        const nextHit = carousel.querySelector('.carousel-hit.next');
        if (prevBtn) {
            const handlePrev = (e) => {
                if (carousel.style.display === 'none') return;
                e.preventDefault();
                e.stopPropagation();
                stopAuto();
                goTo(currentIndex - 1);
            };
            prevBtn.addEventListener('click', handlePrev);
            prevBtn.addEventListener('touchstart', handlePrev, { passive: false });
        }
        if (nextBtn) {
            const handleNext = (e) => {
                if (carousel.style.display === 'none') return;
                e.preventDefault();
                e.stopPropagation();
                stopAuto();
                goTo(currentIndex + 1);
            };
            nextBtn.addEventListener('click', handleNext);
            nextBtn.addEventListener('touchstart', handleNext, { passive: false });
        }
        if (prevHit) {
            const handlePrev = (e) => {
                if (carousel.style.display === 'none') return;
                e.preventDefault();
                e.stopPropagation();
                stopAuto();
                goTo(currentIndex - 1);
            };
            prevHit.addEventListener('click', handlePrev);
            prevHit.addEventListener('touchstart', handlePrev, { passive: false });
            prevHit.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    stopAuto();
                    goTo(currentIndex - 1);
                }
            });
        }
        if (nextHit) {
            const handleNext = (e) => {
                if (carousel.style.display === 'none') return;
                e.preventDefault();
                e.stopPropagation();
                stopAuto();
                goTo(currentIndex + 1);
            };
            nextHit.addEventListener('click', handleNext);
            nextHit.addEventListener('touchstart', handleNext, { passive: false });
            nextHit.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    stopAuto();
                    goTo(currentIndex + 1);
                }
            });
        }

        // Démarrage
        startAuto();

        // Visibilité initiale selon l'onglet actif
        carousel.style.display = (activeTab === 'Accueil') ? '' : 'none';

        // --- Swipe tactile pour mobile/tablette ---
        let touchStartX = 0;
        let touchCurrentX = 0;
        let isSwiping = false;

        function onTouchStart(e) {
            // Ne pas traiter les événements si le carrousel n'est pas visible
            if (carousel.style.display === 'none') return;
            if (!e.touches || e.touches.length === 0) return;
            touchStartX = e.touches[0].clientX;
            touchCurrentX = touchStartX;
            isSwiping = true;
            stopAuto();
        }

        function onTouchMove(e) {
            // Ne pas traiter les événements si le carrousel n'est pas visible
            if (carousel.style.display === 'none') return;
            if (!isSwiping || !e.touches || e.touches.length === 0) return;
            touchCurrentX = e.touches[0].clientX;
        }

        function onTouchEnd() {
            // Ne pas traiter les événements si le carrousel n'est pas visible
            if (carousel.style.display === 'none') return;
            if (!isSwiping) return;
            const delta = touchCurrentX - touchStartX;
            const threshold = 40; // px
            if (Math.abs(delta) > threshold) {
                if (delta > 0) {
                    goTo(currentIndex - 1);
                } else {
                    goTo(currentIndex + 1);
                }
            }
            isSwiping = false;
            // Reprendre l'auto après un court délai
            setTimeout(startAuto, 1200);
        }

        track.addEventListener('touchstart', onTouchStart, { passive: true });
        track.addEventListener('touchmove', onTouchMove, { passive: true });
        track.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    // -------- Animation des phrases pour À propos (réutilisable) --------
    function animateAboutSentences() {
        const aboutSection = document.querySelector('#about');
        if (!aboutSection) return;
        const p = aboutSection.querySelector('p');
        if (!p) return;

        function wrapSentences(node) {
            const sentenceRegex = /[^.!?\n\r]+[.!?]?\s*/g;
            const newFragment = document.createDocumentFragment();
            const text = node.textContent || '';
            const matches = text.match(sentenceRegex) || [];
            matches.forEach((segment) => {
                const span = document.createElement('span');
                span.className = 'sentence';
                span.textContent = segment;
                span.style.opacity = '0';
                newFragment.appendChild(span);
            });
            node.replaceWith(newFragment);
        }

        if (!p.hasAttribute('data-sentences-wrapped')) {
            const nodes = Array.from(p.childNodes);
            nodes.forEach((n) => {
                if (n.nodeType === Node.TEXT_NODE) {
                    if ((n.textContent || '').trim().length) {
                        wrapSentences(n);
                    } else {
                        n.remove();
                    }
                }
            });
            p.setAttribute('data-sentences-wrapped', 'true');
        }

        const sentences = Array.from(p.querySelectorAll('span.sentence'));
        sentences.forEach((span) => {
            span.style.animation = 'none';
            span.style.opacity = '0';
        });
        void p.offsetWidth;
        const baseDelay = 0.2; // s entre phrases
        const duration = 1.6; // même durée que Compétences
        sentences.forEach((span, idx) => {
            span.style.display = 'inline-block';
            span.style.animation = `sentenceSlideIn ${duration}s ease forwards`;
            span.style.animationDelay = `${(idx + 1) * baseDelay}s`;
        });
    }

    const wa = document.getElementById('link-whatsapp');
    const ig = document.getElementById('link-instagram');
    if (wa) {
        wa.addEventListener('click', function (e) {
            e.preventDefault();
            const msg = encodeURIComponent("Bonjour, je souhaite vous contacter via votre portfolio.");
            if (isMobileDevice()) {
                openAppOrWeb(`whatsapp://send?phone=+243847988507&text=${msg}`, `https://wa.me/243847988507?text=${msg}`, 300);
            } else {
                window.open(`https://wa.me/243847988507?text=${msg}`, '_blank');
            }
        });
    }
    if (ig) {
        ig.addEventListener('click', function (e) {
            e.preventDefault();
            const appUrl = `instagram://user?username=barakamirimonzulo`;
            const webUrl = `https://instagram.com/barakamirimonzulo`;
            if (isMobileDevice()) {
                // Essayer l'app d'abord, fallback web après un court délai
                openAppOrWeb(appUrl, webUrl, 350);
            } else {
                // Sur desktop, ouvrir directement le site web (plus fiable)
                window.open(webUrl, '_blank');
            }
        });
    }

    const emailLink = document.getElementById('link-email');
    if (emailLink) {
        emailLink.addEventListener('click', function (e) {
            e.preventDefault();
            openGmailOrMailto('barakamirimo@gmail.com', 'Contact via portfolio', 'Bonjour, je souhaite vous contacter à propos de votre portfolio.');
        });
    }

    // Bouton "En Savoir Plus" → afficher la section À propos avec le même design
    const learnMoreBtn = document.querySelector('.hero .btn[href="#about"]');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Ne pas changer l'onglet actif ni le surlignage du menu
            hideAboutTitleOnce = true;
            // Fix mobile: conserver l'état sur À propos pour éviter retour à Accueil lors des resize
            activeTab = 'À propos';
            renderNav();
            animateAboutSentences();
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
            // Mettre à jour l'URL
            if (window.history && window.history.pushState) {
                history.pushState({ tabName: 'À propos' }, '', '#about');
            } else if (history.replaceState) {
                history.replaceState(null, '', '#about');
            } else {
                location.hash = '#about';
            }
        });
    }

    function restoreSectionFromHash() {
        const hash = location.hash.toLowerCase();
        const targetTab = tabs.find(tab => tab.href.toLowerCase() === hash);
        if (targetTab) {
            activeTab = targetTab.name;
            if (window.history && window.history.replaceState) {
                history.replaceState({ tabName: activeTab }, '', hash);
            }
            renderNav();
        }
    }

    // Si l'URL ouvre directement une ancre interne, activer l'onglet et afficher la section
    restoreSectionFromHash();

    // -------------------- MODAL PHOTO --------------------
    safeLog('Initialisation du modal photo...');
    const profilePhoto = document.getElementById('profile-photo');
    const modal = document.getElementById('photo-modal');
    const modalPhoto = document.getElementById('modal-photo');
    const closeBtn = document.querySelector('.close');
    safeLog('Éléments trouvés:', {
        profilePhoto: !!profilePhoto,
        modal: !!modal,
        modalPhoto: !!modalPhoto,
        closeBtn: !!closeBtn
    });

    // Ouvrir le modal au clic sur la photo
    if (profilePhoto && modal) {
        safeLog('Ajout de l\'événement click sur la photo');
        profilePhoto.addEventListener('click', function() {
            safeLog('Clic détecté sur la photo, ouverture du modal...');
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Empêcher le scroll
            // Ajouter un état dans l'historique pour permettre le retour
            if (history.pushState) {
                history.pushState({ modalOpen: true }, '', '#photo');
            }
        });
    } else {
        safeLog('Erreur: profilePhoto ou modal non trouvé');
    }

    // Fermer le modal
    function closeModal() {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Réactiver le scroll
        // Retirer l'état de l'historique si nécessaire
        if (history.replaceState && location.hash === '#photo') {
            history.replaceState(null, '', location.pathname + location.search);
        }
    }

    // Fermer avec le bouton X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Fermer en cliquant sur l'image elle-même
    if (modalPhoto) {
        modalPhoto.addEventListener('click', closeModal);
        // Support tactile pour mobile/tablette
        modalPhoto.addEventListener('touchstart', closeModal, { passive: true });
    }

    // Fermer en cliquant en dehors de l'image
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Fermer avec le bouton retour du navigateur (téléphone, tablette, ordinateur)
    window.addEventListener('popstate', function(e) {
        if (modal.style.display === 'block') {
            closeModal();
            return;
        }
        const state = e.state;
        if (state && state.tabName) {
            activeTab = state.tabName;
            renderNav();
            showSectionForTab(activeTab);
        } else {
            activeTab = 'Accueil';
            renderNav();
            showSectionForTab(activeTab);
        }
    });
    } catch(error) {
        safeLog('Erreur lors de l\'initialisation:', error);
    }
}

// Initialiser le portfolio quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    // DOM déjà chargé
    initPortfolio();
}
})();