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
