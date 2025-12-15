
import * as THREE from 'three'

function draw_plane(pWidth, pHeight, zFrontWorld) {

    const geometry = new THREE.PlaneGeometry(pWidth, pHeight); // width, height
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1
    });

    let ref_plane = new THREE.Mesh(geometry, material);
    ref_plane.position.z = zFrontWorld
    return ref_plane
}

export function add_box_random_points(num_strands) {
    const boxWidth = 4;
    const boxHeight = 5;
    const boxDepth = 1;

    const boxGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const boxMat = new THREE.MeshStandardMaterial({
        color: 0x156289,
        metalness: 0.2,
        roughness: 0.7,
        wireframe: true
    });

    let boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.set(0, 0, 0);
    boxMesh.visible = false;

    boxGeo.computeBoundingBox();
    const bb = boxGeo.boundingBox;

    const zFrontLocal = bb.max.z;
    const zFrontWorld = zFrontLocal + boxMesh.position.z;

    const xMin = bb.min.x + boxMesh.position.x;
    const xMax = bb.max.x + boxMesh.position.x;
    const yMin = bb.min.y + boxMesh.position.y;
    const yMax = bb.max.y + boxMesh.position.y;

    const points = [];

    for (let i = 0; i < num_strands; i++) {
        const x = THREE.MathUtils.lerp(xMin, xMax, Math.random());
        const z = zFrontWorld;
        const y = THREE.MathUtils.lerp(yMin, yMax, Math.random());

        const p = new THREE.Vector3(x, y, z);
        points.push(p);
    }

    const sphereGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let sphere_guide = new THREE.Mesh(sphereGeo, sphereMat);
    sphere_guide.position.z = zFrontWorld;
    sphere_guide.visible = false;

    let positions = []
    for (let i = 0; i < points.length; i++) {
        positions.push(points[i].x, points[i].y, points[i].z)
    }

    let ref_plane = draw_plane(boxWidth, boxHeight, zFrontWorld)
    
    return [ ref_plane, boxMesh, sphere_guide, positions ]
}

