import * as React from 'react'

type State = EffectCanvasState

type EffectCanvasState = {
    positions: Position[]
    context: CanvasRenderingContext2D
    diff: number
}

type Position = {
    x: number
    y: number
    instanceStamp: number
}

const durationMillis = 2000

export class EffectCanvas extends React.Component<{}, State> {
    canvasRef: React.RefObject<HTMLCanvasElement>
    canvas: HTMLCanvasElement
    pixelData: ImageData

    constructor(props: {}) {
        super(props)

        this.state = {
            positions: [],
            context: null,
            diff: 0
        }

        this.canvasRef = React.createRef()
    }

    handleClick = (e: MouseEvent) => {
        let positions = [...this.state.positions]
        positions.push({ x: e.x, y: e.y, instanceStamp: Date.now() })

        this.setState({ positions: positions })
    }

    loop() {
        let start = Date.now()
        let poses = this.state.positions
        let length = poses.length
        
        let height = this.canvas.height
        let width = this.canvas.width
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let pixel = (y * width + x) * 4

                let isInside: boolean = false
                for (let i = 0; i < length; i++) {
                    isInside = isInside || this.shouldRenderPixel(x, y, poses[i].x, poses[i].y)
                }
                if (isInside) {
                    this.pixelData.data[pixel + 0] = 0
                    this.pixelData.data[pixel + 1] = 255
                    this.pixelData.data[pixel + 2] = 0
                    this.pixelData.data[pixel + 3] = 255
                } else {
                    this.pixelData.data[pixel + 0] = 0
                    this.pixelData.data[pixel + 1] = 0
                    this.pixelData.data[pixel + 2] = 0
                    this.pixelData.data[pixel + 3] = 0

                }
            }
        }
        let end = Date.now()
        this.setState({ diff: end - start })
        this.state.context.putImageData(this.pixelData, 0, 0)
        if (length < 1) return

        if (end - poses[0].instanceStamp > durationMillis) {
            poses.shift()
            this.setState({ positions: poses })
        }
    }

    shouldRenderPixel(pixelX: number, pixelY: number, screenX: number, screenY: number) {
        return (
            ((pixelX - screenX) ** 2 + (pixelY - screenY) ** 2 < 50 ** 2) &&
            ((pixelX - screenX) ** 2 + (pixelY - screenY) ** 2 > 25 ** 2)
        )
    }

    componentDidMount() {
        let context = this.canvas.getContext("2d")
        let data = context.createImageData(this.canvas.clientWidth, this.canvas.clientHeight)
        this.setState({ context: context })
        this.pixelData = data
        this.context = context

        addEventListener("mousedown", this.handleClick)
        setInterval(() => this.loop(), 16)
    }

    render() {
        return <div id="canvas-container">
            <canvas ref={ref => this.canvas = ref} width={1000} height={500}></canvas>
            <span>{this.state.diff}</span>
        </div>
    }
}