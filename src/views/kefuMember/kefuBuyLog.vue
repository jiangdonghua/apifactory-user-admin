<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="商户编号" v-model="searchData.userIdShop">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="订单号" v-model="searchData.number">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.isSuccess" placeholder="是否成功">
        <el-option label="成功" value="true"></el-option>
        <el-option label="失败" value="false"></el-option>
      </el-select>
      <el-date-picker type="date" placeholder="购买时间起" v-model="searchData.dateAddBegin" style="width: 200px;" class="filter-item"></el-date-picker>
      <el-date-picker type="date" placeholder="购买时间止" v-model="searchData.dateAddEnd" style="width: 200px;" class="filter-item"></el-date-picker>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">搜索</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="userIdShop" label="商户编号"></el-table-column>
      <el-table-column prop="number" label="订单号"></el-table-column>
      <el-table-column prop="payGateTradeId" label="支付宝单号"></el-table-column>
      <el-table-column prop="money" label="金额"></el-table-column>
      <el-table-column label="状态" width="100%" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.isSuccess">成功</el-tag>
          <el-tag type="danger" v-if="!scope.row.isSuccess">失败</el-tag>
        </template>
			</el-table-column>
      <el-table-column prop="dateAdd" label="购买时间"></el-table-column>
      <el-table-column label="操作" width="100%" align="center">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.isSuccess" type="danger" size="mini" @click="setSuccess(scope.row.id)">设为成功</el-button>
          <el-button v-else type="text" disabled="true" size="mini">-</el-button>
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
import { fetchDataList, setSuccess } from '@/api/kefuBuyLog'
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

      searchData:{ },

      multipleSelection: [],
      list: null,
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
      fetchDataList(this.page, this.pageSize, this.searchData).then(response => {
        if (response.code == 0) {
          this.list = response.data.result
          this.totalRow = response.data.totalRow
        }
        this.listLoading = false
      })
    },
    setSuccess(id){
      this.$confirm('确定要设置为成功吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setSuccess(id).then(res => {
          Message({
            message: '设置成功',
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
