<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.status" placeholder="是否启用">
        <el-option label="启用" value="0"></el-option>
        <el-option label="禁用" value="1"></el-option>
      </el-select>
      <el-button class="filter-item" type="primary" size="medium" icon="el-icon-search" @click="fetchData">搜索</el-button>
      <el-button class="filter-item" size="medium" style="margin-left: 10px;" @click="handleCreate" type="success" icon="el-icon-edit">添加</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="rebate" label="折扣"></el-table-column>
      <el-table-column prop="upgradeAmount" label="消费满升级"></el-table-column>
      <el-table-column label="状态" width="100%">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status == 0">启用</el-tag>
          <el-tag type="danger" v-if="scope.row.status == 1">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="添加/修改" width="160">
        <template slot-scope="scope">
          {{scope.row.dateAdd}}<br>{{scope.row.dateUpdate?scope.row.dateUpdate:'-'}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row.id)">编辑</el-button>
          <el-button type="text" @click="delData(scope.row.id)" style="color:red">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalRow" style="margin-top:20px;">
    </el-pagination>

    <el-dialog :title="pushData.dialogTitle" :visible.sync="pushData.dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-position="left" label-width="100px">
        <el-form-item label="等级名称" prop="name" >
          <el-input v-model="pushData.name" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="paixu" >
          <el-input v-model="pushData.paixu" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="折扣" prop="rebate" >
          <el-col :span="4">
            <el-input v-model="pushData.rebate" clearable @keyup.enter.native="handleCreateSave"></el-input>
          </el-col>
          <el-col :span="20"> &nbsp;折</el-col>
        </el-form-item>
        <el-form-item label="自动升级" prop="upgradeAmount" >
          <el-col :span="4">
            <el-input v-model="pushData.upgradeAmount" clearable @keyup.enter.native="handleCreateSave"></el-input>
          </el-col>
          <el-col :span="20"> &nbsp;消费满多少金额自动升级到该会员</el-col>
        </el-form-item>
        <el-form-item label="状态" prop="status" >
          <el-select v-model="pushData.status" placeholder="请选择">
            <el-option label="启用" value="0"></el-option>
            <el-option label="禁用" value="1"></el-option>
          </el-select>
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
import { fetchAllUserLevels, infoData, delData, saveData } from '@/api/apiExtUserLevel'
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
      page:1,
      pageSize:10,
      totalRow:0,

      rules: {
        name: [
          { required: true, message: '不能为空'},
        ],
        paixu: [
          { required: true, message: '不能为空'},
        ],
      },

      searchData:{},

      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        id:undefined,
        paixu:0,
        rebate:10,
        name:undefined,
        upgradeAmount:undefined,
        status:undefined,
      },

      multipleSelection: [],
      list: null,
      listLoading: true,
      statisticsData:{}
    }
  },
  created() {
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
      fetchAllUserLevels(this.page, this.pageSize, this.searchData).then(response => {
        if (response.code == 0) {
          this.list = response.data.result
          this.totalRow = response.data.totalRow
        }
        this.listLoading = false
      })
    },
    handleCreate(){
      this.pushData = Object.assign({}, this.pushDataTmp)
      this.pushData.dialogTitle = '增加会员等级'
      this.pushData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['addEditPopForm'].clearValidate()
      })
    },
    handleUpdate(id){
      infoData(id).then(res => {
        if (res.code != 0) {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000
          })
        } else {
          this.pushData = Object.assign({}, this.pushDataTmp, res.data, {status:'' + res.data.status})
          this.pushData.dialogTitle = '修改会员等级'
          this.pushData.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['addEditPopForm'].clearValidate()
          })
        }
      }).catch(e=>{
        console.error(e);
      })
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
    statistics(){
      statistics().then(res => {
        // 弹框点击确定调整支付宝付款
        this.statisticsData = res.data
      })
    },
    delData(id){
      this.$confirm('删除无法恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delData(id).then(res => {
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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.filter-container {
  padding-bottom: 10px;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}

</style>
