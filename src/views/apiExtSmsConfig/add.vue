<template>
  <div class="app-container">

    <el-form :rules="rules" ref="addEditPopForm" :model="pushData" :label-position="labelPosition" label-width="100px">
      <el-form-item :label="name" prop="userName">
        <el-input v-model="pushData.userName" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item :label="pwd" prop="pwd">
        <el-input v-model="pushData.pwd" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item :label="signName" prop="signName" v-if="isSignName">
        <el-input v-model="pushData.signName" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="模板ID" prop="templateId" v-if="isTemplateId">
        <el-input v-model="pushData.templateId" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item :label="templateData" prop="templateData" v-if="isTemplateData">
        <el-input v-model="pushData.templateContent" :rows="4" type="textarea" clearable
                  @keyup.enter.native="handleCreateSave"></el-input>
        <el-col class="red" :span="12" v-if="isCode">
          短信模板变量中，验证码变量请务必使用 code
        </el-col>
      </el-form-item>
      <el-form-item label="短信优先级" prop="paixu">
        <el-col :span="5">
          <el-input-number v-model="pushData.paixu" :min="0" label="请选择排序" @keyup.enter.native="handleCreateSave"
                           style="width: 89%"></el-input-number>
        </el-col>
        <el-col :span="12" class="red">
          &nbsp;&nbsp;&nbsp;&nbsp;数字越小，优先级越高
        </el-col>
      </el-form-item>
      <el-form-item label="短信类型" prop="mod">
        <el-select v-model="pushData.mod" placeholder="请选择">
          <el-option label="验证码短信" value='0'></el-option>
          <el-option label="其他短信" value='1'></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否启用" prop="isUse">
        <el-select v-model="pushData.isUse" placeholder="请选择">
          <el-option label="启用" value='true'></el-option>
          <el-option label="禁用" value='false'></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否需要增加图形验证码" prop="isNeedPiccode">
        <el-col :span="7">
          <el-select v-model="pushData.isNeedPiccode" placeholder="请选择">
            <el-option label="增加" value='true'></el-option>
            <el-option label="不增加" value='false'></el-option>
          </el-select>
        </el-col>
        <el-col :span="18" class="red">
          强烈建议开启图形验证码，防止短信轰炸攻击，确保获取验证码为人为操作！
        </el-col>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" style="text-align: center;">
      <el-button @click="goBack();">返回</el-button>
      <el-button type="primary" @click="handleCreateSave">确定</el-button>
    </div>

  </div>
</template>

<script>
  import {info, saveData} from '@/api/apiExtSmsConfigAdd'
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
        labelPosition: 'right',
        //表单验证
        rules: {
          userName: [
            {required: true, message: '请填写', trigger: 'blur'}
          ],
          pwd: [
            {required: true, message: '请填写', trigger: 'blur'}
          ], paixu: [
            {required: true, message: '请填写排序', trigger: 'blur'}
          ],
          /*type: [
            {min: 0, max: 32, message: '长度在32个字符以内', trigger: 'blur'}
          ],

          linkPhone: [
            {validator: this.validPhone, message: '请输入正确的11位手机号码', trigger: 'blur'}
          ]*/
        },

        pushData: {
          id: undefined,
          type: undefined,
          userName: undefined,
          pwd: undefined,
          signName: undefined,
          templateId: undefined,
          templateData: undefined,
          templateContent: undefined,
          paixu: 0,
          mod: 0,
          isUse: 'true',
          isNeedPiccode: 'true',
        },

        listLoading: true,
        name: '用户账号',
        pwd: '用户密码',
        signName: '短信签名',
        templateData: '短信内容',
        isSignName: false,
        isTemplateId: false,
        isTemplateData: true,
        isCode: false
      }
    },
    created() {
      //获取基本数据
      this.fetchData();

      this.handleCreate();
    },
    mounted() {

    },
    methods: {
      fetchData() {
        this.listLoading = true;
        this.pushData.id = this.$route.query.id ? this.$route.query.id : '';
        this.pushData.type = this.$route.query.type ? this.$route.query.type : '';
        if (this.pushData.id > 0) {
          info(this.pushData.id).then(res => {
            if (res.code !== 0) {
              Message({
                message: res.msg,
                type: 'error',
                duration: 3 * 1000
              })
            } else {
              this.pushData = Object.assign({}, this.pushDataTmp, res.data, {
                isUse: '' + res.data.isUse,
                mod: '' + res.data.mod,
                isNeedPiccode: '' + res.data.isNeedPiccode,
                dateAddStr: res.data.dateAdd,
                dateEndStr: res.data.dateEnd
              });

              this.isHidden(this.pushData.type, this.pushData.templateContent);
              this.$nextTick(() => {
                this.$refs['addEditPopForm'].clearValidate()
              })
            }

          }).then(() => {
            this.listLoading = false;
          });
        } else {
          this.isHidden(this.pushData.type);
        }
      },
      isHidden(type, templateContent) {
        if (type === 'alidayu' || type === 'aliyun') {
          this.name = 'app_key';
          this.pwd = 'app_secret';
          this.templateData = '模板数据';
          this.pushData.templateContent = templateContent ? templateContent : '{code:1234,product:"测试产品"}';
          this.isTemplateId = true;
          this.isSignName = true;
          this.isCode = true;
        } else if (type === '18sms') {
          this.pushData.templateContent = templateContent ? templateContent : '您的验证码是：${code}';
        } else if (type === 'saiyou') {
          this.name = 'APPID';
          this.pwd = 'APPKEY';
          this.templateData = '模板数据';
          this.pushData.templateContent = templateContent ? templateContent : '{code:1234}';
          this.isTemplateId = true;
        } else if (type === 'cr6868') {
          this.pushData.templateContent = templateContent ? templateContent : '您的验证码是：${code}';
          this.isSignName = true;
        } else if (type === 'yunzhixun') {
          this.name = 'Account Sid';
          this.pwd = 'Auth Token';
          this.signName = 'AppId';
          this.templateData = '模板数据';
          this.isSignName = true;
          this.isTemplateId = true;
          this.isTemplateData = false;
        } else if (type === 'tencentCloud') {
          this.name = 'sdkappid';
          this.pwd = 'appkey';
          this.pushData.templateContent = templateContent ? templateContent : '您的验证码是：{1}';
        } else if (type === 'bamikeji') {
          this.name = '用户ID(数字)';
          this.pwd = '密码';
          this.pushData.templateContent = templateContent ? templateContent : '您的验证码是：{1}';
        } else if (type === 'zthysms') {
          this.pushData.templateContent = templateContent ? templateContent : '您的验证码是：{1}';
        }
      },
      //表单验证
      handleCreate() {
        this.$nextTick(() => {
          this.$refs['addEditPopForm'].clearValidate()
        })
      },
      //保存
      handleCreateSave() {
        this.$refs['addEditPopForm'].validate((valid) => {
          if (valid) {
            saveData(this.pushData).then((res) => {
              if (res.code === 0) {
                Message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1000,
                  onClose: () => {
                    this.goBack();
                  }
                })
              } else {
                Message({
                  message: res.msg,
                  type: 'error',
                  duration: 3 * 1000
                })
              }
            }).catch(e => {
              console.error(e);
            })
          } else {
            Message({
              message: '操作失败,请输入正确信息',
              type: 'error',
              duration: 3 * 1000
            });
          }
        });

      },
      goBack() {
        this.$router.push({path: '/user/apiExtSmsConfig/list'});
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

  #container {
    min-width: 600px;
    min-height: 400px;
  }

  .red {
    color: #DD5A43 !important;
  }
</style>
