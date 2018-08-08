<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="手机号码"
                v-model="searchData.mobile">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.isSuccess" placeholder="是否成功">
        <el-option label="全部" value=""></el-option>
        <el-option label="成功" value="true"></el-option>
        <el-option label="未成功" value="false"></el-option>
      </el-select>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="短信内容"
                v-model="searchData.contentLike">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="结果"
                v-model="searchData.resultLike">
      </el-input>
      <br/>
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
      <br/>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;padding-top: 10px;" class="filter-item"
                placeholder="短信通道" v-model="searchData.type"></el-input>
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-top: 10px;" @click="fetchData">
        搜索
      </el-button>
    </div>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row
              empty-text="暂无数据">
      <el-table-column prop="type" label="通道" width="140px;"></el-table-column>
      <el-table-column prop="mobile" label="手机号" width="150px;"></el-table-column>
      <el-table-column label="是否成功" width="80px;" align="center">
        <template slot-scope="scope">
          <el-button type="success" icon="el-icon-check" size="mini" circle v-if="scope.row.isSuccess"></el-button>
          <el-button type="danger" icon="el-icon-close" size="mini" circle v-if="!scope.row.isSuccess"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="短信内容"></el-table-column>
      <el-table-column prop="result" label="返回结果" width="500px;"></el-table-column>
      <el-table-column prop="dateAdd" label="发送时间" width="160px"></el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {fetchDataList} from '@/api/logSms'
  import {mapGetters} from 'vuex'

  export default {
    computed: {
      ...mapGetters([
        'centerUserBase'
      ])
    },
    data() {
      return {
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

        searchData: {
          mobile: undefined,
          isSuccess: undefined,
          contentLike: undefined,
          resultLike: undefined,
          dateAddBegin: undefined,
          dateAddEnd: undefined,
          dateUpdateBegin: undefined,
          dateUpdateEnd: undefined,
          type: undefined,
        },

        list: null,
        listLoading: true,
      }
    },
    created() {
      this.fetchData();
    },
    methods: {
      handleDateAdd(val) {
        this.searchData.dateAddBegin = val ? val[0] : undefined;
        this.searchData.dateAddEnd = val ? val[1] : undefined;
      },
      handleDateUpdate(val) {
        this.searchData.dateUpdateBegin = val ? val[0] : undefined;
        this.searchData.dateUpdateEnd = val ? val[1] : undefined;
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.fetchData();
      },
      handleCurrentChange(val) {
        this.page = val;
        this.fetchData()
      },
      fetchData() {
        this.list = null;
        this.listLoading = true;
        fetchDataList(this.searchData).then(response => {
          if (response.code === 0) {
            this.list = response.data.result;
          }
          this.listLoading = false
        })
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
