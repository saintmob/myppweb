import { langData, languageConfig } from './translations.js';

const SUPPORTED_LANGUAGES = Object.keys(languageConfig);

function safelySetTextContent(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content || '';
    }
}

function setMetaContent(selector, content) {
    const element = document.querySelector(selector);
    if (element && typeof content === 'string') {
        element.setAttribute('content', content);
    }
}

function buildCanonicalUrl(lang) {
    const canonicalUrl = new URL(`${window.location.origin}${window.location.pathname}`);
    canonicalUrl.searchParams.set('lang', lang);
    return canonicalUrl;
}

function updateSeoMetadata(lang, data, config) {
    document.documentElement.lang = config.htmlLang || lang;
    document.title = data.pageTitle || document.title;

    setMetaContent('#meta-description', data.pageDescription);
    setMetaContent('#og-title', data.pageTitle);
    setMetaContent('#og-description', data.pageDescription);
    setMetaContent('#twitter-title', data.pageTitle);
    setMetaContent('#twitter-description', data.pageDescription);
    setMetaContent('#og-locale', config.ogLocale || 'en_US');

    const currentUrl = buildCanonicalUrl(lang);

    const canonicalLink = document.getElementById('canonical-link');
    if (canonicalLink) {
        canonicalLink.setAttribute('href', currentUrl.toString());
    }
    setMetaContent('#og-url', currentUrl.toString());
}

export function updateContent(lang) {
    const data = langData[lang] || langData['en']; // 使用英语作为后备语言
    const config = languageConfig[lang] || languageConfig['en'];

    updateSeoMetadata(lang, data, config);

    safelySetTextContent("app-title-suffix", data.appTitle);
    safelySetTextContent("app-description", data.appDescription);
    safelySetTextContent("app-requires", data.appRequires);
    safelySetTextContent("brand-description", data.brandDescription);
    safelySetTextContent("slogan-text", data.brandSlogan);
    safelySetTextContent("direct-download", data.directDownload);
    safelySetTextContent("old-version-download", data.oldVersionDownload);
    safelySetTextContent("features-title", data.features);
    safelySetTextContent("reviews-title", data.reviewsTitle);
    safelySetTextContent("contact-title", data.contactTitle);
    safelySetTextContent("contact-description", data.contactDescription);
    safelySetTextContent("contact-button", data.contactButton);
    safelySetTextContent("footer-terms", data.footerTerms);
    safelySetTextContent("footer-privacy", data.footerPrivacy);
    safelySetTextContent("footer-copyright-text", data.footerCopyright);

    // 更新 FAQ 标题
    const faqTitle = document.getElementById('faq-title');
    if (faqTitle) {
        faqTitle.textContent = data.faqTitle;
    }

    // 更新 FAQ 内容
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        const questionElement = item.querySelector('.faq-question h3');
        const answerElement = item.querySelector('.faq-answer p');

        if (questionElement && answerElement && data[`faq${index + 1}`] && data[`faq${index + 1}Answer`]) {
            questionElement.textContent = data[`faq${index + 1}`];
            answerElement.textContent = data[`faq${index + 1}Answer`];
        }
    });

    const featureItems = document.querySelectorAll('#app-features .feature-item');
    const featureCopy = [
        [data.featureEditorial, data.featureEditorialDesc],
        [data.featureScreenAdapt, data.featureScreenAdaptDesc],
        [data.featureOneClick, data.featureOneClickDesc],
        [data.featureMyWallpapers, data.featureMyWallpapersDesc]
    ];

    featureItems.forEach((item, index) => {
        const titleElement = item.querySelector('h3');
        const descriptionElement = item.querySelector('p');
        const copy = featureCopy[index];
        if (copy && titleElement && descriptionElement) {
            titleElement.textContent = copy[0];
            descriptionElement.textContent = copy[1];
        }
    });

    const featuresLink = document.querySelector('.navbar-item[href="#features"]');
    if (featuresLink) {
        featuresLink.textContent = data.menuFeatures;
    }

    const userReviewsLink = document.querySelector('.navbar-item[href="#user-reviews"]');
    if (userReviewsLink) {
        userReviewsLink.textContent = data.menuUserReviews;
    }

    const faqLink = document.querySelector('.navbar-item[href="#faq"]');
    if (faqLink) {
        faqLink.textContent = data.menuFAQ;
    }

    const contactLink = document.getElementById("contact-link");
    if (contactLink) {
        contactLink.textContent = data.menuContact;
    }

    const downloadBadge = document.getElementById('download-badge');
    const downloadLink = document.getElementById('download-link');
    if (downloadBadge) {
        downloadBadge.src = config.badgeSrc;
        downloadBadge.alt = config.altText;
    }
    if (downloadLink) {
        downloadLink.href = config.appStoreLink;
    }
}

export function changeLanguage(selectedLanguage) {
    const normalizedLanguage = SUPPORTED_LANGUAGES.includes(selectedLanguage) ? selectedLanguage : 'en';
    try {
        localStorage.setItem('preferredLanguage', normalizedLanguage);
    } catch (error) {
        console.warn('Unable to save language preference:', error);
    }

    try {
        updateContent(normalizedLanguage);
        const url = buildCanonicalUrl(normalizedLanguage);
        history.replaceState({}, '', `${url.pathname}${url.search}${window.location.hash}`);

        const languageText = document.querySelector('.language-text');
        const selectedLangElement = document.querySelector(`.language-dropdown a[data-lang="${normalizedLanguage}"]`);
        if (languageText && selectedLangElement) {
            languageText.textContent = selectedLangElement.textContent;
        }

        const languageSelector = document.querySelector('.language-selector');
        const currentLanguageButton = document.querySelector('.current-language');
        if (languageSelector) {
            languageSelector.classList.remove('open');
        }
        if (currentLanguageButton) {
            currentLanguageButton.setAttribute('aria-expanded', 'false');
        }
    } catch (error) {
        console.error('Error changing language:', error);
    }
}

export function initLanguageSelector() {
    const languageSelector = document.querySelector('.language-selector');
    const currentLanguageButton = document.querySelector('.current-language');
    const languageDropdown = document.querySelector('.language-dropdown');
    if (!languageSelector || !currentLanguageButton || !languageDropdown) {
        return;
    }

    const setOpenState = (isOpen) => {
        languageSelector.classList.toggle('open', isOpen);
        currentLanguageButton.setAttribute('aria-expanded', String(isOpen));
    };

    currentLanguageButton.addEventListener('click', (event) => {
        event.preventDefault();
        setOpenState(!languageSelector.classList.contains('open'));
    });

    currentLanguageButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpenState(!languageSelector.classList.contains('open'));
        }
        if (event.key === 'Escape') {
            setOpenState(false);
        }
    });

    languageDropdown.addEventListener('click', function (e) {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            changeLanguage(e.target.getAttribute('data-lang'));
        }
    });

    languageDropdown.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setOpenState(false);
            currentLanguageButton.focus();
        }
    });

    document.addEventListener('click', (event) => {
        if (!languageSelector.contains(event.target)) {
            setOpenState(false);
        }
    });
}

export function getDefaultLanguage() {
    const urlLanguage = new URLSearchParams(window.location.search).get('lang');
    if (urlLanguage && SUPPORTED_LANGUAGES.includes(urlLanguage)) {
        return urlLanguage;
    }

    let savedLang = '';
    try {
        savedLang = localStorage.getItem('preferredLanguage') || '';
    } catch (error) {
        console.warn('Unable to read language preference:', error);
    }

    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
        return savedLang;
    }

    const userLang = (navigator.language || navigator.userLanguage || '').toLowerCase();

    if (
        userLang.startsWith('zh-hant') ||
        userLang.startsWith('zh-tw') ||
        userLang.startsWith('zh-hk') ||
        userLang.startsWith('zh-mo')
    ) {
        return 'zh-Hant';
    }

    if (userLang.startsWith('zh')) {
        return 'zh-Hans-CN';
    }

    if (userLang.startsWith('ja')) {
        return 'ja';
    }

    if (userLang.startsWith('ko')) {
        return 'ko';
    }

    if (userLang.startsWith('en')) {
        return 'en';
    }

    return 'zh-Hans-CN';
}
