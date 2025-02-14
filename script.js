let xrSession = null;
let xrRefSpace = null;
let scene, camera, renderer;
let points = [];
let distances = [];

async function startAR() {
    if (!navigator.xr) {
        alert("WebXR not supported on this device.");
        return;
    }

    try {
        xrSession = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["local-floor", "hit-test"]
        });

        const gl = document.createElement("canvas").getContext("webgl");
        renderer = new THREE.WebGLRenderer({ canvas: gl.canvas, alpha: true });
        xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });

        xrSession.requestReferenceSpace("local-floor").then((refSpace) => {
            xrRefSpace = refSpace;
            xrSession.requestAnimationFrame(onXRFrame);
        });

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        document.body.appendChild(renderer.domElement);
        xrSession.addEventListener("select", onSelect);
    } catch (error) {
        console.error("Error starting WebXR session:", error);
    }
}

function onXRFrame(time, frame) {
    let session = frame.session;
    session.requestAnimationFrame(onXRFrame);

    let pose = frame.getViewerPose(xrRefSpace);
    if (!pose) return;

    renderer.render(scene, camera);
}

function onSelect(event) {
    const referenceSpace = xrSession.requestReferenceSpace("local-floor");
    const hitTestSource = xrSession.requestHitTestSource({ space: referenceSpace });

    hitTestSource.then((source) => {
        source.requestAnimationFrame((timestamp, frame) => {
            let hitPose = frame.getHitTestResults(source);
            if (hitPose.length > 0) {
                let pos = hitPose[0].getPose(xrRefSpace).transform.position;
                addPoint(pos);
            }
        });
    });
}

function addPoint(position) {
    let geometry = new THREE.SphereGeometry(0.05, 16, 16);
    let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let point = new THREE.Mesh(geometry, material);
    point.position.set(position.x, position.y, position.z);
    scene.add(point);
    points.push(point);

    if (points.length > 1) {
        let prev = points[points.length - 2];
        let distance = prev.position.distanceTo(point.position);
        distances.push(distance);
        console.log(`Distance: ${distance.toFixed(2)} meters`);
    }
}

document.getElementById("start-ar").addEventListener("click", startAR);
