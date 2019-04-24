<template>
  <div>
    <div style="display: flex;">
      <div>
        Src:
        <span v-for="(item, index) in arraySource"
              class="hover-underline" @click="goToFolder(item)">{{item}}/</span>
      </div>
      <Icon v-if="arraySource.length !== 1" type="ios-arrow-dropleft" size="20" @click="collapseTree"/>
      <Icon type="md-add-circle" size="20" @click="openAddFolder"/>

      <Modal
        v-model="modal"
        title="Add folder"
        footer-hide>
        <Input v-model="inputAddFolder" placeholder="Enter name folder"/>
        <Button type="primary"  @click="addFolder">Add</Button>
      </Modal>
    </div>

    <div>
      <Tree :node="treeData" :space="0" style="padding: 20px 0px"/>
    </div>



    <!--<Modal-->
    <!--ref="right"-->
    <!--@blur="closeMenu"-->
    <!--v-model="modal"-->
    <!--title="Choose file"-->
    <!--:style="{top:top, left:left}"-->
    <!--footer-hide>-->
    <!--<div style="display: flex; justify-content: space-between">-->
    <!--<div>-->
    <!--Src:-->
    <!--<span v-for="(item, index) in arraySource"-->
    <!--class="hover-underline" @click="goToFolder(item)">{{item}}/</span>-->
    <!--</div>-->
    <!--<Icon type="ios-arrow-dropleft" size="20" @click="collapseTree"/>-->
    <!--</div>-->
    <!--<Tree :node="treeData" :space="0" style="padding: 20px 0px"/>-->

    <!--<div style="display: flex; justify-content: flex-end">-->
    <!--<Button style="margin-right: 10px" @click="modal = false">Cancel</Button>-->
    <!--<Button type="primary" v-if="sourceData" @click="getFile">Get source</Button>-->
    <!--</div>-->
    <!--</Modal>-->
  </div>
</template>

<script>
  import Tree from "./Tree"
  import {mapGetters, mapMutations} from "vuex"

  export default {
    name: "open-browser-file",
    components: {
      Tree
    },
    data() {
      return {
        inputAddFolder: "",
        modal: false,
        copyTreeData: [],
      }
    },
    computed: {
      ...mapGetters(['sourceData', 'treeData', 'fileSelectedData']),
      arraySource() {
        return this.sourceData.split("/").filter(item => {
          return item && item !== ""
        })
      }
    },
    methods: {
      ...mapMutations(['ADD_TREE', 'COLLAPSE_TREE', 'CHANGE_TREE']),
      goToFolder(label) {
        if(label !== this.arraySource[this.arraySource.length - 1]){
          for (let i = this.arraySource.length; i > this.arraySource.indexOf(label); i--) {
            this.copyTreeData = this.treeData;

            this.setCollapse(this.copyTreeData, this.arraySource[i])
            this.CHANGE_TREE(this.copyTreeData)
            this.COLLAPSE_TREE(this.arraySource[i]);
          }
        }
      },

      collapseTree() {
        this.copyTreeData = this.treeData;

        this.setCollapse(this.copyTreeData, this.arraySource[this.arraySource.length - 1])
        this.CHANGE_TREE(this.copyTreeData)
        this.COLLAPSE_TREE(`${this.arraySource[this.arraySource.length - 1]}/`);
      },

      openAddFolder() {
        this.modal = true;
      },

      addFolder(){
        this.copyTreeData = this.treeData;
        this.createFolder(this.copyTreeData, this.arraySource[this.arraySource.length - 1], this.inputAddFolder)
        this.CHANGE_TREE(this.copyTreeData)

        this.modal = false
        this.$forceUpdate();
      },

      createFolder(item,label,labelNewFolder){
        if (item.label && item.label === label) {
          item.children.push({
            label: labelNewFolder,
            expand: false,
            isShow: true,
            children: []
          })
        }
        if (item.children && item.children.length > 0) {
          for (let i = 0; i < item.children.length; i++) {
            this.createFolder(item.children[i], label,labelNewFolder)
          }
        }
      },

      setCollapse(item, label) {
        if (item.children && item.label && item.label === label) {
          item.expand = false
        } else {
          if (item.children && item.children.length > 0) {
            for (let i = 0; i < item.children.length; i++) {
              this.setCollapse(item.children[i], label)
            }
          }
        }
      },

      getFile() {
        let fileSelectedData = ""
        this.fileSelectedData.forEach(o => {
          fileSelectedData += `${this.sourceData}${o}<br><hr>`
        })
        if (fileSelectedData === "") {
          this.$Message.info(`Please choose one file`)
        } else {
          this.$Message.info(`File selected: <br>${fileSelectedData}`)
        }
      }
    }
  }
</script>

<style scoped>
  .hover-underline:hover {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
