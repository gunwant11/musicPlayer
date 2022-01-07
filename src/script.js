import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'
import * as noise from './perlin'
import { MirroredRepeatWrapping } from 'three'
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// stage
window.addEventListener('click', onClick);
window.addEventListener('mousemove', onMouseMove);
var mixer, actions, prevPosition, playPosition, nextPosition, i = 0,
    center, camera;
const gui = new dat.GUI()
const loadingManager = new THREE.LoadingManager()
const gltfLoader = new GLTFLoader()
const blobGltfLoader = new GLTFLoader()


var audio = document.querySelector('audio')


const songTitles = ['sia', 'theme']
let source = null;



function loadSong(i = 0) {
    audio.src = songTitles[i] + '.mp3'
    console.log(songTitles[i] + '.mp3')
    audio.load()
    audio.play()
}
let audioCtx = null;
let analyser = null;
let dataArray = null;
let bufferLength = 0;

function createAudioContext() {
    if (source) {
        source.disconnect();
        source = null;
    }
    audioCtx = new(window.webkitAudioContext || window.AudioContext || false)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    audio.oncanplay = true

}
let isPlaying = true




createAudioContext()

let baseModel

gltfLoader.load('base.gltf', (gltf) => {

    baseModel = gltf.scene
    const baseMaterialTop = new THREE.MeshStandardMaterial({
        color: 0x909090,
        emissive: 0x00000,
        roughness: 0,
        metalness: 0
    });
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x909090,
        emissive: 0x00000,
        roughness: 0,
        metalness: 0
    });

    console.log(baseModel)

    scene.add(gltf.scene);
    gltf.scene.scale.set(.8, .8, .8)
    gltf.scene.position.set(0.08, -1.9, 0.15)
    gltf.scene.rotation.set(-0.324, -1.56, 0)


    console.log("gltf loaded")
})

blobGltfLoader.load('blob.gltf', (gltf) => {

    //scene.add(gltf.scene);
    gltf.scene.scale.set(.4, .4, .4)
    gltf.scene.position.set(0.08, -1.885, 0.15)
    gltf.scene.rotation.set(-0.324, -1.56, 0)
    console.log("gltf loaded")
})



// Texture


loadingManager.onStart = () => {
    console.log("onstart")
}
loadingManager.onProgress = () => {
    console.log("onProgress")
}
loadingManager.onError = () => {
    console.log("onError")
}
loadingManager.onLoad = () => {
    console.log("onLoad")
}
const textureLoader = new THREE.TextureLoader(loadingManager)
const texture = textureLoader.load('metal12.jpg')


// texture.wrapS = THREE.RepeatWrapping;
// texture.wrapT = THREE.RepeatWrapping;
// texture.repeat.set(2, 1);



const geometry = new THREE.SphereGeometry(23, 100, 100);
geometry.setAttribute("basePosition", new THREE.BufferAttribute().copy(geometry.attributes.position));
const material = new THREE.MeshStandardMaterial({
    color: 0x909090,
    emissive: 0x00000,
    roughness: 0,
    map: texture,
    metalness: 0
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Size 

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
        // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// light 

const AmbientLight = new THREE.AmbientLight(0xffffff, 0.4)
const pointLight = new THREE.PointLight(0xffffff, 1)
const spotLight = new THREE.SpotLight(0x0000ff, 1)
const light = new THREE.DirectionalLight(0xffff00, 2);
const helper = new THREE.DirectionalLightHelper(light, 1);
scene.add(helper);

spotLight.position.set(-6, 11, 9)
pointLight.position.set(6, 11, 9)
spotLight.distance = 200
spotLight.penumbra = 1;
spotLight.decay = 1
spotLight.angle = 0.5
light.rotation.z = Math.PI
light.position.y = -2

// gui.add(pointLight.position, "x", -60, -50, 1)
// gui.add(pointLight.position, "y", 50, 70, 1)
// gui.add(pointLight.position, "z", 50, 90, 1)
scene.add(light);
scene.add(AmbientLight)
scene.add(spotLight)
scene.add(pointLight)
const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
scene.add(pointLightHelper);

//



const move = (a, k, high) => {
    const basePositionAttribute = sphere.geometry.getAttribute("basePosition");
    const positionAttribute = sphere.geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    k = k * 0.0002
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(basePositionAttribute, i);
        //console.log(vertex)
        var perlin = noise.noise.simplex3(
            vertex.x * k + a * 0.0005,
            vertex.y * k,
            vertex.z * k);

        var ratio = perlin * 0.4 + 0.8;
        vertex.normalize().multiplyScalar(ratio);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    sphere.geometry.attributes.position.normalsNeedUpdate = true;
    sphere.geometry.attributes.position.verticesNeedUpdate = true;
    sphere.geometry.attributes.position.needsUpdate = true;
    sphere.geometry.computeVertexNormals();
    sphere.geometry.computeBoundingSphere();
    gsap.to(sphere.rotation, { duration: 1, y: sphere.rotation.y + high * 0.01 })

}
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children[8].children)
    console.log(scene.children)

    console.log(i)
    if (intersects[0].object.name == "NextBtn") {
        i++;
        loadSong(i)
    }
    if (intersects[0].object.name == "PrevBtn") {
        i--;
        loadSong(i)
    }
    if (intersects[0].object.name == "Cube" || intersects[0].object.name == "Cylinder") {
        if (isPlaying) { loadSong() } else audio.pause()
        isPlaying = !isPlaying
    }


}
var mouseTolerance = 0.0003;

function onMouseMove(e) {
    var centerX = window.innerWidth * 0.5;
    var centerY = window.innerHeight * 0.5;

    camera.position.x = ((e.clientX - centerX) * mouseTolerance);
    //camera.position.y = (e.clientY - centerY) * mouseTolerance;
    camera.position.z += (e.clientY - centerY) * mouseTolerance * 0.01;

}

/**
 * Camera
 */
// Base camera
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 4
scene.add(camera)
    // Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
    /**
     * Renderer
     */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    //alpha: true


})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    /**
     * Animate
     */

let distortion = 1,
    high = 1;


const animate = (a) => {

    move(a, distortion, high)
        //nametexture.rotation += 0.01

    renderer.render(scene, camera)
    window.requestAnimationFrame(animate)
    analyser.getByteFrequencyData(dataArray);
    // console.log(dataArray)
    distortion = dataArray[40];
    high = dataArray[70]

}


// rotate()

animate()