// ===============================
// CURTAIN OPENING
// ===============================

const curtainStage = document.getElementById("curtainStage");
const openButton = document.getElementById("openButton");
const invitation = document.getElementById("invitation");

const duaText = document.getElementById("duaText");

const dua = "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا";


openButton.addEventListener("click", function () {

    // Prevent clicking multiple times
    openButton.disabled = true;

    // Open curtains
    curtainStage.classList.add("opened");

    // Allow page scrolling
    document.body.classList.add("invitation-open");

    // Remove curtain after animation
    setTimeout(function () {
        curtainStage.style.display = "none";
        stopSparkles();
    }, 1600);

    // Start the golden light
    startLight();

    // Start typing dua
    setTimeout(function () {
        typeDua();
    }, 900);

});


// ===============================
// COVER SPARKLES (front + back depth)  - light version
// ===============================

const sparkleCanvas = document.getElementById("coverSparkles");
let sparkleRunning = true;

function stopSparkles() {
    sparkleRunning = false;
}

(function initSparkles() {

    if (!sparkleCanvas) return;

    const ctx = sparkleCanvas.getContext("2d");
    let w = 0, h = 0;
    let particles = [];

    const rand = function (a, b) { return a + Math.random() * (b - a); };

    // pre-drawn sprites (much faster than gradients every frame)
    function makeSprite(size, stops) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d");
        const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
        g.fillStyle = gr;
        g.fillRect(0, 0, size, size);
        return c;
    }

    const farSprite = makeSprite(64, [[0, "rgba(255,215,130,1)"], [1, "rgba(255,190,80,0)"]]);
    const nearSprite = makeSprite(32, [[0, "rgba(255,244,205,1)"], [0.25, "rgba(255,210,110,0.55)"], [1, "rgba(255,190,80,0)"]]);

    const starSprite = (function () {
        const c = document.createElement("canvas");
        c.width = c.height = 32;
        const g = c.getContext("2d");
        g.translate(16, 16);
        g.fillStyle = "rgba(255,244,205,1)";
        g.beginPath();
        g.moveTo(0, -15);
        g.quadraticCurveTo(0, 0, 15, 0);
        g.quadraticCurveTo(0, 0, 0, 15);
        g.quadraticCurveTo(0, 0, -15, 0);
        g.quadraticCurveTo(0, 0, 0, -15);
        g.fill();
        return c;
    })();

    function make(far) {
        return {
            far: far,
            x: rand(0, w),
            y: rand(0, h),
            r: far ? rand(10, 26) : rand(0.8, 2.8),
            vy: far ? -rand(4, 10) : -rand(14, 34),
            vx: rand(-6, 6),
            ph: rand(0, 6.28),
            sp: rand(0.6, 1.9),
            a: far ? rand(0.10, 0.26) : rand(0.5, 1)
        };
    }

    function resize() {
        w = sparkleCanvas.clientWidth;
        h = sparkleCanvas.clientHeight;
        sparkleCanvas.width = w;      // 1x resolution is plenty for soft glows
        sparkleCanvas.height = h;

        const small = w < 600;

const farCount = small ? 2 : 6;
const nearCount = small ? 8 : 20;

        particles = [];
        for (let i = 0; i < farCount; i++) particles.push(make(true));
        for (let i = 0; i < nearCount; i++) particles.push(make(false));
    }

    let last = performance.now();

    function frame(now) {
        if (document.hidden) {
    requestAnimationFrame(frame);
    return;
        }


        if (!sparkleRunning) return;

        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const t = now / 1000;

        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";

        for (let i = 0; i < particles.length; i++) {

            const p = particles[i];

            p.y += p.vy * dt;
            p.x += (p.vx + Math.sin(t * 0.7 + p.ph) * 8) * dt;

            const m = p.r * 5;
            if (p.y < -m) { p.y = h + m; p.x = rand(0, w); }
            if (p.x < -m) p.x = w + m;
            if (p.x > w + m) p.x = -m;

            const tw = 0.5 + 0.5 * Math.sin(t * p.sp + p.ph);
            ctx.globalAlpha = p.a * (0.3 + 0.7 * tw);

            if (p.far) {
                ctx.drawImage(farSprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            } else {
                const s = p.r * 10;
                ctx.drawImage(nearSprite, p.x - s / 2, p.y - s / 2, s, s);
                if (p.r > 1.9 && tw > 0.6) {
                    const q = p.r * 6.4;
                    ctx.drawImage(starSprite, p.x - q / 2, p.y - q / 2, q, q);
                }
            }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);

})();


// ===============================
// DUA LETTER-BY-LETTER EFFECT
// ===============================

function typeDua() {

    const letters = Array.from(dua);
    let index = 0;

    duaText.textContent = "";

    const typing = setInterval(function () {

        duaText.textContent = letters.slice(0, index + 1).join("");

        index++;

        if (index >= letters.length) {
            clearInterval(typing);
        }

    },50);
}


// ===============================
// ONE GOLDEN LIGHT WITH A LONG TRAIL
// - page top    -> light at the TOP CENTRE
// - page bottom -> light at the BOTTOM CENTRE
// - in between it sweeps smoothly left <-> right while going down
// - moving LEFT  = in FRONT of the content
// - moving RIGHT = BEHIND the words and cards
// - scrolling up brings it back the same way
// ===============================

const lightBack = document.getElementById("lightBack");
const lightFront = document.getElementById("lightFront");
const ctxBack = lightBack.getContext("2d");
const ctxFront = lightFront.getContext("2d");

let lw = 0, lh = 0;
let lightS = 0;          // smoothed scroll progress (0 - 1)
let lightDir = 1;        // 1 = moving down, -1 = moving up
let lightRunning = false;

function sizeLightCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    lw = window.innerWidth;
    lh = window.innerHeight;
    [lightBack, lightFront].forEach(function (cv) {
        cv.width = lw * dpr;
        cv.height = lh * dpr;
        cv.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    });
}

// number of left/right sweeps depends on page length
function sweepCount() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(Math.max(Math.round(maxScroll / (window.innerHeight * 0.8)), 4), 10);
}

// one smooth continuous path from top-centre to bottom-centre
function lightPoint(s, n) {
    const amp = Math.min(lw * 0.40, 520);
    return {
        x: lw * 0.5 - amp * Math.sin(Math.PI * n * s),
        y: lh * 0.08 + lh * 0.84 * s,
        front: Math.cos(Math.PI * n * s) >= 0     // moving left = front
    };
}

function drawLight() {

    ctxBack.clearRect(0, 0, lw, lh);
    ctxFront.clearRect(0, 0, lw, lh);

    const n = sweepCount();
    const trailLength = 0.16;     // long tail (share of the whole path)
    const steps = window.innerWidth < 600 ? 18 : 36;

    ctxBack.lineCap = "round";
    ctxFront.lineCap = "round";

    let prev = lightPoint(lightS, n);

    for (let i = 1; i <= steps; i++) {

        const f = i / steps;
        const ss = lightS - lightDir * f * trailLength;

        if (ss < 0 || ss > 1) break;

        const p = lightPoint(ss, n);
        const ctx = p.front ? ctxFront : ctxBack;
        const a = Math.pow(1 - f, 1.6) * 0.9;

        ctx.strokeStyle = "rgba(255, 205, 100," + a + ")";
        ctx.lineWidth = 0.8 + 3.6 * (1 - f);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        prev = p;
    }

    // glowing head
    const head = lightPoint(lightS, n);
    const ctx = head.front ? ctxFront : ctxBack;

    const halo = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 40);
    halo.addColorStop(0, "rgba(255, 236, 160, 0.95)");
    halo.addColorStop(0.3, "rgba(255, 190, 80, 0.5)");
    halo.addColorStop(1, "rgba(255, 180, 60, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(head.x, head.y, 40, 0, 6.2832);
    ctx.fill();

    ctx.fillStyle = "#fffaf0";
    ctx.beginPath();
    ctx.arc(head.x, head.y, 3.8, 0, 6.2832);
    ctx.fill();
}

function lightTargetS() {
    const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight, 1
    );
    return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
}

let lightSized = false;

let lightFrame = null;

function startLight() {

    if (!lightSized) {
        sizeLightCanvas();
        lightSized = true;
    }

    // One animation frame at a time
    if (lightFrame !== null) return;

    lightFrame = requestAnimationFrame(function () {

        const target = lightTargetS();

        lightDir = target >= lightS ? 1 : -1;

        // Light follows the actual scroll position
        lightS = target;

        drawLight();

        lightFrame = null;
    });
}

window.addEventListener("scroll", function () {

    if (document.body.classList.contains("invitation-open")) {
        startLight();
    }

}, { passive: true });


window.addEventListener("resize", function () {

    if (document.body.classList.contains("invitation-open")) {

        sizeLightCanvas();
        lightSized = true;

        startLight();
    }

});

window.addEventListener("scroll", function () {
    if (document.body.classList.contains("invitation-open")) {
        startLight();
    }
}, { passive: true });

window.addEventListener("resize", function () {
    if (document.body.classList.contains("invitation-open")) {
        sizeLightCanvas();
        lightRunning = false;
        startLight();
    }
});



 // ===============================
 // RSVP MODAL + BACKEND
 // ===============================

const rsvpOpen = document.getElementById("rsvpOpen");
const rsvpOverlay = document.getElementById("rsvpOverlay");
const closeRsvp = document.getElementById("closeRsvp");

const rsvpForm = document.getElementById("rsvpForm");
const rsvpMessage = document.getElementById("rsvpMessage");

const attendanceInput = document.getElementById("attendance");
const guestCountGroup = document.getElementById("guestCountGroup");
const guestCountInput = document.getElementById("guestCount");

// const whatsappLink = document.getElementById("whatsappLink");

const API = "https://ahmedwedding-two.vercel.app/api/rsvp";

// Open modal
rsvpOpen.addEventListener("click", function () {
    rsvpOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
});

closeRsvp.addEventListener("click", function () {
    rsvpOverlay.classList.remove("active");
    document.body.style.overflow = "";
});

rsvpOverlay.addEventListener("click", function (event) {
    if (event.target === rsvpOverlay) {
        rsvpOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// Close by clicking outside


// Show guest count only if attending
attendanceInput.addEventListener("change", function () {

    if (attendanceInput.value === "No") {
        guestCountGroup.style.display = "none";
        guestCountInput.required = false;
        guestCountInput.value = "1";
    } else {
        guestCountGroup.style.display = "block";
        guestCountInput.required = true;
    }

});

// Submit RSVP to backend
rsvpForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("guestName").value.trim();
    const phone = document.getElementById("guestPhone").value.trim();
    const attendance = attendanceInput.value;

    const guestCount =
        attendance === "Yes" ? Number(guestCountInput.value) : 1;

    if (!name || !phone || !attendance) {
        rsvpMessage.textContent = "Please complete all fields.";
        return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
        rsvpMessage.textContent = "Guest count must be between 1 and 20.";
        return;
    }

    const submitButton = rsvpForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "SUBMITTING...";
    rsvpMessage.textContent = "Please wait...";
    // whatsappLink.style.display = "none";

    try {

        const response = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                phone,
                attendance,
                guestCount
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "RSVP submission failed.");
        }

       rsvpMessage.textContent = `Thank You, ${name}!`;

rsvpForm.reset();
guestCountGroup.style.display = "block";

        // if (result.whatsappLink) {
        //     whatsappLink.href = result.whatsappLink;
        //     whatsappLink.style.display = "inline-block";
        // }


    } catch (error) {

        console.error("RSVP Error:", error);

        rsvpMessage.textContent =
            error.message || "Something went wrong. Please try again.";

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "SUBMIT RESPONSE";

    }

});



// ===============================
// REVEAL SECTIONS ON SCROLL
// ===============================

const revealSections = document.querySelectorAll(".reveal-section");

const revealObserver = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {

        if (entry.isIntersecting) {

            entry.target.classList.add("visible");

        }

    });

}, {
    threshold: 0.12
});

revealSections.forEach(function (section) {

    revealObserver.observe(section);

});


// ===============================
// LIVE WALIMA COUNTDOWN
// ===============================

// 1 January 2027, 8:00 PM Pakistan Time
const walimaDate = new Date("2027-01-01T20:00:00+05:00").getTime();

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const countdownNote = document.getElementById("countdownNote");


function updateCountdown() {

    const currentTime = new Date().getTime();

    const difference = walimaDate - currentTime;

    if (difference <= 0) {

        daysElement.textContent = "000";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        countdownNote.textContent =
            "The celebration has begun! Welcome!";

        clearInterval(countdownInterval);

        return;
    }

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (difference / 1000) % 60
    );

    daysElement.textContent = String(days).padStart(3, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");

}


// Update immediately and then every second
updateCountdown();

const countdownInterval = setInterval(updateCountdown, 1000);