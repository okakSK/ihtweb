import PhotoSwipeLightbox from 'https://unpkg.com/photoswipe@5.4.3/dist/photoswipe-lightbox.esm.js';
import PhotoSwipe from 'https://unpkg.com/photoswipe@5.4.3/dist/photoswipe.esm.js';


/* ================= TELEGRAM ================= */

const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();


/* ================= DATA ================= */

const content = document.getElementById('content');

let galleryData = [];
let booksData = [];

let lightbox = null;


/* ================= THEME ================= */

function initTheme() {
    const saved = localStorage.getItem('theme');
    const system = tg.colorScheme || 'dark';
    applyTheme(saved || system);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.querySelector('.theme-toggle').innerHTML = '🌙';
    } else {
        document.body.classList.remove('light-mode');
        document.querySelector('.theme-toggle').innerHTML = '☀️';
    }
}

window.toggleTheme = () => {
    const isLight = document.body.classList.toggle('light-mode');
    const newTheme = isLight ? 'light' : 'dark';

    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
};


/* ================= NAVIGATION ================= */

window.loadTab = async (tab) => {

    document.querySelectorAll('.nav-item')
        .forEach(b => b.classList.remove('active'));

    const btn =
        event?.currentTarget ||
        document.querySelector(`.nav-item[onclick*="${tab}"]`);

    if (btn) btn.classList.add('active');


    content.innerHTML = '';
    window.scrollTo(0, 0);


    if (tab === 'gallery') await renderGallery();
    else if (tab === 'books') await renderBooks();
    else renderExtra();
};



/* ================= GALLERY ================= */

async function renderGallery() {

    const cols = localStorage.getItem('gallery_cols') || 3;


    content.innerHTML = `

        <div class="glass-toolbar fade-in">

            <button onclick="changeGrid(3)"
                class="view-btn ${cols == 3 ? 'active' : ''}">3</button>

            <button onclick="changeGrid(5)"
                class="view-btn ${cols == 5 ? 'active' : ''}">5</button>

            <button onclick="changeGrid(7)"
                class="view-btn ${cols == 7 ? 'active' : ''}">7</button>

        </div>

        <div class="gallery-grid cols-${cols} fade-in"
             id="grid"></div>

    `;


    const grid = document.getElementById('grid');


    if (galleryData.length === 0) {

        try {

            const res = await fetch('data/gallery.json');
            galleryData = await res.json();

        } catch {

            grid.innerHTML =
                '<p style="text-align:center;color:gray">Ошибка загрузки</p>';

            return;
        }
    }


    renderGalleryItems();
}



/* ================= RENDER GRID ================= */

function renderGalleryItems() {

    const grid = document.getElementById('grid');

    if (!grid) return;


    grid.innerHTML = galleryData.map((img, i) => {

        return `

        <div class="gallery-item">

            <img src="assets/gallery/${img.src}"
                 loading="lazy"
                 onclick="openPhotoSwipe(${i})"
                 onload="this.classList.add('loaded')">

        </div>

        `;

    }).join('');
}



/* ================= GRID ================= */

window.changeGrid = (n) => {

    const grid = document.getElementById('grid');
    if (!grid) return;


    grid.className = `gallery-grid cols-${n}`;


    document.querySelectorAll('.view-btn')
        .forEach(b => {

            b.classList.remove('active');

            if (b.innerText == n)
                b.classList.add('active');
        });


    localStorage.setItem('gallery_cols', n);
};



/* ================= PHOTOSWIPE ================= */

function initPhotoSwipe() {

    if (lightbox) return;


    const items = galleryData.map(img => ({

        src: `assets/gallery/${img.src}`,

        width: img.w || 1200,
        height: img.h || 1200

    }));


    lightbox = new PhotoSwipeLightbox({

        dataSource: items,

        pswpModule: PhotoSwipe,

        bgOpacity: 0.9,

        wheelToZoom: true,

        pinchToClose: true

    });


    lightbox.init();
}



window.openPhotoSwipe = (i) => {

    initPhotoSwipe();

    lightbox.loadAndOpen(i);
};



/* ================= BOOKS ================= */

async function renderBooks() {

    content.innerHTML = `

        <div id="book-filters"
             class="glass-toolbar fade-in">

            <button onclick="filterBooks('all')"
                class="view-btn active">Все</button>

            <button onclick="filterBooks('1_course')"
                class="view-btn">1 Курс</button>

            <button onclick="filterBooks('2_course')"
                class="view-btn">2 Курс</button>

        </div>

        <div id="books-list"
             class="fade-in"></div>

    `;


    if (booksData.length === 0) {

        try {

            const res = await fetch('data/books.json');
            booksData = await res.json();

        } catch { return; }
    }


    filterBooks('all');
}



window.filterBooks = (tag) => {

    const list = document.getElementById('books-list');

    if (!list) return;


    document.querySelectorAll('#book-filters .view-btn')
        .forEach(b => b.classList.remove('active'));


    const btn =
        document.querySelector(
            `#book-filters button[onclick*="${tag}"]`
        );

    if (btn) btn.classList.add('active');


    const filtered =
        tag === 'all'
            ? booksData
            : booksData.filter(b =>
                b.courses?.includes(tag)
            );


    list.innerHTML = filtered.map(b => `

        <a href="${b.url}"
           class="book-card"
           target="_blank">

           ${b.title}

        </a>

    `).join('');
};



/* ================= EXTRA ================= */

function renderExtra() {

    content.innerHTML = `

        <div class="fade-in" style="padding:20px;">

            <h2>Настройки</h2>

            <div class="book-card"
                 onclick="toggleTheme()"
                 style="display:flex;justify-content:space-between">

                <span>Сменить тему</span>
                <span>🌓</span>

            </div>


            <div style="margin-top:40px;
                        text-align:center;
                        opacity:0.5;
                        font-size:12px;">

                Версия App: 2.3

            </div>

        </div>

    `;
}



/* ================= START ================= */

document.addEventListener('DOMContentLoaded', () => {

    initTheme();

    loadTab('gallery');

});
