<template>
  <div>
    <canvas ref="element" width="600" height="600"></canvas>
    <div class="tools">
      <input
        class="scale"
        :value="scaleX"
        @input="scaleX = Number($event.target.value)"
        type="range"
        min="0.01"
        max="5"
        step="0.01"
      />
      {{ scaleX }}
      <!-- <input :value="scaleY" @input="scaleY = Number($event.target.value)" type="range" min="0" max="2" step="0.01"> -->
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, watchEffect } from "vue";
import { coordSystem } from "./CoordSystem";
import { mouseMove } from "./MouseMove";
export default defineComponent({
  name: "HelloWorld",
  props: {},
  setup: () => {
    const element = ref<HTMLCanvasElement>();

    const {
      render,
      scaleX,
      scaleY,
      offsetX,
      offsetY,
      canvas,
      width,
      height,
      drawFunction,
      drawFunctionGPU
    } = coordSystem(element);

    watchEffect(() => {
      render();
    });

    mouseMove(element, offsetX, offsetY, scaleX);

    return { element, width, height, offsetX, offsetY, scaleX, scaleY };
  },
});
</script>

<style scoped>
.tools {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
}

.scale {
  width: 90%;
}
</style>
