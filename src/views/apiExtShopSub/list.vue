<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="店铺编号"
                v-model="searchData.id">
      </el-input>
      <el-select clearable style="width: 200px" class="filter-item" v-model="searchData.status" placeholder="状态">
        <el-option label="正常" value="0"></el-option>
        <el-option label="禁用" value="1"></el-option>
      </el-select>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="店铺类型"
                v-model="searchData.type">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="店铺名称"
                v-model="searchData.nameLike">
      </el-input>
      <el-input clearable @keyup.enter.native="fetchData" style="width: 200px;" class="filter-item" placeholder="地址"
                v-model="searchData.addressLike">
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
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="success"
                 icon="el-icon-edit">添加
      </el-button>
    </div>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row
              empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="id" width="90px" label="店铺编号"></el-table-column>
      <el-table-column prop="type" label="店铺类型"></el-table-column>
      <el-table-column prop="area" :formatter="areaFormat" label="所在地"></el-table-column>
      <el-table-column prop="name" label="店铺名称"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column prop="linkPhone" label="联系电话"></el-table-column>
      <el-table-column label="店铺图片" min-width="100px">
        <template slot-scope="scope" v-if="scope.row.pic">
          <img :src="scope.row.pic" width="100" height="100">
        </template>
      </el-table-column>
      <el-table-column prop="numberOrder" width="70px" label="成交量"></el-table-column>
      <el-table-column prop="numberGoodReputation" width="70px" label="好评数"></el-table-column>
      <el-table-column prop="statusStr" width="50px" label="状态"></el-table-column>
      <el-table-column prop="dateAdd" width="95px" label="添加时间"></el-table-column>
      <el-table-column prop="dateUpdate" width="95px" label="修改时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row.id)">编辑</el-button>
          <el-button type="text" @click="delData(scope.row.id)" style="color:red">删除</el-button>
        </template>
      </el-table-column>
    </el-table>


  </div>
</template>

<script>
  import {delData, fetchDataList, info} from '@/api/apiExtShopSub'
  import {Message} from 'element-ui'
  import {mapGetters} from 'vuex'

  export default {
    computed: {
      ...mapGetters([
        'centerUserBase'
      ])
    },
    data() {
      return {
        rules: {
          goodsId: [
            {required: true, message: '不能为空'},
            {type: 'integer', message: '必须为数字'}
          ],
          number: [
            {required: true, message: '不能为空'},
            {type: 'integer', message: '必须为数字'}
          ],
          originalPrice: [
            {required: true, message: '不能为空'},
            {type: 'number', message: '必须为数字'}
          ],
          minPrice: [
            {required: true, message: '不能为空'},
            {type: 'number', message: '必须为数字'}
          ],
          helpPriceMin: [
            {required: true, message: '不能为空'},
            {type: 'number', message: '必须为数字'}
          ],
          helpPriceMax: [
            {required: true, message: '不能为空'},
            {type: 'number', message: '必须为数字'}
          ],
          status: [
            {required: true, message: '不能为空'}
          ],
          dateAddStr: [
            {required: true, message: '不能为空'}
          ],
          dateEndStr: [
            {required: true, message: '不能为空'}
          ],
        },
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
          id: undefined,
          type: undefined,
          status: undefined,
          nameLike: undefined,
          addressLike: undefined,
          dateAddBegin: undefined,
          dateAddEnd: undefined,
          dateUpdateBegin: undefined,
          dateUpdateEnd: undefined,
        },

        pushData: {
          dialogTitle: undefined,
          dialogFormVisible: false,

          id: undefined,
          type: undefined,
          status: undefined,
          nameLike: undefined,
          addressLike: undefined,
          dateAddStr: undefined,
          dateEndStr: undefined
        },

        multipleSelection: [],
        list: null,
        listLoading: true,
        statisticsData: {}
      }
    },
    created() {
      this.pushDataTmp = Object.assign({}, this.pushData);
      this.fetchData()
    },
    mounted() {

    },
    methods: {
      areaFormat(row) {
        return `${row.provinceStr} - ${row.cityStr} - ${row.areaStr}`;
    },
    handleDateAdd(val) {
        this.searchData.dateAddBegin = val?val[0]:undefined;
        this.searchData.dateAddEnd = val?val[1]:undefined;
      },
      handleDateUpdate(val) {
        this.searchData.dateUpdateBegin = val?val[0]:undefined;
        this.searchData.dateUpdateEnd = val?val[1]:undefined;
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      fetchData() {
        this.list = null;
        this.listLoading = true;
        fetchDataList(this.searchData).then(response => {
          if (response.code === 0) {
            this.list = response.data.result;
            this.totalRow = response.data.totalRow
          }
          this.listLoading = false
        })
      },
      handleCreate() {
        this.$router.push({path: '/user/apiExtShopSub/add'});
      },
      handleUpdate(id) {
        this.$router.push({path: '/user/apiExtShopSub/add', query: {id: id}});
      },
      delData(id) {
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
        }).catch(() => {
        });
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
