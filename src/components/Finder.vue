<template>
    <div v-if="zoomVisiable" class="absolute top-0 left-0 w-full h-full bg-light-300 bg-opacity-50"></div>
    <div class="w-full h-full flex flex-col TableCss">
        <div class="w-full h-1/4">
            <TableHeader />
        </div>
        <div :style="`height: ${height}px`" class="w-full flex flex-row z-30">
            <div v-for="(level_id, index) in level_id_list" :key="level_id" @click="showBarChart()"
                class="cursor-pointer w-1/4 h-full">
                <Timeline :barChartVisible="barChartVisible" :level_id="level_id" />
            </div>
        </div>
        <div class="w-full pt-2" :style="`height: calc(75% - ${height}px)`">
            <Table />
        </div>
    </div>
    <!-- <div v-if = "zoomVisiable" class="w-180 h-35 Zoomcss bg-light-50">
            <ZoomTimeLine :barChartVisible="barChartVisible" :level_id="zoomLevel" />
    </div> -->
</template>

<script>
import TableHeader from './TableHeader.vue'
import Timeline from './table/Timeline.vue'
import ZoomTimeLine from './table/ZoomTimeline.vue'
import Table from './table/Table.vue'
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
export default {
    name: 'Finder',
    components: {
        TableHeader,
        Timeline,
        Table,
        ZoomTimeLine
    },
    setup() {
        const store = useStore()
        const level_id_list = computed(() => store.getters["tree/level_id_list"])
        const zoomVisiable = computed(() => store.getters["time/zoomVisiable"])
        const height = ref(5)
        const zoomLevel = ref(2)
        const barChartVisible = ref(false)

        const showBarChart = () => {
            barChartVisible.value = !barChartVisible.value;
            height.value = barChartVisible.value ? 40 : 5;
        }

        return {
            height,
            barChartVisible,
            showBarChart,
            level_id_list,
            zoomVisiable,
            zoomLevel
        }
    }
}
</script>

<style>
.Zoomcss {
  position: absolute;
  top: 35%;
  left: 35%;
  transform: translate(-50%, -50%);
  z-index: 40; /* 确保这个值高于其他内容 */
  display: flex;
  flex-direction: row; /* flex-row 效果 */
  justify-content: center; /* 水平居中内部元素 */
  align-items: center; /* 垂直居中内部元素 */
}

.TableCss {
  position: relative; /* 如果需要，可以根据实际情况调整 */
  z-index: 20; /* 确保 TableCss 不会被 Zoomcss 遮挡 */
}
</style>
