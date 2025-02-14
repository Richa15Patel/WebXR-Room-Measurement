// Set up necessary variables
let controller, scene, camera, renderer, points = [];

// Set up the basic scene
function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Create the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create the renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a basic light
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Render the scene
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start the WebXR session on user click
document.addEventListener('click', startXRSession);

// Start the XR session when user clicks
function startXRSession(event) {
    // Prevent further clicks from re-triggering session
    document.removeEventListener('click', startXRSession);

    // Check if WebXR is supported
    if (navigator.xr) {
        // Request immersive VR session
        navigator.xr.requestSession('immersive-vr').then(session => {
            // Initialize session and event listeners
            session.addEventListener('selectstart', onSelectStart);
            session.addEventListener('selectend', onSelectEnd);
            controller = new XRController(session);  // Assuming you have a controller class

            // Initialize 3D scene for WebXR
            init();
        }).catch(error => {
            console.error("WebXR session request failed:", error);
        });
    } else {
        console.log("WebXR not supported");
    }
}

// Handle selection start event (when the user selects a point in XR)
function onSelectStart(event) {
    // Get the selected position in the scene (just as an example)
    const mousePosition = new THREE.Vector3();
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Store the point
    points.push(mousePosition);
    console.log(`Point ${points.length}:`, mousePosition);

    // If two points are selected, draw the line
    if (points.length == 2) {
        drawLine(points[0], points[1]);
        calculateDistance(points[0], points[1]);
    }
}

// Handle selection end event (when the user releases the controller or interaction)
function onSelectEnd(event) {
    console.log('Selection ended');
}

// Function to draw a line between two points
function drawLine(pointA, pointB) {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(pointA, pointB);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

// Function to calculate the distance between two points
function calculateDistance(pointA, pointB) {
    const distance = pointA.distanceTo(pointB);
    console.log(`Distance: ${distance.toFixed(2)} units`);
}
