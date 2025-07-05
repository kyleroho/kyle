// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player (cube)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5; // Start above platform
scene.add(player);

// Platform
const platformGeometry = new THREE.BoxGeometry(10, 0.2, 10);
const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.position.y = 0;
scene.add(platform);

// Camera position
camera.position.set(0, 2, 5);
camera.lookAt(player.position);

// Player movement variables
const moveSpeed = 0.1;
let velocityY = 0;
const gravity = -0.01;
const jumpPower = 0.2;
let isJumping = false;

// Keyboard controls
const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, Space: false };
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') keys.Space = true;
    else keys[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') keys.Space = false;
    else keys[event.code] = false;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Movement
    if (keys.ArrowLeft) player.position.x -= moveSpeed;
    if (keys.ArrowRight) player.position.x += moveSpeed;
    if (keys.ArrowUp) player.position.z -= moveSpeed;
    if (keys.ArrowDown) player.position.z += moveSpeed;

    // Jumping
    if (keys.Space && !isJumping) {
        velocityY = jumpPower;
        isJumping = true;
    }

    // Apply gravity
    velocityY += gravity;
    player.position.y += velocityY;

    // Ground collision
    if (player.position.y <= 0.5) {
        player.position.y = 0.5;
        velocityY = 0;
        isJumping = false;
    }

    // Update camera to follow player
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 5;
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});