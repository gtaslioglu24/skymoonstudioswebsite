/* =============================================
   SKYMOON STUDIOS — Starfield + GSAP Engine
   ============================================= */

(() => {
    "use strict";

    /* ━━━ Canvas Starfield & Shooting Stars ━━━ */
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const STAR_COUNT = 220;
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * 2000 - 500,
            y: Math.random() * 2000 - 500,
            r: Math.random() * 1.4 + 0.3,
            a: Math.random() * 0.6 + 0.15,
            tw: Math.random() * Math.PI * 2, // twinkle phase
            ts: Math.random() * 0.008 + 0.003, // twinkle speed
            dx: Math.random() * 0.08 - 0.04,
            dy: Math.random() * 0.04 + 0.01,
        });
    }

    // Shooting stars
    const shootingStars = [];
    function spawnShooter() {
        shootingStars.push({
            x: Math.random() * W * 0.6,
            y: Math.random() * H * 0.4,
            len: Math.random() * 100 + 60,
            speed: Math.random() * 6 + 4,
            angle: (Math.PI / 6) + Math.random() * (Math.PI / 8),
            opacity: 1,
            life: 0,
            maxLife: Math.random() * 50 + 30,
        });
    }
    // occasional shooters
    setInterval(() => {
        if (shootingStars.length < 3 && Math.random() > 0.3) spawnShooter();
    }, 1800);

    // Nebula / soft glow spots
    const nebulae = [
        { x: 0.2, y: 0.3, r: 300, color: "rgba(212,165,116,0.012)" },
        { x: 0.7, y: 0.15, r: 250, color: "rgba(200,149,108,0.008)" },
        { x: 0.5, y: 0.75, r: 350, color: "rgba(166,123,91,0.01)" },
    ];

    function drawStars(time) {
        ctx.clearRect(0, 0, W, H);

        // draw nebulae
        nebulae.forEach(n => {
            const grd = ctx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, n.r);
            grd.addColorStop(0, n.color);
            grd.addColorStop(1, "transparent");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W, H);
        });

        // draw stars
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const starR = isLight ? 70 : 245;
        const starG = isLight ? 45 : 237;
        const starB = isLight ? 20 : 227;
        const glowR = isLight ? 100 : 212;
        const glowG = isLight ? 60 : 165;
        const glowB = isLight ? 25 : 116;

        stars.forEach(s => {
            s.tw += s.ts;
            s.x += s.dx;
            s.y += s.dy;
            if (s.x > W + 50) s.x = -50;
            if (s.y > H + 50) s.y = -50;

            const twinkle = 0.5 + 0.5 * Math.sin(s.tw);
            const alpha = s.a * twinkle * (isLight ? 0.85 : 1);

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * (isLight ? 1.2 : 1), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${starR}, ${starG}, ${starB}, ${alpha})`;
            ctx.fill();

            // subtle glow for brighter stars
            if (s.r > 1) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * (isLight ? 4 : 3), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${alpha * (isLight ? 0.18 : 0.12)})`;
                ctx.fill();
            }
        });

        // draw shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            ss.life++;
            const progress = ss.life / ss.maxLife;
            ss.opacity = progress < 0.5 ? 1 : 1 - (progress - 0.5) * 2;

            const ex = ss.x + Math.cos(ss.angle) * ss.speed * ss.life;
            const ey = ss.y + Math.sin(ss.angle) * ss.speed * ss.life;
            const sx = ex - Math.cos(ss.angle) * ss.len;
            const sy = ey - Math.sin(ss.angle) * ss.len;

            const grad = ctx.createLinearGradient(sx, sy, ex, ey);
            grad.addColorStop(0, `rgba(${glowR}, ${glowG}, ${glowB}, 0)`);
            grad.addColorStop(0.4, `rgba(${starR}, ${starG}, ${starB}, ${ss.opacity * (isLight ? 0.35 : 0.3)})`);
            grad.addColorStop(1, `rgba(${starR}, ${starG}, ${starB}, ${ss.opacity * (isLight ? 0.8 : 0.9)})`);

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = grad;
            ctx.lineWidth = isLight ? 2 : 1.5;
            ctx.stroke();

            // bright head
            ctx.beginPath();
            ctx.arc(ex, ey, isLight ? 2.5 : 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${starR}, ${starG}, ${starB}, ${ss.opacity * (isLight ? 0.85 : 1)})`;
            ctx.fill();

            if (ss.life >= ss.maxLife) shootingStars.splice(i, 1);
        }

        requestAnimationFrame(drawStars);
    }
    requestAnimationFrame(drawStars);

    /* ━━━ Custom Cursor ━━━ */
    let currentLang = localStorage.getItem("skymoon-lang") || "tr";

    const cursor = document.querySelector(".cursor");
    const aura = document.querySelector(".cursor-aura");
    let mx = -100, my = -100, cx = -100, cy = -100, ax = -100, ay = -100;

    if (cursor && aura) {
        window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
        (function moveCursor() {
            cx += (mx - cx) * 0.2;
            cy += (my - cy) * 0.2;
            ax += (mx - ax) * 0.08;
            ay += (my - ay) * 0.08;
            cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
            aura.style.transform = `translate(${ax}px, ${ay}px) translate(-50%, -50%)`;
            requestAnimationFrame(moveCursor);
        })();
    }

    /* ━━━ Lenis ━━━ */
    const lenis = new Lenis({ duration: 1.3, easing: t => 1 - Math.pow(1 - t, 4), smooth: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    /* ━━━ GSAP Setup ━━━ */
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    /* ━━━ Preloader ━━━ */
    const preloader = document.querySelector(".preloader");
    const preTL = gsap.timeline({
        onComplete() {
            preloader.style.pointerEvents = "none";
            lenis.start();
            animateHero();
        }
    });

    lenis.stop();

    preTL
        .to(".pre-ring circle", { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
        .to(".pre-l", { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: "back.out(2)" }, "-=0.6")
        .to(".pre-sub", { opacity: 1, duration: 0.4 }, "-=0.2")
        .to(".pre-fill", { width: "100%", duration: 0.8, ease: "power2.inOut" }, "-=0.3")
        .to(preloader, { opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.2");

    /* ━━━ Hero Animation ━━━ */
    function animateHero() {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(".word", { y: 0, stagger: 0.07, duration: 1.2 }, 0)
          .to(".hero-p", { opacity: 1, y: 0, duration: 0.8 }, 0.4)
          .to(".hero-btns", { opacity: 1, y: 0, duration: 0.8 }, 0.5)
          .fromTo(".orbit-ring", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, stagger: 0.15, duration: 1.2, ease: "expo.out" }, 0.3);
    }

    /* ━━━ Scroll Reveals ━━━ */
    document.querySelectorAll(".rv").forEach((el, i) => {
        ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter() {
                gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay: (i % 4) * 0.08, ease: "power3.out" });
            }
        });
    });

    /* ━━━ Counter Animation ━━━ */
    document.querySelectorAll(".counter").forEach(span => {
        const target = parseInt(span.dataset.to) || 0;
        const parent = span.parentElement;

        ScrollTrigger.create({
            trigger: parent,
            start: "top 92%",
            once: true,
            onEnter() {
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2.2,
                    ease: "power2.out",
                    onUpdate() { span.textContent = Math.round(obj.val); }
                });
            }
        });
    });

    /* ━━━ Navbar ━━━ */
    const nav = document.querySelector(".nav");
    let lastScroll = 0;
    window.addEventListener("scroll", () => {
        const s = window.scrollY;
        if (s > 60) nav.classList.add("scrolled");
        else nav.classList.remove("scrolled");
        lastScroll = s;
    });

    /* ━━━ Smooth anchor scroll ━━━ */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;

        a.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) lenis.scrollTo(target, { offset: -60 });
            // close drawer
            const drawer = document.querySelector(".drawer");
            const burger = document.querySelector(".burger");
            if (drawer && drawer.classList.contains("open")) {
                drawer.classList.remove("open");
                burger.classList.remove("on");
            }
        });
    });

    /* ━━━ Mobile Drawer ━━━ */
    const burger = document.querySelector(".burger");
    const drawer = document.querySelector(".drawer");
    if (burger && drawer) {
        burger.addEventListener("click", () => {
            burger.classList.toggle("on");
            drawer.classList.toggle("open");
        });
    }

    /* ━━━ Active Nav Link ━━━ */
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (scrollY >= top) current = sec.id;
        });
        navLinks.forEach(l => {
            l.classList.remove("active");
            if (l.getAttribute("href") === `#${current}`) l.classList.add("active");
        });
    });

    /* ━━━ Service Tile Tilt + Shine ━━━ */
    document.querySelectorAll(".service-tile").forEach(tile => {
        const shine = tile.querySelector(".tile-shine");
        tile.addEventListener("mousemove", e => {
            const rect = tile.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const px = x / rect.width;
            const py = y / rect.height;
            const rx = (py - 0.5) * 10;
            const ry = (px - 0.5) * -10;
            tile.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
            if (shine) {
                shine.style.left = `${px * 100 - 30}%`;
                shine.style.transition = "none";
            }
        });
        tile.addEventListener("mouseleave", () => {
            tile.style.transform = "";
            if (shine) shine.style.left = "-100%";
        });
    });

    /* ━━━ Magnetic Buttons ━━━ */
    document.querySelectorAll(".btn-glow, .nav-cta").forEach(btn => {
        btn.addEventListener("mousemove", e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
            btn.style.transform = "";
        });
    });

    /* ━━━ Timeline Progress (cards enter animation) ━━━ */
    document.querySelectorAll(".tl-step").forEach((step, i) => {
        gsap.fromTo(step, { opacity: 0, y: 50, scale: 0.9 }, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8,
            delay: i * 0.12,
            ease: "back.out(1.5)",
            scrollTrigger: { trigger: step, start: "top 85%", once: true }
        });
    });

    /* ━━━ Marquee pause on hover ━━━ */
    document.querySelectorAll(".mq-track").forEach(track => {
        track.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
        track.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
    });

    /* ━━━ Parallax on browser mock images (not videos) ━━━ */
    document.querySelectorAll(".browser-mock .bm-body img").forEach(el => {
        gsap.to(el, {
            y: "-20%",
            ease: "none",
            scrollTrigger: {
                trigger: el.closest(".project-showcase"),
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5,
            }
        });
    });

    /* ━━━ Ensure videos autoplay ━━━ */
    document.querySelectorAll("video[autoplay]").forEach(v => {
        v.play().catch(() => {});
    });

    /* ━━━ Contact Form ━━━ */
    const form = document.getElementById("contactForm");
    if (form) {
        form.addEventListener("submit", e => {
            e.preventDefault();
            const btn = form.querySelector(".btn-glow");
            const btnText = btn.querySelector(".btn-glow-text");
            const orig = btnText.textContent;
            btnText.textContent = currentLang === "tr" ? "Gönderildi! ✨" : "Sent! ✨";
            gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
            setTimeout(() => { btnText.textContent = orig; form.reset(); }, 2500);
        });
    }

    /* ━━━ Extra: Parallax depth for hero ━━━ */
    window.addEventListener("mousemove", e => {
        const x = (e.clientX / W - 0.5) * 2;
        const y = (e.clientY / H - 0.5) * 2;
        document.querySelectorAll(".orbit-ring").forEach((ring, i) => {
            const factor = (i + 1) * 6;
            ring.style.transform = `translate(calc(-50% + ${x * factor}px), calc(-50% + ${y * factor}px))`;
        });
    });

    /* ━━━ Dark / Light Theme Toggle ━━━ */
    const themeToggle = document.getElementById("themeToggle");
    let isDark = true;

    // Adapt starfield for light mode
    function updateStarColors() {
        stars.forEach(s => {
            s.lightMode = !isDark;
        });
    }

    if (themeToggle) {
        // Check saved preference
        const saved = localStorage.getItem("skymoon-theme");
        if (saved === "light") {
            document.documentElement.setAttribute("data-theme", "light");
            isDark = false;
            updateStarColors();
        }

        themeToggle.addEventListener("click", () => {
            isDark = !isDark;
            if (isDark) {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("skymoon-theme", "dark");
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("skymoon-theme", "light");
            }
            updateStarColors();
            // Smooth body transition
            document.body.style.transition = "background .5s, color .5s";
        });
    }

    /* ━━━ TR / EN Language Toggle ━━━ */
    const langToggle = document.getElementById("langToggle");

    if (langToggle) {
        if (currentLang === "en") {
            langToggle.querySelector(".lang-label").textContent = "TR";
            applyLanguage("en");
        }

        langToggle.addEventListener("click", () => {
            currentLang = currentLang === "tr" ? "en" : "tr";
            langToggle.querySelector(".lang-label").textContent = currentLang === "tr" ? "EN" : "TR";
            localStorage.setItem("skymoon-lang", currentLang);
            applyLanguage(currentLang);
        });
    }

    function applyLanguage(lang) {
        // Update all elements with data-tr / data-en
        document.querySelectorAll("[data-tr][data-en]").forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) {
                // Check if the element is an input-like (label etc) or has innerHTML needs
                if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    // skip — handled by placeholder
                } else {
                    el.innerHTML = text;
                }
            }
        });

        // Update placeholders
        document.querySelectorAll(`[data-${lang}-ph]`).forEach(el => {
            el.placeholder = el.getAttribute(`data-${lang}-ph`);
        });

        // Update page title
        document.title = lang === "tr"
            ? "Skymoon Studios — Hayalleri Kodluyoruz"
            : "Skymoon Studios — Coding Dreams";
    }

})();
