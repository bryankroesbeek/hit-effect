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
}

type EffectTriangle = {
    angle: number
    widthAtLength1: number
}

const durationMillis = 750

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
        let effect: Effect = {
            x: e.x,
            y: e.y,
            instanceTime: Date.now(),
            circle: {
                radius: 50,
                thickness: 10,
            },
            effectTriangles: []

        }
        let effects = [...this.state.effects, effect]

        this.setState({ effects: effects })
    }

    update() {
        let effects = this.state.effects.map(e => {
            e.circle.thickness -= .5
            e.circle.radius += 5
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
                    pixels[pixel + 0] = 0
                    pixels[pixel + 1] = 0
                    pixels[pixel + 2] = 0
                    pixels[pixel + 3] = 0

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
        return (
            ((pixelX - effect.x) ** 2 + (pixelY - effect.y) ** 2 < circle.radius ** 2) &&
            ((pixelX - effect.x) ** 2 + (pixelY - effect.y) ** 2 > (circle.radius - circle.thickness) ** 2)
        )
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
        setInterval(() => this.loop(), 16)
    }

    render() {
        return <div id="canvas-container">
            <canvas ref={ref => this.canvas = ref}></canvas>
            <span>{this.state.diff}</span>
        </div>
    }
}