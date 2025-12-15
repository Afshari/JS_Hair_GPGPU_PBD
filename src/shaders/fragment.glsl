uniform vec3 uColor;
varying float vT;

void main()
{
    float alpha = (1.0 - vT);
    alpha = 0.4;

    gl_FragColor = vec4(uColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}