<template>

  <div class="app-container">

    
    <div class="json-editor" style="margin-top:10px;">
      <textarea ref="textarea" v-loading.body="listLoading" element-loading-text="Loading"></textarea>
    </div>
    <div class="filter-container">
      <el-button class="filter-item" style="margin-top: 10px;" @click="handleCreateSave" type="danger" icon="el-icon-edit">保存当前菜单设置</el-button>
    </div>

  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'

import { curMenu, setMenu } from '@/api/wxMenu'
import { Message, MessageBox } from 'element-ui'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'centerUserBase'
    ])
  },
  data() {
    return {
      jsonEditor: false,

      rules: {
        appid: [
          { required: true, message: '不能为空'}
        ],
        privateKey: [
          { required: true, message: '不能为空'}
        ]
      },



      multipleSelection: [],
      appid:null,
      privateKey:null,
      list: null,
      listLoading: true,
      statisticsData:{},
      pushData: {
              dialogTitle : undefined,
              dialogFormVisible:false,

              id:undefined,
              appid:undefined,
              privateKey:undefined
            }
    }
  },
  created() {
    this.pushDataTmp = Object.assign({}, this.pushData)
    this.fetchData()
  },
  mounted() {
    this.jsonEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'rubyblue',
      lint: true
    })
    this.jsonEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })
  },
  methods: {
    getValue() {
      return this.jsonEditor.getValue()
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.page = val
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    fetchData() {
      this.list = null
      this.listLoading = true
      curMenu().then(response => {
        if (response.code == 0) {
          this.jsonEditor.setValue(response.data)
          //this.curMenu = response.data
        }
        this.listLoading = false
      })
    },
    handleCreateSave(){
      setMenu(this.getValue()).then((res) => {
        if (res.code == 0) {
          Message({
            message: '设置成功',
            type: 'success',
            duration: 1 * 1000,
            onClose: () => {
              this.fetchData()
            }
          })
        } else {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000
          })
        }
      }).catch(e=>{
        console.error(e);
      })
    }
  }
}
</script>
<style scoped>
.json-editor{
  height: 100%;
  position: relative;
}
.json-editor >>> .CodeMirror {
  height: auto;
  min-height: 300px;
}
.json-editor >>> .CodeMirror-scroll{
  min-height: 300px;
}
.json-editor >>> .cm-s-rubyblue span.cm-string {
  color: #F08047;
}
</style>