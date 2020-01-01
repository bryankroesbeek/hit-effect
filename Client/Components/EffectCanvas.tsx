import * as React from 'react'

import { Effect, EffectCircle, EffectTriangle } from '../types'
import { durationMillis, frameRate } from '../constants'
import { vertexSource, fragmentSource } from '../shaders'
import { createProgram, createShader, initializeVertices } from '../helpers'

type State = EffectCanvasState

type EffectCanvasState = {
    effects: Effect[]
}

export class EffectCanvas extends React.Component<{}, State> {
    canvas: HTMLCanvasElement
    gl: WebGLRenderingContext
    program: WebGLProgram

    positionBuffer: WebGLBuffer
    positionAttributeLocation: number
    resolutionLocation: WebGLUniformLocation
    baseColorLocation: WebGLUniformLocation
    width: number
    height: number

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
    }

    handleClick = (e: MouseEvent) => {
        let radius = Math.random() * 50 + 25
        let thickness = Math.random() * 25 + 10

        let effect: Effect = {
            x: e.x,
            y: e.y,
            instanceTime: Date.now(),
            circle: {
                radius: radius,
                thickness: thickness,
                startRadius: radius,
                startThickness: thickness
            },
            effectTriangles: []
        }

        for (let i = 0; i < (Math.random() + 3); i++) {
            let widthAtLength1 = (Math.random() * 5 + 10) * (Math.PI / 180)
            let angle = Math.random() * (Math.PI * 2 - widthAtLength1 * 2) + widthAtLength1

            let range = (Math.PI / 180) * 5
            let direction = Math.random() * range - (0.5 * range)

            effect.effectTriangles.push({
                widthAtLength1: widthAtLength1,
                angle: angle,
                leftAngle: angle - widthAtLength1,
                rightAngle: angle + widthAtLength1,
                fadeDirection: direction
            })
        }

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

    loop() {
        this.update()
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