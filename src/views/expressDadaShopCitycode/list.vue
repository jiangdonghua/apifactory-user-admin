<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-button class="filter-item" @click="handleCreate" type="success" icon="el-icon-edit">添加</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55" row-key="id"></el-table-column>
      <el-table-column prop="number" label="门店编号"></el-table-column>
      <el-table-column prop="cityCode" label="城市编码"></el-table-column>
      <el-table-column prop="cityName" label="城市名称"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="delData(scope.row.id)" style="color:red">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button style='margin-top:20px' type="danger" @click="delDataMore">批量删除</el-button>
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
        <el-form-item label="门店编号" prop="number" >
          <el-input v-model="pushData.number" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="所在城市" prop="cityCode" >
          <el-select v-model="pushData.cityCode" placeholder="请选择">
            <el-option v-for="item in cities" :key="item.cityCode" :label="item.cityName" :value="item.cityCode"></el-option>
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
import { fetchDataList, fetchCityList, delData, saveData } from '@/api/expressDadaShopCitycode'
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
        number: [
          { required: true, message: '不能为空'},
        ],
        cityCode: [
          { required: true, message: '不能为空'},
        ],       
      },

      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        number:undefined,
        cityCode:undefined,
        cityName:undefined,
      },

      multipleSelection: [],
      list: null,
      cities:undefined,
      listLoading: true,
      statisticsData:{}
    }
  },
  created() {
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
      fetchDataList().then(response => {
        if (response.code == 0) {
          this.list = response.data.result
          this.totalRow = response.data.totalRow
        }
        this.listLoading = false
      })
    },
    handleCreate(){
      fetchCityList().then(res => {
        if (res.code != 0) {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000
          })
        } else {
          this.pushData.dialogTitle = '增加达达门店'
          this.pushData.dialogFormVisible = true

          this.pushData.number = undefined
          this.pushData.cityCode = undefined
          this.pushData.cityName = undefined
          this.cities = res.data
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
          this.cities.forEach(item => {
            if (item.cityCode == this.pushData.cityCode) {
              this.pushData.cityName = item.cityName
            }
          })
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
