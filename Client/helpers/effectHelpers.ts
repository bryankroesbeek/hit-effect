import { Effect } from '../types'

export function generateEffect(clickX: number, clickY: number): Effect {
    let radius = Math.random() * 50 + 25
    let thickness = Math.random() * 25 + 10

    let effect: Effect = {
        x: clickX,
        y: clickY,
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

    return effect
}