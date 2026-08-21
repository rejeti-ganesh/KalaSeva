// ========================================
// Kala Seva Sangeetha Sikshana - Scripts
// ========================================

// PASSWORD HASH (SHA-256) - Change this to set your password
// Current: Empty password (no security - FOR TESTING ONLY)
// To generate hash for new password: run in browser console:
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password')).then(hash =>
//   Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))
//   .then(hashHex => console.log('Password hash:', hashHex))
// SHA-256 of empty string (allows login without password for testing):
const PASSWORD_HASH = "6044af0f972a8f9908b97dc195456712b2a528f75eb8cc9f397687cc70c82d3a";

// Gallery Images - Add your images to assets/gallery/ folder
const GALLERY_IMAGES = [
    { src: "image1.jpg", alt: "Music class session" },
    { src: "image2.jpg", alt: "Student performance" },
    { src: "image3.jpg", alt: "Guru teaching" },
    { src: "image4.jpg", alt: "Carnatic music concert" },
    { src: "image5.jpg", alt: "Academy vestibule" },
    { src: "image6.jpg", alt: "Traditional instruments" }
];

// Notes Data - Add PDFs to notes/ folder
const NOTES_DATA = [
    {
        filename: "Sarali Swaramulu.pdf",
        title: "Sarali Swaras",
        description: "Basic practice exercises for Carnatic music beginners"
    },
    {
        filename: "Paluke Bangaramayena.pdf",
        title: "Paluke Bangaramayena",
        description: "Paluke Bangaramayena one of the famous Telugu compositions by the 17th century composer and devotee of Lord Sri Rama, Bhadrachala Ramadasu"
    },
    {
        filename: "Saranu Siddi Vinayaka.pdf",
        title: "Saranu Siddi Vinayaka",
        description: "Saranu Siddi Vinayaka is one of the famous Ganesha songs by Shri Purandara Dasaru"
    }
];

// ========================================
// Loading Screen
// ========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 2000);
});

// ========================================
// Mobile Navigation
// ========================================
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
const animatedElements = document.querySelectorAll(
    '.fade-up, .fade-down, .fade-left, .fade-right, .slide-left, .slide-right, .zoom-in'
);

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            scrollObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

animatedElements.forEach(el => scrollObserver.observe(el));

// ========================================
// Gallery
// ========================================
function loadGallery() {
    const galleryMasonry = document.getElementById('gallery-masonry');
    if (!galleryMasonry) return;

    GALLERY_IMAGES.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item fade-up';
        galleryItem.style.animationDelay = `${index * 0.1}s`;

        galleryItem.innerHTML = `
            <img
                src="assets/gallery/${image.src}"
                alt="${image.alt}"
                loading="lazy"
                onerror="this.style.display='none';this.parentElement.style.display='none';"
            >
            <div class="gallery-overlay">
                <p style="color: white; font-size: 14px;">${image.alt}</p>
            </div>
        `;

        galleryItem.addEventListener('click', () => openLightbox(image.src));
        galleryMasonry.appendChild(galleryItem);
    });
}

loadGallery();

// ========================================
// Lightbox
// ========================================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(src) {
    if (!lightbox || !lightboxImage) return;

    lightboxImage.src = `assets/gallery/${src}`;
    lightbox.classList.add('active');
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightboxImage.src = '';
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

// Close on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

// ========================================
// Notes Portal - Password Verification
// (query DOM elements at time of use to avoid nulls if script is loaded
// before the DOM or the page structure changes)
// ========================================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadNotes() {
    const notesGrid = document.getElementById('notes-grid');
    if (!notesGrid) {
        console.error('❌ notes-grid element not found in DOM');
        console.log('Available elements:', document.querySelectorAll('[id*="notes"]'));
        return;
    }

    console.log('📚 Starting to load notes...');
    console.log('Notes Grid Element:', notesGrid);
    console.log('Notes Grid Parent:', notesGrid.parentElement);

    notesGrid.innerHTML = '';

    if (!NOTES_DATA || NOTES_DATA.length === 0) {
        console.error('❌ NOTES_DATA is empty or undefined');
        return;
    }

    let successCount = 0;
    NOTES_DATA.forEach((note, index) => {
        try {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.style.animationDelay = `${index * 0.1}s`;

            // Sanitize/escape title and description lightly by using textContent on created nodes
            const icon = document.createElement('div');
            icon.className = 'note-icon';
            icon.textContent = '📄';

            const title = document.createElement('h3');
            title.className = 'note-title';
            title.textContent = note.title;

            const desc = document.createElement('p');
            desc.className = 'note-description';
            desc.textContent = note.description;

            const link = document.createElement('a');
            link.className = 'btn btn-primary';
            link.setAttribute('download', '');
            // Use encodeURI to handle spaces and special chars in filenames
            link.href = `./notes/${encodeURI(note.filename)}`;
            link.textContent = 'Download PDF';

            noteCard.appendChild(icon);
            noteCard.appendChild(title);
            noteCard.appendChild(desc);
            noteCard.appendChild(link);

            notesGrid.appendChild(noteCard);
            console.log(`✅ Added note card ${index + 1}: ${note.title}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error adding note ${index + 1}:`, error);
        }
    });

    console.log(`📚 Finished loading. Total notes added: ${successCount}/${NOTES_DATA.length}`);
    console.log('Grid now contains:', notesGrid.children.length, 'elements');
    console.log('Grid HTML content length:', notesGrid.innerHTML.length);
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========================================
// Navbar Background on Scroll
// ========================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'var(--white)';
        navbar.style.boxShadow = '0 2px 20px var(--shadow)';
    } else {
        navbar.style.boxShadow = '0 2px 20px var(--shadow)';
    }
});

// ========================================
// Performance: Lazy Load Images
// ========================================
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// Accessibility: Keyboard Navigation
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// ========================================
// Initialize Everything
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();

    // Add keyboard navigation class
    document.body.classList.add('js-enabled');

    // ---------------------------------
    // Notes portal: wire up login form
    // ---------------------------------
    const loginSection = document.getElementById('login-section');
    const notesSection = document.getElementById('notes-section');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const enteredPassword = passwordInput ? passwordInput.value : '';
            if (!enteredPassword) {
                if (loginError) loginError.textContent = 'Please enter a password';
                return;
            }

            try {
                const enteredHash = await hashPassword(enteredPassword);
                console.log('🔐 Password verification attempt');
                console.log('Entered hash:', enteredHash);
                console.log('Expected hash:', PASSWORD_HASH);

                if (enteredHash === PASSWORD_HASH) {
                    // Success
                    console.log('✅ Password verified successfully!');

                    // Log visibility toggle
                    if (loginSection) {
                        console.log('📵 Hiding login section...');
                        const hadHidden = loginSection.classList.contains('hidden');
                        loginSection.classList.add('hidden');
                        console.log('   Login section hidden class added. Was already hidden:', hadHidden);
                        console.log('   Login section display:', window.getComputedStyle(loginSection).display);
                    }

                    if (notesSection) {
                        console.log('📺 Showing notes section...');
                        const hadHidden = notesSection.classList.contains('hidden');
                        notesSection.classList.remove('hidden');
                        console.log('   Notes section hidden class removed. Was hidden:', hadHidden);
                        console.log('   Notes section display:', window.getComputedStyle(notesSection).display);
                    }

                    if (loginError) loginError.textContent = '';

                    console.log('📚 About to call loadNotes()...');
                    loadNotes();
                    console.log('✅ Notes loaded and section displayed');
                } else {
                    // Failure
                    console.log('❌ Password mismatch');
                    if (loginError) loginError.textContent = 'Incorrect password. Please try again.';
                    if (passwordInput) passwordInput.value = '';
                }
            } catch (error) {
                console.error('❌ Error during password verification:', error);
                if (loginError) loginError.textContent = 'Error verifying password. Please try again.';
            }
        });
    }
});

console.log('🎼 Kala Seva Sangeetha Sikshana - Website Loaded');