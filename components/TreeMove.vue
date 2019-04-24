<template>
  <div style="display: flex; flex-direction: column;">
    <Tooltip v-if="tooltipText" :content="tooltipText" placement="right" max-width="400">
      <div v-if="!node.expand && node.isShow"
           @click="showChild"
           :class="isFileSelectedToMove || !isHaveChild ? 'disabled-item': ''"
           :style="fileStyle"
           style="padding: 5px">
        <Icon v-if="isHaveChild" type="md-folder" :size="30"/>
        <Icon v-else type="ios-document" :size="30" @click="selectFile"/>
        <span>{{node.label}}</span>
      </div>
    </Tooltip>

    <div v-else>
      <div v-if="!node.expand && node.isShow"
           @click="showChild"
           :class="isFileSelectedToMove || !isHaveChild ? 'disabled-item': ''"
           :style="fileStyle"
           style="padding: 5px">
        <Icon v-if="isHaveChild" type="md-folder" :size="30"/>
        <Icon v-else type="ios-document" :size="30" @click="selectFile"/>
        <span>{{node.label}}</span>
      </div>
    </div>

    <NodeMove v-if="node.expand && isHaveChild"
          v-for="(item, index) in node.children"
          :style="{marginLeft: `${space}px`}"
          :node="item"
          :space="space"
          :key="index">
    </NodeMove>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from "vuex"

  export default {
    name: "NodeMove",
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
    data() {
      return {
        copyTreeData: null,
        showEmptyFolder: false,
        filesInsideFolder: [],
        toggleStyle: false,
        fileStyle: "",
        top: '0px',
        left: '0px',
        menu: false,
        isShowMove: false
      }
    },
    computed: {
      ...mapGetters(['sourceMoveData', 'treeMoveData','fileSelectedData']),
      isFileSelectedToMove(){
        return this.fileSelectedData.find(o=>{
          return o === this.node.label
        })
      },
      arraySource() {
        return this.sourceMoveData.split("/").filter(item => {
          return item && item !== ""
        })
      },
      isHaveChild() {
        return this.node.children && this.node.children.length >= 0
      },
      tooltipText(){
        if(this.isFileSelectedToMove){
          return "Không được di chuyển vào chính nó"
        }
        if(!this.isHaveChild){
          return "Không thể di chuyển vào đây vì đây không phải là thư mục"
        }
      }
    },
    watch:{
      sourceMoveData(){
        if(!this.sourceMoveData || this.sourceMoveData.length === 0){
          this.copyTreeData = this.treeMoveData;
          this.copyTreeData.isShow = true;
          this.CHANGE_TREE_MOVE(this.copyTreeData)
        }else {
          this.copyTreeData = this.treeMoveData;

          if(this.arraySource && this.arraySource.length > 0){
            this.getFileInsideFolder(this.copyTreeData,this.arraySource[this.arraySource.length - 1])
          }

          let filesInsideFolder = this.filesInsideFolder.map(o => {
            return o.label
          })

          this.hideFileNotInsideFolder(this.copyTreeData, filesInsideFolder)
          this.CHANGE_TREE_MOVE(this.copyTreeData)
          this.$forceUpdate();
        }
      }
    },
    methods: {
      ...mapMutations([
        'APPEND_SOURCE_MOVE',
        'CHANGE_TREE_MOVE',
        'SELECT_FILE_MOVE',
        'UNSELECT_FILE_MOVE',
        'RESET_FILE_SELECTED_MOVE']),

      showChild() {
        this.copyTreeData = this.treeMoveData;

        this.setExpand(this.copyTreeData, this.node.label)
        this.CHANGE_TREE_MOVE(this.copyTreeData)
        if (this.isHaveChild) {
          this.RESET_FILE_SELECTED_MOVE();
          this.APPEND_SOURCE_MOVE(this.node.label + "/");
        }
      },

      selectFile(){
        this.toggleStyle = !this.toggleStyle;
        if(this.toggleStyle){
          this.fileStyle = {
            background: "skyblue",
            color: "white",
          }
          this.SELECT_FILE_MOVE(this.node.label)
        }else {
          this.fileStyle = ""
          this.UNSELECT_FILE_MOVE(this.node.label)
        }

      },

      getFileInsideFolder(item,label){
        if (item.label && item.label === label) {
          this.filesInsideFolder = item.children
          return this.filesInsideFolder
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.getFileInsideFolder(item.children[i], label)
          }
        }
      },

      hideFileNotInsideFolder(item,label){
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
      }

    }
  }
</script>

<style scoped>
  .disabled-item{
    pointer-events: none;
    opacity: 0.5;
  }
</style>
