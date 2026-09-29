/* =============================================
   SKYMOON STUDIOS — Interactions
   ============================================= */

(() => {
    "use strict";

    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* storage blocked */ } },
    };

    const currentLang = root.lang === "en" ? "en" : "tr";

    /* ━━━ Starfield ━━━ */
    const canvas = document.getElementById("starfield");
    const ctx = canvas ? canvas.getContext("2d") : null;
    let W = 0, H = 0, dpr = 1;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas) {
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + "px";
            canvas.style.height = H + "px";
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const STAR_COUNT = reduceMotion ? 80 : Math.min(200, Math.round((W * H) / 7000));
    const stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.3,
        a: Math.random() * 0.55 + 0.15,
        tw: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.008 + 0.003,
        dx: Math.random() * 0.06 - 0.03,
        dy: Math.random() * 0.03 + 0.008,
    }));
    const shooters = [];

    function spawnShooter() {
        shooters.push({
            x: Math.random() * W * 0.6,
            y: Math.random() * H * 0.35,
            len: Math.random() * 90 + 60,
            speed: Math.random() * 6 + 4,
            angle: Math.PI / 6 + Math.random() * (Math.PI / 8),
            life: 0,
            maxLife: Math.random() * 45 + 30,
        });
    }
    if (!reduceMotion) {
        setInterval(() => {
            if (!document.hidden && shooters.length < 2 && Math.random() > 0.45) spawnShooter();
        }, 2400);
    }

    function drawStars() {
        if (!ctx) return;
        if (document.hidden) { if (!reduceMotion) requestAnimationFrame(drawStars); return; }
        ctx.clearRect(0, 0, W, H);

        const light = root.getAttribute("data-theme") === "light";
        const [sr, sg, sb] = light ? [110, 75, 45] : [245, 237, 227];
        const [gr, gg, gb] = light ? [154, 106, 67] : [212, 165, 116];
        const k = light ? 0.55 : 1;

        for (const s of stars) {
            if (!reduceMotion) {
                s.tw += s.ts; s.x += s.dx; s.y += s.dy;
                if (s.x > W + 20) s.x = -20; else if (s.x < -20) s.x = W + 20;
                if (s.y > H + 20) s.y = -20;
            }
            const alpha = s.a * (0.5 + 0.5 * Math.sin(s.tw)) * k;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${sr},${sg},${sb},${alpha})`;
            ctx.fill();
            if (s.r > 1.1) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${gr},${gg},${gb},${alpha * 0.12})`;
                ctx.fill();
            }
        }

        for (let i = shooters.length - 1; i >= 0; i--) {
            const ss = shooters[i];
            ss.life++;
            const p = ss.life / ss.maxLife;
            const o = (p < 0.5 ? 1 : 1 - (p - 0.5) * 2) * k;
            const ex = ss.x + Math.cos(ss.angle) * ss.speed * ss.life;
            const ey = ss.y + Math.sin(ss.angle) * ss.speed * ss.life;
            const sx = ex - Math.cos(ss.angle) * ss.len;
            const sy = ey - Math.sin(ss.angle) * ss.len;
            const grad = ctx.createLinearGradient(sx, sy, ex, ey);
            grad.addColorStop(0, `rgba(${gr},${gg},${gb},0)`);
            grad.addColorStop(1, `rgba(${sr},${sg},${sb},${o * 0.85})`);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            if (ss.life >= ss.maxLife) shooters.splice(i, 1);
        }
        // With reduced motion the sky is static: draw once, redraw on resize/theme change
        if (!reduceMotion) requestAnimationFrame(drawStars);
    }
    if (ctx) requestAnimationFrame(drawStars);
    if (ctx && reduceMotion) {
        window.addEventListener("resize", () => requestAnimationFrame(drawStars), { passive: true });
        new MutationObserver(() => requestAnimationFrame(drawStars)).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    }

    /* ━━━ Smooth scroll (Lenis, optional) ━━━ */
    const lenis = (typeof Lenis !== "undefined" && !reduceMotion)
        ? new Lenis({ duration: .9, easing: t => 1 - Math.pow(1 - t, 4) })
        : null;
    if (lenis) {
        const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }

    /* ━━━ Preloader → hero entrance ━━━ */
    const preloader = document.querySelector(".preloader");
    function reveal() {
        root.classList.add("is-ready");
        if (lenis) lenis.start();
    }
    if (preloader && !root.classList.contains("intro-seen")) {
        if (lenis) lenis.stop();
        try { sessionStorage.setItem("skymoon-intro", "1"); } catch (_) { /* ignore */ }
        setTimeout(() => {
            preloader.classList.add("done");
            setTimeout(reveal, 150);
        }, reduceMotion ? 150 : 700);
    } else {
        requestAnimationFrame(() => requestAnimationFrame(reveal));
    }

    /* ━━━ Scroll reveals ━━━ */
    const revealEls = document.querySelectorAll(".rv");
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("in");
                io.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

        revealEls.forEach(el => {
            // Stagger siblings that share a parent (bento tiles, principles…)
            const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains("rv"));
            const idx = siblings.indexOf(el);
            if (idx > 0) el.style.setProperty("--rv-d", `${Math.min(idx, 4) * 0.08}s`);
            io.observe(el);
        });
    } else {
        revealEls.forEach(el => el.classList.add("in"));
    }

    /* ━━━ Nav: scrolled state + active section ━━━ */
    const nav = document.getElementById("nav");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const onScroll = () => { if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if ("IntersectionObserver" in window) {
        const sectionIO = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        document.querySelectorAll("main section[id]").forEach(s => sectionIO.observe(s));
    }

    /* ━━━ Mobile drawer ━━━ */
    const burger = document.getElementById("burger");
    const drawer = document.getElementById("drawer");
    function setDrawer(open) {
        if (!burger || !drawer) return;
        burger.classList.toggle("on", open);
        drawer.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", String(open));
        drawer.setAttribute("aria-hidden", String(!open));
        burger.setAttribute("aria-label", open
            ? (currentLang === "tr" ? "Menüyü kapat" : "Close menu")
            : (currentLang === "tr" ? "Menüyü aç" : "Open menu"));
        document.body.style.overflow = open ? "hidden" : "";
        if (lenis) open ? lenis.stop() : lenis.start();
    }
    if (burger) burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && drawer && drawer.classList.contains("open")) setDrawer(false);
    });

    /* ━━━ Anchor links ━━━ */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        a.addEventListener("click", e => {
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            if (drawer && drawer.classList.contains("open")) setDrawer(false);
            if (lenis) lenis.scrollTo(target, { offset: href === "#hero" ? 0 : -24 });
            else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
            if (href === "#main") target.focus({ preventScroll: true });
        });
    });

    /* ━━━ Cursor aura: trails the (still visible) system cursor ━━━ */
    const aura = document.querySelector(".cursor-aura");
    if (aura && finePointer && !reduceMotion) {
        root.classList.add("has-cursor");
        let mx = 0, my = 0, ax = 0, ay = 0, running = false;
        function loop() {
            ax += (mx - ax) * 0.2; ay += (my - ay) * 0.2;
            aura.style.transform = `translate(${ax}px, ${ay}px) translate(-50%, -50%)`;
            // Sleep once the aura has caught up; the next mousemove wakes it
            if (Math.abs(mx - ax) > 0.1 || Math.abs(my - ay) > 0.1) requestAnimationFrame(loop);
            else running = false;
        }
        window.addEventListener("mousemove", e => {
            if (!root.classList.contains("cursor-on")) { ax = e.clientX; ay = e.clientY; root.classList.add("cursor-on"); }
            mx = e.clientX; my = e.clientY;
            if (!running) { running = true; requestAnimationFrame(loop); }
        }, { passive: true });
        document.addEventListener("mouseover", e => {
            root.classList.toggle("cursor-hover", !!e.target.closest("a, button, .tile"));
        });
        document.documentElement.addEventListener("mouseleave", () => root.classList.remove("cursor-on"));
    }

    /* ━━━ Spotlight on service tiles ━━━ */
    if (finePointer) {
        document.querySelectorAll(".tile-core").forEach(core => {
            core.addEventListener("pointermove", e => {
                const r = core.getBoundingClientRect();
                core.style.setProperty("--mx", `${e.clientX - r.left}px`);
                core.style.setProperty("--my", `${e.clientY - r.top}px`);
            });
        });
    }

    /* ━━━ Phone turns toward the cursor, like a sunflower following the sun ━━━ */
    const phone = document.querySelector(".phone");
    if (phone && finePointer && !reduceMotion) {
        const MAX_Y = 22;   // left/right turn, degrees
        const MAX_X = 14;   // up/down tilt, degrees
        let px = null, py = null;          // pointer position; null = pointer off-page
        let tx = 0, ty = 0, cx = 0, cy = 0; // target / current angles
        let visible = false, running = false;

        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

        function frame() {
            if (px === null) {
                tx = 0; ty = 0;
            } else {
                const r = phone.getBoundingClientRect();
                // Normalised distance from the phone's centre to the pointer (-1…1)
                const dx = clamp((px - (r.left + r.width / 2)) / (W * 0.5), -1, 1);
                const dy = clamp((py - (r.top + r.height / 2)) / (H * 0.5), -1, 1);
                ty = dx * MAX_Y;
                tx = -dy * MAX_X;
            }
            cx += (tx - cx) * 0.08;
            cy += (ty - cy) * 0.08;
            phone.style.setProperty("--tilt-x", `${cx.toFixed(2)}deg`);
            phone.style.setProperty("--tilt-y", `${cy.toFixed(2)}deg`);
            phone.style.setProperty("--glare-x", `${50 + cy * 2}%`);
            phone.style.setProperty("--glare-y", `${50 - cx * 3}%`);
            phone.style.setProperty("--glare-o", px === null ? "0" : "1");

            const settled = Math.abs(tx - cx) < 0.02 && Math.abs(ty - cy) < 0.02;
            if (visible && !(px === null && settled)) requestAnimationFrame(frame);
            else running = false;
        }
        function wake() {
            if (visible && !running) { running = true; requestAnimationFrame(frame); }
        }

        window.addEventListener("pointermove", e => {
            if (e.pointerType !== "mouse") return;
            px = e.clientX; py = e.clientY; wake();
        }, { passive: true });
        document.documentElement.addEventListener("mouseleave", () => { px = py = null; wake(); });
        window.addEventListener("blur", () => { px = py = null; wake(); });

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }).observe(phone);
        } else {
            visible = true;
        }
    }

    /* ━━━ Hero parallax on the moon ━━━ */
    const heroVisual = document.querySelector(".hero-visual");
    if (heroVisual && finePointer && !reduceMotion) {
        const moon = heroVisual.querySelector(".moon");
        const orbits = heroVisual.querySelectorAll(".orbit");
        window.addEventListener("mousemove", e => {
            const x = (e.clientX / W - 0.5) * 2;
            const y = (e.clientY / H - 0.5) * 2;
            if (moon) moon.style.translate = `${x * 10}px ${y * 10}px`;
            orbits.forEach((o, i) => { o.style.translate = `${x * (i + 1) * -5}px ${y * (i + 1) * -5}px`; });
        }, { passive: true });
    }

    /* ━━━ Video autoplay (iOS-safe) ━━━ */
    document.querySelectorAll(".p-video").forEach(video => {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("muted", "");
        let inView = !("IntersectionObserver" in window);
        const tryPlay = () => {
            if (!inView || !video.paused) return;
            const p = video.play();
            if (p) p.catch(() => {});
        };
        // Safari (e.g. Low Power Mode) may refuse autoplay: retry once data is
        // ready, and on the visitor's first touch or click anywhere on the page.
        video.addEventListener("canplay", tryPlay);
        const onGesture = () => {
            tryPlay();
            if (!video.paused) ["touchend", "click", "keydown"].forEach(t => document.removeEventListener(t, onGesture));
        };
        ["touchend", "click", "keydown"].forEach(t => document.addEventListener(t, onGesture, { passive: true }));
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(([entry]) => {
                inView = entry.isIntersecting;
                if (inView) tryPlay(); else video.pause();
            }, { threshold: 0.2 }).observe(video);
        } else {
            tryPlay();
        }
    });

    /* ━━━ Contact form → prefilled email ━━━ */
    const form = document.getElementById("contactForm");
    if (form) {
        const note = form.querySelector(".form-note");
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        const validate = field => {
            const input = field.querySelector("input, textarea");
            const value = input.value.trim();
            const ok = input.type === "email" ? emailRe.test(value) : value.length > 0;
            field.classList.toggle("invalid", !ok);
            input.setAttribute("aria-invalid", String(!ok));
            return ok;
        };

        form.querySelectorAll(".field").forEach(field => {
            const input = field.querySelector("input, textarea");
            input.addEventListener("blur", () => { if (input.value) validate(field); });
            input.addEventListener("input", () => { if (field.classList.contains("invalid")) validate(field); });
        });

        form.addEventListener("submit", e => {
            e.preventDefault();
            const fields = Array.from(form.querySelectorAll(".field"));
            const results = fields.map(validate);
            if (results.includes(false)) {
                fields[results.indexOf(false)].querySelector("input, textarea").focus();
                return;
            }
            const data = new FormData(form);
            const subject = `[Skymoon Studios] ${data.get("subject").trim()}`;
            const body = `${data.get("message").trim()}\n\n— ${data.get("name").trim()}\n${data.get("email").trim()}`;
            window.location.href = `mailto:contact.skymoonstudios@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            if (note) {
                note.classList.add("ok");
                note.textContent = currentLang === "tr"
                    ? "E-posta uygulamanız açılıyor. Açılmazsa bize doğrudan contact.skymoonstudios@gmail.com adresinden yazabilirsiniz."
                    : "Opening your email app. If nothing happens, write to us directly at contact.skymoonstudios@gmail.com.";
            }
        });
    }

    /* ━━━ Theme toggle ━━━ */
    const themeToggle = document.getElementById("themeToggle");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const syncThemeMeta = () => {
        if (themeMeta) themeMeta.content = root.getAttribute("data-theme") === "light" ? "#f4efe8" : "#0d0b09";
    };
    syncThemeMeta();
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const toLight = root.getAttribute("data-theme") !== "light";
            if (toLight) root.setAttribute("data-theme", "light");
            else root.removeAttribute("data-theme");
            store.set("skymoon-theme", toLight ? "light" : "dark");
            syncThemeMeta();
        });
    }

    /* ━━━ Language switch ━━━
       Each language is its own page (/ and /en/, en/ is built by build-en.mjs).
       The switch is a plain link; we only remember the choice so boot.js can
       send a returning visitor straight to their language. */
    const langToggle = document.getElementById("langToggle");
    if (langToggle) {
        langToggle.addEventListener("click", () => store.set("skymoon-lang", currentLang === "tr" ? "en" : "tr"));
    }
})();
