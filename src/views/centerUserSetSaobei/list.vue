<template>

  <div class="app-container">

<div class="filter-container">
<el-button class="filter-item" style="margin-bottom: 10px;" @click="handleCreate" type="success" icon="el-icon-edit">设置</el-button>
<el-button class="filter-item" style="margin-bottom: 10px;" @click="delData" type="danger" icon="el-icon-edit">删除当前设置</el-button>
</div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" :show-header="false" border fit highlight-current-row empty-text="暂无数据">
      <el-table-column prop="name" label="name"></el-table-column>
      <el-table-column prop="val" label="val"></el-table-column>
    </el-table>

    <el-dialog :title="pushData.dialogTitle" :visible.sync="pushData.dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-position="left" label-width="160px">
        <el-form-item label="商户号" prop="merchantNo" >
          <el-input v-model="pushData.merchantNo" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="终端号" prop="terminalId" >
          <el-input v-model="pushData.terminalId" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="注册终端获取的令牌" prop="accessToken" >
          <el-input v-model="pushData.accessToken" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pushData.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSave">确定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { info, saveData, delData } from '@/api/centerUserSetSaobei'
import { Message, MessageBox } from 'element-ui'
import { mapGetters } from 'vuex'

let vm

export default {
  computed: {
    ...mapGetters([
      'centerUserBase'
    ])
  },
  data() {
    return {

      rules: {
        merchantNo: [
          { required: true, message: '不能为空'}
        ],
        terminalId: [
          { required: true, message: '不能为空'}
        ],
        accessToken: [
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
        merchantNo:undefined,
        terminalId:undefined,
        accessToken:undefined
      }
    }
  },
  created() {
    vm = this
    this.pushDataTmp = Object.assign({}, this.pushData)
    this.fetchData()
  },
  mounted() {

  },
  methods: {
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
      info().then(response => {
        if (response.code == 0) {
          vm.pushData = Object.assign({}, this.pushData, response.data)
          vm.list = [{name: '商户号',val: response.data.merchantNo}, {name: '终端号',val: response.data.terminalId}, {name: '注册终端获取的令牌',val: response.data.accessToken}]
        }else if(response.code == 700){
          vm.list = [{name: '商户号',val: '未设置'}, {name: '终端号',val: '未设置'}, {name: '注册终端获取的令牌',val: '未设置'}]
        }
        this.listLoading = false
      })
    },
    handleCreate(){
      this.pushData.dialogTitle = '支付配置'
      this.pushData.dialogFormVisible = true
      vm.$nextTick(() => {
        vm.$refs['addEditPopForm'].clearValidate()
      })
    },
    delData(){
      this.$confirm('删除无法恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delData().then(res => {
          Message({
            message: '删除成功',
            type: 'success',
            duration: 1 * 1000,
            onClose: () => {
              this.fetchData()
            }
          })
        })
      }).catch(() => {});
    },
    handleCreateSave(){
      this.$refs['addEditPopForm'].validate((valid) => {
        if (valid) {
          saveData(this.pushData).then((res) => {
            this.pushData.dialogFormVisible = false
            if (res.code == 0) {
              Message({
                message: '操作成功',
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
      })
    }
  }
}
</script>
