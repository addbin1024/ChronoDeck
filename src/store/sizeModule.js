import * as d3 from "d3"
import { groupData } from "../computation/basicComputation"
import { TS_Scales, getXScale, getYScale } from "../scale/scale" 
import axios from "axios"

const state = {
    rowHeight: 0,
    cardHeight: 0,
    cardWidth: 0,
    xScale: [],
    yScale: [],
    columnPercentage: 0.25,
    rowNum: 20

}

const mutations = {
    UPDATE_ROW_HEIGHT(state, payload) {
        state.rowHeight = payload
    },
    UPDATE_CARD_HEIGHT(state, payload){
        state.cardHeight = payload
    },
    UPDATE_CARD_WIDTH(state, payload) {
        state.cardWidth = payload
    },
    UPDATE_X_SCALE(state, payload) {
        state.xScale = payload
    },
    UPDATE_Y_SCALE(state, payload) {
        state.yScale = payload
    }

}

const actions = {
    updateRowHeight({commit}, height) {
        commit('UPDATE_ROW_HEIGHT', height)
    },
    updateCardHeight({commit}, height) {
        commit('UPDATE_CARD_HEIGHT', height)
    },
    updateCardWidth({commit}, width) {
        commit('UPDATE_CARD_WIDTH', width)
    },
    updateScale({state, commit, rootState}, seriesCollection) {
        // console.log("check seriesCollection")
        // console.log(seriesCollection)

        const timeRange = rootState.tree.timeRange
        const dataset = rootState.tree.dataset

        const x_scale = getXScale(seriesCollection[0].seriesData, state.cardWidth)
        commit('UPDATE_X_SCALE', x_scale)

        if(seriesCollection.length == 1){
            const max = Math.max(...seriesCollection[0].seriesData.map(item => item.value))
            const min = Math.min(...seriesCollection[0].seriesData.map(item => item.value))
            commit('UPDATE_Y_SCALE',[getYScale(max, min, state.cardHeight)]) 
        }

        axios.post('/api/scale', {"timeRange": timeRange, "dataset": dataset}).then((response) => {
            const result = response.data.result

            const y_scale_list = result.map(r => getYScale(r.max, r.min, state.cardHeight))
           
            if(rootState.tree.timeRange.length >= 0){
                commit('UPDATE_Y_SCALE', y_scale_list)
            }
            
              
        })

        // const data_list = groupData(seriesCollection)
        // if(rootState.tree.groupState == true){
        //     console.log("check data_list")
        //     console.log(data_list)
        // }

        // const x_scale = TS_Scales(data_list[0], state.cardWidth, state.cardHeight).xScale
        // const y_scale_list = data_list.map(data => TS_Scales(data, state.cardWidth, state.cardHeight).yScale)

        // commit('UPDATE_X_SCALE', x_scale)
        // commit('UPDATE_Y_SCALE', y_scale_list)  
    } 


}

const getters = {
    rowHeight: state => state.rowHeight,
    cardWidth: state => state.cardWidth,
    cardHeight: state => state.cardHeight,
    xScale: state => state.xScale,
    yScale: state => state.yScale,
    columnPercentage: state => state.columnPercentage,
    rowNum: state => state.rowNum

}



const sizeModule = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default sizeModule