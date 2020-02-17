const state = {
  cover: '%actor% %id% [%genre%]',
  stills: '%actor% %id% [%genre%]',
  video: '%actor% %id% [%genre%]',
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
