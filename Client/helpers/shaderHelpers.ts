export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) return shader

    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
}

export function createProgram(gl: WebGLRenderingContext, vertexS: WebGLShader, fragmentS: WebGLShader) {
    let program = gl.createProgram()

    gl.attachShader(program, vertexS)
    gl.attachShader(program, fragmentS)

    gl.linkProgram(program)

    let success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) return program

    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
}

export function initializeVertices(gl: WebGLRenderingContext, buffer: WebGLBuffer, width: number, height: number) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    let positions = [
        0.0, 0.0,
        width, 0.0,
        0.0, height,
        width, 0.0,
        0.0, height,
        width, height
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)
}