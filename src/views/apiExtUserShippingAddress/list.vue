<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="手机号码" v-model="searchData.mobileUser">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="昵称" v-model="searchData.nick">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.isDefault" placeholder="是否默认">
        <el-option label="全部" value=""></el-option>
        <el-option label="默认" value="true"></el-option>
        <el-option label="不默认" value="false"></el-option>
      </el-select>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="快递手机号码" v-model="searchData.mobile">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.status" placeholder="状态">
        <el-option label="全部" value=""></el-option>
        <el-option label="正常" value="0"></el-option>
        <el-option label="禁用" value="1"></el-option>
      </el-select>

      <el-date-picker
        v-model="dateAdd"
        type="datetimerange"
        @change="handleDateAdd"
        align="center"
        start-placeholder="添加时间起"
        end-placeholder="添加时间止"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptions">
      </el-date-picker>

      <el-date-picker
        v-model="dateUpdate"
        type="datetimerange"
        @change="handleDateUpdate"
        align="center"
        start-placeholder="更新时间起"
        end-placeholder="更新时间止"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptions">
      </el-date-picker>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">搜索</el-button>
    </div>
   <!-- 编号	手机号码	昵称	是否默认	所在地	联系人	邮编	状态	添加时间	更新时间	操作-->
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="id" label="编号" width="70px"></el-table-column>
      <el-table-column prop="mobile" label="手机号码" width="110px">
        <template slot-scope="scope">
          <span v-if="apiExtUserMap[scope.row.uid].mobile">{{apiExtUserMap[scope.row.uid].mobile}}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="nick" label="昵称" width="120px">
        <template slot-scope="scope">
          <span>{{apiExtUserMap[scope.row.uid].nick}}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否默认" width="50px" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.isDefault" type="success" icon="el-icon-check" size="mini" circle></el-button>
          <el-button v-else type="danger" icon="el-icon-close" size="mini" circle></el-button>
        </template>
      </el-table-column>
      <el-table-column label="所在地">
        <template slot-scope="scope">
          <span>{{scope.row.provinceStr}} - {{scope.row.cityStr}} - {{scope.row.areaStr}} - {{scope.row.address}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="city" label="联系人" width="185px">
        <template slot-scope="scope">
          <span>{{scope.row.linkMan}}[{{scope.row.mobile}}]</span>
          <br/>
          <span v-if="scope.row.idcard">{{scope.row.idcard}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="邮编" width="70px"></el-table-column>
      <el-table-column prop="status" label="状态" width="67px">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'danger' : 'success'"
            disable-transitions>{{scope.row.statusStr}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dateAdd" label="添加时间" width="95px"></el-table-column>
      <el-table-column prop="dateUpdate" label="更新时间" width="95px"></el-table-column>
      <el-table-column label="操作" width="100px">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row.id)">编辑</el-button>
          <el-button type="text" @click="delData(scope.row.id)">删除</el-button>
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
  import { fetchDataList,delData } from '@/api/apiExtUserShippingAddress'
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
        dateUpdate: '',
        searchData:{
          isDefault:undefined,
          mobile:undefined,
          nick:undefined,
          mobileUser:undefined,
          status:undefined,
          dateAddBegin:undefined,
          dateAddEnd:undefined,
          dateUpdateBegin:undefined,
          dateUpdateEnd:undefined,
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
      handleDateAdd(val) {
        this.searchData.dateAddBegin = val?val[0]:undefined;
        this.searchData.dateAddEnd = val?val[1]:undefined;
      },
      handleDateUpdate(val) {
        this.searchData.dateUpdateBegin = val?val[0]:undefined;
        this.searchData.dateUpdateEnd = val?val[1]:undefined;
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
            this.apiExtUserMap = response.data.apiExtUserMap
            this.totalRow = response.data.totalRow
          }else if(response.code === 700){
            this.totalRow = 0
          }
          this.listLoading = false
        })
      },
      handleUpdate(id) {
        this.$router.push({path: '/user/apiExtUserShippingAddress/add', query: {id: id}});
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
  .el-range-editor.el-input__inner {
    padding: 7px 11px;
  }

</style>
