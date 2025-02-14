import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

let scene, camera, renderer;
let controller;
let points = [];
let lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add AR button
    document.getElementById("startAR").addEventListener("click", () => {
        document.body.appendChild(ARButton.createButton(renderer));
    });

    // Controller for AR input
    controller = renderer.xr.getController(0);
    controller.addEventListener('selectstart', onSelect);
    scene.add(controller);

    animate();
}

// Handle User Tap for Measurement
function onSelect() {
    let point = new THREE.Vector3();
    controller.getWorldPosition(point);
    
    let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    sphere.position.copy(point);
    scene.add(sphere);
    
    points.push(point);
    if (points.length > 1) {
        drawLine(points[points.length - 2], points[points.length - 1]);
        measureDistance(points[points.length - 2], points[points.length - 1]);
    }
}

// Draw Line Between Points
function drawLine(start, end) {
    let geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    let line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
}

// Measure Distance Between Two Points
function measureDistance(p1, p2) {
    let distance = p1.distanceTo(p2);
    document.getElementById("output").innerText = `Distance: ${distance.toFixed(2)} meters`;
}

// Animation Loop
function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

// Start the App
init();
