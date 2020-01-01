export const fragmentSource = `
#define MAX_SIZE 256

precision mediump float;

varying vec2 v_Pixelposition;

uniform vec4 baseColor;
uniform vec4 activeColor;

uniform vec4 effectCircles[MAX_SIZE];
uniform vec4 effectTriangles[MAX_SIZE];
uniform int effectCirclesSize;
uniform int effectTrianglesSize;

void main() {
    gl_FragColor = baseColor;
}
`