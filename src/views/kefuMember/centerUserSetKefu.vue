<template>

  <div class="app-container">

<div class="filter-container">
<el-button class="filter-item" style="margin-bottom: 10px;" @click="handleCreate" type="success" icon="el-icon-edit">设置</el-button>
<el-button class="filter-item" style="margin-bottom: 10px;" @click="delData" type="danger" icon="el-icon-delete">删除当前设置</el-button>
<el-button v-if="!pushData.isBuy" class="filter-item" style="margin-bottom: 10px;" @click="buyKf" type="warning" icon="el-icon-goods">购买移动客服</el-button>
<el-button v-if="pushData.isBuy" class="filter-item" style="margin-bottom: 10px;" @click="buyKf" type="warning" icon="el-icon-goods">移动客服续费</el-button>
</div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" :show-header="false" border fit highlight-current-row empty-text="暂无数据">
      <el-table-column prop="name" label="name"></el-table-column>
      <el-table-column prop="val" label="val"></el-table-column>
    </el-table>

    <el-alert
      style="margin-top:25px;"
      v-if="pushData.isBuy"
      :title="'您已购买客服小管家，到期时间为：' + pushData.dateEnd + ' ，请在到期之前续费！'"
      type="error"
      :closable="false">
    </el-alert>

    <el-dialog :title="pushData.dialogTitle" :visible.sync="pushData.dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-position="left" label-width="200px">
        <el-form-item label="类型" prop="type" >
          <el-select v-model="pushData.type" placeholder="请选择">
            <el-option label="公众号" value="0"></el-option>
            <el-option label="小程序" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="小程序客服转发到网页客服" prop="transferCustomerService" >
          <el-select v-model="pushData.transferCustomerService" placeholder="请选择">
            <el-option label="转发到网页客服" value="true"></el-option>
            <el-option label="不转发留在手机客服" value="false"></el-option>
          </el-select>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pushData.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSave">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="在线支付" :visible.sync="dialogTableVisiblePay">
      <form :action="alipayPostData.gateway" method="POST" target="_blank">
        <input type="hidden" v-for="(v, k) in alipayPostData.params" v-bind:key="k" :name="k" :value="v" />
        <el-button type="success" native-type="submit" round>打开支付宝付款</el-button>
      </form>
    </el-dialog>


  </div>
</template>

<script>
import { info, saveData, delData, getPayData } from '@/api/centerUserSetKefu'
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
        type: [
          { required: true, message: '不能为空'}
        ],
        transferCustomerService: [
          { required: true, message: '不能为空'}
        ],
      },

      dialogTableVisiblePay:false,
      alipayPostData:{},

      multipleSelection: [],
      list: null,
      listLoading: true,
      
      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        id:undefined,
        type:undefined,
        transferCustomerService:undefined,
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
          vm.pushData.type = '' + response.data.type
          vm.pushData.transferCustomerService = '' + response.data.transferCustomerService
          vm.list = []
          vm.list.push({name: '客服类型',val: response.data.type == 0? '公众号': '小程序'})
          vm.list.push({name: '客服方式',val: response.data.transferCustomerService?'网页客服':'移动客服'})
        }else if(response.code == 700){
          vm.list = [{name: '客服类型',val: '未设置'}, {name: '客服方式',val: '未设置'}]
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
    },
    buyKf(){
      getPayData(this.centerUserBase.id).then(res => {
        // 弹框点击确定调整支付宝付款
        this.alipayPostData = res.data;
        this.dialogTableVisiblePay = true;
      })
    },
  }
}
</script>
