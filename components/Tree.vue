<template>
  <div style="display: flex;" :style="{flexDirection: direction}">
    <div v-right-click-outside="closeAll"
         v-if="!node.expand && node.isShow && node.label"
         @dblclick="showChild"
         @click="selectFile($event,false)"
         @contextmenu.prevent="openMenu($event)"
         :ref="`nodeitem${node.label}`"
         :style="fileStyle"
         :class="node.isMoving ? 'animate-node':''"
         style="display: flex; align-items: center; padding: 5px; width: 100px; border: solid 1px black; border-radius: 4px">
      <Icon v-if="isHaveChild" type="md-folder" :size="30"/>
      <Icon v-else type="ios-document" :size="30"/>
      <div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 50px; height: 20px">
        {{node.label}}
      </div>
    </div>

    <div v-click-outside="onClickOutside" v-if="isShowMove" class="popup" :style="movePosition">
      <div style="display: flex; justify-content: space-between">
        <div style="display: flex">
          <Icon v-if="arraySourceMove.length !== 1"
                type="md-arrow-round-back"
                size="20"
                @click.stop="collapseTree"/>
          Src: {{arraySourceMove[arraySourceMove.length - 1]}}
        </div>
        <Icon type="md-close-circle" @click="isShowMove = false"/>
      </div>

      <TreeMove :node="treeMoveData" :space="0" style="padding: 20px 0px; overflow: auto"/>
      <Button v-if="sourceMoveData !== sourceData" type="primary" @click="moveItem">Move</Button>
    </div>

    <!--:style="computedSpace(index)"-->

    <node v-if="node.expand && isHaveChild"
          v-for="(item, index) in node.children"
          :node="item"
          :style="computedSpace(index)"
          :direction="direction"
          :space="space"
          :key="index">
    </node>

    <Modal
      v-model="modalRename"
      title="Rename"
      footer-hide>
      <Input v-model="inputRename" placeholder="Enter new name" style="margin-bottom: 15px"/>
      <Button type="primary" @click="rename">Rename</Button>
    </Modal>

    <div v-click-outside="closeMenu">
      <ul id="right-click-menu" tabindex="-1" ref="right" v-if="menu" :style="{top:top, left:left}">
        <li @click.stop="showTreeMove">
          <Icon type="md-move"
                :size="30"/>
          Move to
        </li>
        <li @click.stop="onClickRename">
          <Icon type="md-create"
                :size="30"/>
          Rename
        </li>
        <li @click="remove">
          <Icon type="md-trash" :size="30"/>
          Remove
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from "vuex"
  import TreeMove from "./TreeMove"
  import _ from "lodash"
  import vClickOutside from 'v-click-outside'

  export default {
    name: "node",
    components: {
      TreeMove
    },
    directives: {
      clickOutside: vClickOutside.directive
    },
    props: {
      node: {
        type: Object,
        required: false,
      },
      space: {
        type: Number,
        required: false,
      },
      direction: {
        type: String,
        required: false,
        default: 'row'
      }
    },
    mounted() {
      this.isMounted = true
    },
    data() {
      return {
        copyTreeData: null,
        showEmptyFolder: false,
        filesInsideFolder: [],
        toggleStyle: false,
        top: '0px',
        left: '0px',
        menu: false,
        isShowMove: false,
        isMounted: false,
        nodeSelect: {},
        inputRename: "",
        modalRename: false
      }
    },
    computed: {
      ...mapGetters(['sourceData', 'sourceMoveData', 'treeData', 'treeMoveData', 'fileSelectedData', 'isMoved']),
      nodePostion() {
        if (this.isMounted && this.$refs[`nodeitem${this.node.label}`]) {
          return {
            top: this.$refs[`nodeitem${this.node.label}`].getBoundingClientRect().top,
            left: this.$refs[`nodeitem${this.node.label}`].getBoundingClientRect().left
          }
        }
        return {
          top: 0,
          left: 0
        }
      },
      movePosition() {
        return {
          top: (this.nodePostion.top + 50) + 'px',
          left: (this.nodePostion.left) + 'px',
        }
      },
      arraySource() {
        return this.sourceData.split("/").filter(item => {
          return item && item !== ""
        })
      },
      arraySourceMove() {
        return this.sourceMoveData.split("/").filter(item => {
          return item && item !== ""
        })
      },
      isHaveChild() {
        return this.node.children && this.node.children.length >= 0
      },
      fileStyle() {
        return this.node.isSelected ? {
          background: "skyblue",
          color: "white"
        } : ""
      },
    },
    watch: {
      node: {
        handler: function (newValue) {
          if (newValue.isMoving) {
            setTimeout(() => {
              this.copyTreeData = this.treeData;
              this.changeMoving(this.copyTreeData)
              this.CHANGE_TREE(this.copyTreeData);
            }, 1000)
          }
        },
        deep: true
      },
      isMoved() {
        if (this.isMoved) {
          this.goToFolder(this.arraySourceMove[this.arraySourceMove.length - 1])
        }
      },
      sourceData() {
        if (!this.sourceData || this.sourceData.length === 0) {
          this.copyTreeData = this.treeData;
          this.copyTreeData.isShow = true;
          this.CHANGE_TREE(this.copyTreeData)
        } else {
          this.copyTreeData = this.treeData;

          if (this.arraySource && this.arraySource.length > 0) {
            this.getFileInsideFolder(this.copyTreeData, this.arraySource[this.arraySource.length - 1])
          }

          let filesInsideFolder = this.filesInsideFolder.map(o => {
            return o.label
          });

          this.hideFileNotInsideFolder(this.copyTreeData, filesInsideFolder);
          this.CHANGE_TREE(this.copyTreeData);
          this.$forceUpdate();
        }
      }
    },
    methods: {
      ...mapMutations([
        'APPEND_SOURCE',
        'CHANGE_TREE',
        'SELECT_FILE',
        'UNSELECT_FILE',
        'RESET_FILE_SELECTED',
        'CHANGE_TREE_MOVE',
        'COLLAPSE_TREE',
        'COLLAPSE_TREE_MOVE',
        'SET_SOURCE_MOVE',
        'SET_CLICK_MOVE']),
      computedSpace(index) {
        if (index !== 0) {
          if (this.direction === 'row') {
            return {marginLeft: `${this.space}px`}
          }
          if (this.direction === 'column') {
            return {marginTop: `${this.space}px`}
          }
        }
        return {}
      },

      onClickRename() {
        this.modalRename = true;
      },

      rename() {
        this.copyTreeData = this.treeData;
        this.modalRename = false;

        this.doRename(this.copyTreeData, this.node.label, this.inputRename)
        this.CHANGE_TREE(this.copyTreeData);
      },

      doRename(item, label, newName) {
        if (item.label && item.label === label) {
          item.label = newName
        } else {
          if (item.children && item.children.length > 0) {
            for (let i = 0; i < item.children.length; i++) {
              this.doRename(item.children[i], label, newName)
            }
          }
        }
      },

      onClickOutside() {
        this.isShowMove = false
      },
      goToFolder(label) {
        this.copyTreeData = this.treeData;

        if (this.arraySource.indexOf(label) < 0) {
          for (let i = 0; i < this.arraySourceMove.length; i++) {
            this.setExpand(this.copyTreeData, this.arraySourceMove[i])
            let isExistSource = this.arraySource.find(o => {
              return o === this.arraySourceMove[i]
            })
            if (!isExistSource) {
              this.APPEND_SOURCE(this.arraySourceMove[i] + "/");
            }
          }
          this.CHANGE_TREE(this.copyTreeData)
          this.RESET_FILE_SELECTED();
          this.SET_CLICK_MOVE(false)
        } else if (label !== this.arraySource[this.arraySource.length - 1]) {
          for (let i = this.arraySource.length; i > this.arraySource.indexOf(label); i--) {
            this.setCollapse(this.copyTreeData, this.arraySource[i])
            this.COLLAPSE_TREE(this.arraySource[i]);
            this.CHANGE_TREE(this.copyTreeData)
          }
          this.SET_CLICK_MOVE(false)
        }
      },
      closeAll() {
        this.menu = false;
        this.isShowMove = false
      },
      closeMenu() {
        this.menu = false;
      },
      showChild() {
        this.copyTreeData = this.treeData;
        this.isShowMove = false;

        this.setExpand(this.copyTreeData, this.node.label);
        this.CHANGE_TREE(this.copyTreeData);
        if (this.isHaveChild) {
          this.RESET_FILE_SELECTED();
          this.APPEND_SOURCE(this.node.label + "/");
        }
      },

      openMenu(e) {
        this.selectFile(e, true);
        this.menu = true;
        this.isShowMove = false;

        this.$nextTick(function () {
          this.$refs.right.focus;
          this.setMenu(e.y, e.x)
        }.bind(this));
      },

      setMenu(top, left) {
        let largestHeight = window.innerHeight - this.$refs.right.offsetHeight - 25;
        let largestWidth = window.innerWidth - this.$refs.right.offsetWidth - 25;

        if (top > largestHeight) top = largestHeight;

        if (left > largestWidth) left = largestWidth;

        this.top = top + 'px';
        this.left = left + 'px';
      },

      selectFile(event, isRightClick) {
        this.copyTreeData = this.treeData
        if (event && !event.ctrlKey && !isRightClick) {
          this.RESET_FILE_SELECTED();
          this.setUnSelected(this.copyTreeData, this.node.label)
        }


        if (!isRightClick) {
          this.setSelected(this.copyTreeData, this.node.label, !this.node.isSelected)
        } else {
          this.setSelected(this.copyTreeData, this.node.label, true)
        }

        this.CHANGE_TREE(this.copyTreeData);

        if (this.node.isSelected) {
          this.SELECT_FILE(this.node.label)
        } else {
          this.UNSELECT_FILE(this.node.label)
        }
      },

      showTreeMove() {
        this.menu = false
        this.isShowMove = true
        this.SET_SOURCE_MOVE(this.sourceData)
      },

      remove() {
        this.copyTreeData = this.treeData;
        for (let i = 0; i < this.fileSelectedData.length; i++) {
          this.removeItem(this.copyTreeData, this.arraySource[this.arraySource.length - 1], this.fileSelectedData[i]);
        }

        this.CHANGE_TREE(this.copyTreeData);
        this.menu = false
        this.$forceUpdate();
      },

      moveItem() {
        this.copyTreeData = this.treeData;

        for (let i = 0; i < this.fileSelectedData.length; i++) {
          this.getNodeFromTree(this.copyTreeData, this.fileSelectedData[i])
          this.doMove(
            this.copyTreeData,
            this.arraySourceMove[this.arraySourceMove.length - 1],
            this.nodeSelect
          );
          this.removeItem(
            this.copyTreeData,
            this.arraySource[this.arraySource.length - 1],
            this.fileSelectedData[i]
          );
        }
        this.CHANGE_TREE(this.copyTreeData);

        this.isShowMove = false
        this.SET_CLICK_MOVE(true)
      },

      getNodeFromTree(item, label) {
        if (item.label && item.label === label) {
          this.nodeSelect = item
        } else {
          if (item.children && item.children.length > 0) {
            for (let i = 0; i < item.children.length; i++) {
              this.getNodeFromTree(item.children[i], label)
            }
          }
        }
      },

      doMove(item, directory, node) {
        if (item.children && item.label && item.label === directory) {
          node.isMoving = true
          item.children.push(node)
        } else {
          if (item.children && item.children.length > 0) {
            for (let i = 0; i < item.children.length; i++) {
              this.doMove(item.children[i], directory, node)
            }
          }
        }
      },

      changeMoving(item) {
        if (item.label) {
          item.isMoving = false
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.changeMoving(item.children[i])
          }
        }
      },

      removeItem(item, label, removelabel) {
        if (item.children && item.children.length > 0 && item.label && item.label === label) {
          let haveItemToMove = item.children.find(o => {
            return o.label === removelabel
          })
          if (haveItemToMove) {
            item.children = item.children.filter(o => {
              return o.label !== removelabel
            })
          }
          if (item.children.length === 0) {
            item.children = [{}]
          }
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.removeItem(item.children[i], label, removelabel)
          }
        }
      },

      getFileInsideFolder(item, label) {
        if (item.label && item.label === label) {
          this.filesInsideFolder = item.children;
          return this.filesInsideFolder
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.getFileInsideFolder(item.children[i], label)
          }
        }
      },

      hideFileNotInsideFolder(item, label) {
        item.isShow = !!label.includes(item.label);

        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.hideFileNotInsideFolder(item.children[i], label)
          }
        }
      },

      setExpand(item, label) {
        if (item.children && item.label && item.label === label) {
          item.expand = true
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.setExpand(item.children[i], label)
          }
        }
      },
      setCollapse(item, label) {
        if (item.children && item.label && item.label === label) {
          item.expand = false
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.setCollapse(item.children[i], label)
          }
        }
      },
      setSelected(item, label, status) {
        if (item.label && item.label === label) {
          item.isSelected = status
        } else {
          if (item.children && item.children.length > 0) {
            for (let i = 0; i < item.children.length; i++) {
              this.setSelected(item.children[i], label, status)
            }
          }
        }
      },
      setUnSelected(item, label) {
        if (item.label && item.label !== label) {
          item.isSelected = false
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.setUnSelected(item.children[i], label)
          }
        }
      },
      collapseTree() {
        this.copyTreeData = this.treeMoveData;

        this.setCollapse(this.copyTreeData, this.arraySourceMove[this.arraySourceMove.length - 1])
        this.CHANGE_TREE_MOVE(this.copyTreeData)
        this.COLLAPSE_TREE_MOVE(`${this.arraySourceMove[this.arraySourceMove.length - 1]}/`);
      },
    }
  }
</script>

<style scoped>
  .hover-underline:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .move-modal {
    background: #FAFAFA;
    border: 1px solid #BDBDBD;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 250px;
    z-index: 999999;
  }

  #right-click-menu {
    background: #FAFAFA;
    border: 1px solid #BDBDBD;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 250px;
    z-index: 999;
  }

  #right-click-menu li {
    border-bottom: 1px solid #E0E0E0;
    margin: 0;
    padding: 5px 35px;
  }

  #right-click-menu li:last-child {
    border-bottom: none;
  }

  #right-click-menu li:hover {
    background: #1E88E5;
    color: #FAFAFA;
  }

  .popup {
    position: fixed;
    padding: 10px;
    min-width: 150px;
    border: solid 1px black;
    z-index: 9999;
  }

  .popup:after, .popup:before {
    bottom: 100%;
    left: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  .popup:after {
    border-color: rgba(136, 183, 213, 0);
    border-bottom-color: white;
    border-width: 10px;
    margin-left: -10px;
  }

  .popup:before {
    border-color: rgba(194, 225, 245, 0);
    border-bottom-color: black;
    border-width: 10px;
    margin-left: -10px;
  }

  @keyframes example {
    from {
      transform: scale(0.5);
    }
    to {
      transform: scale(1);
    }
  }

  /* The element to apply the animation to */
  .animate-node {
    background-color: white;
    animation-name: example;
    animation-duration: 1s;
  }
</style>
