uniform float gravity;
uniform float dt;
uniform float state;
uniform float len;
uniform float rnd_wind;
uniform bool isMouseDown;
uniform vec3 guide;

vec4 getTargetAttr(float index, float offset) {
    float targetIndex = index + offset;

    float targetX = mod(targetIndex, resolution.x);
    float targetY = floor(targetIndex / resolution.x);

    vec2 targetUV = vec2(
        (targetX + 0.5) / resolution.x,
        (targetY + 0.5) / resolution.y
    );

    return texture(uStrands, targetUV);
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    float index = floor(gl_FragCoord.x) + floor(gl_FragCoord.y) * resolution.x;
    int i_index = int(index);

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 attr = texture(uStrands, uv);

    if(state == 0.0) {
        if(i_index % 9 == 5 || i_index % 9 == 8) {                  // child velocity
            attr.x += (rand(vec2(index, rnd_wind))) * rnd_wind;
            attr.y += dt * gravity;
        } else if(i_index % 9 == 4 || i_index % 9 == 7) {           // child prev_pos
            vec4 pos = getTargetAttr(index, -1.0);                  // child pos
            attr.xyz = pos.xyz;                                     // prev_pos.xyz = pos.xyz
        }
    } else if(state == 1.0) {
        if(i_index % 9 == 3 || i_index % 9 == 6) {                  // child pos
            vec4 vel = getTargetAttr(index, 2.0);                   // child vel
            attr.xyz += vel.xyz * dt;                               // pos.xyz += vel.xyz * dt;
        }
    } else if(state == 2.0) {                                       // Mouse Effect
        if((i_index % 9 == 3 || i_index % 9 == 6) && isMouseDown) {
            vec3 direction = attr.xyz - guide;
            direction.z = 0.0;

            float len = length(direction);
            if (len > 1e-8) {
                direction /= len;
                attr.xyz += direction * 0.01;
            }
        }
    } else if(state == 3.0) {
        if(i_index % 9 == 1) {                                      // root prev_pos
            vec4 child_pos = getTargetAttr(index,  2.0);            // child pos
            vec4 root_pos = getTargetAttr(index, -1.0);             // root pos
            vec3 dv = child_pos.xyz - root_pos.xyz;
            float d = length(dv);
            float w0 = 0.0;
            float w1 = 1.0 / child_pos.w;
            float corr = (len - d) / (d * (w0 + w1));
            attr.xyz = dv;
            attr.w = corr;
        }
    } else if(state == 4.0) {
        if(i_index % 9 == 3) {
            vec4 vec = getTargetAttr(index,  -2.0);
            vec3 dv = vec.xyz;
            float corr = vec.w;
            float w1 = 1.0 / attr.w;
            attr.xyz += dv * w1 * corr;
        }
    } else if(state == 5.0) {
        if(i_index % 9 == 1) {                                      // root prev_pos
            vec4 child2_pos = getTargetAttr(index, 5.0);            // child2 pos
            vec4 child1_pos = getTargetAttr(index, 2.0);            // child1 pos
            vec3 dv = child2_pos.xyz - child1_pos.xyz;
            float d = length(dv);
            float w0 = 1.0 / child1_pos.w;
            float w1 = 1.0 / child2_pos.w;
            float corr = (len - d) / (d * (w0 + w1));
            attr.xyz = dv;
            attr.w = corr;
        }
    } else if(state == 6.0) {
        if(i_index % 9 == 6) {
            vec4 vec = getTargetAttr(index,  -5.0);
            vec3 dv = vec.xyz;
            float corr = vec.w;
            float w1 = 1.0 / attr.w;
            attr.xyz += dv * w1 * corr;
        }
    } else if(state == 7.0) {
        if(i_index % 9 == 5 || i_index % 9 == 8) {                  // child velocity
            vec4 prev_pos = getTargetAttr(index, -1.0);
            vec4 pos = getTargetAttr(index, -2.0);
            attr.xyz = (pos.xyz - prev_pos.xyz) / dt;
        }
    }

    gl_FragColor = attr;
}