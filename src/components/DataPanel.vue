<template>
    <div class="w-full h-full">
        <div class="w-full h-1/4">
            <Configuration />
        </div>
        <div class="w-full h-3/4 pt-2 ">
            <Tree />
        </div>
    </div>

</template>

<script>
import Configuration from "./data_panel/Configuration.vue"
import Tree from "./data_panel/Tree.vue"
export default {
    name: 'DataPanel',
    components: {
        Configuration,
        Tree
    }
}

</script>


<style>


</style>