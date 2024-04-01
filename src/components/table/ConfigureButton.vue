<template>
    <div class="w-35px h-16px flex flex-row items-center justify-center border-2.2px rounded-lg" :style="{ borderColor: themeColor }">
        <div 
        class="buttonName text-center cursor-pointer"
        :style="{ color: themeColor }"
        >
            {{ buttonName }}
        </div>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed } from 'vue'
export default {
    name: 'ConfigureButton',
    props: ['buttonName'],
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
.buttonName {
    font-size: 0.5rem;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: "semibold";
    font-variation-settings:
        "slnt" 0;
}

</style>

