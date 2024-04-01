<template>
    <div class="h-24/25 w-full flex flex-row">
        <div class="w-2/17 h-full px-2 py-5">
            <DataPanel />
        </div>
        <div class="w-11/17 h-full py-5 px-3">
            <Finder />
        </div>
        <div class="w-4/17 h-full pr-3 py-5">
            <SelectionPanel />
        </div>


    </div>

</template>

<script>
import Finder from './Finder.vue'
import DataPanel from './DataPanel.vue'
import SelectionPanel from './SelectionPanel.vue';

export default {
    name: 'ChronoTable',
    components: {
    Finder,
    DataPanel,
    SelectionPanel
}
}



</script>

<style>

</style>