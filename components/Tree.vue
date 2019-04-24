<template>
  <div style="display: flex; flex-direction: row;">
    <div v-right-click-outside="closeMenu"
         v-if="!node.expand && node.isShow"
         @dblclick="showChild"
         @contextmenu.prevent="openMenu($event)"
         :ref="`nodeitem${node.label}`"
         :style="fileStyle"
         style="padding: 5px">
      <Icon v-if="isHaveChild" type="md-folder" :size="30" @click="selectFile"/>
      <Icon v-else type="ios-document" :size="30" @click="selectFile"/>
      <span>{{node.label}}</span>

    </div>

    <div id="popup1" class="popup" :style="computedStyle">
      <div>
        Src:
        <span v-for="(item, index) in arraySourceMove"
              class="hover-underline"
              @click="goToFolder(item)">{{item}}/</span>
      </div>
      <!--<Icon v-if="arraySource.length !== 1" type="ios-arrow-dropleft" size="20" @click="collapseTree"/>-->
      <TreeMove :node="treeMoveData" :space="0" style="padding: 20px 0px; overflow: auto"/>
      <Button v-if="sourceMoveData !== sourceData" type="primary" @click="moveItem">Move</Button>
    </div>

    <a href="#" class="close-popup"></a>
    <!--<div v-click-outside="closeMoveModal">-->
    <!--<div v-if="isShowMove" class="move-modal" ref="moveModal" :style="{top:top, left:left}">-->
    <!--<div>-->
    <!--Src:-->
    <!--<span v-for="(item, index) in arraySourceMove"-->
    <!--class="hover-underline"-->
    <!--@click="goToFolder(item)">{{item}}/</span>-->
    <!--</div>-->
    <!--&lt;!&ndash;<Icon v-if="arraySource.length !== 1" type="ios-arrow-dropleft" size="20" @click="collapseTree"/>&ndash;&gt;-->
    <!--<TreeMove :node="treeMoveData" :space="0" style="padding: 20px 0px; overflow: auto"/>-->
    <!--<Button v-if="sourceMoveData !== sourceData" type="primary" @click="moveItem">Move</Button>-->
    <!--</div>-->
    <!--</div>-->

    <node v-if="node.expand && isHaveChild"
          v-for="(item, index) in node.children"
          :style="{marginLeft: `${space}px`}"
          :node="item"
          :space="space"
          :key="index">
    </node>

    <div v-click-outside="closeMenu">
      <ul id="right-click-menu" tabindex="-1" ref="right" v-if="menu" :style="{top:top, left:left}">
        <li @click="showTreeMove()">
          <!--<a href="#popup1" class="btn"-->
          <!--@click="showTreeMove()">-->
          <Icon type="md-move"
                :size="30"/>
          Move to
          <!--</a>-->
        </li>
        <li @click="remove">
          <Icon type="md-trash" :size="30"/>
          Remove
        </li>
      </ul>
    </div>

    <!--<Modal-->
    <!--v-model="isShowMove"-->
    <!--title="Move"-->
    <!--footer-hide>-->
    <!--<div>-->
    <!--Src:-->
    <!--<span v-for="(item, index) in arraySourceMove"-->
    <!--class="hover-underline"-->
    <!--@click="goToFolder(item)">{{item}}/</span>-->
    <!--</div>-->
    <!--&lt;!&ndash;<Icon v-if="arraySource.length !== 1" type="ios-arrow-dropleft" size="20" @click="collapseTree"/>&ndash;&gt;-->
    <!--<TreeMove :node="treeMoveData" :space="0" style="padding: 20px 0px; overflow: auto"/>-->
    <!--<Button v-if="sourceMoveData !== sourceData" type="primary" @click="moveItem">Move</Button>-->
    <!--</Modal>-->
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from "vuex"
  import TreeMove from "./TreeMove"
  import _ from "lodash"

  export default {
    name: "node",
    components: {
      TreeMove
    },
    props: {
      node: {
        type: Object,
        required: false,
      },
      space: {
        type: Number,
        required: false,
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
        isMounted: false
      }
    },
    computed: {
      ...mapGetters(['sourceData', 'sourceMoveData', 'treeData', 'treeMoveData']),
      computedXY() {
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
      computedStyle(){
        return {
          top: this.computedXY.top + 'px',
          left: this.computedXY.left + 'px',
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
      }
    },
    watch: {
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
        'SET_SOURCE_MOVE']),
      closeMenu() {
        this.menu = false;
      },
      showChild() {
        this.copyTreeData = this.treeData;

        this.setExpand(this.copyTreeData, this.node.label);
        this.CHANGE_TREE(this.copyTreeData);
        if (this.isHaveChild) {
          this.RESET_FILE_SELECTED();
          this.APPEND_SOURCE(this.node.label + "/");
        }
      },

      openMenu(e) {
        this.selectFile();
        this.menu = true;

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
      setMoveModal(top, left) {
        let largestHeight = window.innerHeight - this.$refs.nodeitem.offsetHeight - 200;
        let largestWidth = window.innerWidth - this.$refs.nodeitem.offsetWidth - 200;

        if (top > largestHeight) top = largestHeight;

        if (left > largestWidth) left = largestWidth;

        this.top = top + 'px';
        this.left = left + 'px';
        console.log("this.top", this.top);
        console.log("this.left", this.left);
      },

      selectFile(event) {
        this.copyTreeData = this.treeData
        this.setSelected(this.copyTreeData, this.node.label, !this.node.isSelected)
        if (event && !event.ctrlKey) {
          this.setUnSelected(this.copyTreeData, this.node.label)
        }
        this.CHANGE_TREE(this.copyTreeData);

        if (this.node.isSelected) {
          this.SELECT_FILE(this.node.label)
        } else {
          this.UNSELECT_FILE(this.node.label)
        }
      },

      showTreeMove() {
        this.SET_SOURCE_MOVE(this.sourceData)
        this.menu = false
        location.href = "#popup1"
      },

      remove() {
        this.copyTreeData = this.treeData;
        this.removeItem(this.copyTreeData, this.arraySource[this.arraySource.length - 1], this.node.label);

        this.CHANGE_TREE(this.copyTreeData);

        this.$forceUpdate();
      },

      moveItem() {
        this.copyTreeData = this.treeData;

        this.doMove(this.copyTreeData, this.arraySourceMove[this.arraySourceMove.length - 1], this.node);
        this.removeItem(this.copyTreeData, this.arraySource[this.arraySource.length - 1], this.node.label);
        this.CHANGE_TREE(this.copyTreeData);
      },

      doMove(item, directory, node) {
        if (item.children && item.label && item.label === directory) {
          item.children.push(node)
        } else {
          if (item.children && item.children.length > 0) {
            for (let i = 0; i < item.children.length; i++) {
              this.doMove(item.children[i], directory, node)
            }
          }
        }
      },
      goToFolder(label) {
        if (label !== this.arraySourceMove[this.arraySourceMove.length - 1]) {
          for (let i = this.arraySourceMove.length; i > this.arraySourceMove.indexOf(label); i--) {
            this.copyTreeData = this.treeMoveData;

            this.setCollapse(this.copyTreeData, this.arraySourceMove[i])
            this.CHANGE_TREE_MOVE(this.copyTreeData)
            this.COLLAPSE_TREE_MOVE(this.arraySourceMove[i]);
          }
        }
      },

      removeItem(item, label, removelabel) {
        if (item.children && item.children.length > 0 && item.label && item.label === label && item.children.find(o => {
          return o.label === removelabel
        })) {
          item.children = item.children.filter(o => {
            return o.label !== removelabel
          })
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
    z-index: 999999;
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
    max-width: 500px;
    border: solid 1px black;
    background: rgba(255, 255, 255, .9);
    visibility: hidden;
    opacity: 0;
    /* "delay" the visibility transition */
    -webkit-transition: opacity 0s, visibility 0s linear 0s;
    transition: opacity 0s, visibility 0s linear 0s;
    z-index: 1;
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
    border-width: 11px;
    margin-left: -11px;
  }

  .popup:target {
    visibility: visible;
    opacity: 1;
    /* cancel visibility transition delay */
    -webkit-transition-delay: 0s;
    transition-delay: 0s;
  }

  .close-popup {
    background: rgba(0, 0, 0, 0);
    cursor: default;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    visibility: hidden;
    /* "delay" the visibility transition */
    -webkit-transition: opacity 0s, visibility 0s linear 0s;
    transition: opacity 0s, visibility 0s linear 0s;
  }

  .popup:target + .close-popup {
    opacity: 1;
    visibility: visible;
    /* cancel visibility transition delay */
    -webkit-transition-delay: 0s;
    transition-delay: 0s;
  }
</style>
