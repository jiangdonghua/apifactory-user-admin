<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="用户手机" v-model="searchData.mobile">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="用户编号" v-model="searchData.uid">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="用户昵称" v-model="searchData.nick">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="订单号" v-model="searchData.orderNumber">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.status" placeholder="状态">
        <el-option label="订单关闭" value="-1"></el-option>
        <el-option label="待支付" value="0"></el-option>
        <el-option label="待发货" value="1"></el-option>
        <el-option label="已发货待确认" value="2"></el-option>
        <el-option label="待评价" value="3"></el-option>
        <el-option label="交易成功" value="4"></el-option>
      </el-select>
      <el-date-picker type="date" placeholder="交易时间起" v-model="searchData.dateAddBegin" style="width: 200px;" class="filter-item" value-format="yyyy-MM-dd"></el-date-picker>
      <el-date-picker type="date" placeholder="交易时间止" v-model="searchData.dateAddEnd" style="width: 200px;" class="filter-item" value-format="yyyy-MM-dd"></el-date-picker>
      <el-date-picker type="date" placeholder="更新时间起" v-model="searchData.dateUpdateBegin" style="width: 200px;" class="filter-item" value-format="yyyy-MM-dd"></el-date-picker>
      <el-date-picker type="date" placeholder="更新时间止" v-model="searchData.dateUpdateEnd" style="width: 200px;" class="filter-item" value-format="yyyy-MM-dd"></el-date-picker>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">搜索</el-button>
      <el-button v-if="hasLingTongMod" class="filter-item" type="success" @click="goLT">灵通打单</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55" row-key="id"></el-table-column>
      <el-table-column label="用户信息">
        <template slot-scope="scope">
          {{apiExtUserMap[scope.row.uid].mobile?apiExtUserMap[scope.row.uid].mobile:'-'}}<br>
          {{apiExtUserMap[scope.row.uid].nick?apiExtUserMap[scope.row.uid].nick:'-'}}
        </template>
      </el-table-column>
      <el-table-column label="商品数/订单号">
        <template slot-scope="scope">
          {{scope.row.goodsNumber}}<br>
          {{scope.row.orderNumber}}
        </template>
      </el-table-column>
      <el-table-column prop="statusStr" label="状态">
        <template slot-scope="scope">
         {{scope.row.statusStr}}
         <el-button style="color:red" v-if="scope.row.hasRefund" type="text" @click="orderDetail(scope.row.id)">有退款</el-button>
        </template>
      </el-table-column>
      <el-table-column label="价格">
        <template slot-scope="scope">
         商品价:{{scope.row.amount}}<br>
         快递费:{{scope.row.amountLogistics?scope.row.amountLogistics:0}}
        </template>
      </el-table-column>
      <el-table-column label="实收">
        <template slot-scope="scope">
         金额:{{scope.row.amountReal}}<br>
         积分:{{scope.row.score?scope.row.score:0}}
        </template>
      </el-table-column>
      <el-table-column label="交易/更新时间" width="160">
        <template slot-scope="scope">
         {{scope.row.dateAdd}}<br>
         {{scope.row.dateUpdate?scope.row.dateUpdate:'-'}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" class='delete' @click="orderDetail(scope.row.id)" style="color:#336699">详情</el-button>
          <el-button type="text" class='delete' @click="delOrder(scope.row.id)" style="color:red">删除</el-button>
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
  </div>
</template>

<script>
import { fetchDataList, fetchExpressCompanies, traces, orderDetails, closeOrder, changePrice, changeScore, payOrder, payOrderOff, fahuo, fahuoDada, successOrder, delOrder, orderRefund, goLingTong } from '@/api/apiExtOrder'
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
        goodsId: [
          { required: true, message: '不能为空'},
          { type:'integer', message: '必须为数字'}
        ],
        number: [
          { required: true, message: '不能为空'},
          { type:'integer', message: '必须为数字'}
        ],
        originalPrice: [
          { required: true, message: '不能为空'},
          { type:'number', message: '必须为数字'}
        ],
        minPrice: [
          { required: true, message: '不能为空'},
          { type:'number', message: '必须为数字'}
        ],
        helpPriceMin: [
          { required: true, message: '不能为空'},
          { type:'number', message: '必须为数字'}
        ],
        helpPriceMax: [
          { required: true, message: '不能为空'},
          { type:'number', message: '必须为数字'}
        ],
        status: [
          { required: true, message: '不能为空'}
        ],
        dateAddStr: [
          { required: true, message: '不能为空'}
        ],
        dateEndStr: [
          { required: true, message: '不能为空'}
        ],
      },

      searchData:{},

      pushData: {
        dialogTitle : undefined,
        dialogFormVisible:false,

        id:undefined,
        goodsId:undefined,
        number:undefined,
        originalPrice:undefined,
        minPrice:undefined,
        helpPriceMin:undefined,
        helpPriceMax:undefined,
        status:undefined,
        dateAddStr:undefined,
        dateEndStr:undefined
      },

      multipleSelection: [],
      list: null,
      listLoading: true,
      statisticsData:{},
      apiExtUserMap:{},
      hasLingTongMod:false
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
          this.apiExtUserMap = response.data.apiExtUserMap
          this.list = response.data.result
          this.totalRow = response.data.totalRow
          this.hasLingTongMod = response.data.hasLingTongMod
        } else {
          this.list = []
          this.totalRow = 0
        }
        this.listLoading = false
      })
    },
    goLT(){
      this.listLoading = true
      goLingTong().then(res => {
        this.listLoading = false
        this.$alert('<a href="'+ res.data +'" target="_blank" style="color:red"><点击进入灵通平台></a>', '跳转到灵通打单', {
          dangerouslyUseHTMLString: true,
          showConfirmButton:false,
          center: true
        });
      })
    },
    orderDetail(id){
      this.$router.push({path: '/user/apiExtOrder/detail', query : {id:id}})
    },
    delOrder(id){
      this.$confirm('删除无法恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delOrder(id).then(res => {
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
          delOrder(obj.id).then(res => {
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
