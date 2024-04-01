const state = {
    scrollPosition: {
        x: 0,
        y: 0
    }
}

const mutations =  {
    SET_SCROLL_POSITION(state, position) {
        state.scrollPosition = position;
    }
}

const actions = {
    updateScrollPosition({ commit }, position) {
        console.log("updated")
        commit('SET_SCROLL_POSITION', position);
    }
}
const getters = {
    scrollPosition: state => state.scrollPosition
}

const scrollModule = {
    namespaced:true,
    state,
    mutations,
    actions,
    getters
}

export default scrollModule

  