import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/webxr/VRButton.js';

// **Setup scene, camera, and renderer**
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // **Aktifkan XR untuk VR**
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// **Tambahkan pencahayaan agar objek terlihat di VR**
const light = new THREE.HemisphereLight(0xffffff, 0x000000, 4); 
scene.add(light);

// **Tambahkan lantai agar terasa tidak melayang di VR**
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// **Buat kubus**
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, -2);
scene.add(cube);

// **Atur posisi awal kamera (seperti tinggi manusia)**
// **Buat anchor untuk kamera agar bisa diatur di VR**
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

// **Atur posisi awal kamera di luar VR**
camera.position.set(0, 1.6, 0); // Set tinggi kamera seperti tinggi manusia
cameraGroup.position.set(0, 0, 3); // Geser posisi awal pemain di VR

// **Event listener saat masuk ke VR**
renderer.xr.addEventListener('sessionstart', () => {
    cameraGroup.position.set(0, 0, 2); // Atur posisi kamera di VR
});

// **Event listener saat keluar dari VR**
renderer.xr.addEventListener('sessionend', () => {
    cameraGroup.position.set(0, 0, 3); // Kembalikan posisi ke awal
});


// **Animasi dengan VR**
function animate() {
    renderer.setAnimationLoop(() => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    });
}
animate();

// **Interaksi klik (ubah warna)**
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const originalColors = new Map(); // Simpan warna asli setiap objek

window.addEventListener('click', (event) => {
    if (event.target !== renderer.domElement) {
        return; // Abaikan klik di luar canvas
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const object = intersects[0].object;

        // Jika objek belum tersimpan warnanya, simpan warna aslinya
        if (!originalColors.has(object)) {
            originalColors.set(object, object.material.color.getHex());
        }

        // Toggle warna: jika warna sudah berubah, kembalikan ke warna asli
        if (object.material.color.getHex() === 0xff0000) {
            object.material.color.set(originalColors.get(object)); // Kembali ke warna asli
        } else {
            object.material.color.set(0xff0000); // Ubah ke merah
        }
    }
});


// **Interaksi drag untuk rotasi**
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener("mousedown", (event) => {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    let deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
    };

    let rotationSpeed = 0.005;
    cube.rotation.y += deltaMove.x * rotationSpeed;
    cube.rotation.x += deltaMove.y * rotationSpeed;

    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// **Resize window agar responsif**
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
