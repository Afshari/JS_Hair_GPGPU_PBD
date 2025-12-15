
export function build_strand_node_uvs(baseGeometry, gpgpu) {

    const strandsUvArray = new Float32Array(baseGeometry.totalNodes * 2)

    for (let node = 0; node < baseGeometry.totalNodes; node++) {

        // texel index for the pos attribute of this node
        const texelIndex = node * baseGeometry.attrsPerNode + 0;  // 0 = pos

        // convert texelIndex -> (x, y)
        const x = texelIndex % gpgpu.size;
        const y = Math.floor(texelIndex / gpgpu.size);

        // compute UV
        const uvX = (x + 0.5) / gpgpu.size;
        const uvY = (y + 0.5) / gpgpu.size;

        // store UV
        const i2 = node * 2;
        strandsUvArray[i2 + 0] = uvX;
        strandsUvArray[i2 + 1] = uvY;
    }

    return strandsUvArray
}

export function build_strand_line_attributes(strandsUvArray, baseGeometry) {
    
    const segmentsPerRoot = baseGeometry.nodesPerRoot - 1;
    const totalSegments = baseGeometry.rootCount * segmentsPerRoot;
    const lineUv = new Float32Array(totalSegments * 2 * 2);

    const aT = new Float32Array(totalSegments * 2);

    let j = 0;
    let v = 0;      // vertex index

    for (let r = 0; r < baseGeometry.rootCount; r++) {
        const rootBase = r * baseGeometry.nodesPerRoot;

        for (let k = 0; k < segmentsPerRoot; k++) {
            const nodeA = rootBase + k;
            const nodeB = rootBase + k + 1;

            const a2 = nodeA * 2;
            const b2 = nodeB * 2;

            // vertex A UV
            lineUv[j + 0] = strandsUvArray[a2 + 0];
            lineUv[j + 1] = strandsUvArray[a2 + 1];

            // vertex B UV
            lineUv[j + 2] = strandsUvArray[b2 + 0];
            lineUv[j + 3] = strandsUvArray[b2 + 1];

            // vertex A
            aT[v + 0] = k / (baseGeometry.nodesPerRoot - 1);

            // vertex B
            aT[v + 1] = (k + 1) / (baseGeometry.nodesPerRoot - 1);

            j += 4;
            v += 2;   // 2 vertices
        }
    }

    return [lineUv, aT, totalSegments]
}
