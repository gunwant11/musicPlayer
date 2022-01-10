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


const songTitles = ['painter', 'theme', 'castle']
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
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x252525,
        emissive: 0x00000,
        roughness: 0.5,
        metalness: 0
    });
    const baseMaterial2 = new THREE.MeshStandardMaterial({
        color: 0x333333,
        emissive: 0x00000,
        roughness: 0.5,
        metalness: 0
    });
    baseModel.children.forEach((x) => x.material = baseMaterial)
        // const color2 = new THREE.Color(0xff0000);
    baseModel.children[2].material = baseMaterial2
    console.log(baseModel.children)

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

// function createRandomballs(i) {
//     var r = 0.2 * Math.random() * i
//     console.log(r)
//     const ballGeometry = new THREE.SphereGeometry(r, 16, 16);
//     const ball = new THREE.Mesh(ballGeometry, material);
//     scene.add(ball);
//     var pos = (Math.random() * i) - 0.5
//     console.log(pos)
//     ball.position.set(pos, pos, pos)
// }

// const particleBall = new THREE.BufferGeometry;
// const particleCnt = 5000;

// const posArray = new Float32Array(particleCnt * 3);

// for (let i = 0; i < particleCnt * 3; i++) {
//     posArray[i] = Math.random()
// }
// particleBall.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

// const particleMesh = new THREE.Points(particleBall, material)
// scene.add(particleMesh)


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
const spotLight1 = new THREE.SpotLight(0x0000ff, 1)
const spotLight2 = new THREE.SpotLight(0xff00ff, 1)
const spotLight3 = new THREE.SpotLight(0x0000ff, 1)
const spotLight4 = new THREE.SpotLight(0x0000ff, 1)
const light = new THREE.DirectionalLight(0xffff00, 2);
const helper = new THREE.DirectionalLightHelper(light, 1);
scene.add(helper);

spotLight1.position.set(-6, 11, 9)
spotLight2.position.set(-6, 5, 1)
spotLight3.position.set(6, 5, 1)
spotLight4.position.set(-6, 11, 1)
pointLight.position.set(6, 11, 9)
spotLight1.distance = 200
spotLight1.penumbra = 1;
spotLight1.decay = 1
spotLight1.angle = 0.5
light.rotation.z = Math.PI
light.position.y = -2

// gui.add(pointLight.position, "x", -60, -50, 1)
// gui.add(pointLight.position, "y", 50, 70, 1)
// gui.add(pointLight.position, "z", 50, 90, 1)
scene.add(light);
scene.add(AmbientLight)
scene.add(spotLight1)
scene.add(spotLight2)
scene.add(spotLight3)
scene.add(spotLight4)
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
    const intersects = raycaster.intersectObjects(scene.children[11].children)
    console.log(scene.children)

    console.log(i)
    if (intersects[0].object.name == "NextBtn") {
        i++;
        isPlaying = false
        checkLenght()
        loadSong(i)
    }
    if (intersects[0].object.name == "PrevBtn") {
        i--;
        isPlaying = false
        checkLenght()
        loadSong(i)
    }
    if (intersects[0].object.name == "Cube" || intersects[0].object.name == "Cylinder") {
        checkLenght()
        if (isPlaying) { loadSong(i) } else audio.pause()
        isPlaying = !isPlaying

    }


}

function checkLenght() {

    if (i > (songTitles.length - 1)) {
        i = 0
    }
}
var mouseTolerance = 0.0002;

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
    // const controls = new OrbitControls(camera, canvas)
    // controls.enableDamping = true
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