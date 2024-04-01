<template>
        <div class="w-full h-full rounded-md flex flex-row tableContainer" id="tableContainer">
            <div 
            v-for="(level_id, index) in level_id_list"
            :key="level_id"
            class="flex flex-row h-full "
            >
                <div 
                class="h-full flex flex-col border-1 rounded-md overflow overflow-scroll"
                :style="{
                width: tableContainer?.offsetWidth * columnPercentage - 30 + 'px'
                }">
                    <div 
                    class="w-full flex flex-col"
                    v-if = "level_id >= alignLevel"
                    v-for="(align_id, index) in alignID"
                    :key="align_id"
                    >
                        <div 
                        class="w-full h-full flex flex-col"
                        :style="{ height: heightForEachAlignID[align_id] + 'px' }"
                        >
                            <Section
                            v-for="(parent_id, index) in groupLevelByParentId(level_id, selectionTree, align_id, alignLevel)"
                            :key = parent_id
                            :node_id_list = "findNodesByParentId(parent_id, selectionTree, level_id, align_id, alignLevel)"
                            :level_id = "level_id"
                            />
                        </div>
                    </div>
                    <div 
                    class="w-full flex flex-col"
                    v-else-if="level_id < alignLevel"
                    >
                        <Section
                        v-for="(parent_id, index) in groupLevelByParentId(level_id, selectionTree, 1, 1)"
                        :key = parent_id
                        :node_id_list = "findNodesByParentId(parent_id, selectionTree, level_id, 1, 1)"
                        :level_id = "level_id"
                        />
                    </div>
                    
                </div>
                <div class="w-30px h-full">
                    <LinkColumn 
                    v-if="level_id != level_id_list.length"
                    :level = level_id
                    />

                </div>
            </div>
        </div>
</template>

<script>
import Section from "./Section.vue"
import LinkColumn from './LinkColumn.vue'
import { computed, ref, watchEffect, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { findAlignAncester } from "../../align/align"

export default {
    name: 'Table',
    components: {
        Section,
        LinkColumn
    },
    setup() {
        const tableContainer = ref(null)

        const store = useStore()
        const selectionTree = computed(()=>store.getters['tree/selectionTree'])
        const columnPercentage = computed(()=>store.getters['size/columnPercentage'])
        const rowNum = computed(()=>store.getters['size/rowNum'])
        const level_id_list = computed(() => store.getters["tree/level_id_list"])
        const alignID = computed(() => store.getters["align/alignID"])
        const alignLevel = computed(() => store.getters["align/alignLevel"])
        const alignState = computed(() => store.getters["align/alignState"])
        const rowHeight = computed(() => store.getters["size/rowHeight"])





        const groupLevelByParentId = (level_id, tree, align_id, alignLevel) => {
            //alignLevel只可能是1或2
            if(alignLevel == 1 || level_id < alignLevel){
                const parent_list = [...new Set(tree.filter(node => node.level == level_id).map( node => node.parent_id))]
                return parent_list
            }
            else if(level_id == alignLevel){
                return [align_id]
            }
            else if(level_id > alignLevel){
                const parent_list = [...new Set(tree.filter(node => node.level == level_id).filter(node => findAlignAncester(node.id, tree, alignLevel) == align_id).map( node => node.parent_id))]
                return parent_list
            }
        }
        
        const findNodesByParentId = (parent_id, tree, level_id, align_id, alignLevel) => {
            if(alignLevel == 1 || level_id < alignLevel){
                return tree.filter(node => node.parent_id == parent_id).map(node => node.id)    
            }
            else if(level_id == alignLevel){
                return tree.filter(node => node.id == align_id).map(node => node.id)
            }
            else if(level_id > alignLevel){
                return tree.filter(node => node.parent_id == parent_id).map(node => node.id)    
            }   
        }

        const heightForEachAlignID = computed(() => {
            const heightCollection = {};
            alignID.value.forEach(align_id => {
                let maxHeight = 0;
                level_id_list.value.filter(level => level >= alignLevel.value).forEach(level_id => {
                    let TSCardNumber = selectionTree.value.filter(node => node.level == level_id).filter(node => findAlignAncester(node.id, selectionTree.value, alignLevel.value) == align_id).length
                    let ConfigureNumber = [...new Set(selectionTree.value.filter(node => node.level == level_id).filter(node => findAlignAncester(node.id, selectionTree.value, alignLevel.value) == align_id).map(node => node.parent_id))].length
                    let overallHeight = TSCardNumber * rowHeight.value + ConfigureNumber * 10 //超参
                    if(overallHeight > maxHeight){
                        maxHeight = overallHeight
                    }
                })
                heightCollection[align_id] = maxHeight;
            })
            // console.log("check alignHeightCollection")
            // console.log(heightCollection)
            return heightCollection;
        });



        onMounted(()=>{
            tableContainer.value = document.querySelector("#tableContainer")
            store.dispatch("size/updateRowHeight", tableContainer.value?.offsetHeight / rowNum.value)
        })


        return {
            selectionTree,
            level_id_list,
            alignID,
            alignLevel,
            columnPercentage,
            tableContainer,
            groupLevelByParentId,
            findNodesByParentId,
            heightForEachAlignID
        }
    }
}



</script>

<style>
</style>