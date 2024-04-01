const state = {
    SD: [],
    // wholeTimeRange: ['2022-11-27','2023-3-27']
    wholeTimeRange: ['2023-03-01', '2023-03-31'],
    zoomVisiable:0

}

const mutations = {
    UPDATE_ZOOM(state){
        state.zoomVisiable = !state.zoomVisiable
    }
}

const actions = {
    updateSD({state}, SD_result){
        state.SD = SD_result
        // console.log("update")
        // console.log(state.SD)
    }

}
const getters = {
    SD: state => state.SD,
    wholeTimeRange: state => state.wholeTimeRange,
    zoomVisiable: state => state.zoomVisiable
    
}

const timeModule = {
    namespaced:true,
    state,
    mutations,
    actions,
    getters
}

export default timeModule