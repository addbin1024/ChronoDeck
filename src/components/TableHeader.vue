<template>
  <div class="w-full h-full">
    <div class="w-full h-full rounded-md flex flex-col" id="headerContainer">
      <div class="flex flex-row h-1/8 w-full">
        <div
          v-for="(level_name, index) in level_name_list"
          :key="level_name"
          class="flex flex-row h-full"
          :style="{
            width: headerContainer?.offsetWidth * columnPercentage + 'px',
          }"
        >
          <div
            class="h-full flex flex-row items-center"
            :style="{
              width:
                headerContainer?.offsetWidth * columnPercentage - 30 + 'px',
              backgroundColor: colorBar[index],
            }"
          >
            <div class="ml-2 text-ms font-serif text-center text-white title">
              {{ level_name }}
            </div>
            <div class="flex-1 h-full"></div>
            <div class="flex flex-row mr-1">
              <font-awesome-icon
                :icon="['fas', 'toggle-on']"
                class="mr-2 cursor-pointer"
                style="color: #ffffff"
                @click="toggleAlign(level_id_list[index])"
              />
              <font-awesome-icon
                :icon="['fas', 'chart-simple']"
                class="mr-2 cursor-pointer"
                style="color: #ffffff"
                @click="toggleBarChartVisible(index)"
              />
              <font-awesome-icon
                :icon="['fas', 'arrow-up-wide-short']"
                class="mr-2 cursor-pointer"
                style="color: #ffffff"
                @click="sortColumn(level_id_list[index], 'trend-desc')"
              />
              <font-awesome-icon
                :icon="['fas', 'arrow-down-short-wide']"
                class="mr-2 cursor-pointer"
                style="color: #ffffff"
                @click="sortColumn(level_id_list[index], 'trend-asc')"
              />
              <font-awesome-icon
                :icon="['fas', 'draw-polygon']"
                class="mr-2 cursor-pointer"
                style="color: #ffffff"
                @click="processSelectedCircles(level_id_list[index])"
              />
              <font-awesome-icon
                :icon="['fas', 'layer-group']"
                class="cursor-pointer mr-2"
                style="color: #ffffff"
                @click="createLayers(level_id_list[index])"
              />
            </div>
          </div>
          <div
            class="h-full px-0.5px cursor-pointer flex flex-row justify-center items-center"
            :style="{ width: 30 + 'px' }"
            @click="addColumn"
          >
            
          </div>
        </div>
      </div>
      <div class="w-full h-7/8 py-1" style="position: relative; z-index: 2">
        <div class="w-full h-full flex flex-row" id="plotContainer">
          <div
            class="h-full"
            :style="{ width: dynamicWidth + 'px' }"
            @mousedown="startDrawing"
            @mousemove="drawing"
            @mouseup="finishLine"
            @dblclick.prevent="finishDrawing"
          >
            <svg class="h-full" :style="{ width: dynamicWidth + 'px' }">
              
              <!-- 实时绘制的线段 -->
              <line
                v-if="tempEndPoint && points.length > 0"
                :x1="points.slice(-1)[0][0]"
                :y1="points.slice(-1)[0][1]"
                :x2="tempEndPoint[0]"
                :y2="tempEndPoint[1]"
                stroke="#DF1C33"
                style="stroke-width: 4;"
              />
              <polygon
                v-if="points.length >= 3"
                :points="pointsToString"
                fill="red"
                fill-opacity="0.2"
                stroke="#DF1C33"
                stroke-width="4"
              />
              <polyline :points="pointsToString" fill="none" stroke="#DF1C33" store-width="4"/>
              <circle
                v-for="(point, index) in points"
                :key=point[0]
                :cx="point[0]"
                :cy="point[1]"
                r="4"
                fill="white"
                stroke="#DF1C33"
              />
              <!-- <polyline :points="pointsToString" fill="none" stroke="black" /> -->
              <!-- <polygon 之前的有颜色的框框，要用的话注释回去即可，不需要可删掉
                v-if="finalPointsToString"
                :points="finalPointsToString"
                fill="red"
                fill-opacity="0.5"
              /> -->
              <path
                v-for="pathObj in selectNodePaths"
                v-if="linkVisible"
                :key="pathObj.key"
                :d="pathObj.d"
                stroke="rgba(243,194,18)"
                stroke-width="2"
                fill="none"
                class="emphasizeLink cursor-pointer"
                :id="pathObj.key"
                @mouseover="handleMouseOverLink(pathObj.key)"
                @mouseleave="handleMouseOutLink(pathObj.key)"
              />
              <path
                v-for="pathObj in bezierPaths"
                :key="pathObj.key"
                :d="pathObj.d"
                stroke="rgb(243,194,18)"
                stroke-width="2"
                fill="none"
                fill-opacity="0.5"
              />
              <g
                v-for="(level_name, index) in level_name_list"
                :key="level_name"
                class="h-full"
                :transform="
                  'translate(' +
                  headerContainer?.offsetWidth * columnPercentage * index +
                  ', 0)'
                "
              >
                <rect
                  x="0"
                  y="0"
                  :width="headerContainer?.offsetWidth * columnPercentage - 30"
                  height="100%"
                  stroke="#e5e7eb"
                  stroke-width="2"
                  fill="none"
                  rx="5"
                ></rect>
                <circle
                  v-for="circle in circlesData[level_id_list[index]].filter(
                    (circle) => !hasNode(selectionTree, circle.key)
                  )"
                  class="node cursor-pointer"
                  :id="'node' + circle.key"
                  :key="circle.key"
                  :cx="circle.cx"
                  :cy="circle.cy"
                  :r="circle.r"
                  :fill="colorBar[index]"
                  :fill-opacity="circle.fillOpacity"
                  :stroke="circle.stroke"
                  :stroke-width="circle.strokeWidth"
                  @click="handleNodeClick(circle.key)"
                  @dblclick="filterCurrentNode(circle.key)"
                  @mouseover="handleMouseOver(circle.key, level_id_list[index])"
                  @mouseout="handleMouseOut(circle.key, level_id_list[index])"
                ></circle>
                <circle
                v-for="circle in circlesData[level_id_list[index]].filter(
                  (circle) =>
                    hasNode(selectionTree, circle.key) &&
                    !ifEmphasize(
                      selectionTree,
                      circle.key,
                      level_id_list[index],
                      level_id_list
                    )
                )"
                class="node cursor-pointer foldNode"
                :id="'node' + circle.key"
                :key="circle.key"
                :cx="circle.cx"
                :cy="circle.cy"
                :r="circle.r"
                :fill="colorBar[index]"
                :fill-opacity="clusterVisible ? 0.05 : circle.fillOpacity"
                :stroke="clusterVisible ? 'none' : circle.stroke"
                :stroke-width="circle.strokeWidth"
                @click="handleNodeClick(circle.key)"
                @dblclick="filterCurrentNode(circle.key)"
                @mouseover="handleMouseOver(circle.key, level_id_list[index])"
                @mouseout="handleMouseOut(circle.key, level_id_list[index])"
              ></circle>
              <circle
                v-for="circle in circlesData[level_id_list[index]].filter(
                  (circle) =>
                    ifEmphasize(
                      selectionTree,
                      circle.key,
                      level_id_list[index],
                      level_id_list
                    )
                )"
                class="node cursor-pointer emphasizeNode"
                :id="'node' + circle.key"
                :key="circle.key"
                :cx="circle.cx"
                :cy="circle.cy"
                :r="circle.r"
                :fill="colorBar[index]"
                :fill-opacity="clusterVisible ? 0.05 : circle.fillOpacity"
                :stroke="clusterVisible ? 'none' : circle.stroke"
                :stroke-width="circle.strokeWidth"
                @mouseover="handleMouseOver(circle.key, level_id_list[index])"
                @mouseout="handleMouseOut(circle.key, level_id_list[index])"
                @click="handleNodeClick(circle.key)"
                @dblclick="filterCurrentNode(circle.key)"
              ></circle>

              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";
import {
  calculatePlotLinks,
  calculateCircles,
  hasChildren,
  ifEmphasize,
  hasNode,
  highlightLinks,
  findAllRelatedNodeIds,
  findChildrenIds,
} from "../computation/treeComputation";
import {
  highlightNodes,
  deHighlightNodes,
  highlightLink,
  highlightEmphaizeCards,
  deHighlightEmphasizeCards,
} from "../highlight/highlight";
import {
  isPointInPolygon,
  isIdInSelectionTree,
  lassoHasChildren,
} from "../select/lassoSelection";

export default {
  name: "TableHeader",
  setup() {
    const headerContainer = ref(null);
    const plotContainer = ref(null);

    const store = useStore();
    const columnPercentage = computed(
      () => store.getters["size/columnPercentage"]
    );

    const linkVisible = computed(
      () => store.getters["scatterPlot/linkVisible"]
    );

    const colorBar = computed(() => store.getters["tree/colorBar"]);
    const dataset = computed(() => store.getters["tree/dataset"]);
    const originalTree = computed(() => store.getters["tree/originalTree"]);
    const selectionTree = computed(() => store.getters["tree/selectionTree"]);
    const levels = computed(() => store.getters["tree/levels"]);
    const level_id_list = computed(() => store.getters["tree/level_id_list"]);
    const level_name_list = computed(() =>
      level_id_list.value.map((id) => levels.value[id - 1])
    );
    const alignState = computed(() => store.getters["align/alignState"]);

    const clusterVisible = computed(() => store.getters["scatterPlot/clusterVisible"])

    const bezierPaths = computed(
      () => store.getters["scatterPlot/bezierPaths"]
    );
    const plot_X_Scale = computed(
      () => store.getters["scatterPlot/plot_X_Scale"]
    );
    const plot_Y_Scale = computed(
      () => store.getters["scatterPlot/plot_Y_Scale"]
    );
    const coordinateCollection = computed(
      () => store.getters["scatterPlot/coordinateCollection"]
    );

    const dynamicWidth = computed(() => {
      if (headerContainer.value && level_name_list.value) {
        return (
          headerContainer.value.offsetWidth *
          columnPercentage.value *
          level_name_list.value.length
        );
      }
      return 0;
    });

    const selectNodePaths = computed(() => {
      let allPaths = [];
      const newTree = selectionTree.value.filter((node) =>
        ifEmphasize(
          selectionTree.value,
          node.id,
          node.level,
          level_id_list.value
        )
      );
      newTree.forEach((node) => {
        if (hasChildren(selectionTree.value, node.id)) {
          const pathsForNode = calculatePlotLinks(
            node.id,
            selectionTree.value,
            coordinateCollection.value,
            plot_X_Scale.value,
            plot_Y_Scale.value,
            headerContainer.value.offsetWidth * columnPercentage.value,
            level_id_list.value
          );
          allPaths = allPaths.concat(pathsForNode);
        }
      });
      return allPaths;
    });

    const circlesData = computed(() => {
      return calculateCircles(
        level_id_list.value,
        coordinateCollection.value,
        plot_X_Scale.value,
        plot_Y_Scale.value,
        selectionTree.value
      );
    });

    const handleMouseOver = (id, level) => {
      if (ifEmphasize(selectionTree.value, id, level, level_id_list.value)) {
        deHighlightEmphasizeCards();
      }
      const id_list = findChildrenIds(id, originalTree.value);
      highlightNodes(id_list);
      store.dispatch(
        "scatterPlot/updateBezierPaths",
        highlightLinks(
          id,
          originalTree.value,
          coordinateCollection.value,
          plot_X_Scale.value,
          plot_Y_Scale.value,
          headerContainer.value.offsetWidth * columnPercentage.value
        )
      );
    };

    const handleMouseOut = (id, level) => {
      if (ifEmphasize(selectionTree.value, id, level, level_id_list.value)) {
        highlightEmphaizeCards();
      }
      const id_list = findChildrenIds(id, originalTree.value);
      deHighlightNodes(id_list);
      store.dispatch("scatterPlot/updateBezierPaths", []);
    };

    const handleMouseOverLink = (key) => {
      deHighlightEmphasizeCards();
      highlightNodes(key.split("-"));
      highlightLink(key);
    };

    const handleMouseOutLink = (key) => {
      highlightEmphaizeCards();
      deHighlightNodes(key.split("-"));
    };

    const handleNodeClick = (id) => {
      if (!hasChildren(selectionTree.value, id)) {
        store.dispatch("tree/selectNodeAndChildren", id);
      } else {
        store.dispatch("tree/deselectNodeAndChildren", id);
      }
    };

    const addColumn = () => {
      store.dispatch("tree/addLevelToLevelIdList");
    };

    const sortColumn = (level, mode) => {
      const id_list = selectionTree.value
        .filter((node) => node.level == level)
        .map((node) => node.id);
      store.dispatch("tree/sortSelectionTree", {
        id_list: id_list,
        mode: mode,
      });
    };

    const createLayers = (level_id) => {
      // const obj = { dataset: dataset.value, level_id: level_id };
      // store.dispatch("tree/addLayer", obj);
      const obj = {id1 : 9, id2: 12}
      store.dispatch("tree/mergeTrees", obj)
    };

    const filterCurrentNode = (id) => {
      const currentNode = selectionTree.value.find((node) => node.id == id);
      const level = currentNode.level;
      const id_list = selectionTree.value
        .filter((node) => node.id != id && node.level == level)
        .map((node) => node.id);
      id_list.forEach((id) => {
        store.dispatch("tree/deselectNodeAndChildren", id);
      });
    };

    const toggleAlign = (level_id) => {
      if (alignState.value == false) {
        store.dispatch("align/updateAlignState", true);
        store.dispatch("align/updateAlignLevel", level_id);
        store.dispatch("align/calculateAlignID");
      } else {
        store.dispatch("align/updateAlignState", false);
        store.dispatch("align/updateAlignLevel", 1);
        store.dispatch("align/calculateAlignID");
      }
    };

    const toggleBarChartVisible = (level) => {
      store.dispatch("tree/updateBarChartVisible", level)
    }
    //lasso function

    const canDraw = ref(false); // 控制是否可以开始绘制
    const points = ref([]); // 存储多边形的顶点
    const tempEndPoint = ref(null); // 存储实时拖动时的临时终点

    function startDrawing(event) {
      // 如果还未开始绘制或者刚刚完成了绘制，初始化第一个点
      if (!canDraw.value || points.value.length === 0) {
        canDraw.value = true;
        tempEndPoint.value = null; // 重置临时终点
        points.value.push([event.offsetX, event.offsetY]);
        event.preventDefault();
      }
    }

    function drawing(event) {
      // 如果正在绘制，更新临时终点以实时显示线段
      if (canDraw.value) {
        tempEndPoint.value = [event.offsetX, event.offsetY];
        event.preventDefault();
      }
    }

    function finishLine(event) {
      // 如果已有起点，则确定线段并准备开始新线段
      if (canDraw.value && points.value.length > 0) {
        points.value.push([event.offsetX, event.offsetY]);
        tempEndPoint.value = null; // 确定线段后重置临时终点
      }
    }

    function finishDrawing() {
      // 双击结束绘制，完成多边形
      if (points.value.length > 2) {
        canDraw.value = false;
        points.value.push(points.value[0]); // 将最后一个点连接到第一个点
      }
    }

    //选中之后的过滤函数
    const processSelectedCircles = (level_id) => {
      let selectedCircleIds = [];
      const offset =
        headerContainer.value.offsetWidth *
        columnPercentage.value *
        (level_id - 1);
      for (let circle of circlesData.value[level_id]) {
        if (isPointInPolygon([circle.cx, circle.cy], points.value, offset)) {
          selectedCircleIds.push(circle.key);
        }
      }
      // 处理选中的圆的 ID
      const filteredSelectedCircleIds = selectedCircleIds.filter((id) =>
        isIdInSelectionTree(id, selectionTree.value)
      );
      //console.log("Filtered selected circles:", filteredSelectedCircleIds)
      const deleteIds = selectionTree.value.filter(node => node.level == level_id).filter(node => !filteredSelectedCircleIds.includes(node.id)).map(node => node.id)
      store.dispatch("tree/deleteNodes", deleteIds)



      points.value = [];
    };
    const pointsToString = computed(() => {
      return points.value.map((point) => point.join(",")).join(" ");
    });

    onMounted(() => {
      headerContainer.value = document.querySelector("#headerContainer");
      plotContainer.value = document.querySelector("#plotContainer");
      store.dispatch(
        "scatterPlot/updatePlotWidth",
        headerContainer.value.offsetWidth * columnPercentage.value - 30
      );
      store.dispatch(
        "scatterPlot/updateColumnWidth",
        headerContainer.value.offsetWidth * columnPercentage.value
      );
      store.dispatch(
        "scatterPlot/updatePlotHeight",
        plotContainer.value.offsetHeight
      );
    });

    return {
      selectionTree,
      headerContainer,
      plotContainer,
      level_id_list,
      level_name_list,
      colorBar,
      plot_X_Scale,
      plot_Y_Scale,
      coordinateCollection,
      circlesData,
      dynamicWidth,
      columnPercentage,
      bezierPaths,
      selectNodePaths,
      handleNodeClick,
      handleMouseOver,
      handleMouseOut,
      handleMouseOverLink,
      handleMouseOutLink,
      addColumn,
      sortColumn,
      createLayers,
      filterCurrentNode,
      hasNode,
      ifEmphasize,
      alignState,
      toggleAlign,
      linkVisible,
      pointsToString,
      startDrawing,
      drawing,
      finishLine,
      finishDrawing,
      canDraw,
      points,
      tempEndPoint,
      processSelectedCircles,
      clusterVisible,
      toggleBarChartVisible
    };
  },
};
</script>

<style>
.title {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: "semibold";
  font-variation-settings: "slnt" 0;
}
</style>