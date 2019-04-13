"use strict"

const config = {
    horizontalResolution: 249,
    aspectRatio: 2 / 3 ** 0.5,  // To fit an equilateral triangle
    canvasId: 'chaos_game_canvas',

    colour: {
        red: 128,
        green: 0,
        blue: 192,
        opacity: 255
    },
    
    dotsPerFrame: 1,
    millisecondsPerFrame: 30
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static midpoint(point1, point2) {
        const x = (point1.x + point2.x) / 2
        const y = (point1.y + point2.y) / 2
        return new Point(x, y)
    }
}

class Triangle {
    constructor(corners) {
        this.corners = corners
    }

    randomCorner() {
        const choice = Math.floor(Math.random() * this.corners.length)
        return this.corners[choice]
    }
}

class Colour {
    constructor(red, green, blue, opacity) {
        this.red = red
        this.green = green
        this.blue = blue
        this.opacity = opacity
    }

    indexedValues() {
        return Object.values(this).entries()
    }
}

class PixelGrid {
    constructor(width, height) {
        this.canvas = document.createElement('canvas')
        this.canvas.width = Math.floor(width)
        this.canvas.height = Math.floor(height)
        this.context = this.canvas.getContext('2d')
        this.image = this.context.getImageData(0, 0, width, height)
    }

    plotPoint(position, colour) {
        const x = Math.floor(position.x)
        const y = Math.floor(position.y)
        const width = this.canvas.width

        for (const [colourIndex, colourValue] of colour.indexedValues()) {
            const dataIndex = (y * width + x) * 4 + colourIndex
            this.image.data[dataIndex] = colourValue
        }
    }
}

class Display {
    constructor(canvas, aspectRatio) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d')

        const matchWindowSize = () => {
            const viewWidth = document.documentElement.clientWidth
            const viewHeight = document.documentElement.clientHeight

            this.canvas.width = Math.floor(
                Math.min(viewWidth, viewHeight * aspectRatio)
            )

            this.canvas.height = Math.floor(
                Math.min(viewWidth / aspectRatio, viewHeight)
            )

            this.context.imageSmoothingEnabled = false
        }

        matchWindowSize()
        window.addEventListener('resize', matchWindowSize)
    }

    update(pixelGrid) {
        pixelGrid.context.putImageData(pixelGrid.image, 0, 0)

        this.context.drawImage(
            pixelGrid.canvas, 0, 0, this.canvas.width, this.canvas.height
        )
    }
}

class ChaosGame {
    constructor(
        display, pixelGrid, triangle, colour, dotsPerFrame, millisecondsPerFrame
    ) {
        this.display = display
        this.pixelGrid = pixelGrid
        this.triangle = triangle
        this.colour = colour
        this.dotsPerFrame = dotsPerFrame
        this.millisecondsPerFrame = millisecondsPerFrame
    }

    play() {
        let currentPosition = this.triangle.randomCorner()

        const nextFrame = () => {
            for (let i = 0; i < this.dotsPerFrame; i += 1) {

                const targetCorner = this.triangle.randomCorner()
                currentPosition = Point.midpoint(currentPosition, targetCorner)
                this.pixelGrid.plotPoint(currentPosition, this.colour)

            }
            this.display.update(this.pixelGrid)
        }

        setInterval(nextFrame, this.millisecondsPerFrame)
    }
}

const startChaosGame = (config) => {
    const canvas = document.getElementById(config.canvasId)
    const display = new Display(canvas, config.aspectRatio)

    const width = config.horizontalResolution
    const height = width / config.aspectRatio
    const pixelGrid = new PixelGrid(width, height)

    const topMiddle = new Point(width / 2, 0)
    const bottomLeft = new Point(0, height)
    const bottomRight = new Point(width, height)
    const corners = [topMiddle, bottomLeft, bottomRight]
    const triangle = new Triangle(corners)

    const colour = new Colour(
        config.colour.red,
        config.colour.green,
        config.colour.blue,
        config.colour.opacity
    )

    const game = new ChaosGame(
        display,
        pixelGrid,
        triangle,
        colour,
        config.dotsPerFrame,
        config.millisecondsPerFrame
    )

    game.play()
}

if (document.readyState === 'loading') {

    document.addEventListener(
        'DOMContentLoaded',
        () => {startChaosGame(config)}
    )

} else {
    startChaosGame(config)
}

