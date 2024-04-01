<template>
    <div
      class="w-1/3 h-full flex justify-center"
    >
      <div class="w-1/2 h-full name flex mt-1">
        <div class="text-[#4B99D0] ml-6">{{ entityName }}</div>
      </div>
      <div class="w-1/2 h-full mt-1 flex flex-row">
        <svg class="w-full h-full" viewBox="0 0 16 16" >
          <circle cx="6" cy="5" r="4" fill="#D2E6F8" />
          <text
            x="6"
            y="5"
            :fill="themeColor"
            class="circleNumber"
            text-anchor="middle"
            alignment-baseline="central"
            font-size="6"
          >
            {{ number }}
          </text>
        </svg>
      </div>
    </div>
  </template>
  
  <script>
  import { useStore } from "vuex";
  import { computed, ref, onMounted, watch, watchEffect } from "vue"
  
  export default {
    name: "EntityHeader",
    props: ["entityName", "number", 'entityVisiable'],
    setup(props) {
      const store = useStore();
      const themeColor = computed(() => store.getters["tree/themeColor"]);
      
      return { themeColor,};
    },
  };
  </script>
  
  <style scoped>
  .circleNumber {
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-style: "semibold";
    font-variation-settings: "slnt" 0;
  }
  .name {
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-style: "semibold";
    font-variation-settings: "slnt" 0;
  }
  </style>