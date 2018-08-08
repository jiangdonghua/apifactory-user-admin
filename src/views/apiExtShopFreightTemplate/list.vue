<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-button class="filter-item" @click="handleCreate" type="success" icon="el-icon-edit">添加</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column label="是否包邮" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.isFree">包邮</el-tag>
          <el-tag type="danger" v-if="!scope.row.isFree">不包邮</el-tag>
        </template>
			</el-table-column>
      <el-table-column prop="feeTypeStr" align="center" label="计价方式"></el-table-column>
      <el-table-column prop="dateAdd" label="添加时间"></el-table-column>
      <el-table-column prop="dateUpdate" label="更新时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row.id)">编辑</el-button>
          <el-button type="text" @click="delData(scope.row.id)" style="color:red">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { fetchDataList, delData } from '@/api/apiExtShopFreightTemplate'
import { Message, MessageBox } from 'element-ui'

export default {
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '不能为空'}
        ],
        isFree: [
          { required: true, message: '不能为空'}
        ],
        feeType: [
          { required: true, message: '不能为空'}
        ],
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
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    fetchData() {
      this.list = null
      this.listLoading = true
      fetchDataList().then(response => {
        if (response.code == 0) {
          this.list = response.data
        }
        this.listLoading = false
      })
    },
    handleCreate(){
      this.$router.push({ path: 'add' })
    },
    handleUpdate(id){
      this.$router.push({ path: 'add', query:{id:id} })
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
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
