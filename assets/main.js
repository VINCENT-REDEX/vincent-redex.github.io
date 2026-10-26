/* vincent-redex.github.io — progressive enhancement only.
   Everything on the page works without this file. */
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- current year ---------- */
    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = String(new Date().getFullYear());
    });

    /* ---------- reveal on scroll ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach((el) => el.classList.add('is-in'));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealObserver.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        reveals.forEach((el) => revealObserver.observe(el));
    }

    /* ---------- highlight the section you're reading ---------- */
    const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    const active = link.getAttribute('href') === `#${entry.target.id}`;
                    if (active) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach((section) => navObserver.observe(section));
    }

    /* ---------- live repository metadata ----------
       Static values in the markup are the fallback; if the API is
       unreachable or rate-limited the page simply keeps them. */
    const CACHE_KEY = 'vx-repo-cache-v1';
    const CACHE_TTL = 60 * 60 * 1000; // 1 hour

    const readCache = () => {
        try {
            return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
        } catch {
            return {};
        }
    };

    const cache = readCache();

    const relative = (iso) => {
        const then = new Date(iso).getTime();
        if (Number.isNaN(then)) return '';
        const diff = then - Date.now();
        const units = [
            ['year', 31536000000],
            ['month', 2592000000],
            ['week', 604800000],
            ['day', 86400000],
        ];
        const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        for (const [unit, ms] of units) {
            if (Math.abs(diff) >= ms) return fmt.format(Math.round(diff / ms), unit);
        }
        return 'today';
    };

    const paint = (repo, data) => {
        const card = repo.closest('.work-card');
        if (!card) return;

        const stars = card.querySelector('[data-stars]');
        if (stars) {
            const count = data.stargazers_count || 0;
            if (count > 0) {
                stars.textContent = `${count} ${count === 1 ? 'star' : 'stars'}`;
                stars.hidden = false;
            } else {
                stars.hidden = true;
            }
        }

        const pushed = card.querySelector('[data-pushed]');
        if (pushed && data.pushed_at) {
            const when = relative(data.pushed_at);
            if (when) {
                pushed.textContent = `Pushed ${when}`;
                pushed.title = new Date(data.pushed_at).toLocaleDateString('en', {
                    year: 'numeric', month: 'short', day: 'numeric',
                });
            }
        }
    };

    const loadRepo = async (repo) => {
        const name = repo.dataset.repo;
        if (!name) return;

        const cached = cache[name];
        if (cached && Date.now() - cached.at < CACHE_TTL) {
            paint(repo, cached.data);
            return;
        }

        try {
            const res = await fetch(`https://api.github.com/repos/VINCENT-REDEX/${name}`, {
                headers: { Accept: 'application/vnd.github+json' },
            });
            if (!res.ok) return;
            const data = await res.json();
            paint(repo, data);
            cache[name] = { at: Date.now(), data };
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            } catch {
                /* storage full or disabled — not important */
            }
        } catch {
            /* offline: keep the static fallback */
        }
    };

    document.querySelectorAll('[data-repo]').forEach(loadRepo);
})();
