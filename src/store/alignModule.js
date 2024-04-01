import { ifEmphasize } from "../computation/treeComputation"

const state = {
    alignState: false,
    sectionState: 1,
    alignLevel: 1, //in default, align to the root node of the selectionTree
    alignID : [1], //在section遍历alignID, 然后在section里面过滤节点
    largestNumber: [] //对应每一个alignID下的最大高度是多少

}

const mutations =  {
    UPDATE_ALIGN_STATE(state, payload){
        state.alignState = payload
    },
    UPDATE_ALIGN_LEVEL(state, payload){
        state.alignLevel = payload
    },
    UPDATE_ALIGN_ID(state,payload){
        state.alignID = payload
    },
    UPDATE_LARGEST_NUMBER(state, payload){
        state.largestNumber = payload
    },
    UPDATE_SECTION_STATE(state){
        state.sectionState = state.sectionState + 1
    }
}

const actions = {
    updateAlignState({commit}, value){
        commit('UPDATE_ALIGN_STATE',value)
    },
    updateSectionState({commit}){
        // state.sectionState = state.sectionState + 1
        commit('UPDATE_SECTION_STATE')
    },
    updateAlignLevel({commit}, value){
        commit('UPDATE_ALIGN_LEVEL',value)    
    },
    updateAlignID({commit}, value){
        commit('UPDATE_ALIGN_ID', value)
    },
    updateLargestNumber({commit}, value){
        commit('UPDATE_LARGEST_NUMBER',value)
    },
    calculateAlignID({state, commit, rootState}){
        const level = state.alignLevel
        const selectionTree = JSON.parse(JSON.stringify(rootState.tree.selectionTree))
        const level_id_list = rootState.tree.level_id_list

        const new_alignID = selectionTree.filter(node => node.level == level).filter(node => ifEmphasize(selectionTree, node.id, level, level_id_list)).map(node => node.id)

        commit('UPDATE_ALIGN_ID', new_alignID)
    }

    
}
const getters = {
    alignState: state => state.alignState,
    sectionState: state => state.sectionState,
    alignLevel: state => state.alignLevel,
    alignID: state => state.alignID,
    largestNumber: state => state.largestNumber 

}

const alignModule = {
    namespaced:true,
    state,
    mutations,
    actions,
    getters
}

export default alignModule