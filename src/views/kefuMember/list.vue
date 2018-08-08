<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-button class="filter-item" @click="handleCreate" type="success" icon="el-icon-edit" v-loading.body="listLoadingBT" element-loading-text="Loading">添加</el-button>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row empty-text="暂无数据" @selection-change="handleSelectionChange">
      <el-table-column prop="nick" label="昵称"></el-table-column>
      <el-table-column prop="mobile" label="手机号码"></el-table-column>
      <el-table-column label="状态" width="100%">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status == 0">启用</el-tag>
          <el-tag type="danger" v-if="scope.row.status == 1">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dateAdd" label="添加时间" width="160"></el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status == 1" type="text" @click="enable(scope.row.id)">启用</el-button>
          <el-button v-if="scope.row.status == 0" type="text" @click="disable(scope.row.id)">禁用</el-button>
          <el-button type="text" @click="delData(scope.row.id)" style="color:red">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { fetchDataList, fetchQrcode, enable, disable, delData } from '@/api/kefuMember'
import { Message, MessageBox } from 'element-ui'
import { mapGetters } from 'vuex'
import QRCode from 'qrcodejs2'

export default {
  computed: {
    ...mapGetters([
      'centerUserBase'
    ])
  },
  data() {
    return {
      listLoadingBT:false,
      listLoading:false,

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
      fetchDataList().then(response => {
        if (response.code != 700) {
          this.list = response.data.list
          this.list.forEach(ele => {
            let user = response.data.userMap[ele.uid]
            if (user) {
              ele.nick = user.nick ? user.nick : '-'
              ele.mobile = user.mobile ? user.mobile : '-'
            }
          })
        }
        this.listLoading = false
      })
    },
    handleCreate(){
      this.listLoadingBT = true
      let rnd = Math.random()
      fetchQrcode().then(res => {
        this.$alert('<div id="qrcode_'+ rnd +'"></div>', '扫码绑定客服', {
          dangerouslyUseHTMLString: true,
          showConfirmButton:false
        });
        this.$nextTick(() => {
          this.listLoadingBT = false
          let qrcode = new QRCode('qrcode_' + rnd, {
            width: 200,
            height: 200, // 高度
            text: res.data // 二维码内容
            // render: 'canvas' // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
            // background: '#f0f'
            // foreground: '#ff0'
          })
        });      
      }).catch(e => {
        console.log(e);
        
      })
    },
    enable(id){
      this.$confirm('确定要启用该客服?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enable(id).then(res => {
          Message({
            message: '启用成功',
            type: 'success',
            duration: 1 * 1000,
            onClose: () => {
              this.fetchData()
            }
          })
        })
      }).catch(() => {});
    },
    disable(id){
      this.$confirm('确定要禁用该客服?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disable(id).then(res => {
          Message({
            message: '禁用成功',
            type: 'success',
            duration: 1 * 1000,
            onClose: () => {
              this.fetchData()
            }
          })
        })
      }).catch(() => {});
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
    },
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
