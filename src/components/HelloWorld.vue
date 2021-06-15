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
import { coordSystem, Point } from "./CoordSystem";
import { mouseMove } from "./MouseMove";
import {compile, derivative, evaluate, log, parse, simplify} from 'mathjs'
export default defineComponent({
  name: "HelloWorld",
  props: {},
  setup: () => {
    const element = ref<HTMLCanvasElement>();
    const executeText = ref("f(x) = a*x*x where a = 4")
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
      drawFunctionGPU,
      drawLines
    } = coordSystem(element);

    watchEffect(update);

    onUpdated(update)

    onMounted(update)

    function update() {
      render()
      renderText()

      const points: {x: number, y: number}[] = []

      
    }

    function renderText() {
      try {
        executeText.value.split('\n').forEach((line) => {
          const result = /^.*?\((.*?)\)\s*?=\s*?(.*?)(where(.*?))?$/.exec(line)
          if(!result || result.length < 3) return
          const params = result[1].split(',')
          const expression = result[2]
          
          const scope: Record<string, number> = {}
          params.forEach(v => {scope[v] = 1})

          if(result.length === 5 && result[4] !== undefined) {
            const constants = result[4].split(',')
            for(let constant of constants) {
              const match = /^(.*?)=(.*?)$/.exec(constant)
              if(!match || match.length < 3) continue;

              const name = match[1].trim();
              const value = parseInt(match[2])
              scope[name] = value
            }
          }
          
          const c = compile(expression)

          drawFunction((x) => {
            scope[params[0]] = x
            return c.evaluate(scope)
          });
        })
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
  width: 30vw;
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
