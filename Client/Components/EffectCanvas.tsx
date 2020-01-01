import * as React from 'react'

import { Effect, EffectCircle, EffectTriangle } from '../types'
import { durationMillis, frameRate } from '../constants'
import { vertexSource, fragmentSource } from '../shaders'
import { createProgram, createShader, initializeVertices } from '../helpers/shaderHelpers'
import { generateEffect } from '../helpers/effectHelpers'

type State = EffectCanvasState

type EffectCanvasState = {
    effects: Effect[]
}

export class EffectCanvas extends React.Component<{}, State> {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext
    program: WebGLProgram
    width: number
    height: number

    positionBuffer: WebGLBuffer
    positionAttributeLocation: number
    resolutionLocation: WebGLUniformLocation
    baseColorLocation: WebGLUniformLocation
    activeColorLocation: WebGLUniformLocation
    effectCircles: WebGLUniformLocation
    effectTriangles: WebGLUniformLocation
    effectCirclesSize: WebGLUniformLocation
    effectTrianglesSize: WebGLUniformLocation

    constructor(props: {}) {
        super(props)

        this.state = {
            effects: []
        }
    }

    componentDidMount() {
        let gl = this.canvas.getContext("webgl")
        if (!gl) throw "NO WEBGL"
        this.gl = gl

        let doc = document.getElementById("canvas-container")
        this.width = doc.clientWidth
        this.height = doc.clientHeight

        this.initializeWebGl(this.width, this.height)

        addEventListener("mousedown", this.handleClick)
        requestAnimationFrame(this.loop)
    }

    initializeWebGl(width: number, height: number) {
        let vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexSource)
        let fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentSource)
        this.program = createProgram(this.gl, vertexShader, fragmentShader)

        this.positionBuffer = this.gl.createBuffer()
        initializeVertices(this.gl, this.positionBuffer, width, height)
        this.initializeScreen()
    }

    initializeScreen() {
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'resolution')
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position')
        this.baseColorLocation = this.gl.getUniformLocation(this.program, 'baseColor')
        this.activeColorLocation = this.gl.getUniformLocation(this.program, 'activeColor')

        this.effectCircles = this.gl.getUniformLocation(this.program, 'effectCircles')
        this.effectTriangles = this.gl.getUniformLocation(this.program, 'effectTriangles')
        this.effectCirclesSize = this.gl.getUniformLocation(this.program, 'effectCirclesSize')
        this.effectTrianglesSize = this.gl.getUniformLocation(this.program, 'effectTrianglesSize')
    }

    handleClick = (e: MouseEvent) => {
        let effect = generateEffect(e.x, e.y)
        let effects = [...this.state.effects, effect]
        this.setState({ effects: effects })
    }

    update() {
        let effects = this.state.effects.map(e => {
            let delta = Date.now() - e.instanceTime
            let thickness = (durationMillis - delta) / durationMillis

            e.effectTriangles = e.effectTriangles.map(et => {
                et.leftAngle = et.angle - et.widthAtLength1 * thickness
                et.rightAngle = et.angle + et.widthAtLength1 * thickness

                et.angle += et.fadeDirection
                return et
            })

            e.circle.thickness = e.circle.startThickness * thickness
            e.circle.radius = e.circle.startRadius + e.circle.startRadius * (1 - thickness)
            return e
        })

        this.setState({ effects: effects })
    }

    renderScreen = () => {
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        this.gl.useProgram(this.program)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.uniform2f(this.resolutionLocation, this.width, this.height)

        let effectArrays = this.generateEffectArrays()
        this.gl.uniform4fv(this.effectCircles, effectArrays.effectCircles)
        this.gl.uniform4fv(this.effectTriangles, effectArrays.effectTriangles)
        this.gl.uniform1f(this.effectCirclesSize, effectArrays.effectCircles.length)
        this.gl.uniform1f(this.effectTrianglesSize, effectArrays.effectTriangles.length)

        this.gl.uniform4f(this.baseColorLocation, 0.2, 0.0, 0.4, 1)
        this.gl.uniform4f(this.activeColorLocation, 0, 1, 0, 1)

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
    }

    generateEffectArrays() {
        let effectCircles = []
        let effectTriangles = []

        for (let i = 0; i < this.state.effects.length; i++) {
            let effect = this.state.effects[i]
            let circle = effect.circle
            let triangles = effect.effectTriangles
            effectCircles.push(effect.x, effect.y, circle.radius, circle.thickness)

            for (let j = 0; j < triangles.length; i++) {
                let triangle = triangles[j]
                effectTriangles.push(effect.x, effect.y, triangle.leftAngle, triangle.rightAngle)
            }
        }

        return { effectCircles, effectTriangles }
    }

    loop = () => {
        this.update()
        this.renderScreen()
        requestAnimationFrame(this.loop)
    }

    shouldRenderPixel(pixelX: number, pixelY: number, effect: Effect) {
        let circle = effect.circle

        let should = (
            ((pixelX - effect.x) ** 2 + (pixelY - effect.y) ** 2 < circle.radius ** 2) &&
            ((pixelX - effect.x) ** 2 + (pixelY - effect.y) ** 2 > (circle.radius - circle.thickness) ** 2)
        )

        for (let i = 0; i < effect.effectTriangles.length; i++) {
            let angle = Math.atan2((effect.y - pixelY), (effect.x - pixelX)) + Math.PI
            should = should || angle > effect.effectTriangles[i].leftAngle && angle < effect.effectTriangles[i].rightAngle
        }

        return should
    }

    render() {
        return <div id="canvas-container">
            <canvas ref={ref => this.canvas = ref}></canvas>
        </div>
    }
}