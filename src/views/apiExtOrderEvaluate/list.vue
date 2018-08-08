<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="手机号码" v-model="searchData.mobile">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="昵称" v-model="searchData.nick">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="订单ID" v-model="searchData.orderId">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="订单号" v-model="searchData.orderNumber">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.goodReputation" placeholder="评价">
        <el-option label="差评" value="0"></el-option>
        <el-option label="中评" value="1"></el-option>
        <el-option label="好评" value="2"></el-option>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">搜索</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="orderId" label="订单ID"></el-table-column>
      <el-table-column label="商品图片" align="center">
        <template slot-scope="scope">
          <img v-if="scope.row.pic" :src="scope.row.pic" style="width:70px;" />
          <span v-if="!scope.row.pic">-</span>
        </template>
      </el-table-column>
      <el-table-column label="商品信息">
        <template slot-scope="scope">
          {{scope.row.goodsName}} &nbsp; &nbsp; &nbsp; {{scope.row.property}}
        </template>
      </el-table-column>
      <el-table-column label="手机号码">
        <template slot-scope="scope">
          {{apiExtUserMap[scope.row.uid].mobile}}
        </template>
      </el-table-column>
      <el-table-column label="昵称">
        <template slot-scope="scope">
          {{apiExtUserMap[scope.row.uid].nick}}
        </template>
      </el-table-column>
      <el-table-column prop="goodReputationStr" label="评价"></el-table-column>
      <el-table-column prop="goodReputationRemark" label="备注"></el-table-column>
      <el-table-column prop="dateReputation" label="评价时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row.id, scope.row.goodReputation, scope.row.goodReputationRemark)">编辑</el-button>
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
        <el-form-item label="评价" prop="goodReputation" >
          <el-select v-model="pushData.goodReputation" placeholder="请选择">
            <el-option label="差评" value="0"></el-option>
            <el-option label="中评" value="1"></el-option>
            <el-option label="好评" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="goodReputationRemark" >
          <el-input v-model="pushData.goodReputationRemark" type="textarea" :rows="8" clearable @keyup.enter.native="handleCreateSave"></el-input>
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
import { fetchDataList, saveData } from '@/api/apiExtOrderEvaluate'
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
        goodReputation: [
          { required: true, message: '不能为空'},
        ],
        goodReputationRemark: [
          { required: true, message: '不能为空'},
        ],
      },

      searchData:{
        mobile:undefined,
        nick:undefined,
        orderId:undefined,
        orderNumber:undefined,
        goodReputation:undefined,
      },

      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        id:undefined,
        goodReputation:undefined,
        goodReputationRemark:undefined,
      },

      multipleSelection: [],
      list: null,
      listLoading: true,
      apiExtUserMap:undefined
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
      fetchDataList(this.page, this.pageSize, this.searchData).then(response => {
        if (response.code == 0) {
          this.list = response.data.result
          this.apiExtUserMap = response.data.apiExtUserMap
          this.totalRow = response.data.totalRow
        }
        this.listLoading = false
      })
    },
    handleCreate(){
      this.pushData = Object.assign({}, this.pushDataTmp)
      this.pushData.dialogTitle = '增加评价'
      this.pushData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['addEditPopForm'].clearValidate()
      })
    },
    handleUpdate(id, goodReputation, goodReputationRemark){
      this.pushData = Object.assign({}, this.pushDataTmp, {id:id, goodReputation:'' + goodReputation, goodReputationRemark:goodReputationRemark})
      this.pushData.dialogTitle = '修改评价'
      this.pushData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['addEditPopForm'].clearValidate()
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
    },
    delDataMore(){
      if (!this.multipleSelection.length) {
        Message({
          message: '请先选择需要删除的数据',
          type: 'error',
          duration: 1 * 1000
        })
        return
      }
      this.$confirm('删除无法恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.multipleSelection.forEach(obj => {
          delData(obj.id).then(res => {
            this.fetchData()
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
