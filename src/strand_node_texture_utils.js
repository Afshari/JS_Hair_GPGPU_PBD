
function texel_base(nodeIndex, attrIndex, baseGeometry) {
    const texelIndex = nodeIndex * baseGeometry.attrsPerNode + attrIndex;
    return texelIndex * 4; // 4 floats per texel
}

export function populate_strand_node_texture(data, positions, baseGeometry, sceneInfo) {

    for (let i = 0; i < baseGeometry.rootCount; i++) {

        // geometry indices
        const i3 = i * 3;
        const root_x = positions[i3 + 0]
        const root_y = positions[i3 + 1]
        const root_z = positions[i3 + 2]

        // node indices
        const rootNode = i * baseGeometry.nodesPerRoot + 0;
        const child1Node = i * baseGeometry.nodesPerRoot + 1;
        const child2Node = i * baseGeometry.nodesPerRoot + 2;

        // ----- ROOT -----
        // pos
        let b = texel_base(rootNode, 0, baseGeometry);
        data[b + 0] = root_x;
        data[b + 1] = root_y;
        data[b + 2] = root_z;
        data[b + 3] = 0;           // mass

        // prev_pos = pos
        b = texel_base(rootNode, 1, baseGeometry);
        data[b + 0] = root_x;
        data[b + 1] = root_y;
        data[b + 2] = root_z;

        // vel = 0
        b = texel_base(rootNode, 2, baseGeometry);
        data[b + 0] = data[b + 1] = data[b + 2] = 0;

        // ----- CHILD 1 -----
        // compute child_x, child_y, child_z
        let child_x = root_x + sceneInfo.len * Math.sin(sceneInfo.angle);
        let child_y = root_y + sceneInfo.len * Math.cos(sceneInfo.angle);
        let child_z = root_z;

        // pos
        b = texel_base(child1Node, 0, baseGeometry);
        data[b + 0] = child_x;
        data[b + 1] = child_y;
        data[b + 2] = child_z;
        data[b + 3] = sceneInfo.mass;

        // prev_pos = pos
        b = texel_base(child1Node, 1, baseGeometry);
        data[b + 0] = child_x;
        data[b + 1] = child_y;
        data[b + 2] = child_z;

        // vel = 0
        b = texel_base(child1Node, 2, baseGeometry);
        data[b + 0] = data[b + 1] = data[b + 2] = 0;

        // ----- CHILD 2-----
        // compute child_x, child_y, child_z
        child_x = root_x + sceneInfo.len * Math.sin(sceneInfo.angle);
        child_y = root_y + sceneInfo.len * Math.cos(sceneInfo.ang);
        child_z = root_z;

        // pos
        b = texel_base(child2Node, 0, baseGeometry);
        data[b + 0] = child_x;
        data[b + 1] = child_y;
        data[b + 2] = child_z;
        data[b + 3] = sceneInfo.mass;

        // prev_pos = pos
        b = texel_base(child2Node, 1, baseGeometry);
        data[b + 0] = child_x;
        data[b + 1] = child_y;
        data[b + 2] = child_z;

        // vel = 0
        b = texel_base(child2Node, 2, baseGeometry);
        data[b + 0] = data[b + 1] = data[b + 2] = 0;
    }

    return data
}
