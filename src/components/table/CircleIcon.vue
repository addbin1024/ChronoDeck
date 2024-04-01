<template>
    <svg width="16" height="16"> 
        <circle cx="8" cy="8" r="8" fill="#DDEAF7" /> 
        <text x="50%" y="50%" :fill="themeColor" font-size="8" alignment-baseline="middle" text-anchor="middle" class="circleNumber">{{ number }}</text> 
    </svg>
</template>

<script>
import { useStore } from 'vuex'
import { computed } from 'vue'
export default {
    name: 'CircleIcon',
    props: ['number'],
    setup() {
        const store = useStore()
        const themeColor = computed(() => store.getters["tree/themeColor"])
        return {
            themeColor
        }
        
    }
}
</script>

<style>
.circleNumber {
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: "semibold";
  font-variation-settings:
    "slnt" 0;
}

</style>
