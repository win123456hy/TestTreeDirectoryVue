<template>
  <div style="display: flex; flex-direction: row;">
    <div v-if="!node.expand && node.isShow" @click="showChild" :style="fileStyle" style="padding: 5px">
      <Icon v-if="isHaveChild" type="md-folder" :size="30"/>
      <Icon v-else type="ios-document" :size="30" @click="selectFile"/>
      <span>{{node.label}}</span>
    </div>


    <node v-if="node.expand && isHaveChild"
          v-for="(item, index) in node.children"
          :style="{marginLeft: `${space}px`}"
          :node="item"
          :space="space"
          :key="index">
    </node>

  </div>
</template>

<script>
  import {mapGetters, mapMutations} from "vuex"

  export default {
    name: "node",
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
        fileStyle: ""
      }
    },
    computed: {
      ...mapGetters(['sourceData', 'treeData']),
      isHaveChild() {
        return this.node.children && this.node.children.length >= 0
      },
    },
    watch:{
      sourceData(){
        if(!this.sourceData || this.sourceData.length === 0){
          this.copyTreeData = this.treeData;
          this.copyTreeData.isShow = true;
          this.CHANGE_TREE(this.copyTreeData)
        }else {
          let arrayFolder = this.sourceData.split("/")

          arrayFolder = arrayFolder.filter(item => {
            return item && item !== ""
          })
          this.copyTreeData = this.treeData;

          if(arrayFolder && arrayFolder.length > 0){
            this.getFileInsideFolder(this.copyTreeData,arrayFolder[arrayFolder.length - 1])
          }

          let filesInsideFolder = this.filesInsideFolder.map(o => {
            return o.label
          })

          this.hideFileNotInsideFolder(this.copyTreeData, filesInsideFolder)
          this.CHANGE_TREE(this.copyTreeData)
          this.$forceUpdate();
        }
      }
    },
    methods: {
      ...mapMutations(['APPEND_SOURCE', 'CHANGE_TREE','SELECT_FILE','UNSELECT_FILE','RESET_FILE_SELECTED']),
      selectFile(){
        this.toggleStyle = !this.toggleStyle;
        if(this.toggleStyle){
          this.fileStyle = {
            background: "skyblue",
            color: "white"
          }
          this.SELECT_FILE(this.node.label)
        }else {
          this.fileStyle = ""
          this.UNSELECT_FILE(this.node.label)
        }

      },
      showChild() {
        this.copyTreeData = this.treeData;

        this.changeState(this.copyTreeData, this.node.label)
        this.CHANGE_TREE(this.copyTreeData)
        if (this.isHaveChild) {
          this.RESET_FILE_SELECTED();
          this.APPEND_SOURCE(this.node.label + "/");
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

      changeState(item, label) {
        if (item.children && item.children.length > 0 && item.label && item.label === label) {
          item.expand = !item.expand
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.changeState(item.children[i], label)
          }
        }
      }

    }
  }
</script>
