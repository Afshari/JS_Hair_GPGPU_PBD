uniform vec2 uResolution;
uniform float uSize;

uniform sampler2D uParticlesTexture;
attribute vec2 aParticlesUv;

attribute float aT;
varying float vT;

void main()
{
    vT = aT;

    vec4 particle = texture(uParticlesTexture, aParticlesUv);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
}