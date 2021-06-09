import { Ref, onMounted, ref } from 'vue'

export function mouseMove(element: Ref<HTMLCanvasElement | undefined>,offsetX: Ref<number>, offsetY: Ref<number>, scaleX: Ref<number>, width: Ref<number>, height: Ref<number>) {

    let downPositions = {x: 0, y: 0}
    const zoomStrength = ref(1.1)
    const strgPressed = ref(false)
    const altPressed = ref(false)

    onMounted(() => {

        document.addEventListener('mousedown', mouseDown)
        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('wheel', wheel)
        document.addEventListener('keydown', keydown)
        document.addEventListener('keyup', keyup)
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
            offsetX.value -= ((event.clientX - width.value / 2) - offsetX.value) * (zoomStrength.value - 1)
            offsetY.value -= ((event.clientY - height.value / 2) - offsetY.value)  * (zoomStrength.value - 1)
            scaleX.value *= zoomStrength.value
        } else {
            offsetY.value += (((event.clientY - height.value / 2) - offsetY.value) / zoomStrength.value) * (zoomStrength.value - 1)
            offsetX.value += (((event.clientX - width.value / 2) - offsetX.value) / zoomStrength.value) * (zoomStrength.value - 1)
            scaleX.value /= zoomStrength.value
        }
    }

    function keydown(event: KeyboardEvent) {
        strgPressed.value = event.ctrlKey
        zoomStrength.value = event.shiftKey ? 2 : 1.1
        altPressed.value = event.altKey
    }

    function keyup(event: KeyboardEvent) {
        strgPressed.value = event.ctrlKey
        altPressed.value = event.altKey
    }

    return {strgPressed, altPressed}
}