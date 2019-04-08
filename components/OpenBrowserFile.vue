<template>
  <div>
    <Button type="primary" @click="openModal">Open File</Button>

    <Modal
      v-model="modal"
      title="Choose file"
      footer-hide>
      <div style="display: flex; justify-content: space-between">
        <div>
          Src:
          <span v-for="(item, index) in arraySource"
                class="hover-underline" @click="goToFolder(item)">{{item}}/</span>
        </div>
        <Icon type="ios-arrow-dropleft" size="20" @click="collapseTree"/>
      </div>
      <Tree :node="treeData" :space="0" style="padding: 20px 0px"/>

      <div style="display: flex; justify-content: flex-end">
        <Button style="margin-right: 10px" @click="modal = false">Cancel</Button>
        <Button type="primary" v-if="sourceData" @click="getFile">Get source</Button>
      </div>
    </Modal>
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
        modal: false,
        copyTreeData: []
      }
    },
    computed: {
      ...mapGetters(['sourceData', 'treeData', 'fileSelectedData']),
      arraySource() {
        let arrayFolder = this.sourceData.split("/")

        arrayFolder = arrayFolder.filter(item => {
          return item && item !== ""
        })
        return arrayFolder
      }
    },
    methods: {
      ...mapMutations(['ADD_TREE', 'COLLAPSE_TREE', 'CHANGE_TREE']),
      openModal() {
        this.modal = true;
      },
      goToFolder(label){
        // this.copyTreeData = this.treeData;
        // this.changeState(this.copyTreeData, label)
        // this.CHANGE_TREE(this.copyTreeData)
      },
      collapseTree() {
        this.copyTreeData = this.treeData;
        let arrayFolder = this.sourceData.split("/")

        arrayFolder = arrayFolder.filter(item => {
          return item && item !== ""
        })

        this.changeState(this.copyTreeData, arrayFolder[arrayFolder.length - 1])
        this.CHANGE_TREE(this.copyTreeData)
        this.COLLAPSE_TREE(`${arrayFolder[arrayFolder.length - 1]}/`);
      },
      changeState(item, label) {
        if (item.children && item.children.length > 0 && item.label && item.label === label) {
          item.expand = !item.expand
        } else {
          if (item.children && item.children.length > 0) {
            for (let i = 0; i < item.children.length; i++) {
              this.changeState(item.children[i], label)
            }
          }
        }
      },
      getFile() {
        let fileSelectedData = ""
        this.fileSelectedData.forEach(o => {
          fileSelectedData += `${this.sourceData}${o}<br><hr>`
        })
        if(fileSelectedData === ""){
          this.$Message.info(`Please choose one file`)
        }else {
          this.$Message.info(`File selected: <br>${fileSelectedData}`)
        }
      }
    }
  }
</script>

<style scoped>
  .hover-underline:hover{
    text-decoration: underline;
    cursor: pointer;
  }
</style>
