<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="关键词" v-model="searchData.likeAsk">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="回复内容" v-model="searchData.likeReply">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.type" placeholder="类型">
        <el-option label="关注" value="0"></el-option>
        <el-option label="关键词回复" value="1"></el-option>
        <el-option label="小程序客服欢迎语" value="2"></el-option>
      </el-select>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.isUse" placeholder="是否启用">
        <el-option label="启用" value="true"></el-option>
        <el-option label="禁用" value="false"></el-option>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="success" icon="el-icon-edit">添加</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="typeStr" label="类型"></el-table-column>
      <el-table-column prop="ask" label="关键词"></el-table-column>
      <el-table-column prop="reply" label="回复内容" show-overflow-tooltip></el-table-column>
      <el-table-column label="状态" width="100%">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.isUse">启用</el-tag>
          <el-tag type="danger" v-if="!scope.row.isUse">禁用</el-tag>
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
        <el-form-item label="类型" prop="type" >
          <el-select v-model="pushData.type" placeholder="请选择">
            <el-option label="关注" value="0"></el-option>
            <el-option label="关键词回复" value="1"></el-option>
            <el-option label="小程序客服欢迎语" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词" prop="ask" >
          <el-input v-model="pushData.ask" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="回复内容" prop="reply" >
          <el-input v-model="pushData.reply" type="textarea" :rows="4" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="isUse" >
          <el-select v-model="pushData.isUse" placeholder="请选择">
            <el-option label="启用" value="true"></el-option>
            <el-option label="禁用" value="false"></el-option>
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
import { fetchDataList, infoData, delData, saveData } from '@/api/wxAutoReply'
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
        type: [
          { required: true, message: '不能为空'},
        ],
        ask: [
          { required: true, message: '不能为空'},
        ],
        reply: [
          { required: true, message: '不能为空'},
        ],
        isUse: [
          { required: true, message: '不能为空'},
        ],
      },

      searchData:{},

      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        id:undefined,
        type:undefined,
        ask:undefined,
        reply:undefined,
        isUse:undefined,
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
      fetchDataList(this.page, this.pageSize, this.searchData).then(response => {
        if (response.code == 0) {
          this.list = response.data.result
          this.totalRow = response.data.totalRow
        }
        this.listLoading = false
      })
    },
    handleCreate(){
      this.pushData = Object.assign({}, this.pushDataTmp)
      this.pushData.dialogTitle = '增加自动回复'
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
          this.pushData = Object.assign({}, this.pushDataTmp, res.data, {type:'' + res.data.type, isUse:'' + res.data.isUse})
          this.pushData.dialogTitle = '修改自动回复'
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
