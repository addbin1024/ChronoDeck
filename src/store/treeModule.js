import axios from "axios"
import { clone, cloneDeep, update } from 'lodash'
import { transformData, filterDataByTimeRange, calculateSeriesAverage, calculateSeriesTrend, calculateAverageSeries } from "../computation/basicComputation"
import { updateSelectionFromOriginal, addLevels, updateSeriesCollection } from "../update/updateTree"
import { addPlotScale, addYScale } from "../update/updateScale"
import { selection } from "d3"



const state = {
    originalTree : [],
    selectionTree : [], 
    seriesCollection: [],
    dataset: 'PV',
    levels: ['Index', 'Sector', 'Stock'],
    // levels: ['Transformer', 'Converter', 'Line'],
    description: ['-kw/h', '-kw/h', '-mA', '-mA'],
    level_id_list: [],
    timeRange: [],
    colorBar: ["#4B99D0", "#4B99D0", "#4B99D0","#4B99D0", "#4B99D0","#4B99D0"],
    groupState: false,
    themeColor: "#4B99D0",
    barChartVisible: [false, false, false, false]
}

const mutations = {
    UPDATE_ORIGINAL_TREE(state, payload){
        console.log("check originalTree")
        console.log(payload)
        state.originalTree = payload
    },
    UPDATE_SELECTION_TREE(state, payload){
        // if(state.groupState == true) {
        //   console.log("CHECK SelectionTree")
        //   console.log(payload)
        // }
        state.selectionTree = payload
    },
    UPDATE_SERIES_COLLECTION(state, payload){
        console.log("CHECK Series Collection")
        console.log(payload)
        state.seriesCollection = payload
    },
    UPDATE_TIME_RANGE(state, payload){
      console.log("check timeRange")
      console.log(payload)
      state.timeRange = payload 

    },
    UPDATE_LEVEL_ID_LIST(state, payload) {
      state.level_id_list = payload
    },
    UPDATE_LEVELS(state, payload) {
      state.levels = payload
    }

}

const actions = {
    getPVTree({state, dispatch, commit}) {
        axios.get('/api/PVTree').then((response) => {
            commit('UPDATE_ORIGINAL_TREE', response.data.PV_Tree)
            // console.log("CHECK")
            // console.log(response.data.PV_Tree)
            dispatch('addToSelectionTree',cloneDeep(state.originalTree.slice(0,1)))
            dispatch("time/updateSD", response.data.SD, {root: true})
            console.log("check SD")
            console.log(response.data.SD)
        })
    },
    updateSelectionTree({state, commit, dispatch}, currentSelectionTree){
      commit('UPDATE_SELECTION_TREE', currentSelectionTree)
      if(state.level_id_list.length != [...new Set(currentSelectionTree.map((node) => node.level))].length && state.groupState == false){
        dispatch('updateLevelIdList', [...new Set(currentSelectionTree.map((node) => node.level))])
      }
      dispatch('getSeriesCollection', currentSelectionTree)
    },
    getSeriesCollection({state, commit, dispatch}, selectionTree){
      axios.post('/api/SeriesCollection',{"selectionTree":selectionTree, "dataset":state.dataset}).then((response) => {
        const newSeriesCollection = response.data.seriesCollection.map(node => {
          return {
            ...node,
            seriesData: filterDataByTimeRange(transformData(node.seriesData),state.timeRange),
            price: filterDataByTimeRange(transformData(node.price),state.timeRange),
            change: filterDataByTimeRange(transformData(node.change), state.timeRange)
          }
        })
        commit("UPDATE_SERIES_COLLECTION", newSeriesCollection)
        // if(state.groupState == false && newSeriesCollection.length == 1)
        if(state.groupState == false) {
          dispatch('size/updateScale', newSeriesCollection, {root : true})
        } 
      })
    },
    sortSelectionTree({state, commit}, obj){
        let updatedSelectionTree = [...state.selectionTree];
        const averageMap = new Map();
        state.selectionTree.forEach(node => {
          if (obj.id_list.includes(node.id)) {
              const seriesNode = state.seriesCollection.find(item => item.id === node.id);
              const average = seriesNode ? (obj.mode.includes("trend") ? calculateSeriesTrend(seriesNode.price) : calculateSeriesAverage(seriesNode.seriesData)) : 0;
              console.log("check average")
              console.log(average)
              averageMap.set(node.id, average);
          }
        });
        
        updatedSelectionTree = updatedSelectionTree.map(node => {
            if (obj.id_list.includes(node.id)) {
                return {...node, average: averageMap.get(node.id)};
            }
            return node;
        });
    
        if (obj.mode.includes("desc")) {
            updatedSelectionTree.sort((a, b) => obj.id_list.includes(a.id) && obj.id_list.includes(b.id) ? b.average - a.average : 0);
        } 
        else if (obj.mode.includes("asc")) {
            updatedSelectionTree.sort((a, b) => obj.id_list.includes(a.id) && obj.id_list.includes(b.id) ? a.average - b.average : 0);
        } 

        updatedSelectionTree = updatedSelectionTree.map(({ average, ...node }) => node);
        // console.log("check updatedSelectionTree")
        // console.log(updatedSelectionTree)
        
    
        commit('UPDATE_SELECTION_TREE', updatedSelectionTree);
    },
    updateTimeRange({state, commit, dispatch}, newTimeRange) {
      //newTimeRange = [new Date('2022-12-15'), new Date('2022-12-29')]
      newTimeRange = [new Date('2023-03-10'), new Date('2023-03-18')]
      commit('UPDATE_TIME_RANGE', newTimeRange)
      dispatch('filterSeriesCollectionByTimeRange', newTimeRange)
      dispatch('scatterPlot/getCoordinateCollection',null, {root:true})
    },
    filterSeriesCollectionByTimeRange({state, commit, dispatch}, newTimeRange){

      let currentSeriesCollection = state.seriesCollection.map(node => {
        return {
          ...node,
          seriesData: filterDataByTimeRange(node['seriesData'], newTimeRange),
          price: filterDataByTimeRange(node['price'], newTimeRange),
          change: filterDataByTimeRange(node['change'], newTimeRange)
        }
      })
      commit('UPDATE_SERIES_COLLECTION', currentSeriesCollection)
      if(state.groupState == false){
        dispatch('size/updateScale', currentSeriesCollection, {root : true})
      }  
    },
    // fold and unfold operation
    selectNodeAndChildren({state, dispatch}, id) {
        const nodesToAdd = [];
        const findChildren = (parentId) => {
          state.originalTree.forEach(node => {
            if (node.parent_id == parentId) {
              const new_node = cloneDeep(node)
              if(node.children_id.length > 0){
                new_node.leaf = false
              }
              else {
                new_node.leaf = true
              }
              nodesToAdd.push(new_node);
            }
          });
        }
        findChildren(id);
        // console.log(nodesToAdd)
        dispatch('addToSelectionTree',nodesToAdd)
    },
    deselectNodeAndChildren({state, dispatch}, id) {
        const nodesToRemove = []
        const nodeToDeselect = state.selectionTree.find(node => node.id == id)
        nodeToDeselect.children_id = []

        const findChildren = (parentId) => {
          state.originalTree.forEach(node => {
            if (node.parent_id === parentId) {
              const new_node = cloneDeep(node)
              nodesToRemove.push(new_node);
              findChildren(node.id) // find children recursively
            }
          });
        };
        findChildren(id);
        if (nodesToRemove.length > 0) {
            dispatch('removeFromSelectionTree',nodesToRemove)  
        }
    },
    addToSelectionTree({ state, commit, dispatch }, nodes) {
        let currentSelectionTree = state.selectionTree
        nodes.forEach(node => {
          // prevent duplicate
          if (!currentSelectionTree.some(n => n.id == node.id)) {
            //update children
            const nodeToUpdate = currentSelectionTree.find(n => n.id === node.parent_id)
            if(nodeToUpdate) {
                nodeToUpdate.children_id.push(node.id)
            }
            node.children_id = []
            currentSelectionTree.push(node);
          }
        })
        dispatch('updateSelectionTree', currentSelectionTree)

      },
    removeFromSelectionTree({state, dispatch}, nodesToRemove) {
        let currentSelectionTree = state.selectionTree
        currentSelectionTree = currentSelectionTree.filter(node =>
            !nodesToRemove.some(n => n.id === node.id)
        )
        dispatch('updateSelectionTree',currentSelectionTree)
    },
    updateLevelIdList({commit, dispatch}, level_id_list) {
      commit('UPDATE_LEVEL_ID_LIST', level_id_list)
      dispatch('scatterPlot/getCoordinateCollection',null, {root:true})
    },
    addLevelToLevelIdList({state, dispatch}){
      const max = Math.max(...state.level_id_list)
      state.level_id_list.push(max + 1) 
      dispatch('updateLevelIdList', state.level_id_list)
    },
    addLayer({state, dispatch, commit, rootState}, obj){
      state.groupState = true
      axios.post('/api/addLayer',obj).then((response) => {
        // console.log("check newOriginalTree")
        // console.log(response.data.newOriginalTree)
        commit('UPDATE_ORIGINAL_TREE', response.data.newOriginalTree) // originalTree
        dispatch('updateSelectionTree', updateSelectionFromOriginal(state.selectionTree, state.originalTree, obj.level_id)) // selectionTree & seriesCollection
        commit('UPDATE_LEVEL_ID_LIST', [...new Set(state.selectionTree.map(node => node.level))].sort((a, b) => a - b)) // level_id_list
        commit('UPDATE_LEVELS', addLevels(state.levels, obj.level_id)) // levels
        commit('size/UPDATE_Y_SCALE', addYScale(rootState.size.yScale, obj.level_id), { root: true }) // yScale
        commit('scatterPlot/UPDATE_COORDINATE_COLLECTION', response.data.newCoordinateCollection, { root: true }) // coordinateCollection
        const {plotX, plotY} = addPlotScale(rootState.scatterPlot.plot_X_Scale, rootState.scatterPlot.plot_Y_Scale, obj.level_id)
        commit('scatterPlot/UPDATE_PLOT_X_SCALE', plotX, { root: true }) //plot_x_scale
        commit('scatterPlot/UPDATE_PLOT_Y_SCALE', plotY, { root: true }) //plot_y_scale
      })
    },
    mergeTrees({state, commit, rootState}, obj){
      // id2 向 id1 合并, 已经展开的 Materials 和 已经展开的 Energy 进行合并
      const id1 = obj.id1
      const id2 = obj.id2

      let originalTree = cloneDeep(state.originalTree)
      let selectionTree = []
      let seriesCollection = cloneDeep(state.seriesCollection)
      let coordinateCollection = cloneDeep(rootState.scatterPlot.coordinateCollection)

      console.log("check coordinateCollection")
      console.log(coordinateCollection)

      //update originalTree, selectionTree, seriesCollection, coordinateCollection
      const original_parent_node = originalTree.find(node => node.children_id.includes(id2))

      //remove id2 from children_id(in the format of array) of original_parent_node
      original_parent_node.children_id = original_parent_node.children_id.filter(id => id != id2)

      const node1 = originalTree.find(node => node.id == id1)
      const node2 = originalTree.find(node => node.id == id2)

      //put node2's children_id into node1's
      node1.children_id = [...node1.children_id, ...node2.children_id]

      node1["node_name"] = "merged"

      node2.children_id.forEach(id => {
        const child_node = originalTree.find(n => n.id == id)
        child_node.parent_id = id1
      })

      //delete node2 from originalTree
      originalTree = originalTree.filter(node => node.id != id2)

      const series1 = seriesCollection.find(node => node.id == id1)
      const series2 = seriesCollection.find(node => node.id == id2)

      //make the series1.seriesData the average of series1.seriesData and series2.seriesData
      series1.seriesData = calculateAverageSeries(series1.seriesData, series2.seriesData)
      series1.node_name = "merged"

      //delete series2 from seriesCollection
      seriesCollection = seriesCollection.filter(node => node.id != id2)


      const coordinate1 = coordinateCollection['2'].find(node => node.id == id1)
      const coordinate2 = coordinateCollection['2'].find(node => node.id == id2)

      //make the coordinate1 the avarage of coordinate 1 and 2, each coordinate is a object contain key x and y
      coordinate1.x = (coordinate1.x + coordinate2.x) / 2
      coordinate1.y = (coordinate1.y + coordinate2.y) / 2

      //remove node with id2 in coordinateCollection['2']
      coordinateCollection['2'] = coordinateCollection['2'].filter(node => node.id != id2);

      //update coordinateCollection in the scatterPlot module
      commit("scatterPlot/UPDATE_COORDINATE_COLLECTION", coordinateCollection, {root: true})

      //then update originalTree, seriesCollection, coordinateCollection
      state.originalTree = originalTree
      state.seriesCollection = seriesCollection

      //update selectionTree
      state.selectionTree.forEach(node => {
        if(node.id != id2){
          const selectionNode = originalTree.find(n => n.id == node.id)
          let new_selectionNode = {}
          if(selectionNode.id != id1 && selectionNode.level == 2){
            new_selectionNode = cloneDeep(selectionNode)
            new_selectionNode.children_id = []
          }
          else if(selectionNode.id == id1 || selectionNode.level != 2){
            new_selectionNode = cloneDeep(selectionNode) 
          }
          selectionTree.push(new_selectionNode)
        }
      })
      state.selectionTree = selectionTree
    },
    deleteNodes({state, commit, rootState}, deleteIds){
      let selectionTree = cloneDeep(state.selectionTree)
      selectionTree = selectionTree.filter(node => !deleteIds.includes(node.id))
      const id = deleteIds[0]
      const parent_node = selectionTree.find(node => node.children_id.includes(id))
      parent_node.children_id = parent_node.children_id.filter(id => !deleteIds.includes(id))
      state.selectionTree = selectionTree   
    },
    updateBarChartVisible({state}, index){
      let v = cloneDeep(state.barChartVisible)
      v[index] = !v[index]
      state.barChartVisible = v
    }
}

const getters = {
    originalTree: state => state.originalTree,
    selectionTree: state => state.selectionTree,
    seriesCollection: state => state.seriesCollection,
    dataset: state => state.dataset,
    levels: state => state.levels,
    level_id_list: state => state.level_id_list,
    description: state => state.description,
    timeRange: state => state.timeRange,
    colorBar: state => state.colorBar,
    groupState: state => state.groupState,
    themeColor: state => state.themeColor,
    barChartVisible: state => state.barChartVisible
    


}


const treeModule  = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default treeModule


