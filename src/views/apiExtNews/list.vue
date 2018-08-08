<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="编号"
                v-model="searchData.id">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="手机号码"
                v-model="searchData.mobileUser">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="发布人昵称"
                v-model="searchData.nick">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.categoryId" placeholder="商品分类">
        <el-option v-for="item in CmsCategoryList" :key="item.value" :label="item.name" :value="item.id">
          <span>
            <span v-for="lv in item.level-1" :key="lv">&#8195;&#8195;&#8195;&#8195;&#8195;</span>
            <span v-if="item.level > 1">╚═══</span>
            {{item.name}}
          </span>
        </el-option>
      </el-select>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="标题"
                v-model="searchData.titleLike">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="关键词"
                v-model="searchData.keywordsLike">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="标签"
                v-model="searchData.tagsLike">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.isRecommend" placeholder="是否推荐">
        <el-option label="推荐" value="true"></el-option>
        <el-option label="不推荐" value="false"></el-option>
      </el-select>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.status" placeholder="状态">
        <el-option label="待审核" value="0"></el-option>
        <el-option label="审核不通过" value="1"></el-option>
        <el-option label="审核通过" value="2"></el-option>
      </el-select>
      <el-date-picker type="date" placeholder="发布时间起" v-model="searchData.dateAddBegin" style="width: 200px;" class="filter-item"></el-date-picker>
      <el-date-picker type="date" placeholder="发布时间止" v-model="searchData.dateAddEnd" style="width: 200px;" class="filter-item"></el-date-picker>
      <el-date-picker type="date" placeholder="修改时间起" v-model="searchData.dateUpdateBegin" style="width: 200px;" class="filter-item"></el-date-picker>
      <el-date-picker type="date" placeholder="修改时间止" v-model="searchData.dateUpdateEnd" style="width: 200px;" class="filter-item"></el-date-picker>
      <el-button class="filter-item" type="primary" size="medium" icon="el-icon-search" @click="fetchData">搜索</el-button>
      <el-button class="filter-item" size="medium" style="margin-left: 10px;" @click="handleCreate" type="success"
                 icon="el-icon-edit">添加
      </el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="id" label="编号" width="100%"></el-table-column>
      <el-table-column label="发布人" width="100%">
        <template slot-scope="scope">
          {{scope.row.mobile ? scope.row.mobile : '-'}}
          <br>
          {{scope.row.nick ? scope.row.nick : '-'}}
        </template>
      </el-table-column>      
      <el-table-column prop="categoryName" label="分类" width="100%"></el-table-column>
      <el-table-column label="标题" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isRecommend" type="danger" size="mini">推荐</el-tag>
          {{scope.row.title}}
        </template>
      </el-table-column>
      <el-table-column prop="statusStr" label="状态" width="100%"></el-table-column>
      <el-table-column prop="views" label="浏览量" width="100%" align="center"></el-table-column>
      <el-table-column label="发布/更新时间" width="160">
        <template slot-scope="scope">
          {{scope.row.dateAdd}}
          <br>
          {{scope.row.dateUpdate ? scope.row.dateUpdate : '-'}}
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

  </div>
</template>

<script>
import { fetchDataList, delData } from '@/api/apiExtNews'
import { fetchCmsCategoryList } from '@/api/apiExtNewsCategory'
import { Message, MessageBox } from 'element-ui'

export default {
  data() {
    return {
      page:1,
      pageSize:10,
      totalRow:0,

      searchData: {
        id: undefined,
        nameLike: undefined,
        status: undefined,
        dateAddBegin: undefined,
        dateAddEnd: undefined,
      },

      multipleSelection: [],
      list: null,
      CmsCategoryList:[],
      listLoading: true,
      statisticsData:{}
    }
  },
  created() {
    this.pushDataTmp = Object.assign({}, this.pushData)
    this.fetchData()
  },
  mounted() {
    fetchCmsCategoryList().then(response => {
      if (response.code == 0) {
        this.CmsCategoryList = response.data
      }
    })
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
          this.list.forEach(ele => {
            if (ele.uid != 0) {
              let userMap = response.data.userMap[ele.uid]
              if(userMap){
                ele.mobile = userMap.mobile
                ele.nick = userMap.nick
              }
            }            
            let categoryMap = response.data.categoryMap[ele.categoryId]
            if(categoryMap){
              ele.categoryName = categoryMap.name
            }          
          })
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
