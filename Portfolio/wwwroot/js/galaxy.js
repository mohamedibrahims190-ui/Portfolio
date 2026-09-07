const canvas = document.getElementById("galaxyCanvas");

if (canvas) {

    const ctx = canvas.getContext("2d");

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

    let mouseX = 0;
    let mouseY = 0;

    let targetMouseX = 0;
    let targetMouseY = 0;

    const STAR_COUNT = 280;
    const PARTICLE_COUNT = 42;

    // =========================================================
    // RESIZE
    // =========================================================

    function resizeCanvas() {

        const rect =
            canvas.parentElement.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;

        canvas.style.width =
            width + "px";

        canvas.style.height =
            height + "px";

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

    /*
     * Central area where the main portfolio text lives.
     *
     * Technology words will avoid this region.
     */

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

        } while (
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

                /*
                 * Most stars stay in background.
                 */

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


    function updateStars(time) {

        for (const star of stars) {

            /*
             * Natural slow movement
             */

            star.x +=
                star.speedX *
                (0.5 + star.depth);

            star.y +=
                star.speedY *
                (0.5 + star.depth);


            /*
             * Mouse parallax.
             *
             * Foreground stars move more.
             */

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


            /*
             * Wrap stars around screen.
             */

            if (
                star.x <
                -30
            ) {

                star.x =
                    width + 30;
            }

            if (
                star.x >
                width + 30
            ) {

                star.x =
                    -30;
            }

            if (
                star.y <
                -30
            ) {

                star.y =
                    height + 30;
            }

            if (
                star.y >
                height + 30
            ) {

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

            /*
             * Foreground stars appear slightly larger.
             */

            const size =
                star.radius *
                (
                    0.7 +
                    star.depth * 0.8
                );


            /*
             * Main star
             */

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
             * Glow around brighter foreground stars.
             */

            if (
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

            depth:
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


            /*
             * Slowly breathe the orbital distance.
             */

            const breathing =
                Math.sin(
                    time * 0.00025 +
                    particle.angle
                ) * 8;


            const distance =
                particle.distance +
                breathing;


            const x =
                centerX +
                Math.cos(
                    particle.angle
                ) *
                distance;


            const y =
                centerY +
                Math.sin(
                    particle.angle
                ) *
                distance *
                particle.vertical;


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
            ) *
            35;

        const centerY =
            height * 0.45 +
            Math.cos(
                time * 0.00006
            ) *
            22;


        const radius =
            Math.max(
                width,
                height
            ) *
            0.58;


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


        /*
         * Three depth layers:
         *
         * 0 = background
         * 1 = middle
         * 2 = foreground
         */

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


        /*
         * Curved path parameters.
         */

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


            /*
             * Base movement.
             */

            driftX:
                (Math.random() - 0.5) *
                0.035,

            driftY:
                (Math.random() - 0.5) *
                0.025,


            /*
             * Curved movement.
             */

            curveRadius,

            curveSpeed,

            curvePhase:
                Math.random() *
                Math.PI *
                2,


            /*
             * Small rotation.
             */

            rotation:
                (Math.random() - 0.5) *
                0.035,


            rotationSpeed:
                (Math.random() - 0.5) *
                0.00015,


            /*
             * Breathing animation.
             */

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

            /*
             * Very slow base movement.
             */

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


            /*
             * Curved orbital movement.
             *
             * This creates a smooth
             * floating path rather than
             * straight-line movement.
             */

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


            /*
             * Mouse parallax.
             */

            const parallaxX =
                mouseX *
                word.depth *
                30;

            const parallaxY =
                mouseY *
                word.depth *
                18;


            word.renderX =
                word.baseX +
                curveX +
                parallaxX;

            word.renderY =
                word.baseY +
                curveY +
                parallaxY;


            /*
             * Slow rotation.
             */

            word.renderRotation =
                word.rotation +
                Math.sin(
                    time *
                    word.rotationSpeed +
                    word.phase
                ) *
                0.012;


            /*
             * Keep words moving around
             * the screen.
             */

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

            /*
             * Gentle breathing.
             */

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


            /*
             * Depth affects size.
             */

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


            /*
             * Font.
             */

            ctx.font =
                `600 ${fontSize}px Inter, Arial, sans-serif`;


            /*
             * Foreground words get
             * slightly stronger glow.
             */

            const glow =
                word.depth > 0.65
                    ? 10
                    : 6;


            ctx.shadowBlur =
                glow;

            ctx.shadowColor =
                "rgba(80,150,255,0.30)";


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

        /*
         * Keep shooting stars mostly
         * outside the hero center.
         */

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


            star.opacity -=
                0.018;


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
                1.4;

            ctx.stroke();


            /*
             * Bright head.
             */

            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                1.5,
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
    // MOUSE
    // =========================================================

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
        }
    );


    /*
     * Reset mouse when leaving window.
     */

    window.addEventListener(
        "mouseleave",
        () => {

            targetMouseX = 0;
            targetMouseY = 0;
        }
    );


    function updateMouse() {

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

    window.addEventListener(
        "resize",
        () => {

            resizeCanvas();

            createStars();

            createParticles();

            createFloatingWords();
        }
    );


    // =========================================================
    // ANIMATION
    // =========================================================

    let lastShootingStar = 0;

    function animate(time) {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Mouse.
         */

        updateMouse();


        /*
         * -----------------------------------------------------
         * BACKGROUND
         * -----------------------------------------------------
         */

        drawNebula(time);


        /*
         * -----------------------------------------------------
         * STARFIELD
         * -----------------------------------------------------
         */

        updateStars(time);

        drawStars(time);


        /*
         * -----------------------------------------------------
         * ORBITAL PARTICLES
         * -----------------------------------------------------
         */

        updateParticles(time);

        drawParticles();


        /*
         * -----------------------------------------------------
         * TECHNOLOGY WORDS
         * -----------------------------------------------------
         */

        updateFloatingWords(time);

        drawFloatingWords(time);


        /*
         * -----------------------------------------------------
         * SHOOTING STARS
         * -----------------------------------------------------
         */

        updateShootingStars();

        drawShootingStars();


        /*
         * Random shooting star.
         *
         * Approximately every 6–12 seconds.
         */

        if (
            time -
            lastShootingStar >
            6000 +
            Math.random() *
            6000
        ) {

            createShootingStar();

            lastShootingStar =
                time;
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