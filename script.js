/* ═════════════════════════════════════════════════════════
   Video Background — load & fallback handling
   ═════════════════════════════════════════════════════════ */
(function initVideo() {
  var video = document.getElementById('bgVideo');
  var fallback = document.getElementById('bgFallback');

  // When video has enough data to play, fade it in and hide fallback
  video.addEventListener('canplaythrough', function() {
    video.classList.add('loaded');
    if (fallback) fallback.classList.add('hidden');
  }, { once: true });

  // If video encounters an error, hide it entirely
  video.addEventListener('error', function() {
    video.style.display = 'none';
  });

  // Safety net: if video hasn't loaded after 6 seconds, hide it
  // The gradient fallback remains visible underneath
  setTimeout(function() {
    if (!video.classList.contains('loaded')) {
      video.style.display = 'none';
    }
  }, 6000);
})();


/* ═════════════════════════════════════════════════════════
   Slide Navigation System
   ═════════════════════════════════════════════════════════ */
var slides = document.querySelectorAll('.slide');
var totalSlides = slides.length;
var currentSlide = 0;
var isTransitioning = false;

// DOM references for navigation UI
var navDotsContainer = document.getElementById('navDots');
var currentNumEl = document.getElementById('currentNum');
var totalNumEl = document.getElementById('totalNum');
var progressLine = document.getElementById('progressLine');
var toastEl = document.getElementById('toast');

// Set total slide count
totalNumEl.textContent = String(totalSlides).padStart(2, '0');

// Build dot navigation
for (var i = 0; i < totalSlides; i++) {
  var dot = document.createElement('button');
  dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
  dot.dataset.index = i;
  dot.addEventListener('click', function() {
    goToSlide(parseInt(this.dataset.index));
  });
  navDotsContainer.appendChild(dot);
}

// Update all navigation indicators to match current slide
function updateUI() {
  currentNumEl.textContent = String(currentSlide + 1).padStart(2, '0');
  progressLine.style.width = ((currentSlide + 1) / totalSlides * 100) + '%';

  var dots = document.querySelectorAll('.nav-dot');
  for (var i = 0; i < dots.length; i++) {
    if (i === currentSlide) {
      dots[i].classList.add('active');
    } else {
      dots[i].classList.remove('active');
    }
  }
}

// Navigate to a specific slide index
function goToSlide(index) {
  if (index === currentSlide || isTransitioning || index < 0 || index >= totalSlides) return;
  isTransitioning = true;

  var direction = index > currentSlide ? 'up' : 'down';
  var oldSlide = slides[currentSlide];
  var newSlide = slides[index];

  // Exit current slide
  oldSlide.classList.remove('active');
  if (direction === 'up') oldSlide.classList.add('exit-up');

  // After a short delay, enter new slide
  setTimeout(function() {
    oldSlide.classList.remove('exit-up');
    newSlide.classList.add('active');
    currentSlide = index;
    updateUI();

    // Lock transitions for the animation duration
    setTimeout(function() {
      isTransitioning = false;
    }, 800);
  }, 150);
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
}

function prevSlide() {
  if (currentSlide > 0) goToSlide(currentSlide - 1);
}


/* ═════════════════════════════════════════════════════════
   Input: Keyboard
   ═════════════════════════════════════════════════════════ */
document.addEventListener('keydown', function(e) {
  // Don't hijack keys when user is typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  }
});


/* ═════════════════════════════════════════════════════════
   Input: Mouse Wheel
   ═════════════════════════════════════════════════════════ */
var wheelTimeout = null;

document.addEventListener('wheel', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  e.preventDefault();

  // Throttle to prevent rapid-fire slides
  if (wheelTimeout) return;
  wheelTimeout = setTimeout(function() { wheelTimeout = null; }, 1000);

  if (e.deltaY > 30) nextSlide();
  else if (e.deltaY < -30) prevSlide();
}, { passive: false });


/* ═════════════════════════════════════════════════════════
   Input: Touch Swipe
   ═════════════════════════════════════════════════════════ */
var touchStartY = 0;

document.addEventListener('touchstart', function(e) {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
  var diff = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diff) > 60) {
    if (diff > 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });


/* ═════════════════════════════════════════════════════════
   Fullscreen Toggle
   ═════════════════════════════════════════════════════════ */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function() {});
    showToast('Entered fullscreen');
  } else {
    document.exitFullscreen();
    showToast('Exited fullscreen');
  }
}


/* ═════════════════════════════════════════════════════════
   Toast Notification
   ═════════════════════════════════════════════════════════ */
var toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toastEl.classList.remove('show');
  }, 2500);
}


/* ═════════════════════════════════════════════════════════
   Contact Form Handler
   ═════════════════════════════════════════════════════════ */
function handleSendMessage() {
  var inputs = document.querySelectorAll('.contact-input');
  var filled = true;

  inputs.forEach(function(input) {
    if (!input.value.trim()) filled = false;
  });

  if (!filled) {
    showToast('Please fill in all fields');
    return;
  }

  showToast('Message sent');
  inputs.forEach(function(input) { input.value = ''; });
}


/* ═════════════════════════════════════════════════════════
   Parallax: Orbs follow mouse
   ═════════════════════════════════════════════════════════ */
document.addEventListener('mousemove', function(e) {
  var x = (e.clientX / window.innerWidth - 0.5) * 2;
  var y = (e.clientY / window.innerHeight - 0.5) * 2;
  var orbs = document.querySelectorAll('.bg-orb');

  for (var i = 0; i < orbs.length; i++) {
    var factor = (i + 1) * 8;
    orbs[i].style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
  }
});


/* ═════════════════════════════════════════════════════════
   Initialize
   ═════════════════════════════════════════════════════════ */
updateUI();