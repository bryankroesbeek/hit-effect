export const vertexSource = `
uniform vec2 resolution;
attribute vec2 a_position;

varying vec2 v_Pixelposition;

void main() {
    vec2 clipSpace = ((a_position / resolution) * 2.0) - 1.0;

    gl_Position = vec4(clipSpace.x, clipSpace.y * -1.0, 0, 1);
    v_Pixelposition = a_position;
}
`