export const fragmentSource = `
#define MAX_SIZE 64
#define PI 3.1415926

precision mediump float;

varying vec2 v_Pixelposition;

uniform vec4 baseColor;
uniform vec4 activeColor;

uniform vec4 effectCircles[MAX_SIZE];
uniform vec4 effectTriangles[MAX_SIZE];
uniform int effectCirclesSize;
uniform int effectTrianglesSize;

void main() {

    // Effect circles
    for (int i = 0; i < MAX_SIZE; i++) {
        if (i >= effectCirclesSize) break;
        float xDis = pow(effectCircles[i].x - v_Pixelposition.x, 2.0);
        float yDis = pow(effectCircles[i].y - v_Pixelposition.y, 2.0);
        bool isInRadius = xDis + yDis < pow(effectCircles[i].z, 2.0);
        bool isInInner = xDis + yDis > pow(effectCircles[i].z - effectCircles[i].w, 2.0);

        if (isInRadius && isInInner) {
            gl_FragColor = activeColor;
            return;
        }
    }

    // Effect triangles
    for (int i = 0; i < MAX_SIZE; i++) {
        if (i >= effectTrianglesSize) break;

        float angle = atan(effectTriangles[i].y - v_Pixelposition.y, effectTriangles[i].x - v_Pixelposition.x) + PI;
        bool isInside = angle > effectTriangles[i].z && angle < effectTriangles[i].w;

        if (isInside) {
            gl_FragColor = activeColor;
            return;
        }
    }

    gl_FragColor = baseColor;
}
`