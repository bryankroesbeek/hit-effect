export const fragmentSource = `
precision mediump float;

varying vec2 v_Pixelposition;

uniform vec4 baseColor;

void main() {
    gl_FragColor = baseColor;
}
`