<template>
  <div class="w-full h-full">
    <div class="w-full flex flex-row justify-between" :style="{ height: headerHeight + 'px' }">
      <EntityHeader entityName="Node" :number="nodeEntities.length" > </EntityHeader>
      <EntityHeader entityName="Path" :number="pathEntities.length" > </EntityHeader>
      <EntityHeader entityName="Layer" number=0 > </EntityHeader>
      <EntityHeader entityName="Tree" :number="treeEntities.length" > </EntityHeader>
    </div>
    <div class="w-full mt-2 mb-3 px-2"><div class="border-solid border-1 border-light-800"></div></div>
    <NodeCard
      v-for="entity in nodeEntities"
      :key="entity.id"
      :id="entity.id"
      :entityID="entity.entityID"
      :level="entity.level"
    />
    <PathCard
      v-for="(entity) in pathEntities"
      :key="entity.entityID"
      :id_list="entity.path"
      :level_list="entity.levelList"
      :entityID="entity.entityID"
      :related="false"
    />
    <TreeCard
      v-for="(entity) in treeEntities"
      :key="entity.entityID"
      :id_list="entity.path"
      :level_list="entity.levelList"
      :entityID="entity.entityID"
      :related="false"
    />
  </div>
</template>

<script>
import NodeCard from "./selection_panel/NodeCard.vue";
import PathCard from "./selection_panel/PathCard.vue";
import TreeCard from "./selection_panel/TreeCard.vue";
import EntityHeader from "./selection_panel/EntityHeader.vue";
import ConfigureButton from "./table/ConfigureButton.vue";

import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";
export default {
  name: "SelectionPanel",
  components: {
    NodeCard,
    PathCard,
    TreeCard,
    EntityHeader,
    ConfigureButton,
  },
  setup() {
    const store = useStore();
    const entityCollection = computed(
      () => store.getters["selection/entityCollection"]
    );
    const nodeEntities = computed(() => {
      return entityCollection.value.filter((entity) => entity.type === "Node");
    });
    const pathEntities = computed(() => {
      return entityCollection.value.filter((entity) => entity.type === "Path");
    });
    const treeEntities = computed(() => {
      return entityCollection.value.filter((entity) => entity.type === "Tree");
    });
    const width = ref(0);
    const height = ref(0);
    const headerContainer = ref(null);
    const headerHeight = computed(() => height.value / 8);
    onMounted(() => {
      headerContainer.value = document.querySelector("#headerContainer");
      width.value = headerContainer.value.offsetWidth;
      height.value = headerContainer.value.offsetHeight;
      console.log("height is ", height.value)
      // height.value = 700;
    });

    return {
      nodeEntities,
      pathEntities,
      treeEntities,
      entityCollection,
      headerHeight
    };
  },
};
</script>


<style></style>