<template>
<div class="w-full h-full flex flex-col">
  <NavigationBar />
  <ChronoTable />
</div>

</template>

<script>
import NavigationBar from "./components/NavigationBar.vue"
import ChronoTable from "./components/ChronoTable.vue"
import { useStore } from "vuex"

export default {
  name: 'App',
  components: {
    NavigationBar,
    ChronoTable
  },
  setup() {
    const store = useStore()

    store.dispatch('tree/getPVTree')
  }

}


</script>

<style>

</style>
