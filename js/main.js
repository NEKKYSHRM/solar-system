// Importing necessary libraries
import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

// Setting up the speed controls for each planet
let mercury_speed = document.getElementById("mercury");
let venus_speed = document.getElementById("venus");
let earth_speed = document.getElementById("earth");
let mars_speed = document.getElementById("mars");
let jupiter_speed = document.getElementById("jupiter");
let saturn_speed = document.getElementById("saturn");
let uranus_speed = document.getElementById("uranus");
let neptune_speed = document.getElementById("neptune");
const sliders = document.querySelectorAll("input[type='range']");

// Adding event for pause/resume functionality
let isPaused = false;
document.getElementById("toggle-btn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("toggle-btn").textContent = isPaused ? "▶️ Resume" : "⏸ Pause";
});

// Setting up the asteroid belt
const asteroidCount = 150;
const asteroids = [];

// Updating the slider labels with their initial values
sliders.forEach((slider) => {
  const label = document.getElementById(`val-${slider.id}`);
  slider.addEventListener("input", () => {
    label.textContent = slider.value;
  });
});

// Setting up the scene, camera, renderer, controls, skybox, sun, and planets
let scene, camera, renderer, controls, skybox, sun, planets;

// Defining the planet data with their properties
const planetData = [
  {
    name: "Mercury",
    size: 1,
    dist: 25,
    speed: parseFloat(mercury_speed.value) / 5000,
    color: "./img/mercury_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
  },
  {
    name: "Venus",
    size: 2,
    dist: 37,
    speed: parseFloat(venus_speed.value) / 5000,
    color: "./img/venus_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
  },
  {
    name: "Earth",
    size: 2.5,
    dist: 48,
    speed: parseFloat(earth_speed.value) / 5000,
    color: "./img/earth_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
  },
  {
    name: "Mars",
    size: 2,
    dist: 60,
    speed: parseFloat(mars_speed.value) / 5000,
    color: "./img/mars_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
  },
  {
    name: "Jupiter",
    size: 5,
    dist: 70,
    speed: parseFloat(jupiter_speed.value) / 5000,
    color: "./img/jupiter_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
  },
  {
    name: "Saturn",
    size: 4.5,
    dist: 88,
    speed: parseFloat(saturn_speed.value) / 5000,
    color: "./img/saturn_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
    hasRing: true,
  },
  {
    name: "Uranus",
    size: 3.5,
    dist: 105,
    speed: parseFloat(uranus_speed.value) / 5000,
    color: "./img/uranus_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
  },
  {
    name: "Neptune",
    size: 3.5,
    dist: 120,
    speed: parseFloat(neptune_speed.value) / 5000,
    color: "./img/neptune_hd.jpg",
    widthSegments: 100,
    heightSegments: 100,
  },
];

// Function to create an array of materials for the skybox
function createMatrixArray() {
  const skyboxImagePath = [
    "./img/sky/space_rt.png", // px
    "./img/sky/space_lf.png", // nx
    "./img/sky/space_up.png", // py
    "./img/sky/space_dn.png", // ny
    "./img/sky/space_ft.png", // pz
    "./img/sky/space_bk.png", // nz
  ];

  const materialArray = skyboxImagePath.map((path) => {
    return new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(path),
      side: THREE.BackSide,
    });
  });
  return materialArray;
}

// Function to set up the skybox
function setSkybox() {
  const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
  const skyboxMaterial = createMatrixArray();
  skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);
}

// Function to initialize the scene, camera, renderer, controls, sun, and planets
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);

  setSkybox();

  // Sun
  const sunTexture = new THREE.TextureLoader().load("./img/sun_hd.jpg");
  const sunGeometry = new THREE.SphereGeometry(20, 100, 100);
  const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  const sunlight = new THREE.PointLight(0xffffff, 2, 1000);
  sunlight.position.set(0, 0, 0);
  scene.add(sunlight);

  // Create Planets
  planets = planetData.map((planet) => {
    const planetMesh = loadPlanetTexture(
      planet.color,
      planet.size,
      planet.widthSegments,
      planet.heightSegments,
      "basic"
    );

    planetMesh.userData = {
      speed: planet.speed,
      distance: planet.dist,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: Math.random() * 0.02 + 0.005,
    };

    // Add rings
    if (planet.hasRing) {
      const ringTexture = new THREE.TextureLoader().load("../img/saturn_ring.jpg");
      const ringGeometry = new THREE.RingGeometry(planet.size + 1, planet.size + 3, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, transparent: true });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.01;
      planetMesh.add(ring);
    }

    scene.add(planetMesh);
    return planetMesh;
  });

  // Attach speed slider listeners now that planets[] is ready
  setupSpeedControl("mercury", mercury_speed);
  setupSpeedControl("venus", venus_speed);
  setupSpeedControl("earth", earth_speed);
  setupSpeedControl("mars", mars_speed);
  setupSpeedControl("jupiter", jupiter_speed);
  setupSpeedControl("saturn", saturn_speed);
  setupSpeedControl("uranus", uranus_speed);
  setupSpeedControl("neptune", neptune_speed);
}

// Function to set up speed control for a specific planet
function setupSpeedControl(planetName, inputElement) {
  const index = planetData.findIndex((p) => p.name.toLowerCase() === planetName);
  if (index !== -1 && planets[index]) {
    // Set initial speed
    planets[index].userData.speed = parseFloat(inputElement.value) / 5000;

    // Update on input
    inputElement.addEventListener("input", () => {
      planets[index].userData.speed = parseFloat(inputElement.value) / 5000;
    });
  }
}

// Main animation loop
function animate(time) {
  if (!isPaused) {
    sun.rotation.y += 0.001;

    planets.forEach((planet) => {
      planet.userData.angle += planet.userData.speed;
      const dist = planet.userData.distance;
      planet.position.x = Math.cos(planet.userData.angle) * dist;
      planet.position.z = Math.sin(planet.userData.angle) * dist;
      planet.rotation.y += 0.01;
    });

    asteroids.forEach((asteroid) => {
      asteroid.userData.angle += asteroid.userData.speed;
      const dist = asteroid.userData.distance;
      asteroid.position.x = Math.cos(asteroid.userData.angle) * dist;
      asteroid.position.z = Math.sin(asteroid.userData.angle) * dist;
    });
  }

  controls.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// function to load planet texture and create a mesh
function loadPlanetTexture(
  texture,
  radius,
  widthSegments,
  heightSegments,
  meshType
) {
  const geometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );
  const material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(texture),
    roughness: 1,
    metalness: 0.1,
  });

  const planet = new THREE.Mesh(geometry, material);
  scene.add(planet);

  return planet;
}

init();
animate(0);

// Function to create asteroids in the asteroid belt
function createAsteroids() {
  for (let i = 0; i < asteroidCount; i++) {
    const size = Math.random() * 0.3 + 0.1; // Very small
    const geometry = new THREE.SphereGeometry(size, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.userData = {
      distance: Math.random() * 40 + 50, // Between 50 and 90 units from center
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.001 + 0.0002, // Very slow
      verticalOffset: (Math.random() - 0.5) * 4, // Y offset to simulate 3D belt
    };

    mesh.position.y = mesh.userData.verticalOffset;
    scene.add(mesh);
    asteroids.push(mesh);
  }
}

createAsteroids();

