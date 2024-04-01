<template>
    <div class="w-full h-full p-0.8 flex flex-col">
        <div class="w-full h-full " id="TimelineContainer">
            <div v-show="barChartVisible" class="h-40px w-full " >
                <svg class="w-full h-full " id="svg-container" @contextmenu.prevent="toggleZoom">
                    <g ref="brushRef"></g>
                    <path v-for="(d, index) in paths" :key="index" :stroke="colorBar[index % colorBar.length]"
                        fill="none" stroke-width="1.5" :d="d"></path>
                </svg>
            </div>
            <div v-if="!barChartVisible" class="h-4px w-full">
                <svg class="w-full h-full">
                    <line :x1="0" :y1="2" :x2="width" :y2="2" stroke="#f5f5f4" stroke-width="4" stroke-linecap="round">
                    </line>
                    <line v-if="timeRange.length > 0" :x1="xScale(new Date(timeRange[0]))" :y1="2"
                        :x2="xScale(new Date(timeRange[1]))" :y2="2" :stroke="themeColor" stroke-width="4"
                        stroke-linecap="round"></line>
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
    name: "Timeline",
    props: ["barChartVisible", "level_id"],
    setup(props) {
        const store = useStore();
        const brushRef = ref(null);
        const isZoomed = ref(false);
        const themeColor = computed(() => store.getters["tree/themeColor"]);
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
                .range([0, width.value]);
        });
        const yScale = computed(() => {
            return d3.scaleLinear()
                .domain([minValue.value, maxValue.value])
                .range([height.value, 0]); // SVG的y坐标是从上到下增加的，所以我们把最大值放在上面（即0）
        });
        const colorBar = ref(['#bdd7e7', '#6baed6', '#3182bd', '#08519c']);
        const setupBrush = () => {
            if (!brushRef.value) {
                console.log('brushRef is not initialized');
                return;
            }
            const brush = d3.brushX()
                .extent([[0, 0], [width.value, height.value]])
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
                d3.select(brushRef.value).call(brushRef.value.brush.move, null);
            }
        };

        //seriesData_copy

        // yScale

        //color

        const SD_Data = computed(() => {
            // console.log("KKK")
            // console.log(store.getters["time/SD"])
            // console.log(store.getters["time/SD"].find(d => d.level == props.level_id)?.SD??[])
            return (
                store.getters["time/SD"].find((d) => d.level == props.level_id)?.SD ??
                []
            );
        });

        // const yScale = computed(() => {
        //   if (SD_Data.value.length > 0) {
        //     const scale = d3
        //       .scaleLinear()
        //       .domain([0, Math.max(...SD_Data.value.map((item) => item.Value))])
        //       .range([height.value, 0]);
        //     console.log("check scale");
        //     console.log(scale(0));
        //     return scale;
        //   } else {
        //     return d3.scaleLinear().domain([0, 0]).range([0, 0]);
        //   }
        // });

        const barWidth = computed(() => {
            if (SD_Data.value.length > 0) {
                console.log("check width");
                console.log(width.value);
                console.log(width.value / SD_Data.value.length);
                return (width.value * 1.0) / SD_Data.value.length - 1;
            } else {
                return 0;
            }
        });
        const toggleZoom = () => {
            store.commit('time/UPDATE_ZOOM');
        };
        // 监听 isZoomed 的变化，根据其值调整比例尺的 range 来实现放大或缩小
        watch(isZoomed, (newVal) => {
            if (newVal) {
                // 放大状态，调整比例尺的 range
                console.log("is zoom")
                width.value = width.value * 2
                // yScale.value.range([height.value * 2, 0]);
                height.value = 80
                // paths.value=[];
                console.log("yScale updated", yScale.value.range());
                d3.select('#svg-container').on('contextmenu', function () {
                    d3.select(this).raise();
                });
            } else {
                // 缩小状态，恢复比例尺的 range
                xScale.value.range([0, width.value]);
                yScale.value.range([height.value, 0]);
                height.value = 40
                width.value = width.value / 2
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
            SD_Data,
            barWidth,
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