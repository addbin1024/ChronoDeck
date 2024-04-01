import axios from "axios"
import { PLOT_Scale } from "../scale/scale";

const state = {
    plotWidth: 0,
    plotHeight: 0,
    columnWidth: 0,
    plot_X_Scale: [],
    plot_Y_Scale: [],
    coordinateCollection: [],
    bezierPaths: [],
    linkVisible: false,
    highlightVisible: false,
    clusterNumber: 5,
    clusterVisible: false,
    


}

const mutations = {
    UPDATE_PLOT_WIDTH(state, payload) {
        state.plotWidth = payload
    },
    UPDATE_PLOT_HEIGHT(state, payload) {
        state.plotHeight = payload
    },
    UPDATE_COLUMN_WIDTH(state, payload) {
        state.columnWidth = payload
    },
    UPDATE_PLOT_X_SCALE(state, payload) {
        state.plot_X_Scale = payload
    },
    UPDATE_PLOT_Y_SCALE(state, payload) {
        state.plot_Y_Scale = payload
    },
    UPDATE_COORDINATE_COLLECTION(state, payload) {
        state.coordinateCollection = payload
    },
    UPDATE_PLOT_LINK(state, nodeId) {
        if (!state.plotLinks.includes(nodeId)) {
          state.plotLinks.push(nodeId);
        }
    },
    UPDATE_BEZIER_PATHS(state, payload) {
        state.bezierPaths = payload
    }
}

const actions = {
    getCoordinateCollection({ state, commit, dispatch, rootState }) {
        const dataset = rootState.tree.dataset
        const level_id_list = rootState.tree.level_id_list
        const timeRange = rootState.tree.timeRange
        if(timeRange.length != 0){
            axios.post('/api/coordinateCollection', { "dataset": dataset, "level_id_list": level_id_list, "timeRange": timeRange }).then((response) => {
                commit('UPDATE_COORDINATE_COLLECTION', response.data.coordinateCollection)
                dispatch('updatePlotScale')
            })
        }     
    },
    updatePlotScale({ state, commit }) {
        const coordinateCollection = state.coordinateCollection
        const plotWidth = state.plotWidth; 
        const plotHeight = state.plotHeight; 

        let plot_X_Scale = [];
        let plot_Y_Scale = [];

        Object.keys(coordinateCollection).forEach(level_id => {
            const coordinates = coordinateCollection[level_id];
            const { xScale, yScale } = PLOT_Scale(coordinates, plotWidth, plotHeight);
            plot_X_Scale.push({ level_id: level_id, xScale: xScale });
            plot_Y_Scale.push({ level_id: level_id, yScale: yScale });
            
        });
        commit('UPDATE_PLOT_X_SCALE', plot_X_Scale);
        commit('UPDATE_PLOT_Y_SCALE', plot_Y_Scale);
    },
    updatePlotLinks({ commit }, id){
        commit('UPDATE_PLOT_LINK', id)
    },
    updatePlotWidth({ commit }, plotWidth) {
        commit('UPDATE_PLOT_WIDTH', plotWidth)
    },
    updatePlotHeight({ commit }, plotHeight) {
        commit("UPDATE_PLOT_HEIGHT", plotHeight)
    },
    updateBezierPaths({commit}, links) {
        commit("UPDATE_BEZIER_PATHS", links)
    },
    updateColumnWidth({commit}, width) {
        commit('UPDATE_COLUMN_WIDTH', width)
    },
    toggleLinkVisible({state}) {
        state.linkVisible = !state.linkVisible
    },
    toggleHighlightVisible({state}) {
        state.highlightVisible = !state.highlightVisible
    },
    updateClusterNumber({state}, number) {
        console.log("update!")
        state.clusterNumber = number
    },
    toggleClusterVisible({state}) {
        state.clusterVisible = !state.clusterVisible
    }


    
}
const getters = {
    plotWidth: state => state.plotWidth,
    plotHeight: state => state.plotHeight,
    columnWidth: state => state.columnWidth,
    plot_X_Scale: state => state.plot_X_Scale,
    plot_Y_Scale: state => state.plot_Y_Scale,
    coordinateCollection: state => state.coordinateCollection,
    bezierPaths: state => state.bezierPaths,
    linkVisible: state => state.linkVisible,
    highlightVisible: state => state.highlightVisible,
    updateClusterNumber: state => state.clusterNumber,
    clusterVisible: state => state.clusterVisible
}

const scatterPlotModule = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default scatterPlotModule