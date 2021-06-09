<template>
  <div>
    <canvas class="canvas" ref="element" width="600" height="600"></canvas>
    <div class="info">
      <!-- <input
        class="scale"
        :value="scaleX"
        @input="scaleX = Number($event.target.value)"
        type="range"
        min="0.01"
        max="5"
        step="0.01"
      /> -->
      Offset ({{roundPrecision(offsetX)}} | {{roundPrecision(offsetY)}}) Scale ({{ roundPrecision(scaleX) }} | {{roundPrecision(scaleY)}})
      <!-- <input :value="scaleY" @input="scaleY = Number($event.target.value)" type="range" min="0" max="2" step="0.01"> -->
    </div>
    <div class="functions">
      <textarea v-model="executeText"></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onUpdated, onMounted,  watchEffect, watch } from "vue";
import { coordSystem } from "./CoordSystem";
import { mouseMove } from "./MouseMove";
export default defineComponent({
  name: "HelloWorld",
  props: {},
  setup: () => {
    const element = ref<HTMLCanvasElement>();
    const executeText = ref("x")
    const {
      render,
      scaleX,
      scaleY,
      offsetX,
      offsetY,
      canvas,
      width,
      height,
      roundPrecision,
      drawFunction,
      drawFunctionGPU
    } = coordSystem(element);

    watchEffect(() => {
      render()
      renderText()
    });

    onUpdated(() => {
      render()
      renderText()
    })

    onMounted(() => {
      render()
      renderText()
    })

    function renderText() {
      try {
        drawFunction(new Function("x", "return " + executeText.value) as any)
      } catch (error) {
      }
    }

    watch(executeText, (newVal) => {
      try {
        
      } catch (error) {
        console.log(error)
      }
      
    })

    mouseMove(element, offsetX, offsetY, scaleX, scaleY, width, height);

    return { element, width, height, offsetX, offsetY, scaleX, scaleY, roundPrecision, executeText };
  },
});
</script>

<style scoped>
.info {
  position: absolute;
  background-color: rgba(255, 255,255, 0.7);
  bottom: 0;
  left: 0;
  padding: 5px;
  /* width: 100%; */
}

.functions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40vw;
  height: 60px;
  padding: 10px;
}

.functions textarea {
  resize: none;
  width: 100%;
  height: 100%;
  padding: 5px;
}

.scale {
  width: 90%;
}

.canvas {
  display: block;
}
</style>
