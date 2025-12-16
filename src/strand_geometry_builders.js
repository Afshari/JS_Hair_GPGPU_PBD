
export function build_strand_node_uvs(base_geometry, gpgpu) {

    const strands_uv_array = new Float32Array(base_geometry.totalNodes * 2)

    for (let node = 0; node < base_geometry.totalNodes; node++) {

        // texel index for the pos attribute of this node
        const texel_index = node * base_geometry.attrsPerNode + 0;  // 0 = pos

        // convert texelIndex -> (x, y)
        const x = texel_index % gpgpu.size;
        const y = Math.floor(texel_index / gpgpu.size);

        // compute UV
        const uv_x = (x + 0.5) / gpgpu.size;
        const uv_y = (y + 0.5) / gpgpu.size;

        // store UV
        const i2 = node * 2;
        strands_uv_array[i2 + 0] = uv_x;
        strands_uv_array[i2 + 1] = uv_y;
    }

    return strands_uv_array
}

export function build_strand_line_attributes(strands_uv_array, base_geometry) {
    
    const segmentsPerRoot = base_geometry.nodesPerRoot - 1;
    const totalSegments = base_geometry.rootCount * segmentsPerRoot;
    const lineUv = new Float32Array(totalSegments * 2 * 2);

    const aT = new Float32Array(totalSegments * 2);

    let j = 0;
    let v = 0;      // vertex index

    for (let r = 0; r < base_geometry.rootCount; r++) {
        const rootBase = r * base_geometry.nodesPerRoot;

        for (let k = 0; k < segmentsPerRoot; k++) {
            const nodeA = rootBase + k;
            const nodeB = rootBase + k + 1;

            const a2 = nodeA * 2;
            const b2 = nodeB * 2;

            // vertex A UV
            lineUv[j + 0] = strands_uv_array[a2 + 0];
            lineUv[j + 1] = strands_uv_array[a2 + 1];

            // vertex B UV
            lineUv[j + 2] = strands_uv_array[b2 + 0];
            lineUv[j + 3] = strands_uv_array[b2 + 1];

            // vertex A
            aT[v + 0] = k / (base_geometry.nodesPerRoot - 1);

            // vertex B
            aT[v + 1] = (k + 1) / (base_geometry.nodesPerRoot - 1);

            j += 4;
            v += 2;   // 2 vertices
        }
    }

    return [lineUv, aT, totalSegments]
}
