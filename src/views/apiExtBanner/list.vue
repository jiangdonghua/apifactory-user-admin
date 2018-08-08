<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-button class="filter-item" size="medium" @click="handleCreate()" type="success" icon="el-icon-edit">添加</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="type" label="自定义类型"></el-table-column>
      <el-table-column prop="businessId" label="业务编号"></el-table-column>
      <el-table-column prop="title" label="名称"></el-table-column>
      <el-table-column label="图标" width="100%" align="center">
        <template slot-scope="scope">
          <img v-if="scope.row.picUrl" :src="scope.row.picUrl" style="width:70px;" />
          <span v-if="!scope.row.picUrl">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="linkUrl" label="链接地址"></el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
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
        
        <el-form-item label="自定义类型" prop="type" >
          <el-input v-model="pushData.type" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="业务编号" prop="businessId" >
          <el-input v-model="pushData.businessId" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="title" >
          <el-input v-model="pushData.title" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="上传图片" >
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            name="upfile"
            :headers="uploadUrlHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="链接地址" prop="linkUrl" >
          <el-input v-model="pushData.linkUrl" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark" >
          <el-input v-model="pushData.remark" type="textarea" :rows="4" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status" >
          <el-select v-model="pushData.status" placeholder="请选择">
            <el-option label="显示" value="0"></el-option>
            <el-option label="隐藏" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="paixu" >
          <el-input v-model="pushData.paixu" clearable @keyup.enter.native="handleCreateSave"></el-input>
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
import { fetchDataList, infoData, delData, saveData } from '@/api/apiExtBanner'
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

      imageUrl:undefined,
      uploadUrl:process.env.BASE_API + '/fileUpload',
      uploadUrlHeaders:{
        "X-Token":getToken()
      },

      rules: {
        type: [
          { required: true, message: '不能为空'},
        ],
        businessId: [
          { required: true, message: '不能为空'},
        ],
        title: [
          { required: true, message: '不能为空'},
        ],
        picUrl: [
          { required: true, message: '不能为空'},
        ],
        status: [
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
      this.imageUrl = URL.createObjectURL(file.raw);
      this.pushData.picUrl = res.data.url;
    },
    beforeAvatarUpload(file) {
      const isJPG = (file.type.indexOf('image/') != -1);
      const isLt1M = file.size / 1024 / 1024 < 1;

      if (!isJPG) {
        this.$message.error('只能是图片格式!');
      }
      if (!isLt1M) {
        this.$message.error('图片大小不能超过 1MB!');
      }
      return isJPG && isLt1M;
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
    handleCreate(){
      this.imageUrl = undefined
      this.pushData = Object.assign({}, this.pushDataTmp)
      this.pushData.dialogTitle = '添加Banner'
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
          this.imageUrl = res.data.picUrl
          this.pushData.dialogTitle = '修改Banner'
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
