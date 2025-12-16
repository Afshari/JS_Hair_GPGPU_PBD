
import * as THREE from 'three'

// [ ] - Add labels for strands & particles in lil-gui
// [ ] - limit framerate
// [ ] - Add text for help/guide in lil-gui

function draw_plane(p_width, p_height, z_front_world) {

    const geometry = new THREE.PlaneGeometry(p_width, p_height); // width, height
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1
    });

    let ref_plane = new THREE.Mesh(geometry, material);
    ref_plane.position.z = z_front_world
    return ref_plane
}

export function add_box_random_points(num_strands) {
    const box_width = 4;
    const box_height = 5;
    const box_depth = 1;

    const box_geo = new THREE.BoxGeometry(box_width, box_height, box_depth);
    const box_mat = new THREE.MeshStandardMaterial({
        color: 0x156289,
        metalness: 0.2,
        roughness: 0.7,
        wireframe: true
    });

    let box_mesh = new THREE.Mesh(box_geo, box_mat);
    box_mesh.position.set(0, 0, 0);
    box_mesh.visible = false;

    box_geo.computeBoundingBox();
    const bb = box_geo.boundingBox;

    const z_front_local = bb.max.z;
    const z_front_world = z_front_local + box_mesh.position.z;

    const x_min = bb.min.x + box_mesh.position.x;
    const x_max = bb.max.x + box_mesh.position.x;
    const y_min = bb.min.y + box_mesh.position.y;
    const y_max = bb.max.y + box_mesh.position.y;

    const points = [];

    for (let i = 0; i < num_strands; i++) {
        const x = THREE.MathUtils.lerp(x_min, x_max, Math.random());
        const z = z_front_world;
        const y = THREE.MathUtils.lerp(y_min, y_max, Math.random());

        const p = new THREE.Vector3(x, y, z);
        points.push(p);
    }

    const sphereGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let sphere_guide = new THREE.Mesh(sphereGeo, sphereMat);
    sphere_guide.position.z = z_front_world;
    sphere_guide.visible = false;

    let positions = []
    for (let i = 0; i < points.length; i++) {
        positions.push(points[i].x, points[i].y, points[i].z)
    }

    let ref_plane = draw_plane(box_width, box_height, z_front_world)
    
    return [ ref_plane, box_mesh, sphere_guide, positions ]
}

