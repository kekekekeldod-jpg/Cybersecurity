(function() {
    // Funktion für die Earth-Canvas-Initialisierung
    function initEarthCanvas() {
        let scene;
        let camera; 
        let renderer;
        let earthmesh;
        let atmosphereMesh;
        let cloudMesh;
        let stars;

        let canvasWidth, canvasHeight, canvasColor;

        if (window.innerWidth < 576 || window.innerHeight < 576) {
            canvasWidth = 300; // Standardbreite
            canvasHeight = 300; // Standardhöhe
            canvasColor = 0x1C2137; // Farbe als Hexadezimalwert
        } else {
            canvasWidth = 500; // Standardbreite
            canvasHeight = 500; // Standardhöhe
            canvasColor = 0x2F3359; // Farbe als Hexadezimalwert
        }

        const canvas = document.querySelector('#erde');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(40, canvasWidth / canvasHeight, 0.1, 600);
        camera.position.z = 2;
        scene.add(camera);

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(canvasWidth, canvasHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Hintergrundfarbe des Canvas setzen
        renderer.setClearColor(canvasColor);

        // Erde-Geometrie erstellen
        const earthgeometry = new THREE.SphereGeometry(0.6, 32, 32);
        
        const earthmaterial = new THREE.MeshStandardMaterial({
            roughness: 0.3,
            metalness: 0,
            map: new THREE.TextureLoader().load('bilder/erdmape.jpg'),
            bumpMap: new THREE.TextureLoader().load('bilder/earthbump.jpg'),
            bumpScale: 2,
        });
        
        earthmesh = new THREE.Mesh(earthgeometry, earthmaterial);
        scene.add(earthmesh);

        const cloudGeometry = new THREE.SphereGeometry(0.60, 62, 64);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load('bilder/earthClouds.png'),
            transparent: true,
            opacity: 0.2,
            bumpScale: 5
        });

        cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        scene.add(cloudMesh);

        // Umgebungslicht setzen
        const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientlight);

        const sunlight = new THREE.DirectionalLight(0xffffff, 0.008);
        sunlight.position.set(5, 2, 5);
        scene.add(sunlight);

        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 3000;
        const starsPositions = [];

        for (let i = 0; i < starsCount; i++) {
            starsPositions.push((Math.random()-0.5)*300);
            starsPositions.push((Math.random()-0.5)*300);
            starsPositions.push((Math.random()-0.5)*300);
        }

        starsGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(starsPositions, 3)
        );

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7
        });

        stars = new THREE.Points(starsGeometry, starMaterial);
        scene.add(stars);

        // Punktlicht setzen
        const pointerlight = new THREE.PointLight(0xffffff, 0.9);
        
        // Lichtposition setzen
        pointerlight.position.set(5, 3, 5);
        scene.add(pointerlight);

        const animate = () => {
            requestAnimationFrame(animate);
            earthmesh.rotation.y += 0.00511;
            render();
        }

        const render = () => {
            renderer.render(scene, camera);
        }
        
        animate();
    }

    // Event-Listener für das Laden der Seite
    window.addEventListener('load', initEarthCanvas);
})();