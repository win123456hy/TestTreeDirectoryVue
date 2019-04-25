import Vuex from 'vuex';
import _ from 'lodash'

const state = () => ({
  tree: {
    label: "root",
    expand: true,
    isShow: false,
    isSelected: false,
    children: [
      {
        label: "Folder 1",
        expand: false,
        isShow: true,
        isSelected: false,
        children: [
          {
            label: "Folder 2",
            expand: false,
            isShow: true,
            isSelected: false,
            children: [{label: "file 2", isShow: true, isSelected: false,}, {
              label: "Folder3",
              isShow: true,
              isSelected: false,
              expand: false,
              children: [{label: "file 3", isShow: true, isSelected: false,}, {label: "file 4", isShow: true, isSelected: false,}]
            }],
          },
          {label: "Folder 4", isShow: true, expand: false,isSelected: false, children: []}
        ]
      },
      {label: "file 1", isShow: true, isSelected: false,}
    ],
  },
  treeMove: {},
  source: "root/",
  sourceMove: "root/",
  fileSelected: [],
  fileSelectedMove: [],
  isClickMove: false
});

const getters = {
  sourceData(state) {
    return state.source
  },
  sourceMoveData(state) {
    return state.sourceMove
  },
  treeData(state) {
    return state.tree
  },
  treeMoveData(state) {
    return JSON.parse(JSON.stringify(state.tree));
  },
  fileSelectedData(state) {
    return _.uniq(state.fileSelected)
  },
  fileSelectedMoveData(state) {
    return _.uniq(state.fileSelectedMove)
  },
  isMoved(state) {
    return state.isClickMove
  },
};

const mutations = {
  CHANGE_TREE_MOVE(state, data) {
    state.treeMove = data;
  },
  CHANGE_TREE(state, data) {
    state.tree = data;
  },
  APPEND_SOURCE(state, data) {
    state.source += data;
  },
  APPEND_SOURCE_MOVE(state, data) {
    state.sourceMove += data;
  },
  COLLAPSE_TREE(state,data) {
    state.source = state.source.replace(data, '');
  },
  COLLAPSE_TREE_MOVE(state,data) {
    state.sourceMove = state.sourceMove.replace(data, '');
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
  },
  SELECT_FILE_MOVE(state, data) {
    state.fileSelectedMove.push(data)
  },
  UNSELECT_FILE_MOVE(state, data) {
    state.fileSelectedMove = state.fileSelectedMove.filter(o => {
      return o !== data
    })
  },
  RESET_FILE_SELECTED_MOVE(state) {
    state.fileSelectedMove = []
  },
  SET_SOURCE_MOVE(state,data){
    state.sourceMove = data
  },
  SET_CLICK_MOVE(state,data){
    state.isClickMove = data
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
