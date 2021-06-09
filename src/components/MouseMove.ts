import { Ref, onMounted, ref } from 'vue'

export function mouseMove(element: Ref<HTMLCanvasElement | undefined>,offsetX: Ref<number>, offsetY: Ref<number>, scaleX: Ref<number>, scaleY: Ref<number>, width: Ref<number>, height: Ref<number>) {

    let downPositions = {x: 0, y: 0}
    const zoomStrength = ref(1.1)
    const strgPressed = ref(false)
    const shiftPressed = ref(false)
    const altPressed = ref(false)
    const scalingX = ref(false)
    const scalingY = ref(false)
    const moving = ref(false)

    onMounted(() => {

        document.addEventListener('mousedown', mouseDown)
        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('wheel', wheel)
        document.addEventListener('keydown', keydown)
        document.addEventListener('keyup', keyup)
    })

    function mouseDown(event: MouseEvent) {
        if(event.target !== element.value) return
        downPositions = {x: event.clientX, y: event.clientY}
        moving.value = true
    }

    function mouseMove(event: MouseEvent) {
        if(moving.value) {
            offsetX.value -= downPositions.x - event.clientX
            offsetY.value -= downPositions.y - event.clientY
            downPositions = {x: event.clientX, y: event.clientY}
        }

        if(!element.value || (!shiftPressed.value && !scalingX.value && !scalingY.value)) return

        const cursorPositionX = ((event.clientX - width.value / 2) - offsetX.value)
        const cursorPositionY = ((event.clientY - height.value / 2) - offsetY.value)

        if(cursorPositionX > - 5 && cursorPositionX < 5) {
            scalingX.value = true
            scalingY.value = false
            element.value.style.cursor = "n-resize"
        } else if(cursorPositionY > - 5 && cursorPositionY < 5) {
            scalingX.value = false
            scalingY.value = true
            element.value.style.cursor = "w-resize"
        } else {
            scalingX.value = false
            scalingY.value = false
            element.value.style.cursor = "default"
        }
    }
    
    function mouseUp() {
        moving.value = false
    }

    function wheel(event: WheelEvent) {
        if(event.deltaY <= 0) {
            if(!scalingX.value) {
                offsetX.value -= ((event.clientX - width.value / 2) - offsetX.value) * (zoomStrength.value - 1)
                scaleX.value *= zoomStrength.value
            }
            if(!scalingY.value) {
                offsetY.value -= ((event.clientY - height.value / 2) - offsetY.value)  * (zoomStrength.value - 1)
                scaleY.value *= zoomStrength.value
            }
            
        } else {
            if(!scalingX.value) {
                offsetX.value += (((event.clientX - width.value / 2) - offsetX.value) / zoomStrength.value) * (zoomStrength.value - 1)
                scaleX.value /= zoomStrength.value
            }
            if(!scalingY.value) {
                offsetY.value += (((event.clientY - height.value / 2) - offsetY.value) / zoomStrength.value) * (zoomStrength.value - 1)
                scaleY.value /= zoomStrength.value
            }
        }
    }

    function keydown(event: KeyboardEvent) {
        strgPressed.value = event.ctrlKey
        zoomStrength.value = event.shiftKey ? 2 : 1.1
        altPressed.value = event.altKey
        shiftPressed.value = event.shiftKey
    }

    function keyup(event: KeyboardEvent) {
        strgPressed.value = event.ctrlKey
        zoomStrength.value = event.shiftKey ? 2 : 1.1
        altPressed.value = event.altKey
        shiftPressed.value = event.shiftKey
    }

    return {strgPressed, altPressed}
}