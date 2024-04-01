<template>
    <a-dropdown :trigger="['contextmenu']">
        <div :class="['w-full p-0.8 hover:opacity-100', { 'opacity-40': !ifEmphasize(selectionTree, node_id, level, level_id_list) }, { 'emphasizeCard': ifEmphasize(selectionTree, node_id, level, level_id_list) }]"
            :id="'card' + node_id" :style="{ height: rowHeight + 'px' }" 
            @mouseover="handleMouseOver(node_id)"
            @mouseout="handleMouseOut(node_id)"
            @click="!hasChildren(selectionTree, node_id) ? unfold(node_id) : fold(node_id)"
            @dblclick="filterCurrentCard(node_id)" @contextmenu.prevent>
            <div 
                :class="['w-full h-full card ', { 'emphasize-effect': ifEmphasize(selectionTree, node_id, level, level_id_list) }]"
                id="cardContainer">
                <svg class="w-full h-full bg-stone-100">
                    <!-- <text x="98%" y="12" class="node-name text-ms" v-if="!averageValue == 0" text-anchor="end">{{ averageValue.toFixed(2) }}</text> -->
                    <g ref="brushRef"></g>
                    <path v-if="!barChartVisible" :stroke="colorBar[level - 1]" fill="none" stroke-width="2"
                        :d="generatePath(seriesData, xScale, yScale)">
                    </path>
                 
                    <line v-if="barChartVisible" x1="0" y1="50%" x2="100%" y2="50%" stroke="#d1d5db" stroke-width="1.5"></line>
                    <g class="bar-chart">
                        <rect 
                        v-if="barChartVisible"
                        v-for="(d, index) in changeData" 
                        :key="'bar' + index"
                            :x="xScale(new Date(d.Time))"
                            :y="d.value > 0 ? yScale_change(d.value) : cardHeight/2"
                            :width="3"
                            :height="Math.abs(cardHeight/2 - yScale_change(d.value))"
                            :fill= "d.value > 0 ? '#ef4444': '#10b981'" 
                            rx="1"
                            ry="1"
                            />
                    </g>
                    <text x="5" y="12" class="node-name text-ms">{{ node_name }}</text>
                </svg>
            </div>
        </div>
        <template #overlay>
            <div>
                <a-menu class="bg-black">
                    <a-menu-item key="1" @click="onClickNode">Node</a-menu-item>
                    <a-menu-item key="2" @click="onClickPath">Path</a-menu-item>
                    <a-menu-item key="3" @click="onClickLayer">Layer</a-menu-item>
                    <a-menu-item key="3" @click="onClickTree">Tree</a-menu-item>
                </a-menu>
            </div>
        </template>
    </a-dropdown>

</template>


<script>
import { useStore } from 'vuex';
import { ref, computed, onMounted, watchEffect } from 'vue'
import * as d3 from 'd3'
import { Dropdown, Menu } from 'ant-design-vue'
import { DownOutlined } from '@ant-design/icons-vue'
import { generatePath } from "../../generator/generator"
import { findPath, findLevelList, buildSubtree, getSubtreeIds } from "../../select/entitySelection"
import { calculateSeriesAverage } from "../../computation/basicComputation"
import { hasChildren, ifEmphasize, findAllRelatedNodeIds, highlightLinks, findChildrenIds } from '../../computation/treeComputation'
import { highlightNodes, deHighlightNodes, highlightEmphaizeCards, deHighlightEmphasizeCards } from "../../highlight/highlight"


export default {
    name: 'TSCard',
    props: ['seriesData', 'level', 'node_id', 'node_name', 'groupedNode'],
    components: {
        'a-dropdown': Dropdown,
        'a-menu': Menu,
        'a-menu-item': Menu.Item,
        DownOutlined,
    },
    setup(props) {
        const store = useStore()
        const selectionTree = computed(() => store.getters["tree/selectionTree"])
        const level_id_list = computed(() => store.getters["tree/level_id_list"])
        const colorBar = computed(() => store.getters["tree/colorBar"])
        const rowHeight = computed(() => store.getters['size/rowHeight'])
        const cardHeight = computed(() => store.getters['size/cardHeight'])
        const cardWidth = computed(() => store.getters['size/cardWidth'])

        const timeRange = computed(() => store.getters['tree/timeRange'])
        
        const xScale = computed(() => store.getters['size/xScale'])
        const yScale = computed(() => store.getters['size/yScale'][props.level - 1])

        const originalTree = computed(() => store.getters["tree/originalTree"])
        const plot_X_Scale = computed(() => store.getters["scatterPlot/plot_X_Scale"])
        const plot_Y_Scale = computed(() => store.getters["scatterPlot/plot_Y_Scale"])
        const coordinateCollection = computed(() => store.getters["scatterPlot/coordinateCollection"])
        const columnWidth = computed(() => store.getters["scatterPlot/columnWidth"])

        const highlightVisible = computed(() => store.getters["scatterPlot/highlightVisible"])
        const barChartVisible = computed(() => store.getters["tree/barChartVisible"][props.level-1])
        
        const seriesCollection = computed(() => store.getters["tree/seriesCollection"])
        const changeData = computed(() => {
            console.log("check")
            return seriesCollection.value.find(node => node.id == props.node_id)["change"]
        })

        const yScale_change = computed(() => {
            return d3.scaleLinear().domain([-3,3]).range([cardHeight.value,0])
        })

        const barWidth = computed(() => {
            return cardWidth.value * 1.0 / changeData.value.length 
        })



        const brushRef = ref(null)
        const averageValue = ref(0)

        watchEffect(() => {
            if(timeRange.value.length > []){
                averageValue.value = calculateSeriesAverage(props.seriesData)
            }
        })

        const setupBrush = () => {
            const brush = d3.brushX()
                .extent([[0, 0], [cardWidth.value, cardHeight.value]])
                .on('end', brushed)
            d3.select(brushRef.value).call(brush);

            // Store the brush for later use
            brushRef.value.brush = brush;
        };

        const brushed = (event) => {
            const selection = event.selection;
            if (selection) {
                const newTimeRange = selection.map(xScale.value.invert)
                store.dispatch('tree/updateTimeRange', newTimeRange)
                // console.log('Selected Time Range:', newTimeRange)
                d3.select(brushRef.value).call(brushRef.value.brush.move, null)
            }
        }

        const unfold = (id) => {
            store.dispatch('tree/selectNodeAndChildren', id)
        }

        const fold = (id) => {
            store.dispatch('tree/deselectNodeAndChildren', id)
        }

        const filterCurrentCard = (id) => {
            const currentNode = selectionTree.value.find(node => node.id == id)
            const level = currentNode.level
            const id_list = selectionTree.value.filter(node => node.id != id && node.level == level).map(node => node.id)
            id_list.forEach(id => {
                store.dispatch('tree/deselectNodeAndChildren', id)
            })
        }

        const handleMouseOver = (id) => {
            if(highlightVisible.value){
                if (ifEmphasize(selectionTree.value, id, props.level, level_id_list.value)) {
                deHighlightEmphasizeCards()
                }
                const id_list = findChildrenIds(id, originalTree.value)
                highlightNodes(id_list)
                store.dispatch('scatterPlot/updateBezierPaths',
                    highlightLinks(
                        id,
                        originalTree.value,
                        coordinateCollection.value,
                        plot_X_Scale.value,
                        plot_Y_Scale.value,
                        columnWidth.value
                ))
            }
        };

        const handleMouseOut = (id) => {
            if(highlightVisible.value){
                if (ifEmphasize(selectionTree.value, id, props.level, level_id_list.value)) {
                highlightEmphaizeCards()
                }
                const id_list = findChildrenIds(id, originalTree.value)
                deHighlightNodes(id_list)
                store.dispatch('scatterPlot/updateBezierPaths', [])
            }   
        }

        const onClickNode = () => {
            console.log(`Click on Node `, props.node_id);
            store.dispatch("selection/addEntity", { type: 'Node', id: props.node_id, level: props.level });
        }

        const onClickPath = () => {
            console.log(`Click on Path`);
            const paths = findPath(props.node_id, selectionTree.value);
            const levelList = paths.length > 0 ? findLevelList(selectionTree.value, paths[0]) : [];
            paths.forEach((path) => {
                const pathEntity = {
                    type: 'Path', // 用于识别实体类型
                    path, // 当前路径
                    levelList, // 与此路径相关的级别列表
                };
                // 将路径实体添加到 Vuex store
                store.dispatch('selection/addEntity', pathEntity);
            });
        }

        const onClickLayer = () => {
            console.log(`Click on Layer`);
        }

        const onClickTree = () => {
            console.log(`Click on Tree`);
            const subtree = buildSubtree(selectionTree.value, props.node_id); // 构建子树
            const path = getSubtreeIds(subtree); // 获取子树的所有节点ID列表
            const levelList = findLevelList(selectionTree.value, path);
            const treeEntity = {
                type: 'Tree', // 用于识别实体类型
                path, // 当前路径
                levelList, // 与此路径相关的级别列表
            };
            // 将路径实体添加到 Vuex store
            store.dispatch('selection/addEntity', treeEntity);
        }

        onMounted(() => {
            cardContainer.value = document.querySelector("#cardContainer")
            store.dispatch('size/updateCardWidth', cardContainer.value?.offsetWidth)
            store.dispatch('size/updateCardHeight', cardContainer.value?.offsetHeight)
            setupBrush()
        })

        return {
            rowHeight,
            xScale,
            yScale,
            generatePath,
            brushRef,
            colorBar,
            fold,
            unfold,
            selectionTree,
            hasChildren,
            ifEmphasize,
            level_id_list,
            filterCurrentCard,
            handleMouseOver,
            handleMouseOut,
            onClickNode,
            onClickPath,
            onClickLayer,
            onClickTree,
            averageValue,
            changeData,
            yScale_change,
            cardHeight,
            barWidth,
            barChartVisible
        }
    }
}

</script>

<style>
.brush .selection {
    fill: rgb(100, 102, 102);
    opacity: 0.3;
}

.emphasize-effect {
    box-shadow: 0 5px 4px -2.5px rgba(151, 192, 204, 0.6);
}

.card :hover {
    box-shadow: 0 5px 4px -2.5px rgba(151, 192, 204, 0.6);
}

.node-name {
    font-size: 6px;
    fill: #4B99D0;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-style: "semibold italic";
    font-variation-settings:
        "slnt" 0;

}
</style>
