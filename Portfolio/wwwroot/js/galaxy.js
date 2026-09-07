const canvas = document.getElementById("galaxyCanvas");

if (canvas) {

    const ctx = canvas.getContext("2d", {
        alpha: true
    });

    let width;
    let height;
    let dpr;

    let stars = [];
    let particles = [];
    let shootingStars = [];
    let floatingWords = [];

    const WORDS = [
        ".NET",
        "C#",
        "ASP.NET Core",
        "Web API",
        "React",
        "JavaScript",
        "SQL Server",
        "PostgreSQL",
        "MongoDB",
        "EF Core",
        "Azure",
        "Microservices",
        "Neo4J",
        "ApacheNIFI"
    ];


    // =========================================================
    // DEVICE PERFORMANCE SETTINGS
    // =========================================================

    const isMobile =
        window.matchMedia("(max-width: 600px)").matches;

    const isTablet =
        window.matchMedia(
            "(min-width: 601px) and (max-width: 1024px)"
        ).matches;


    let STAR_COUNT;
    let PARTICLE_COUNT;
    let TARGET_FPS;
    let ENABLE_PARALLAX;
    let ENABLE_STAR_GLOW;
    let ENABLE_TEXT_GLOW;
    let NEBULA_INTERVAL;


    if (isMobile) {

        STAR_COUNT = 85;
        PARTICLE_COUNT = 10;

        TARGET_FPS = 30;

        ENABLE_PARALLAX = false;

        ENABLE_STAR_GLOW = false;

        ENABLE_TEXT_GLOW = false;

        /*
         * Draw nebula less frequently.
         */
        NEBULA_INTERVAL = 2;

    }
    else if (isTablet) {

        STAR_COUNT = 100;
        PARTICLE_COUNT = 12;

        TARGET_FPS = 30;

        ENABLE_PARALLAX = false;

        ENABLE_STAR_GLOW = false;

        ENABLE_TEXT_GLOW = false;

        NEBULA_INTERVAL = 3;
    }
    else {

        STAR_COUNT = 280;
        PARTICLE_COUNT = 42;

        TARGET_FPS = 60;

        ENABLE_PARALLAX = true;

        ENABLE_STAR_GLOW = true;

        ENABLE_TEXT_GLOW = true;

        NEBULA_INTERVAL = 1;
    }


    const FRAME_INTERVAL =
        1000 / TARGET_FPS;


    let lastFrameTime = 0;

    let frameCounter = 0;

    let lastShootingStar = 0;

    let nextShootingStarDelay =
        6000 +
        Math.random() * 6000;


    // =========================================================
    // MOUSE
    // =========================================================

    let mouseX = 0;
    let mouseY = 0;

    let targetMouseX = 0;
    let targetMouseY = 0;


    // Only attach mouse movement
    // when parallax is actually needed.

    if (ENABLE_PARALLAX) {

        window.addEventListener(
            "mousemove",
            (event) => {

                targetMouseX =
                    event.clientX /
                    window.innerWidth -
                    0.5;

                targetMouseY =
                    event.clientY /
                    window.innerHeight -
                    0.5;
            },
            {
                passive: true
            }
        );


        window.addEventListener(
            "mouseleave",
            () => {

                targetMouseX = 0;
                targetMouseY = 0;

            },
            {
                passive: true
            }
        );
    }


    function updateMouse() {

        if (!ENABLE_PARALLAX) {

            mouseX = 0;
            mouseY = 0;

            return;
        }


        mouseX +=
            (
                targetMouseX -
                mouseX
            ) *
            0.035;


        mouseY +=
            (
                targetMouseY -
                mouseY
            ) *
            0.035;
    }


    // =========================================================
    // RESIZE
    // =========================================================

    function resizeCanvas() {

        const rect =
            canvas.parentElement.getBoundingClientRect();


        width = rect.width;

        height = rect.height;


        /*
         * Mobile devices don't need
         * extremely high canvas resolution.
         *
         * This is one of the biggest
         * performance improvements.
         */

        const devicePixelRatio =
            window.devicePixelRatio || 1;


        if (isMobile) {

            dpr =
                Math.min(
                    devicePixelRatio,
                    1.25
                );

        }
        else if (isTablet) {

            dpr =
                Math.min(
                    devicePixelRatio,
                    1.5
                );

        }
        else {

            dpr =
                Math.min(
                    devicePixelRatio,
                    2
                );
        }


        canvas.width =
            Math.floor(
                width * dpr
            );


        canvas.height =
            Math.floor(
                height * dpr
            );


        canvas.style.width = "100%";
        canvas.style.height = "100%";


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }


    // =========================================================
    // HERO SAFE ZONE
    // =========================================================

    function isInsideHeroSafeZone(x, y) {

        const centerX =
            width * 0.5;

        const centerY =
            height * 0.46;


        const safeWidth =
            Math.min(
                width * 0.62,
                850
            );


        const safeHeight =
            Math.min(
                height * 0.42,
                360
            );


        return (
            Math.abs(x - centerX) <
            safeWidth / 2 &&

            Math.abs(y - centerY) <
            safeHeight / 2
        );
    }


    function getSafeWordPosition() {

        let x;
        let y;

        let attempts = 0;


        do {

            x =
                Math.random() *
                width;

            y =
                Math.random() *
                height;

            attempts++;

        }
        while (
            isInsideHeroSafeZone(x, y) &&
            attempts < 100
        );


        return {
            x,
            y
        };
    }


    // =========================================================
    // STARS
    // =========================================================

    function createStar() {

        const depth =
            Math.random();


        return {

            x:
                Math.random() *
                width,

            y:
                Math.random() *
                height,

            depth:
                Math.pow(
                    depth,
                    1.4
                ),

            radius:
                Math.random() *
                1.35 +
                0.25,

            opacity:
                Math.random() *
                0.65 +
                0.15,

            twinkleSpeed:
                Math.random() *
                0.018 +
                0.003,

            twinkleOffset:
                Math.random() *
                Math.PI *
                2,

            speedX:
                (Math.random() - 0.5) *
                0.04,

            speedY:
                (Math.random() - 0.5) *
                0.025
        };
    }


    function createStars() {

        stars = [];


        for (
            let i = 0;
            i < STAR_COUNT;
            i++
        ) {

            stars.push(
                createStar()
            );
        }
    }


    function updateStars() {

        for (const star of stars) {

            star.x +=
                star.speedX *
                (
                    0.5 +
                    star.depth
                );


            star.y +=
                star.speedY *
                (
                    0.5 +
                    star.depth
                );


            /*
             * Parallax is only calculated
             * on desktop.
             */

            if (ENABLE_PARALLAX) {

                star.renderX =
                    star.x +
                    mouseX *
                    star.depth *
                    24;


                star.renderY =
                    star.y +
                    mouseY *
                    star.depth *
                    14;

            }
            else {

                star.renderX =
                    star.x;

                star.renderY =
                    star.y;
            }


            if (star.x < -30) {

                star.x =
                    width + 30;
            }


            if (star.x > width + 30) {

                star.x =
                    -30;
            }


            if (star.y < -30) {

                star.y =
                    height + 30;
            }


            if (star.y > height + 30) {

                star.y =
                    -30;
            }
        }
    }


    function drawStars(time) {

        for (const star of stars) {

            const twinkle =
                Math.sin(
                    time *
                    star.twinkleSpeed +
                    star.twinkleOffset
                );


            const opacity =
                Math.max(
                    0.03,
                    star.opacity +
                    twinkle * 0.16
                );


            const size =
                star.radius *
                (
                    0.7 +
                    star.depth * 0.8
                );


            ctx.beginPath();


            ctx.arc(
                star.renderX,
                star.renderY,
                size,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(
                    255,
                    255,
                    255,
                    ${opacity}
                )`;


            ctx.fill();


            /*
             * Glow only on desktop/tablet.
             *
             * Mobile skips this expensive
             * second drawing operation.
             */

            if (
                ENABLE_STAR_GLOW &&
                star.depth > 0.65 &&
                size > 1
            ) {

                ctx.beginPath();


                ctx.arc(
                    star.renderX,
                    star.renderY,
                    size * 3.5,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(
                        130,
                        170,
                        255,
                        ${opacity * 0.07}
                    )`;


                ctx.fill();
            }
        }
    }


    // =========================================================
    // ORBITAL PARTICLES
    // =========================================================

    function createParticle() {

        const depth =
            Math.random() *
            0.8 +
            0.2;


        return {

            angle:
                Math.random() *
                Math.PI *
                2,

            distance:
                Math.random() *
                Math.min(
                    width,
                    height
                ) *
                0.45,

            speed:
                Math.random() *
                0.00035 +
                0.00012,

            size:
                Math.random() *
                1.5 +
                0.4,

            opacity:
                Math.random() *
                0.3 +
                0.08,

            vertical:
                Math.random() *
                0.45 +
                0.18,

            depth
        };
    }


    function createParticles() {

        particles = [];


        for (
            let i = 0;
            i < PARTICLE_COUNT;
            i++
        ) {

            particles.push(
                createParticle()
            );
        }
    }


    function updateParticles(time) {

        const centerX =
            width * 0.5;

        const centerY =
            height * 0.46;


        for (const particle of particles) {

            particle.angle +=
                particle.speed *
                16;


            const breathing =
                Math.sin(
                    time * 0.00025 +
                    particle.angle
                ) * 8;


            const distance =
                particle.distance +
                breathing;


            const cos =
                Math.cos(
                    particle.angle
                );


            const sin =
                Math.sin(
                    particle.angle
                );


            const x =
                centerX +
                cos *
                distance;


            const y =
                centerY +
                sin *
                distance *
                particle.vertical;


            if (ENABLE_PARALLAX) {

                particle.x =
                    x +
                    mouseX *
                    particle.depth *
                    20;


                particle.y =
                    y +
                    mouseY *
                    particle.depth *
                    12;

            }
            else {

                particle.x = x;

                particle.y = y;
            }
        }
    }


    function drawParticles() {

        for (const particle of particles) {

            ctx.beginPath();


            ctx.arc(
                particle.x,
                particle.y,
                particle.size *
                (
                    0.7 +
                    particle.depth
                ),
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(
                    120,
                    170,
                    255,
                    ${particle.opacity}
                )`;


            ctx.fill();
        }
    }


    // =========================================================
    // NEBULA
    // =========================================================

    function drawNebula(time) {

        const centerX =
            width * 0.5 +
            Math.sin(
                time * 0.00008
            ) * 35;


        const centerY =
            height * 0.45 +
            Math.cos(
                time * 0.00006
            ) * 22;


        const radius =
            Math.max(
                width,
                height
            ) * 0.58;


        const gradient =
            ctx.createRadialGradient(
                centerX,
                centerY,
                10,
                centerX,
                centerY,
                radius
            );


        gradient.addColorStop(
            0,
            "rgba(80,120,255,0.10)"
        );


        gradient.addColorStop(
            0.25,
            "rgba(90,100,240,0.045)"
        );


        gradient.addColorStop(
            0.55,
            "rgba(50,70,180,0.018)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );


        ctx.save();


        ctx.translate(
            centerX,
            centerY
        );


        ctx.rotate(
            time * 0.000008
        );


        ctx.scale(
            1.8,
            0.42
        );


        ctx.beginPath();


        ctx.arc(
            0,
            0,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            gradient;


        ctx.fill();


        ctx.restore();
    }


    // =========================================================
    // FLOATING TECHNOLOGY WORDS
    // =========================================================

    function createFloatingWord(
        text,
        index
    ) {

        const position =
            getSafeWordPosition();


        const layer =
            index % 3;


        let depth;


        if (layer === 0) {

            depth =
                Math.random() *
                0.18 +
                0.18;

        }
        else if (layer === 1) {

            depth =
                Math.random() *
                0.20 +
                0.42;

        }
        else {

            depth =
                Math.random() *
                0.18 +
                0.72;
        }


        const curveRadius =
            Math.random() *
            90 +
            50;


        const curveSpeed =
            Math.random() *
            0.00035 +
            0.00012;


        return {

            text,

            index,

            layer,

            depth,

            x:
                position.x,

            y:
                position.y,

            baseX:
                position.x,

            baseY:
                position.y,


            size:

                layer === 2

                    ? Math.random() *
                    5 +
                    15

                    : layer === 1

                        ? Math.random() *
                        4 +
                        12

                        : Math.random() *
                        3 +
                        10,


            opacity:

                layer === 2

                    ? Math.random() *
                    0.13 +
                    0.20

                    : layer === 1

                        ? Math.random() *
                        0.10 +
                        0.12

                        : Math.random() *
                        0.07 +
                        0.07,


            driftX:
                (Math.random() - 0.5) *
                0.035,

            driftY:
                (Math.random() - 0.5) *
                0.025,


            curveRadius,

            curveSpeed,

            curvePhase:
                Math.random() *
                Math.PI *
                2,


            rotation:
                (Math.random() - 0.5) *
                0.035,


            rotationSpeed:
                (Math.random() - 0.5) *
                0.00015,


            phase:
                Math.random() *
                Math.PI *
                2,


            phaseSpeed:
                Math.random() *
                0.0007 +
                0.00025
        };
    }


    function createFloatingWords() {

        floatingWords = [];


        for (
            let i = 0;
            i < WORDS.length;
            i++
        ) {

            floatingWords.push(
                createFloatingWord(
                    WORDS[i],
                    i
                )
            );
        }
    }


    function updateFloatingWords(time) {

        for (
            const word of floatingWords
        ) {

            word.baseX +=
                word.driftX *
                (
                    0.7 +
                    word.depth
                );


            word.baseY +=
                word.driftY *
                (
                    0.7 +
                    word.depth
                );


            const curve =
                time *
                word.curveSpeed +
                word.curvePhase;


            const curveX =
                Math.cos(curve) *
                word.curveRadius;


            const curveY =
                Math.sin(curve * 0.8) *
                word.curveRadius *
                0.45;


            let parallaxX = 0;

            let parallaxY = 0;


            if (ENABLE_PARALLAX) {

                parallaxX =
                    mouseX *
                    word.depth *
                    30;


                parallaxY =
                    mouseY *
                    word.depth *
                    18;
            }


            word.renderX =
                word.baseX +
                curveX +
                parallaxX;


            word.renderY =
                word.baseY +
                curveY +
                parallaxY;


            word.renderRotation =
                word.rotation +
                Math.sin(
                    time *
                    word.rotationSpeed +
                    word.phase
                ) *
                0.012;


            if (
                word.baseX <
                -180
            ) {

                word.baseX =
                    width + 180;
            }


            if (
                word.baseX >
                width + 180
            ) {

                word.baseX =
                    -180;
            }


            if (
                word.baseY <
                -80
            ) {

                word.baseY =
                    height + 80;
            }


            if (
                word.baseY >
                height + 80
            ) {

                word.baseY =
                    -80;
            }
        }
    }


    function drawFloatingWords(time) {

        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        for (
            const word of floatingWords
        ) {

            const pulse =
                Math.sin(
                    time *
                    word.phaseSpeed +
                    word.phase
                ) *
                0.025;


            const opacity =
                Math.max(
                    0.035,
                    word.opacity +
                    pulse
                );


            const depthScale =
                0.78 +
                word.depth *
                0.38;


            const fontSize =
                word.size *
                depthScale;


            ctx.save();


            ctx.translate(
                word.renderX,
                word.renderY
            );


            ctx.rotate(
                word.renderRotation
            );


            ctx.font =
                `600 ${fontSize}px Inter, Arial, sans-serif`;


            /*
             * Text shadow is expensive.
             *
             * Only desktop gets it.
             */

            if (ENABLE_TEXT_GLOW) {

                ctx.shadowBlur =
                    word.depth > 0.65
                        ? 10
                        : 6;

                ctx.shadowColor =
                    "rgba(80,150,255,0.30)";
            }
            else {

                ctx.shadowBlur = 0;
            }


            ctx.fillStyle =
                `rgba(
                    150,
                    190,
                    255,
                    ${opacity}
                )`;


            ctx.fillText(
                word.text,
                0,
                0
            );


            ctx.restore();
        }
    }


    // =========================================================
    // SHOOTING STARS
    // =========================================================

    function createShootingStar() {

        let x;
        let y;


        if (
            Math.random() < 0.5
        ) {

            x =
                Math.random() *
                width *
                0.7;


            y =
                Math.random() *
                height *
                0.30;

        }
        else {

            x =
                Math.random() *
                width *
                0.35;


            y =
                height *
                (
                    0.55 +
                    Math.random() *
                    0.25
                );
        }


        shootingStars.push({

            x,

            y,

            length:
                Math.random() *
                100 +
                80,

            speed:
                Math.random() *
                8 +
                7,

            opacity: 1,

            angle:
                Math.random() *
                0.25 +
                0.35
        });
    }


    function updateShootingStars() {

        for (
            let i =
                shootingStars.length - 1;

            i >= 0;

            i--
        ) {

            const star =
                shootingStars[i];


            star.x +=
                Math.cos(
                    star.angle
                ) *
                star.speed;


            star.y +=
                Math.sin(
                    star.angle
                ) *
                star.speed;


            /*
             * Mobile fades slightly faster
             * so shooting stars don't remain
             * on screen too long.
             */

            star.opacity -=
                isMobile
                    ? 0.025
                    : 0.018;


            if (
                star.opacity <= 0 ||
                star.x >
                width + 200 ||
                star.y >
                height + 200
            ) {

                shootingStars.splice(
                    i,
                    1
                );
            }
        }
    }


    function drawShootingStars() {

        for (
            const star of shootingStars
        ) {

            const tailX =
                star.x -
                Math.cos(
                    star.angle
                ) *
                star.length;


            const tailY =
                star.y -
                Math.sin(
                    star.angle
                ) *
                star.length;


            const gradient =
                ctx.createLinearGradient(
                    star.x,
                    star.y,
                    tailX,
                    tailY
                );


            gradient.addColorStop(
                0,
                `rgba(
                    255,
                    255,
                    255,
                    ${star.opacity}
                )`
            );


            gradient.addColorStop(
                1,
                "rgba(255,255,255,0)"
            );


            ctx.beginPath();


            ctx.moveTo(
                star.x,
                star.y
            );


            ctx.lineTo(
                tailX,
                tailY
            );


            ctx.strokeStyle =
                gradient;


            ctx.lineWidth =
                isMobile
                    ? 1
                    : 1.4;


            ctx.stroke();


            ctx.beginPath();


            ctx.arc(
                star.x,
                star.y,
                isMobile ? 1.2 : 1.5,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(
                    255,
                    255,
                    255,
                    ${star.opacity}
                )`;


            ctx.fill();
        }
    }


    // =========================================================
    // RESIZE EVENT
    // =========================================================

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        resizeCanvas();

                        createStars();

                        createParticles();

                        createFloatingWords();

                    },
                    150
                );
        },
        {
            passive: true
        }
    );


    // =========================================================
    // ANIMATION
    // =========================================================

    function animate(time) {

        /*
         * FPS throttling.
         *
         * Desktop: ~60 FPS
         * Tablet: ~45 FPS
         * Mobile: ~30 FPS
         */

        if (
            time -
            lastFrameTime <
            FRAME_INTERVAL
        ) {

            requestAnimationFrame(
                animate
            );

            return;
        }


        lastFrameTime = time;


        frameCounter++;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // -----------------------------------------------------
        // MOUSE
        // -----------------------------------------------------

        updateMouse();


        // -----------------------------------------------------
        // NEBULA
        // -----------------------------------------------------

        /*
         * On mobile we don't need to recreate
         * the expensive radial gradient every frame.
         */

        if (!isMobile) {
            drawNebula(time);
        }


        // -----------------------------------------------------
        // STARS
        // -----------------------------------------------------

        updateStars();

        drawStars(time);


        // -----------------------------------------------------
        // PARTICLES
        // -----------------------------------------------------

        updateParticles(time);

        drawParticles();


        // -----------------------------------------------------
        // TECHNOLOGY WORDS
        // -----------------------------------------------------

        updateFloatingWords(time);

        drawFloatingWords(time);


        // -----------------------------------------------------
        // SHOOTING STARS
        // -----------------------------------------------------

        updateShootingStars();

        drawShootingStars();


        // -----------------------------------------------------
        // SHOOTING STAR SPAWN
        // -----------------------------------------------------

        if (
            time -
            lastShootingStar >
            nextShootingStarDelay
        ) {

            /*
             * Reduce shooting star frequency
             * on mobile.
             */

            if (
                !isMobile ||
                Math.random() < 0.65
            ) {

                createShootingStar();
            }


            lastShootingStar =
                time;


            nextShootingStarDelay =
                isMobile

                    ? 10000 +
                    Math.random() *
                    10000

                    : 6000 +
                    Math.random() *
                    6000;
        }


        requestAnimationFrame(
            animate
        );
    }


    // =========================================================
    // INITIALIZE
    // =========================================================

    resizeCanvas();

    createStars();

    createParticles();

    createFloatingWords();


    requestAnimationFrame(
        animate
    );
}