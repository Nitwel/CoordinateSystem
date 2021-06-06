import { GPU } from "gpu.js"
import { h, onMounted, ref, Ref } from "vue"

export class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    distanceTo(x1: number, y1: number) {
        return Math.sqrt(Math.pow(x1 - this.x, 2) + Math.pow(y1 - this.y, 2))
    }

    angleTo(x1: number, y1: number) {
        return (this.y - y1) / (this.x - x1)
    }
}

export function coordSystem(element: Ref<HTMLCanvasElement | undefined>) {

    const gpu = new GPU()

    const width = ref(0)
    const height = ref(0)
    const offsetX = ref(0)
    const offsetY = ref(0)
    const scaleX = ref(1)
    const scaleY = ref(1)
    const canvas = ref<CanvasRenderingContext2D>()


    onMounted(() => {
        if (!element.value) return
        canvas.value = element.value.getContext("2d") || undefined
        element.value.width = window.innerWidth - 20
        element.value.height = window.innerHeight - 20

        width.value = element.value.width
        height.value = element.value.height
    })

    function render() {
        canvas.value?.clearRect(0, 0, width.value, height.value)
        drawGrid()
        // drawFunction(x => Math.cos(x / 100) * 100)
        // drawFunction(x => Math.cos(x / 100 + 0.2) * 100)
        // drawFunction(x => Math.cos(x / 100 + 0.4) * 100)
        // drawFunction(x => Math.cos(x / 100 + 0.6) * 100)
        drawFunctionGPU(x => 0)
        drawFunctionGPU(x => 0.2)
        drawFunctionGPU(x => 0.4)
        drawFunctionGPU(x => 0.6)
    }

    function drawLines(...points: Point[] | { x: number, y: number }[]) {
        if (!canvas.value) return

        canvas.value.beginPath()
        let first = true
        for (const point of points) {
            const x = point.x * scaleX.value + offsetX.value + width.value / 2
            const y = -point.y * scaleX.value + offsetY.value + height.value / 2
            if (first) {
                canvas.value.moveTo(x, y)
                first = false
            }
            else canvas.value.lineTo(x, y)

        }
        canvas.value.stroke()
    }

    const translatePoints = gpu.createKernel(function(xy: number[][], scaleX: number, scaleY: number, offsetX: number, offsetY: number, width: number, height: number) {
        if(this.thread.x === 0) {
            return xy[this.thread.x][this.thread.y] * scaleX + offsetX + (width / 2)
        } else {
            return -xy[this.thread.x][this.thread.y] * scaleY + offsetY + (height / 2)
        }
    }).setDynamicOutput(true)

    function drawLines2(xList: number[], yList: number[]) {
        if (!canvas.value) return
        translatePoints.setOutput([2, xList.length])

        const xyPoints = translatePoints([xList, yList], scaleX.value, scaleX.value, offsetX.value, offsetY.value, width.value, height.value) as Float32Array[]
        canvas.value.beginPath()
        let first = true
        for (let point of xyPoints) {
            if (first) {
                canvas.value.moveTo(point[0], point[1])
                first = false
            }
            else canvas.value.lineTo(point[0], point[1])

        }
        canvas.value.stroke()
    }

    function drawLines3(xList: number[], yList: number[]) {
        if (!canvas.value) return
        translatePoints.setOutput([xList.length, 2])
        
        const [xPoints, yPoints] = translatePoints([xList, yList], scaleX.value, scaleY.value, offsetX.value, offsetY.value, width.value, height.value) as number[][]
        
        const image = canvas.value.createImageData(width.value, height.value)
        const length = width.value * height.value * 4
        const data = image.data

        for(let i = 0; i < xPoints.length; i++) {
            const dataIndex = (Math.round(xPoints[i]) + Math.round(yPoints[i]) * width.value) * 4
            if(dataIndex >= length) {
                continue
            }
            data[dataIndex] = 0
            data[dataIndex + 1] = 0
            data[dataIndex + 2] = 0
            data[dataIndex + 3] = 255
        }
        canvas.value.putImageData(image, 0, 0)
    }

    function findScale(scale: number) {
        let i = 0
        const limit = 4
        let targetScale = scale

        while (true) {
            if (targetScale >= limit) {
                targetScale /= limit
                i += 1
            } else if (targetScale < 1) {
                targetScale *= limit
                i -= 1
            } else {
                break
            }
        }
        return targetScale
    }

    function drawFunction(f: (x: number) => number) {
        if (!canvas.value) return
        const points: { x: number, y: number }[] = []
        const min = (-offsetX.value - width.value / 2) / scaleX.value
        const max = (-offsetX.value + width.value / 2) / scaleX.value

        for (let x = min; x <= max; x += 1 / scaleX.value) {
            points.push({ x, y: f(x) })
        }
        canvas.value.strokeStyle = '#000000'
        drawLines(...points)
    }

    const calculateY = gpu.createKernel(function(xList: number[], offset: number) {
        const x = xList[this.thread.x]
        return Math.sin(x / 100 + offset) * 100
    }).setDynamicOutput(true)

    function drawFunctionGPU(f: (x: number) => number) {
        if (!canvas.value) return
        const xValues: number[] = []

        const min = (-offsetX.value - width.value / 2) / scaleX.value
        const max = (-offsetX.value + width.value / 2) / scaleX.value

        for(let x = min; x <= max; x += 1 / scaleX.value) {
            xValues.push(x)
        }

        calculateY.setOutput([xValues.length])
        const yValues = calculateY(xValues, f(0)) as number[]

        canvas.value.strokeStyle = '#000000'
        drawLines2(xValues, yValues)
    }

    function steigung(x0: number, y0: number, x1: number, y1: number) {
        return (y1 - y0) / (x1 - x0)
    }

    function drawGrid() {
        if (!canvas.value) return

        let xSpace = 50 * findScale(scaleX.value)
        let ySpace = 50 * findScale(scaleX.value)

        const xLines = Math.ceil(width.value / 2 / xSpace)
        const yLines = Math.ceil(height.value / 2 / ySpace)

        const middleIndex = offsetX.value >= 0? Math.floor(offsetX.value / xSpace) : Math.ceil(offsetX.value / xSpace)

        for (let i = -xLines; i <= xLines; i++) {
            let xLine = width.value / 2 + (i * xSpace)
            xLine += 0.5
            xLine += offsetX.value % xSpace
            
            canvas.value.beginPath()
            canvas.value.strokeStyle = i === middleIndex? '#000000' : '#AAAAAA'
            canvas.value.moveTo(xLine, 0)
            canvas.value.lineTo(xLine, height.value)
            canvas.value.stroke()
            canvas.value.fillText(String(Math.round((xLine - offsetX.value - width.value / 2 -0.5 )/ scaleX.value) ), xLine, 10)
        }

        for (let i = -yLines; i <= yLines; i++) {
            let yLine = height.value / 2 + (i * ySpace)
            yLine += 0.5
            yLine += offsetY.value % ySpace

            const middleIndex = offsetY.value >= 0? Math.floor(offsetY.value / ySpace) : Math.ceil(offsetY.value / ySpace)

            canvas.value.beginPath()
            canvas.value.strokeStyle = i === middleIndex ? '#000000' : '#AAAAAA'
            canvas.value.moveTo(0, yLine)
            canvas.value.lineTo(width.value, yLine)
            canvas.value.stroke()
            canvas.value.beginPath()
            canvas.value.fillText(String(-Math.round((yLine - offsetY.value - height.value / 2 -0.5) / scaleX.value)), 10, yLine - 2)
        }


    }

    return { drawGrid, render, offsetX, offsetY, scaleX, scaleY, drawLines, canvas, width, height, drawFunction, drawFunctionGPU }
}