<template>
  <svg class="w-full h-full">
    <path
      v-for="path in flag ? cardPaths : pre_cardPaths"
      :key="path.key"
      :d="path.d"
      fill="none"
      stroke="rgb(210, 210, 208)"
      stroke-width="0.8"
    />
  </svg>
</template>


<script>
import { computed, ref, watchEffect, nextTick } from "vue";
import { useStore } from "vuex";

export default {
  name: "LinkColumn",
  props: ["level"],
  setup(props) {
    //selectionTree，遍历当前层(props.level)的结点，拿到父子id对列表， id1, id2

    //document.getElementById 拿到父子对id对应的TSCard id是card + id
    //element.offset 拿每个card的左上角的绝对坐标
    //document.getElementByClassName 获取table的绝对坐标作为参考系坐标 并且利用vuex中的rowHeight, plotWidth, columnWidth等必要的尺寸计算线两个端点在svg中的坐标, svg的宽度是20px
    //和开会讨论不同的是，用rowHeight代替cardHeight
    const store = useStore();
    const selectionTree = computed(() => store.getters["tree/selectionTree"])

    const plotWidth = computed(() => store.getters["scatterPlot/plotWidth"])
    const plotHeight = computed(() => store.getters["scatterPlot/plotHeight"])
    const alignLevel = computed(() => store.getters["align/alignLevel"])
    const sectionState = computed(() => store.getters["align/sectionState"])
    const currentLevelNodes = computed(() => {
      // console.log("selected tree is", selectionTree.value);
      return selectionTree.value.filter((node) => node.level == props.level); // 直接使用level，不使用level.value
    });
    const flag = ref(0);
    const pre_cardPaths = ref();
    const cardPaths = computed(() => {
      let paths = [];
      currentLevelNodes.value.forEach((parentNode) => {
        parentNode.children_id.forEach((childId) => {
          // 请确保 getNodeCoords 逻辑在这里是正确的
          const childCoords = getNodeCoords(childId, 1); // 子节点的坐标
          const parentCoords = getNodeCoords(parentNode.id, 0); // 父节点的坐标
          if (parentCoords && childCoords) {
            // 确保两个坐标都存在
            // 计算贝塞尔曲线控制点
            const controlX1 = (parentCoords.x + childCoords.x) / 2;
            const controlY1 = parentCoords.y;
            const controlX2 = (parentCoords.x + childCoords.x) / 2;
            const controlY2 = childCoords.y;
            if (alignLevel.value > 0 || sectionState.value != -1) {
              paths.push({
                d: `M ${parentCoords.x},${parentCoords.y} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${childCoords.x},${childCoords.y}`,
                key: `c-${parentNode.id}-${childId}`,
              });
            }
            // paths.push({
            //   d: `M ${parentCoords.x},${parentCoords.y} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${childCoords.x},${childCoords.y}`,
            //   key: `c-${parentNode.id}-${childId}`,
            // });
          }
        });
      });
      // });
      return paths; // 更新路径
    });
    watchEffect(() => {
      nextTick().then(() => {
        let paths = [];
        currentLevelNodes.value.forEach((parentNode) => {
          parentNode.children_id.forEach((childId) => {
            // 请确保 getNodeCoords 逻辑在这里是正确的
            const childCoords = getNodeCoords(childId, 1); // 子节点的坐标
            const parentCoords = getNodeCoords(parentNode.id, 0); // 父节点的坐标
            if (parentCoords && childCoords) {
              // 确保两个坐标都存在
              // 计算贝塞尔曲线控制点
              const controlX1 = (parentCoords.x + childCoords.x) / 2;
              const controlY1 = parentCoords.y;
              const controlX2 = (parentCoords.x + childCoords.x) / 2;
              const controlY2 = childCoords.y;
              paths.push({
                d: `M ${parentCoords.x},${parentCoords.y} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${childCoords.x},${childCoords.y}`,
                key: `c-${parentNode.id}-${childId}`, // 组合 key,
              });
            }
          });
        });
        pre_cardPaths.value = paths; // 更新路径
      });
    });
    function getNodeCoords(nodeId, childFlag) {
      const element = document.getElementById(`card${nodeId}`); // 使用传入的 nodeId 来获取对应的 DOM 元素
      const table = document.getElementById("tableContainer"); // 使用传入的 nodeId 来获取对应的 DOM 元素
      flag.value = element ? 1 : 0;
      if (element && childFlag) {
        const { top, left, width, height } = element.getBoundingClientRect();
        const x =
          left -
          plotWidth.value * props.level -
          table.offsetLeft -
          5 -
          30 -
          30 * (props.level - 1);
        const y = top - table.offsetTop + height / 2;
        return { x: x, y: y }; // 获取中心点坐标
      } else if (element) {
        const { top, left, width, height } = element.getBoundingClientRect();
        const x =
          left -
          table.offsetLeft -
          plotWidth.value * (props.level - 1) -
          30 * (props.level - 1) +
          2;
        const y = top - table.offsetTop + height / 2;
        return { x: x, y: y }; // 获取中心点坐标
      }
      return null; // 如果没有找到元素，返回 null
    }
    return {
      cardPaths,
      plotWidth,
      plotHeight,
      currentLevelNodes,
      pre_cardPaths,
      flag,
      sectionState,
      alignLevel
    };
  },
};
</script>


<style>
</style>