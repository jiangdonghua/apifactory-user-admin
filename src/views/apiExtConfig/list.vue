<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-button class="filter-item" @click="handleCreate(0)" type="success">添加文本参数</el-button>
      <el-button class="filter-item" @click="handleCreate(1)" type="success">添加开关参数</el-button>
      <el-button class="filter-item" @click="handleCreate(2)" type="success">添加文件参数</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="key" label="编号"></el-table-column>
      <el-table-column prop="value" label="参数值"></el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
      <el-table-column label="状态" width="100%">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.isPub">公开参数</el-tag>
          <el-tag type="danger" v-if="!scope.row.isPub">保密参数</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="添加/修改" width="160">
        <template slot-scope="scope">
          {{scope.row.creatAt}}<br>{{scope.row.dateUpdate?scope.row.dateUpdate:'-'}}
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
        
        <el-form-item v-if="!pushData.id" label="参数编码" prop="key" >
          <el-input v-model="pushData.key" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item v-if="pushData.dateType == 0" label="参数值" prop="content" >
          <el-input v-model="pushData.content" type="textarea" :rows="4" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item v-if="pushData.dateType == 1" label="开关状态" prop="content" >
          <el-select v-model="pushData.content" placeholder="请选择">
            <el-option label="开启" value="1"></el-option>
            <el-option label="关闭" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="pushData.dateType == 2" label="上传文件" prop="content" >
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            name="upfile"
            :headers="uploadUrlHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess">
            <el-button slot="trigger" class="filter-item" size="medium" type="primary">选择文件上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注" prop="remark" >
          <el-input v-model="pushData.remark" type="textarea" :rows="4" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="isPub" >
          <el-select v-model="pushData.isPub" placeholder="请选择">
            <el-option label="公开数据" value="true"></el-option>
            <el-option label="保密数据" value="false"></el-option>
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
import { fetchDataList, infoData, delData, saveData } from '@/api/apiExtConfig'
import { Message, MessageBox } from 'element-ui'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'

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

      uploadUrl:process.env.BASE_API + '/fileUpload',
      uploadUrlHeaders:{
        "X-Token":getToken()
      },

      rules: {
        key: [
          { required: true, message: '不能为空'},
        ],
        content: [
          { required: true, message: '不能为空'},
        ],
        isPub: [
          { required: true, message: '不能为空'},
        ],
      },

      searchData:{},

      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        id:undefined,
        dateType:undefined,
        isPub:"true",
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
    handleAvatarSuccess(res, file) {
      if (res.code == 10000) {
        this.$message.error('参数编号已被使用')
        return
      }
      if (res.code == 0) {
        Message({
          message: "上传成功",
          type: "success",
          duration: 1 * 1000
        });
        this.pushData.content = res.data.url;
      } else {
        this.$message.error(res.msg);
      }
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
      fetchDataList(this.page, this.pageSize, this.searchData).then(response => {
        if (response.code == 0) {
          this.list = response.data.result
          this.totalRow = response.data.totalRow
        }
        this.listLoading = false
      })
    },
    handleCreate(dateType){
      this.pushData = Object.assign({}, this.pushDataTmp)
      this.pushData.dateType = '' + dateType
      if (dateType == 0) {
        this.pushData.dialogTitle = '添加文本参数'
      }
      if (dateType == 1) {
        this.pushData.dialogTitle = '添加开关参数'
      }
      if (dateType == 2) {
        this.pushData.dialogTitle = '添加文件参数'
      }
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
          this.pushData = Object.assign({}, this.pushDataTmp, res.data, {dateType:'' + res.data.dateType, isPub:'' + res.data.isPub, content:res.data.value})
          if (res.data.dateType == 0) {
            this.pushData.dialogTitle = '修改文本参数'
          }
          if (res.data.dateType == 1) {
            this.pushData.dialogTitle = '修改开关参数'
          }
          if (res.data.dateType == 2) {
            this.pushData.dialogTitle = '修改文件参数'
          }
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
