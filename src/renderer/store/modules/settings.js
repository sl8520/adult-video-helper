const state = {
  cover: '%actor%/%id%/%id% [%genre%]',
  stills: '%actor%/%id%/pic/%id% [%genre%]',
  video: '%actor%/%id%/%id% [%genre%]',
  info: '%actor%/%id%/%id% [%genre%]',
}

const mutations = {
  CHANGE_SETTING(state, { key, value }) {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
