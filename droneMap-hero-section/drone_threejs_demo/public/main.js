import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let rotorMeshes = [];
let spinning = true;
let rpm = 2000;

init();
animate();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202428);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(4,3,6);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.7);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5,10,7);
  dir.castShadow = true;
  scene.add(dir);

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(50,50), new THREE.MeshStandardMaterial({color:0x111214}));
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -0.5;
  scene.add(ground);

  // Drone group
  const drone = new THREE.Group();
  scene.add(drone);

  // Body - central pod
  const bodyMat = new THREE.MeshStandardMaterial({metalness:0.6, roughness:0.4});
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), bodyMat);
  body.castShadow = true;
  drone.add(body);

  // Arms
  const armGeom = new THREE.BoxGeometry(1.8, 0.12, 0.12);
  const armMat = new THREE.MeshStandardMaterial({color:0x333333, metalness:0.3, roughness:0.6});
  function addArm(angle){
    const arm = new THREE.Mesh(armGeom, armMat);
    arm.position.set(Math.cos(angle)*0.9, 0, Math.sin(angle)*0.9);
    arm.rotation.y = -angle;
    arm.castShadow = true;
    drone.add(arm);
    return arm;
  }
  addArm(0);
  addArm(Math.PI/2);
  addArm(Math.PI);
  addArm(-Math.PI/2);

  // Propeller holder + rotors (separate meshes)
  const propHolderMat = new THREE.MeshStandardMaterial({color:0x222222, metalness:0.4, roughness:0.5});
  const rotorMat = new THREE.MeshStandardMaterial({color:0x111111, metalness:0.2, roughness:0.8});

  const propOffset = 1.1;
  const rotorRadius = 0.45;
  const hubGeom = new THREE.CylinderGeometry(0.06,0.06,0.12,12);
  const bladeGeom = new THREE.BoxGeometry(rotorRadius*2, 0.02, 0.12);

  const positions = [
    [ propOffset, 0, 0],
    [ 0, 0, propOffset],
    [-propOffset, 0, 0],
    [ 0, 0,-propOffset]
  ];

  positions.forEach((pos, i) => {
    const holder = new THREE.Mesh(new THREE.BoxGeometry(0.16,0.08,0.16), propHolderMat);
    holder.position.set(pos[0], pos[1], pos[2]);
    holder.castShadow = true;
    drone.add(holder);

    // rotor group
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(pos[0], pos[1]+0.06, pos[2]);
    // hub
    const hub = new THREE.Mesh(hubGeom, propHolderMat);
    hub.rotation.z = Math.PI/2;
    hub.castShadow = true;
    rotorGroup.add(hub);

    // blades (two perpendicular blades)
    const blade1 = new THREE.Mesh(bladeGeom, rotorMat);
    blade1.position.set(0,0,0);
    blade1.castShadow = true;
    rotorGroup.add(blade1);

    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI/2;
    rotorGroup.add(blade2);

    // set pivot for rotation to group origin
    scene.add(rotorGroup);
    rotorMeshes.push(rotorGroup);
  });

  // slight rotation for nicer view
  drone.rotation.x = 0.05;
  drone.position.y = 0.6;

  // UI
  const toggle = document.getElementById('toggleSpin');
  toggle.addEventListener('click', () => {
    spinning = !spinning;
    toggle.textContent = spinning ? 'Pause Rotors' : 'Resume Rotors';
  });
  const rpmSlider = document.getElementById('rpm');
  const rpmVal = document.getElementById('rpmVal');
  rpmSlider.addEventListener('input', (e) => {
    rpm = Number(e.target.value);
    rpmVal.textContent = rpm;
  });

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
  requestAnimationFrame(animate);
  controls.update();

  // rotate rotors
  if(spinning){
    // rpm -> deg per sec = rpm * 360 / 60
    const degPerSec = rpm * 360 / 60;
    const radPerSec = degPerSec * (Math.PI/180);
    const delta = Math.min(0.05, renderer.info.render.frame ? 0.016 : 0.016); // rough delta
    rotorMeshes.forEach((r, idx) => {
      // alternate spin directions for realism
      const dir = (idx % 2 === 0) ? 1 : -1;
      r.rotateY(dir * radPerSec * delta);
    });
  }

  renderer.render(scene, camera);
}
