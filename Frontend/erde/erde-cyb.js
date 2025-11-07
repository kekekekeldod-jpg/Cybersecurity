(function() {
    // Funktion für die Earth-Canvas-Initialisierung
    function initEarthCanvas() {
        let scene;
        let camera; 
        let renderer;
        let earthmesh;

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
            roughness: 1,
            metalness: 0,
            map: new THREE.TextureLoader().load('bilder/erdmape.jpg'),
            bumpMap: new THREE.TextureLoader().load('bilder/earthbump.jpg'),
            bumpScale: 1.1,
        });
        
        earthmesh = new THREE.Mesh(earthgeometry, earthmaterial);
        scene.add(earthmesh);
        
        // Umgebungslicht setzen
        const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientlight);

        // Punktlicht setzen
        const pointerlight = new THREE.PointLight(0xffffff, 0.9);
        
        // Lichtposition setzen
        pointerlight.position.set(5, 3, 5);
        scene.add(pointerlight);

        const animate = () => {
            requestAnimationFrame(animate);
            earthmesh.rotation.y += 0.0045;
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