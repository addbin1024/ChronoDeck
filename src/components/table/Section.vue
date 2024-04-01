<template>
    <div class="w-full flex flex-col">
        <TSCard
        v-for = "(id,index) in node_id_list.filter(id => (!foldState || ifEmphasize(selectionTree, id, level_id, level_id_list)))"
        :key = "id"
        :seriesData = findSeriesData(id)
        :level = "level_id"
        :node_id = "id"
        :node_name = findNodeName(id)
        :groupedNode = groupedNodeFlag(id)
        />
        <div 
        class="w-full p-0.8 py-0"
        v-show="level_id > alignLevel"
        >
            <div class="w-full flex flex-col">
                <div 
                class="w-full h-27px flex flex-row justify-center items-center"
                v-if="configureShow"
                >
                    <div v-if="foldState">
                        <CircleIcon
                        :number = "hideSeriesNumber"
                        />

                    </div>
                    <div class="flex-1"></div>
                    <div 
                    class="flex flex-row"
                    v-if="!foldState"
                    >
                        <ConfigureButton 
                        class="mr-1"
                        buttonName='sort'
                        @click="sortSection()"
                         />
                         <ConfigureButton 
                         buttonName='hide'
                         @click="toggleFoldState()"
                         />
                    </div>
                    <div 
                    class="flex flex-row"
                    v-else-if="foldState"
                    >
                         <ConfigureButton 
                         buttonName='unfold'
                         @click="toggleFoldState()"
                         />
                    </div>
                </div>
                <div class="w-full h-4px cursor-pointer mt-4px" @click="toggleConfigureShow()">
                    <svg class="w-full h-full">
                        <line x1="0" y1="0" x2="100%" y2="0" :stroke="themeColor" stroke-width="2px" stroke-dasharray="8,8" >
                        </line>
                    </svg>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import TSCard from './TSCard.vue'
import ConfigureButton from './ConfigureButton.vue'
import CircleIcon from './CircleIcon.vue'
import { useStore } from 'vuex'
import { computed,ref } from 'vue' 
import { ifEmphasize } from '../../computation/treeComputation'

export default {
    name: 'Section',
    props: ['node_id_list', 'level_id'],
    components: {
        TSCard,
        ConfigureButton,
        CircleIcon
    },
    setup(props) {
        const store = useStore()
        const seriesCollection = computed(() => store.getters["tree/seriesCollection"])
        const selectionTree =computed(() => store.getters["tree/selectionTree"])
        const level_id_list = computed(() => store.getters["tree/level_id_list"])
        const themeColor = computed(() => store.getters["tree/themeColor"])

        const configureShow = ref(false)
        const foldState = ref(false)

        const alignState = computed(() => store.getters["align/alignState"])
        const alignLevel = computed(() => store.getters["align/alignLevel"])
  
        const findSeriesData = (id) => {
            return seriesCollection.value.find(node => node.id ==id)?.seriesData??[]
        }

        const findNodeName = (id) => {
            let name = seriesCollection.value.find(node => node.id ==id)?.node_name??""
            name = name.split('-')
            return name[name.length - 1]
        }

        const groupedNodeFlag = (id) => {
            const attribute = selectionTree.value.find(node => node.id == id)?.attribute??""
            if(attribute.includes("group")) {
                return true
            }
            else {
                return false
            }    
        }

        const toggleConfigureShow = () => {
            configureShow.value = !configureShow.value
        }

        const toggleFoldState = () => {
            foldState.value = !foldState.value
            store.dispatch("align/updateSectionState")
        }

        const sortSection = () => {
            store.dispatch("tree/sortSelectionTree", {"id_list":props.node_id_list, "mode":'asc'})

        }

        const hideSeriesNumber = computed(() => {
            const hide_node_list = props.node_id_list.filter(id => !ifEmphasize(selectionTree.value, id, props.level, level_id_list.value))
            return hide_node_list.length
        })


        

        return {
            themeColor,
            seriesCollection,
            selectionTree,
            level_id_list,
            findSeriesData,
            findNodeName,
            groupedNodeFlag,
            configureShow,
            foldState,
            alignState,
            alignLevel,
            toggleConfigureShow,
            toggleFoldState,
            sortSection,
            ifEmphasize,
            hideSeriesNumber
        }

    }
}

</script>

<style>

</style>




