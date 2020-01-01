export type Effect = {
    circle: EffectCircle
    effectTriangles: EffectTriangle[]
    instanceTime: number
    x: number
    y: number
    end: boolean
}

export type EffectCircle = {
    radius: number
    thickness: number
    startRadius: number
    startThickness: number
}

export type EffectTriangle = {
    widthAtLength1: number
    angle: number
    leftAngle: number
    rightAngle: number
    fadeDirection: number
}