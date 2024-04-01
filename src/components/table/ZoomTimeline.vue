<template>
    <div class="w-full h-full p-0.8 flex flex-col border-3 border-blue-100">
        <div class="w-full h-full " id="TimelineContainer">
            <div  class="h-120px w-full " >
                <svg class="w-full h-full " id="svg-container" @contextmenu.prevent="toggleZoom">
                    <g ref="brushRef"></g>
                    <path v-for="(d, index) in paths" :key="index" :stroke="colorBar[index % colorBar.length]"
                        fill="none" stroke-width="3" :d="d"></path>
                </svg>
            </div>
        </div>
    </div>
</template>


<script>
import { useStore } from "vuex";
import { ref, computed, onMounted, watch } from "vue";
import { generatePath } from "../../generator/generator";
import { filterDataByTimeRange } from "../../computation/basicComputation"
import * as d3 from "d3";

export default {
    name: "ZoomTimeline",
    props: ["barChartVisible", "level_id"],
    setup(props) {
        const store = useStore();
        const brushRef = ref(null);
        const isZoomed = ref(false);
        const themeColor = computed(() => store.getters["tree/themeColor"]);
        const zoomVisiable = computed(() => store.getters["time/zoomVisiable"])
        const seriesCollection = computed(
            () => store.getters["tree/seriesCollection"]
        );
        const timeRange = computed(() => store.getters["tree/timeRange"]);
        const wholeTimeRange = computed(() => store.getters["time/wholeTimeRange"]);

        const TimelineContainer = ref(null);
        const width = ref(0);
        const height = ref(40);
        const filteredSeriesData = computed(() => {
            // 过滤出所有匹配当前level_id的seriesData_copy
            const data = seriesCollection.value
                .filter((item) => item.level === props.level_id)
                .map((item) => item.seriesData_copy);
            return data
        });
        const paths = computed(() => {
            return filteredSeriesData.value.map(data => {
                return generatePath(data, xScale.value, yScale.value);
            });
        });

        const minValue = computed(() => {
            return Math.min(...filteredSeriesData.value.flatMap(dataSet => dataSet.map(data => data.value)));
        });

        const maxValue = computed(() => {
            return Math.max(...filteredSeriesData.value.flatMap(dataSet => dataSet.map(data => data.value)));
        });
        const xScale = computed(() => {
            return d3
                .scaleTime()
                .domain([
                    new Date(wholeTimeRange.value[0]),
                    new Date(wholeTimeRange.value[1]),
                ])
                .range([0, width.value * 2.5]);
        });
        const yScale = computed(() => {
            return d3.scaleLinear()
                .domain([minValue.value, maxValue.value])
                .range([height.value * 3, 0]); // SVG的y坐标是从上到下增加的，所以我们把最大值放在上面（即0）
        });
        const colorBar = ref(['#bdd7e7', '#6baed6', '#3182bd', '#08519c']);
        const setupBrush = () => {
            if (!brushRef.value) {
                console.log('brushRef is not initialized');
                return;
            }
            const brush = d3.brushX()
                .extent([[0, 0], [width.value*2.5, height.value*3]])
                .on('end', brushed);

            d3.select(brushRef.value).call(brush);
            brushRef.value.brush = brush;
        };

        // 定义处理刷子操作结束的函数
        const brushed = (event) => {
            const selection = event.selection;
            if (selection) {
                const newTimeRange = selection.map(xScale.value.invert);
                store.dispatch('tree/updateTimeRange', newTimeRange);
                store.commit('time/UPDATE_ZOOM');
                d3.select(brushRef.value).call(brushRef.value.brush.move, null);
            }
        };
        const toggleZoom = () => {
            store.commit('time/UPDATE_ZOOM');
        };
        // 监听 isZoomed 的变化，根据其值调整比例尺的 range 来实现放大或缩小
        watch(isZoomed, (newVal) => {
            if (newVal) {
                // 放大状态，调整比例尺的 range
                console.log("is zoom")
                width.value = width.value * 3
                height.value = height.value *3
                console.log("yScale updated", yScale.value.range());
                d3.select('#svg-container').on('contextmenu', function () {
                    d3.select(this).raise();
                });
            } else {
                // 缩小状态，恢复比例尺的 range
                xScale.value.range([0, width.value]);
                yScale.value.range([height.value, 0]);
                width.value = width.value / 3
                height.value = height.value / 3
            }
            // 这里你可能需要重新渲染图表以应用新的比例尺
        });

        onMounted(() => {
            TimelineContainer.value = document.querySelector("#TimelineContainer");
            width.value = TimelineContainer.value.offsetWidth - 30;
            setupBrush();
        });

        return {
            xScale,
            yScale,
            timeRange,
            themeColor,
            width,
            seriesCollection,
            height,
            generatePath,
            colorBar,
            filteredSeriesData,
            maxValue,
            minValue,
            brushRef,
            wholeTimeRange,
            toggleZoom,
            isZoomed,
            paths
        };
    },
};
</script>


<style></style>