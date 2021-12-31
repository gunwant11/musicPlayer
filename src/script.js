import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// stage

const gui = new dat.GUI()

const gltfLoader = new GLTFLoader()

gltfLoader.load('music.gltf', (gltf) => {

    scene.add(gltf.scene);
    gltf.scene.scale.set(-0.122, 0.105, 0.135)
        // x = -0.122 
        // y = 0.105
        //z = 0.135
    gltf.scene.position.set(0.08, -0.5, 0.15)
        // x = 0.08
        // y = -0.5
        // z = 0.15
        // gui.add(gltf.scene.rotation, "x").min(0).max(9)
        // gui.add(gltf.scene.rotation, "y").min(0).max(9)
        // gui.add(gltf.scene.rotation, "z").min(0).max(9)
    gui.add(gltf.scene.scale, "x", -3, 3, 0.001).name('scalex')
    gui.add(gltf.scene.scale, "y", -3, 3, 0.001).name('scaley')
    gui.add(gltf.scene.scale, "z", -3, 3, 0.001).name('scalez')
    gui.add(gltf.scene.position, "x", -3, 3, 0.001)
    gui.add(gltf.scene.position, "y", -3, 3, 0.001)
    gui.add(gltf.scene.position, "z", -3, 3, 0.001)
    console.log("gltf loaded")
})


const geometry = new THREE.SphereGeometry(.2, 32, 16);

const material = new THREE.MeshStandardMaterial({ color: 0x5e5959, roughness: 0, metalness: 0 });
const sphere = new THREE.Mesh(geometry, material);
const sphere1 = new THREE.Mesh(geometry, material);
const sphere2 = new THREE.Mesh(geometry, material);
const sphere3 = new THREE.Mesh(geometry, material);
const sphere4 = new THREE.Mesh(geometry, material);

sphere1.position.set(.4, -0.2, 0)
sphere2.position.set(.7, -0.2, 0)
sphere3.position.set(0.8, 0, 0)
sphere4.position.set(0.7, 0.2, 0)

sphere1.scale.set(.2, .2, .2)
sphere2.scale.set(.2, .2, .2)
sphere3.scale.set(.2, .2, .2)
sphere4.scale.set(.2, .2, .2)

scene.add(sphere);
scene.add(sphere1);
scene.add(sphere2);
scene.add(sphere3);
scene.add(sphere4);
sphere.rotation.z
const rotate = () => {
    for (let i = 1; i < 5; i++) {
        let x = (sphere + i)
        console.log(x)
        gsap.to(sphere.rotation, { duration: 50, y: sphere.rotation.y + 100 })

    }
}


// Size 

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// light 

const AmbientLight = new THREE.AmbientLight(0xffffff, 1)
const pointLight = new THREE.PointLight(0xffffff, 1)
const spotLight = new THREE.SpotLight(0xeaff00, 1)
spotLight.position.set(-0.3, 0.4, 0.3)
pointLight.position.set(0.5, 0.5, 0.5)
spotLight.distance = 200
spotLight.penumbra = 1;
spotLight.decay = 1
spotLight.angle = 0.5

scene.add(AmbientLight)
scene.add(spotLight)
scene.add(pointLight)

/**
  Fullscreen
 */
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    // Render
    controls.update()
    renderer.render(scene, camera)
        // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
rotate()

tick()