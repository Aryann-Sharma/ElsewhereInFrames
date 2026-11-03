const gallery = document.querySelector('.photo-grid, .featured-frame');
const viewer = document.querySelector('.photo-viewer');

if (gallery && viewer) {
    const frames = [...gallery.querySelectorAll('.photo-item a, .featured-frame-link')];
    const image = viewer.querySelector('.viewer-image');
    const previous = viewer.querySelector('.viewer-previous');
    const next = viewer.querySelector('.viewer-next');
    const close = viewer.querySelector('.viewer-close');
    const count = viewer.querySelector('.viewer-count');
    let current = 0;
    let openedFrom;
    let idleTimer;
    let touchStart;

    function showControls() {
        viewer.classList.remove('is-idle');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (!viewer.querySelector(':focus-visible')) viewer.classList.add('is-idle');
        }, 1400);
    }

    function showFrame(index) {
        if (index < 0 || index >= frames.length) return;

        current = index;
        const frame = frames[current];
        image.src = frame.href;
        image.alt = frame.querySelector('img').alt;
        if (count) count.textContent = `Frame ${String(current + 1).padStart(3, '0')} / ${String(frames.length).padStart(3, '0')}`;
        if (previous) previous.disabled = current === 0;
        if (next) next.disabled = current === frames.length - 1;
    }

    gallery.addEventListener('click', (event) => {
        const frame = event.target.closest('.photo-item a, .featured-frame-link');
        if (!frame) return;

        event.preventDefault();
        openedFrom = frame;
        showFrame(frames.indexOf(frame));
        viewer.showModal();
        viewer.focus();
        document.body.classList.add('viewer-open');
        showControls();
    });

    previous?.addEventListener('click', () => {
        showFrame(current - 1);
        previous.blur();
        showControls();
    });

    next?.addEventListener('click', () => {
        showFrame(current + 1);
        next.blur();
        showControls();
    });

    close.addEventListener('click', () => viewer.close());

    viewer.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            showFrame(current + (event.key === 'ArrowLeft' ? -1 : 1));
            showControls();
        }
    });

    viewer.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'touch') showControls();
    });
    viewer.addEventListener('pointerdown', showControls);
    viewer.addEventListener('touchstart', (event) => {
        if (event.touches.length !== 1) {
            touchStart = undefined;
            return;
        }
        touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    viewer.addEventListener('touchend', (event) => {
        if (!touchStart) return;
        if (event.changedTouches.length !== 1) {
            touchStart = undefined;
            return;
        }
        const distanceX = event.changedTouches[0].clientX - touchStart.x;
        const distanceY = event.changedTouches[0].clientY - touchStart.y;
        touchStart = undefined;
        if (Math.abs(distanceX) < 55 || Math.abs(distanceX) < Math.abs(distanceY) * 1.3) return;
        showFrame(current + (distanceX < 0 ? 1 : -1));
        showControls();
    }, { passive: true });
    viewer.addEventListener('touchcancel', () => { touchStart = undefined; });

    viewer.addEventListener('close', () => {
        clearTimeout(idleTimer);
        touchStart = undefined;
        viewer.classList.remove('is-idle');
        image.removeAttribute('src');
        document.body.classList.remove('viewer-open');
        openedFrom?.focus();
    });
}
