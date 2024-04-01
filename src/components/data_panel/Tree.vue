<template>
  <div class="w-full h-full p-2">
    <div ref="chart" class="w-full h-full" id="TContainer"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watchEffect, nextTick } from "vue";
import * as d3 from "d3";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();
    const originalTree = computed(() => store.getters["tree/originalTree"]);
    const selectionTree = computed(() => store.getters["tree/selectionTree"]);
    const flag = ref(0);
    const width = ref(0);
    const height = ref(0);
    const TContainer = ref(null);
    const chart = ref(null);
    const convertedTree = computed(() => {
      const root = { name: "Root", children: [] };
      const idMap = new Map();
      originalTree.value.forEach((node) => {
        idMap.set(node.id, {
          id: node.id,
          name: node.node_name,
          children: [],
          level: node.level,
        });
      });
      originalTree.value.forEach((node) => {
        if (node.children_id.length > 0) {
          const parentNode = idMap.get(node.id);
          node.children_id.forEach((childId) => {
            const childNode = idMap.get(childId);
            parentNode.children.push(childNode);
          });
        }
      });
      root.children = originalTree.value
        .filter((node) => node.parent_id === 0)
        .map((node) => idMap.get(node.id));
      return root;
    });
    watchEffect(() => {
      if (originalTree.value.length != 0) {
        renderChart(width.value, height.value);
      }
    });
    onMounted(() => {
      TContainer.value = document.querySelector("#TContainer");
      width.value = TContainer.value.offsetWidth;
      height.value = TContainer.value.offsetHeight;
      // height.value = 700;
    });

    const renderChart = (width, height) => {
      d3.select(chart.value).selectAll("svg").remove();
      const svg = d3
        .select(chart.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(-80,0)");

      const cluster = d3.cluster().size([height, width * 1.3]);
      //console.log("oringinal tree is", originalTree.value);
      const root = d3.hierarchy(convertedTree.value, function (d) {
        return d.children;
      });
      //console.log("root is", root);
      cluster(root);

      svg
        .selectAll("path")
        .data(root.descendants().slice(2))
        .enter()
        .append("path")
        .attr("d", function (d) {
          return (
            "M" +
            d.y +
            "," +
            d.x +
            "C" +
            (d.parent.y + 20) +
            "," +
            d.x +
            " " +
            (d.parent.y + 75) +
            "," +
            d.parent.x +
            " " +
            d.parent.y +
            "," +
            d.parent.x
          );
        })
        .style("fill", "none")
        .attr("stroke", function (d) {
          // 检查当前线条连接的节点是否都在 selectionTree 中
          const inSelectionTree =
            selectionTree.value.some((node) => node.id === d.data.id) &&
            selectionTree.value.some((node) => node.id === d.parent.data.id);
          return inSelectionTree ? "#4B99D0" : "#ccc";
        })
        .attr("stroke-width", 0.4)
        .attr("id", (d) => "treePath-" + d.parent.data.id + "-" + d.data.id); // 设置每个 path 的 ID，为父节点-子节点，例如 "treePath-0-1",

      svg
        .selectAll("g")
        .data(root.descendants().slice(1))
        .enter()
        .append("g")
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        })
        .append("circle")
        .attr("r", 1.5)
        .style("fill", "#DFDFDF")
        .attr("stroke", "none")
        .style("stroke-width", 0.1)
        .attr("id", (d) => "treeCircle-" + d.data.id); // 设置每个 circle 的 ID，例如 "treeCircle-0",
    };
    return { chart, originalTree };
  },
};
</script>


<style>
</style>