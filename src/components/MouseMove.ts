import { Ref, onMounted } from 'vue'

export function mouseMove(element: Ref<HTMLCanvasElement | undefined>,offsetX: Ref<number>, offsetY: Ref<number>, scaleX: Ref<number>, width: Ref<number>, height: Ref<number>) {

    let downPositions = {x: 0, y: 0}
    const zoomStrength = 2

    onMounted(() => {

        document.addEventListener('mousedown', mouseDown)
        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('wheel', wheel)
    })

    function mouseDown(event: MouseEvent) {
        if(event.target !== element.value) return
        document.addEventListener('mousemove', mouseMove)
        downPositions = {x: event.clientX, y: event.clientY}
    }

    function mouseMove(event: MouseEvent) {
        offsetX.value -= downPositions.x - event.clientX
        offsetY.value -= downPositions.y - event.clientY
        downPositions = {x: event.clientX, y: event.clientY}
    }
    
    function mouseUp() {
        document.removeEventListener('mousemove', mouseMove)
    }

    function wheel(event: WheelEvent) {
        if(event.deltaY <= 0) {
            offsetX.value -= (event.clientX - width.value / 2) - offsetX.value
            offsetY.value -= (event.clientY - height.value / 2) - offsetY.value
            scaleX.value *= zoomStrength
        } else {
            offsetY.value += ((event.clientY - height.value / 2) - offsetY.value) / zoomStrength
            offsetX.value += ((event.clientX - width.value / 2) - offsetX.value) / zoomStrength
            scaleX.value /= zoomStrength
        }
    }

    return {}
}