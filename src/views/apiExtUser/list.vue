<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="用户编号" v-model="searchData.id">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.source" placeholder="来源">
        <el-option label="全部" value=""></el-option>
        <el-option label="小程序" value="0"></el-option>
        <el-option label="手机注册" value="1"></el-option>
        <el-option label="公众号" value="2"></el-option>
        <el-option label="支付宝小程序" value="3"></el-option>
      </el-select>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="手机号码" v-model="searchData.mobile">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="昵称" v-model="searchData.nick">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="省份" v-model="searchData.province">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="城市" v-model="searchData.city">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="注册IP" v-model="searchData.ipAdd">
      </el-input>
      <el-date-picker
        v-model="dateAdd"
        type="datetimerange"
        @change="handleDateAdd"
        align="center"
        start-placeholder="注册时间起"
        end-placeholder="注册时间止"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptions">
      </el-date-picker>

      <el-date-picker
        v-model="dateLogin"
        type="datetimerange"
        @change="handleDateLogin"
        align="center"
        start-placeholder="登录时间起"
        end-placeholder="登录时间止"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptions">
      </el-date-picker>

      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="登录IP" v-model="searchData.ipLogin">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.status" placeholder="状态">
        <el-option label="全部" value=""></el-option>
        <el-option label="默认" value="0"></el-option>
      </el-select>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.isIdcardCheck" placeholder="实名认证">
        <el-option label="全部" value=""></el-option>
        <el-option label="是" value="true"></el-option>
        <el-option label="否" value="false"></el-option>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">搜索</el-button>
      <el-button class="filter-item but_gn" type="primary" icon="el-icon-plus" @click="importFromWX">从微信公众号导入用户</el-button>
    </div>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55" row-key="id"></el-table-column>
      <el-table-column prop="id" label="用户编号" width="80px"></el-table-column>
      <el-table-column prop="sourceStr" label="注册来源" width="80px"></el-table-column>
      <el-table-column prop="mobile" label="手机号码" width="110px">
        <template slot-scope="scope">
          <span v-if="scope.row.mobile">{{scope.row.mobile}}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="nick" label="昵称"></el-table-column>
      <el-table-column prop="province" label="省份" width="110px"></el-table-column>
      <el-table-column prop="city" label="城市" width="110px"></el-table-column>
      <el-table-column label="头像" align="center">
        <template slot-scope="scope">
          <img v-if="scope.row.avatarUrl" :src="scope.row.avatarUrl" style="width:70px;" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="dateAdd" label="注册时间" width="95px"></el-table-column>
      <el-table-column prop="ipAdd" label="注册IP"></el-table-column>
      <el-table-column prop="dateLogin" label="登录时间" width="95px"></el-table-column>
      <el-table-column prop="ipLogin" label="登录IP"></el-table-column>
      <el-table-column prop="statusStr" label="状态" width="50px"></el-table-column>
      <el-table-column label="操作" width="100px">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row.id)">编辑</el-button>
          <el-button type="text" @click="delData(scope.row.id)">删除</el-button>
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

    <el-dialog :title="pushData.dialogTitle" :visible.sync="pushData.dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" width="50%" style="margin-top: -11vh;" center>
      <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-position="left" label-width="100px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>用户标识</span>
          </div>
          <el-form-item label="id">
            {{pushData.id}}
          </el-form-item>
          <el-form-item label="openid">
            {{pushData.openid}}
          </el-form-item>
        </el-card>
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>基础信息</span>
          </div>
          <el-form-item label="手机号码">
            <el-col :span="15">
            <el-input v-model="pushData.mobile"></el-input>
            </el-col>

            <el-col :span="9" class="orange">
              &nbsp;&nbsp;&nbsp;修改手机号码请重新设置密码
            </el-col>
          </el-form-item>
          <el-form-item label="登录密码">
            <el-col :span="15">
            <el-input v-model="pushData.pwd"></el-input>
            </el-col>
            <el-col :span="9" class="orange">
              &nbsp;&nbsp;&nbsp;留空代表不修改密码
            </el-col>
          </el-form-item>
          <el-form-item label="昵称">
            <el-col :span="15">
            <el-input v-model="pushData.nick"></el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="会员等级">
            <el-select clearable v-model="pushData.levelId" placeholder="请选择">
              <el-option v-for="item in userLevels" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-card>
        <!-- <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>扩展信息</span>
          </div>
          <el-form-item label="用户">
            <el-col :span="15">
            <el-input v-model="pushData.用户"></el-input>
            </el-col>
          </el-form-item>
        </el-card> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pushData.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSave">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchDataList,info,importFromWX, saveData,delData } from '@/api/apiExtUser'
import { fetchAllUserLevels } from '@/api/apiExtUserLevel'
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
      pageSize:50,
      totalRow:0,

      rules: {},

      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      dateAdd: '',
      dateLogin: '',
      searchData:{
        id:undefined,
        source:undefined,
        mobile:undefined,
        nick:undefined,
        province:undefined,
        city:undefined,
        ipAdd:undefined,
        ipLogin:undefined,
        status:undefined,
        isIdcardCheck:undefined,
        dateAddBegin:undefined,
        dateAddEnd:undefined,
        dateLoginBegin:undefined,
        dateLoginEnd:undefined,
      },

      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        id:undefined,
        openid:undefined,
        mobile:undefined,
        nick:undefined,
        pwd:undefined,
        levelId:undefined,
      },

      multipleSelection: [],
      list: null,
      listLoading: true,
      userLevels:[]
    }
  },
  created() {
    this.pushDataTmp = Object.assign({}, this.pushData)
    this.fetchData()
  },
  mounted() {

  },
  methods: {
    handleDateAdd(val) {
      this.searchData.dateAddBegin = val?val[0]:undefined;
      this.searchData.dateAddEnd = val?val[1]:undefined;
    },
    handleDateLogin(val) {
      this.searchData.dateLoginBegin = val?val[0]:undefined;
      this.searchData.dateLoginEnd = val?val[1]:undefined;
    },
    importFromWX(){
      this.$confirm('本次操作可能需要您耐心等待几分钟<strong></br></strong>请耐心等待！', '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        importFromWX().then(res=>{
          if (res.code === 0) {
            Message({
              message: '操作成功',
              type: 'success',
              duration: 1000,
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
        });
      }).catch(() => {

      });
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
        if (response.code === 0) {
          this.list = response.data.result
          this.totalRow = response.data.totalRow
        }else if(response.code === 700){
          this.totalRow = 0
        }
        this.listLoading = false
      })
    },
    handleUpdate(id){
      let vm = this
      this.pushData = Object.assign({}, this.pushDataTmp, {id:id})
      this.pushData.dialogTitle = '编辑用户信息'
      this.pushData.dialogFormVisible = true
      info(id).then(res => {
        if (res.code !== 0) {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000
          })
        } else {
          this.pushData.mobile = res.data.userBase.mobile;
          this.pushData.nick = res.data.userBase.nick;
          this.pushData.openid = res.data.userBaseWx.openid;
          this.pushData.levelId = res.data.userBase.levelId;

          let levelSearchData = {}
          levelSearchData.status = 0
          fetchAllUserLevels(1, 10000, levelSearchData).then(res2 =>{
            if (res2.code !== 0) {
              Message({
                message: res2.msg,
                type: 'error',
                duration: 3 * 1000
              })
            } else {
              vm.userLevels = res2.data.result
            }
          })
          this.$nextTick(() => {
            this.$refs['addEditPopForm'].clearValidate()
          })
        }
      }).then(() => {
      });
    },
    handleCreateSave(){
      this.$refs['addEditPopForm'].validate((valid) => {
        if (valid) {
          saveData(this.pushData).then((res) => {
            this.pushData.dialogFormVisible = false
            if (res.code === 0) {
              Message({
                message: '操作成功',
                type: 'success',
                duration: 1000,
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
        delData(id).then(() => {
          Message({
            message: '删除成功',
            type: 'success',
            duration: 1000,
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

  .but_gn{
    background-color: #629B58!important;
    border-color: #87B87F;
  }

.el-range-editor.el-input__inner {
  padding: 7px 11px;
}

.orange {
  color: #FF892A!important;
}

.el-card {
  border: 0px;
}
.el-dialog__body {
  padding: 20px 20px;
}
</style>
