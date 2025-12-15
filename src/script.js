import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import gpgpuStrandsShader from './shaders/gpgpu/strands.glsl'
import { add_box_random_points } from './scene_utils.js'
import { populate_strand_node_texture } from './strand_node_texture_utils.js'
import { build_strand_node_uvs, build_strand_line_attributes } from './strand_geometry_builders.js'

/**
 * Scene Info
 */
export const sceneInfo = {
    gravity: -30.0,
    dt: 0.01,
    numSubSteps: 5,
    mass: 0.5,
    len: 0.25,
    angle: Math.PI,
    num_strands: 31000
};

/**
 * Stats
 */
const stats = new Stats();
document.body.appendChild(stats.dom);

/**
 * GUI
 */
const sceneControl = {
    wind: 1.5,
}
const gui = new GUI({ width: 340 })
gui.add(sceneControl, 'wind', -2, 2, 0.1).name('Wind');


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Mouse
let isMouseDown = false;
const mouse = new THREE.Vector2()
window.addEventListener('mousedown', (event) => {
    isMouseDown = true;
});
window.addEventListener('mouseup', (event) => {
    isMouseDown = false;
});
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    strands.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100)
camera.position.z = 4;
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = true;

// Raycaster
const raycaster = new THREE.Raycaster();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Geometry
 */
let [ ref_plane, boxMesh, sphere_guide, positions ] = add_box_random_points(sceneInfo.num_strands)
scene.add(ref_plane)
scene.add(boxMesh)
scene.add(sphere_guide)

// Base Geometry
const baseGeometry = {}
baseGeometry.rootCount = positions.length / 3
baseGeometry.childrenPerRoot = 2
baseGeometry.nodesPerRoot = 1 + baseGeometry.childrenPerRoot
baseGeometry.totalNodes = baseGeometry.rootCount * baseGeometry.nodesPerRoot
baseGeometry.attrsPerNode = 3;                         // pos, prev, vel
baseGeometry.texelCount = baseGeometry.totalNodes * baseGeometry.attrsPerNode


/**
 * GPU Compute
 */
// Setup
const gpgpu = {}
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.texelCount))
gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer)
console.log("root count", baseGeometry.rootCount, "\ngpu size:", gpgpu.size)

// Base Strands
const baseStrandsTexture = gpgpu.computation.createTexture()


let data = baseStrandsTexture.image.data
data = populate_strand_node_texture(data, positions, baseGeometry, sceneInfo)

// Strands variable
gpgpu.strandsVariable = gpgpu.computation.addVariable('uStrands', gpgpuStrandsShader, baseStrandsTexture)
gpgpu.computation.setVariableDependencies(gpgpu.strandsVariable, [gpgpu.strandsVariable])
gpgpu.strandsVariable.material.uniforms.rootCount = new THREE.Uniform(baseGeometry.rootCount)
gpgpu.strandsVariable.material.uniforms.state = new THREE.Uniform(0)
gpgpu.strandsVariable.material.uniforms.dt = new THREE.Uniform(sceneInfo.dt)
gpgpu.strandsVariable.material.uniforms.gravity = new THREE.Uniform(sceneInfo.gravity)
gpgpu.strandsVariable.material.uniforms.len = new THREE.Uniform(sceneInfo.len)
gpgpu.strandsVariable.material.uniforms.rnd_wind = new THREE.Uniform(0)
gpgpu.strandsVariable.material.uniforms.isMouseDown = new THREE.Uniform(false)
gpgpu.strandsVariable.material.uniforms.guide = new THREE.Vector3(0, 0, 0.5)

// Init
gpgpu.computation.init()

/**
 * Strands
 */
const strands = {}

const strandsUvArray = build_strand_node_uvs(baseGeometry, gpgpu)
const [lineUv, aT, totalSegments] = build_strand_line_attributes(strandsUvArray, baseGeometry)

strands.geometry = new THREE.BufferGeometry()
strands.geometry.setDrawRange(0, totalSegments * 2)
strands.geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(lineUv, 2))
strands.geometry.setAttribute('aT', new THREE.BufferAttribute(aT, 1));

// Material
strands.material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms:
    {
        uSize: new THREE.Uniform(0.2),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uColor: { value: new THREE.Color('crimson') },
        uParticlesTexture: new THREE.Uniform()
    }
})

strands.lines = new THREE.LineSegments(strands.geometry, strands.material)
scene.add(strands.lines)


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    stats.begin();

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObject(ref_plane)
    if(intersects.length > 0) {
        sphere_guide.position.copy(intersects[0].point);
    } else {
        isMouseDown = false
    }

    // const elapsedTime = clock.getElapsedTime()
    // const deltaTime = elapsedTime - previousTime
    // previousTime = elapsedTime

    gpgpu.strandsVariable.material.uniforms.dt.value = sceneInfo.dt
    gpgpu.strandsVariable.material.uniforms.rnd_wind.value = (Math.random() * sceneControl.wind);
    gpgpu.strandsVariable.material.uniforms.isMouseDown.value = isMouseDown
    gpgpu.strandsVariable.material.uniforms.guide.value = sphere_guide.position;

    // Update controls
    controls.update()

    // GPGPU Update
    state = 0
    for (var i = 0, state = 0; i < 8; i++, state++) {
        gpgpu.strandsVariable.material.uniforms.state.value = state
        gpgpu.computation.compute()
    }

    strands.material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.strandsVariable).texture

    // Render normal scene
    renderer.render(scene, camera)

    stats.end();

    window.requestAnimationFrame(tick)
}

tick()