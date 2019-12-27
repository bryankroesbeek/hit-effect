import * as React from 'react'

type State = EffectCanvasState

type EffectCanvasState = {
    positions: Position[]
    context: CanvasRenderingContext2D
    diff: number
    effects: Effect[]
}

type Position = {
    x: number
    y: number
    instanceStamp: number
}

type Effect = {
    circle: EffectCircle
    effectTriangles: EffectTriangle[]
    instanceTime: number
    x: number
    y: number
}

type EffectCircle = {
    radius: number
    thickness: number
    startRadius: number
    startThickness: number
}

type EffectTriangle = {
    widthAtLength1: number
    angle: number
    leftAngle: number
    rightAngle: number
    fadeDirection: number
}

const durationMillis = 750
const frameRate = 1000 / 60

export class EffectCanvas extends React.Component<{}, State> {
    canvas: HTMLCanvasElement
    pixelData: ImageData

    constructor(props: {}) {
        super(props)

        this.state = {
            positions: [],
            context: null,
            diff: 0,
            effects: []
        }
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
        let start = Date.now()
        let effects = this.state.effects
        let length = effects.length

        let height = this.canvas.height
        let width = this.canvas.width

        let pixels = this.pixelData.data

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let pixel = (y * width + x) * 4

                let isInside: boolean = false
                for (let i = 0; i < length; i++) {
                    isInside = isInside || this.shouldRenderPixel(x, y, effects[i])
                }
                if (isInside) {
                    pixels[pixel + 0] = 0
                    pixels[pixel + 1] = 255
                    pixels[pixel + 2] = 0
                    pixels[pixel + 3] = 255
                } else {
                    pixels[pixel + 0] = 31
                    pixels[pixel + 1] = 0
                    pixels[pixel + 2] = 63
                    pixels[pixel + 3] = 255

                }
            }
        }
        let end = Date.now()
        this.setState({ diff: end - start })
        this.state.context.putImageData(this.pixelData, 0, 0)
        if (length < 1) return

        if (end - effects[0].instanceTime > durationMillis) {
            effects.shift()
            this.setState({ effects: effects })
        }
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

    componentDidMount() {
        let context = this.canvas.getContext("2d")
        let data = context.createImageData(this.canvas.clientWidth, this.canvas.clientHeight)
        this.setState({ context: context })
        this.pixelData = data
        this.context = context
        let doc = document.getElementById("canvas-container")
        this.canvas.width = doc.clientWidth
        this.canvas.height = doc.clientHeight

        addEventListener("mousedown", this.handleClick)
        setInterval(() => this.loop(), frameRate)
    }

    render() {
        return <div id="canvas-container">
            <canvas ref={ref => this.canvas = ref}></canvas>
            <span>{this.state.diff}</span>
        </div>
    }
}