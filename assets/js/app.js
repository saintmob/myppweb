import { changeLanguage, initLanguageSelector, getDefaultLanguage } from './languageUtils.js';
import { langData } from './translations.js';

function initNavbarToggle() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    if (!navbarToggle || !navbarMenu) {
        return;
    }

    const setMenuOpen = (isOpen) => {
        navbarToggle.classList.toggle('active', isOpen);
        navbarMenu.classList.toggle('active', isOpen);
        navbarToggle.setAttribute('aria-expanded', String(isOpen));
    };

    navbarToggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = navbarMenu.classList.contains('active');
        setMenuOpen(!isOpen);
    });

    document.addEventListener('click', (event) => {
        if (!navbarToggle.contains(event.target) && !navbarMenu.contains(event.target)) {
            setMenuOpen(false);
        }
    });

    navbarMenu.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            setMenuOpen(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuOpen(false);
        }
    });
}

function getFallbackReviews(lang) {
    const data = langData[lang] || langData['en'];
    const defaultReviewTitle = data.reviewsTitle || 'User Review';
    return [
        { rating: 5, title: data.reviewTitle1 || defaultReviewTitle, content: data.review1, author: data.reviewAuthor1 },
        { rating: 5, title: data.reviewTitle2 || defaultReviewTitle, content: data.review2, author: data.reviewAuthor2 },
        { rating: 5, title: data.reviewTitle3 || defaultReviewTitle, content: data.review3, author: data.reviewAuthor3 },
        { rating: 5, title: data.reviewTitle4 || defaultReviewTitle, content: data.review4, author: data.reviewAuthor4 }
    ];
}

async function fetchAppReviews() {
    try {
        const response = await fetch('https://itunes.apple.com/cn/rss/customerreviews/id=1639052102/sortBy=mostRecent/json');
        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        const data = await response.json();
        const reviews = data.feed.entry
            .filter(entry => parseInt(entry['im:rating'].label) >= 4 && entry.content.label.length >= 6)
            .map(entry => ({
                rating: parseInt(entry['im:rating'].label),
                content: entry.content.label,
                author: entry.author.name.label,
                title: entry.title.label
            }))
            .slice(0, 40);
        return reviews;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];  // 错误时返回空数组，保持接口一致性
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';  // 清空容器内容
    
    const selectedReviews = shuffleArray(reviews).slice(0, 8);  // 随机选取8条评论
    
    selectedReviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        
        const starsElement = document.createElement('div');
        starsElement.className = 'review-stars';
        starsElement.textContent = '★'.repeat(review.rating);  // 安全设置星级显示

        const titleElement = document.createElement('h3');
        titleElement.className = 'review-title';
        titleElement.textContent = review.title;  // 安全设置标题

        const contentElement = document.createElement('p');
        contentElement.className = 'review-text';
        contentElement.textContent = review.content;  // 安全设置内容

        const authorElement = document.createElement('p');
        authorElement.className = 'review-author';
        authorElement.textContent = `- ${review.author}`;  // 安全设置作者

        // 将各个部分添加到 reviewElement
        reviewElement.appendChild(starsElement);
        reviewElement.appendChild(titleElement);
        reviewElement.appendChild(contentElement);
        reviewElement.appendChild(authorElement);

        // 将整个 reviewElement 添加到容器中
        container.appendChild(reviewElement);
    });
}

async function initSwiper() {
    try {
        console.log('Initializing Swiper');
        const swiper = new Swiper('.swiper-container', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: false,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            breakpoints: {
                640: {
                    slidesPerView: 2
                },
                768: {
                    slidesPerView: 3
                },
                1024: {
                    slidesPerView: 4,
                }
            }
        });
        await loadRandomScreenshots(swiper);

        const minSlidesForLoop = typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 1;
        if (swiper.slides.length > minSlidesForLoop) {
            swiper.params.loop = true;
            swiper.loopCreate();
            swiper.update();
        }
    } catch (error) {
        console.error('Error initializing Swiper:', error);
    }
}

async function loadRandomScreenshots(swiper) {
    const screenshotWrapper = document.getElementById('screenshot-wrapper');
    if (!screenshotWrapper) {
        return;
    }

    const screenshots = [];
    for (let i = 1; i <= 208; i++) {
        const num = i.toString().padStart(5, '0');
        screenshots.push(`./assets/screenshots/720p/s${num}.webp`);
    }

    const targetSlideCount = 8;
    const selectedScreenshots = shuffleArray([...screenshots]).slice(0, targetSlideCount);
    const existingSlides = Array.from(screenshotWrapper.querySelectorAll('.swiper-slide'));

    const loadPromises = selectedScreenshots.map((src, index) => {
        return new Promise((resolve) => {
            let slide = existingSlides[index];
            if (!slide) {
                slide = document.createElement('div');
                slide.className = 'swiper-slide';
                screenshotWrapper.appendChild(slide);
            }

            let img = slide.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                slide.appendChild(img);
            }

            const finish = () => resolve();
            const currentSrc = img.getAttribute('src');

            img.alt = 'pap.er app screenshot';
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.decoding = 'async';
            img.style.background = '#f0f0f0';
            img.onload = finish;
            img.onerror = finish;

            if (currentSrc === src && img.complete) {
                resolve();
                return;
            }

            img.src = src;
            if (img.complete) {
                resolve();
            }
        });
    });

    for (let i = selectedScreenshots.length; i < existingSlides.length; i++) {
        existingSlides[i].remove();
    }

    await Promise.all(loadPromises);
    swiper.update();
}

document.addEventListener('DOMContentLoaded', async () => {
    // FAQ 初始化
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (index === 0) {
            item.classList.add('active');
        }

        question.addEventListener('click', () => {
            item.classList.toggle('active');

            if (item.classList.contains('active')) {
                answer.style.maxHeight = 'none';
                answer.style.opacity = '1';
                answer.style.padding = '1rem';
            } else {
                answer.style.maxHeight = '0';
                answer.style.opacity = '0';
                answer.style.padding = '0 1rem';
            }
        });
    });

    // 其他页面初始化逻辑
    try {
        const defaultLang = getDefaultLanguage();
        changeLanguage(defaultLang);
        initLanguageSelector();
        initNavbarToggle();
        await initSwiper();

        let reviews = await fetchAppReviews();
        if (reviews.length === 0) {
            reviews = getFallbackReviews(defaultLang);
        }
        displayReviews(reviews);
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});
