// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
scene.add(player);

// Platforms
const platforms = [];
const platformGeometry = new THREE.BoxGeometry(5, 0.2, 5);
const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
for (let i = 0; i < 5; i++) {
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(
        (Math.random() - 0.5) * 10,
        i * 2 + 0.1,
        (Math.random() - 0.5) * 10
    );
    platforms.push(platform);
    scene.add(platform);
}

// Collectibles
const collectibles = [];
const collectibleGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const collectibleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
for (let i = 0; i < 10; i++) {
    const collectible = new THREE.Mesh(collectibleGeometry, collectibleMaterial);
    collectible.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 0.5,
        (Math.random() - 0.5) * 10
    );
    collectibles.push(collectible);
    scene.add(collectible);
}

// Enemies
const enemies = [];
const enemyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
for (let i = 0; i < 3; i++) {
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 0.5,
        (Math.random() - 0.5) * 10
    );
    enemies.push(enemy);
    scene.add(enemy);
}

// Camera
camera.position.set(0, 2, 10);
camera.lookAt(player.position);

// UI
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
let score = 0;
let lives = 3;

// Physics and controls
const moveSpeed = 0.1;
let velocityY = 0;
const gravity = -0.01;
const jumpPower = 0.2;
let isJumping = false;
let canDoubleJump = false;

const keys = {};
document.addEventListener('keydown', (event) => keys[event.code] = true);
document.addEventListener('keyup', (event) => keys[event.code] = false);

function checkCollision(obj1, obj2) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    return box1.intersectsBox(box2);
}

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
        canDoubleJump = true;
    } else if (keys.Space && canDoubleJump) {
        velocityY = jumpPower * 0.8;
        canDoubleJump = false;
    }

    // Apply gravity
    velocityY += gravity;
    player.position.y += velocityY;

    // Platform collision
    let onPlatform = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform) && velocityY <= 0) {
            player.position.y = platform.position.y + 0.6;
            velocityY = 0;
            isJumping = false;
            canDoubleJump = false;
            onPlatform = true;
        }
    });
    if (!onPlatform && player.position.y <= 0.5) {
        player.position.y = 0.5;
        velocityY = 0;
        isJumping = false;
        canDoubleJump = false;
    }

    // Collectibles
    collectibles = collectibles.filter(collectible => {
        if (checkCollision(player, collectible)) {
            scene.remove(collectible);
            score += 10;
            scoreElement.textContent = score;
            return false;
        }
        return true;
    });

    // Enemies
    enemies.forEach(enemy => {
        enemy.position.y = Math.sin(Date.now() * 0.001 + enemy.id) * 0.5 + enemy.position.y;
        if (checkCollision(player, enemy)) {
            lives--;
            livesElement.textContent = lives;
            player.position.set(0, 0.5, 0);
            velocityY = 0;
            if (lives <= 0) {
                alert("Game Over! Refresh to restart.");
                lives = 3;
                score = 0;
                livesElement.textContent = lives;
                scoreElement.textContent = score;
            }
        }
    });

    // Win condition
    if (score >= 100 && player.position.y > 8) {
        alert("You Win! Refresh to restart.");
        score = 0;
        lives = 3;
        livesElement.textContent = lives;
        scoreElement.textContent = score;
        player.position.set(0, 0.5, 0);
    }

    // Reset
    if (keys.KeyR) {
        player.position.set(0, 0.5, 0);
        velocityY = 0;
    }

    // Camera follow
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 10;
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