<template>

  <div class="app-container">

    <div class="filter-container">
      <el-upload
        class="upload-demo"
        :action="uploadUrl"
        name="file"
        :headers="uploadUrlHeaders"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload">
        <el-button slot="trigger" class="filter-item" size="medium" type="primary" icon="el-icon-upload">上传支付证书（P12格式文件）</el-button>
        <el-button class="filter-item" style="margin-bottom: 10px;" size="medium" @click="handleCreate" type="success" icon="el-icon-edit">修改appid/secret设置</el-button>
        <el-button class="filter-item" size="medium" type="primary" icon="el-icon-upload" @click="fetchQrcode">小程序获取二维码</el-button>
        <el-button class="filter-item" style="margin-bottom: 10px;" size="medium" @click="delData" type="danger" icon="el-icon-delete">删除当前配置</el-button>
      </el-upload>
      
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" :show-header="false" border fit highlight-current-row empty-text="暂无数据">
      <el-table-column prop="name" label="name"></el-table-column>
      <el-table-column prop="val" label="val"></el-table-column>
    </el-table>
    <h3>Accesstoken 信息</h3>
    <el-table :data="listResult" v-loading.body="listLoading" element-loading-text="Loading" :show-header="false" border fit highlight-current-row empty-text="暂无数据">
      <el-table-column prop="name" label="name"></el-table-column>
      <el-table-column prop="val" label="val"></el-table-column>
    </el-table>

    <el-dialog title="配置微信appid/secret信息" :visible.sync="pushData.dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-position="left" label-width="160px">
        <el-form-item label="appid" prop="appid" >
          <el-input v-model="pushData.appid" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="secret" prop="secret" >
          <el-input v-model="pushData.secret" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="token" prop="wxtoken" >
          <el-input v-model="pushData.wxtoken" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="微信支付商户号" prop="mchId" >
          <el-input v-model="pushData.mchId" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
        <el-form-item label="微信支付商户秘钥" prop="mchKey" >
          <el-input v-model="pushData.mchKey" type="text" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pushData.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSave">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="小程序获取二维码" :visible.sync="pushData2.dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="addEditPopForm2" :model="pushData2" label-position="left" label-width="160px">
        <el-form-item label="页面路径" prop="content" >
          <el-input v-model="pushData2.content" type="text" clearable @keyup.enter.native="handleCreateSave2"></el-input>
        </el-form-item>
        <el-form-item label="二维码的宽度" prop="width" >
          <el-input v-model.number="pushData2.width" type="text" clearable @keyup.enter.native="handleCreateSave2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pushData2.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSave2">确定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { infoData, saveData, delData, qrcode } from "@/api/centerUserWxKey";
import { Message, MessageBox } from "element-ui";
import { mapGetters } from "vuex";
import { getToken } from '@/utils/auth'

export default {
  computed: {
    ...mapGetters(["centerUserBase"])
  },
  data() {
    return {
      uploadUrl:process.env.BASE_API + '/user/centerUserWxKey/save/certFile',
      uploadUrlHeaders:{
        "X-Token":getToken()
      },

      rules: {
        appid: [{ required: true, message: "不能为空" }],
        secret: [{ required: true, message: "不能为空" }],
      },

      multipleSelection: [],
      appid: null,
      privateKey: null,
      list: null,
      listResult: null,
      listLoading: true,
      statisticsData: {},
      pushData: {
        dialogFormVisible: false,

        id: undefined,
        appid: undefined,
        secret: undefined,
        wxtoken: undefined,
        mchId: undefined,
        mchKey: undefined,
      },
      pushData2: {
        dialogFormVisible: false,

        content: undefined,
        width: undefined,
      }
    };
  },
  created() {
    this.pushData2Tmp = Object.assign({}, this.pushData2);
    this.fetchData();
  },
  mounted() {},
  methods: {
    beforeAvatarUpload(file) {
      const isJPG = (file.type.indexOf('application/x-pkcs12') != -1);
      if (!isJPG) {
        this.$message.error('请上传 p12 格式的证书文件');
      }
      return isJPG;
    },
    handleAvatarSuccess(res, file) {
      if (res.code == 700) {
        this.$message.error('请先配置appid和secret再上传支付证书');
      }
      if (res.code == 0) {
        Message({
          message: "上传成功",
          type: "success",
          duration: 1 * 1000,
          onClose: () => {
            this.fetchData();
          }
        });
      } else {
        this.$message.error(res.msg);
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.fetchData();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    fetchData() {
      this.list = null;
      this.listLoading = true;
      infoData().then(response => {
        if (response.code == 0) {
          (this.appid = response.data.appid),
            (this.privateKey = response.data.privateKey),
            (this.list = [
              { name: "appid", val: response.data.appid },
              { name: "secret", val: response.data.secret },
              { name: "token", val: response.data.wxtoken },
              { name: "微信支付商户号", val: response.data.mchId },
              { name: "微信支付商户秘钥", val: response.data.mchKey }
            ]);
            this.pushData.appid = response.data.appid
            this.pushData.secret = response.data.secret
            this.pushData.wxtoken = response.data.wxtoken
            this.pushData.mchId = response.data.mchId
            this.pushData.mchKey = response.data.mchKey
          if (response.data.mchCertFile) {
            this.list.push({ name: "微信支付证书", val: "已上传" });
          } else {
            this.list.push({ name: "微信支付证书", val: "未上传" });
          }
          this.listResult = []
          this.listResult.push({ name: "accesstoken", val: response.data.accesstoken })
          this.listResult.push({ name: "jsTicket", val: response.data.jsTicket })
          this.listResult.push({ name: "添加时间", val: response.data.dateAdd })
          this.listResult.push({ name: "更新时间", val: response.data.dateUpdate })
          this.listResult.push({ name: "刷新时间", val: response.data.dateRefresh })
        } else if (response.code == 700) {
          this.list = [
            { name: "appid", val: "未设置" },
            { name: "secret", val: "未设置" },
            { name: "token", val: "未设置" },
            { name: "微信支付商户号", val: "未设置" },
            { name: "微信支付商户秘钥", val: "未设置" },
            { name: "微信支付证书", val: "未上传" }
          ]
          this.listResult = []
        }
        this.listLoading = false;
      });
    },
    handleCreate() {
      this.pushData.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["addEditPopForm"].clearValidate();
      });
    },
    handleCreateSave() {
      this.$refs["addEditPopForm"].validate(valid => {
        if (valid) {
          saveData(this.pushData)
            .then(res => {
              if (res.code == 101) {
                this.$message.error('appid或secret不正确！');
              }
              if (res.code == 0) {
                this.pushData.dialogFormVisible = false;
                Message({
                  message: "操作成功",
                  type: "success",
                  duration: 1 * 1000,
                  onClose: () => {
                    this.fetchData();
                  }
                });
              } else {
                Message({
                  message: res.msg,
                  type: "error",
                  duration: 3 * 1000
                });
              }
            })
            .catch(e => {
              console.error(e);
            });
        }
      });
    },
    fetchQrcode() {
      this.pushData2 = Object.assign({}, this.pushData2Tmp);
      this.pushData2.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["addEditPopForm2"].clearValidate();
      });
    },
    handleCreateSave2() {
      this.$refs["addEditPopForm2"].validate(valid => {
        if (valid) {
          qrcode(this.pushData2).then((res) => {
            this.pushData2.dialogFormVisible = false;            
            if (res.code != 0) {
              Message({
                message: res.msg,
                type: 'error',
                duration: 3 * 1000
              })
              return;
            }
            this.$alert(`<img src="${res.data}" width="200" >`, '微信扫一扫', {
              dangerouslyUseHTMLString: true,
              showConfirmButton:false,
              center: true
            });
          }).catch((err) => {
            console.log(err);
          })          
        }
      });
    },
    delData(){
      this.$confirm('删除无法恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delData().then(res => {
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
};
</script>

<style rel="stylesheet/scss" lang="scss">

</style>
