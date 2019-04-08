import Vuex from 'vuex';
import _ from 'lodash'

const state = () => ({
  tree: {
    label: "root",
    expand: false,
    isShow: true,
    children: [
      {
        label: "Folder 2",
        expand: false,
        isShow: true,
        children: [
          {
            label: "Folder 2222",
            isShow: true,
            children: [{label: "file5", isShow: true}, {
              label: "Folder34",
              isShow: true,
              children: [{label: "file8", isShow: true}, {label: "file9", isShow: true}]
            }],
            expand: false
          },
          {label: "Folder343434", isShow: true, expand: false, children: []}
        ]
      },
      {label: "file1", isShow: true}
    ]
  },
  source: "",
  fileSelected: []
});

const getters = {
  sourceData(state) {
    return state.source
  },
  treeData(state) {
    return state.tree
  },
  fileSelectedData(state) {
    return _.uniq(state.fileSelected)
  }
};

const mutations = {
  CHANGE_TREE(state, data) {
    state.tree = data;
  },
  APPEND_SOURCE(state, data) {
    state.source += data;
  },
  COLLAPSE_TREE(state,data) {
    state.source = state.source.replace(data, '');
  },
  SELECT_FILE(state, data) {
    state.fileSelected.push(data)
  },
  UNSELECT_FILE(state, data) {
    state.fileSelected = state.fileSelected.filter(o => {
      return o !== data
    })
  },
  RESET_FILE_SELECTED(state) {
    state.fileSelected = []
  }
};


const actions = {};

const createStore = () => {
  return new Vuex.Store({
    state,
    getters,
    mutations,
    actions
  })
};

export default createStore
