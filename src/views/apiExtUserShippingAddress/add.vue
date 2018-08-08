<template>
  <div class="app-container">

    <el-form :rules="rules" ref="addEditPopForm" :model="pushData" :label-position="labelPosition" label-width="100px">
      <el-form-item label="所在地" prop="areaSelect">
        <el-cascader :options="options" placeholder="- 请选择 -" @active-item-change="handleSelectionChange"
                     @change="handleAreaData" :props="props" v-model="areaData">
        </el-cascader>
      </el-form-item>
      <el-form-item label="联系人" prop="linkMan">
        <el-input v-model="pushData.linkMan" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="身份证号码" prop="idcard">
        <el-input v-model="pushData.idcard" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="pushData.address" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="pushData.mobile" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="邮编" prop="code">
        <el-input v-model="pushData.code" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="pushData.status" placeholder="请选择">
          <el-option label="正常" value='0'></el-option>
          <el-option label="禁用" value='1'></el-option>
        </el-select>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer" style="text-align: center;">
      <el-button @click="goBack()">返回</el-button>
      <el-button type="primary" @click="handleCreateSave">确定</el-button>
    </div>

  </div>
</template>

<script>
  import {getChild, getProvince, info, saveData} from '@/api/apiExtUserShippingAddressAdd'
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
          areaSelect: [
            {message: '请选择所在地', trigger: 'blur'},
            {validator: this.handleArea, trigger: 'change'}
          ],
          linkMan: [
            {required: true, message: '请输入联系人', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入详细地址', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入邮编', trigger: 'blur'}
          ],
          mobile: [
            {required: true,validator: this.validPhone, message: '请输入正确的11位手机号码', trigger: 'blur'}
          ]
        },

        pushData: {
          id: undefined,
          isDefault: undefined,
          provinceId: undefined,
          cityId: undefined,
          districtId: undefined,
          address: undefined,
          code: undefined,
          linkMan: undefined,
          mobile: undefined,
          idcard: undefined,
          status: undefined,
        },

        //所在省份参数
        areaStatus: false,
        options: [],
        props: {
          value: 'id',
          label: 'name',
          children: 'cities'
        },
        //状态参数
        areaData: [],
      }
    },
    created() {
      //获取基本数据
      this.info();

      this.handleCreate();
    },
    mounted() {

    },
    methods: {
      info() {
        this.listLoading = true;
        this.pushData.id = this.$route.query.id ? this.$route.query.id : '';
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
                status: '' + res.data.status,
                dateAddStr: res.data.dateAdd,
                dateEndStr: res.data.dateEnd
              });

              this.areaStatus = true;

              this.$nextTick(() => {
                this.$refs['addEditPopForm'].clearValidate()
              })
            }

          }).then(() => {
            this.listLoading = false;
            //获取所在地区数据
            this.getProvinceData();
          });
        } else {
          //获取所在地区数据
          this.getProvinceData();
        }
      },
      validPhone(rule, value, callback) {
        let reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
        if (!reg.test(value) || !value) {
          callback(new Error('请输入正确的11位手机号码'))
        } else {
          callback();
        }
      },
      handleArea(rule, value, callback) {
        if (!this.areaStatus) {
          callback(new Error('请选择所在地'));
        }
        callback();
      },
      //获取省份
      getProvinceData() {
        getProvince().then(res => {
          let data = [], val = [], arr = [710000, 810000, 820000];
          if (res.code !== 0) {
            Message({
              message: res.msg,
              type: 'error',
              duration: 3 * 1000
            })
          } else {
            res.data.forEach((a, i) => {
              let b = {};
              b.id = a.id + ',' + i;
              b.value = a.id;
              b.name = a.name;
              if (arr.indexOf(a.id) === -1) {
                b.cities = [];
                if (this.pushData.provinceId === a.id) {
                  val.push(a.id + ',' + i);
                  this.handleSelectionChange(val);
                }
              }
              data.push(b);
            });

            this.areaData = val;
            this.options = data;

          }
        });
      },
      //绑定所在地区
      handleAreaData(val) {
        this.pushData.provinceId = val[0].split(',')[0];
        this.pushData.cityId = val.length >= 2 ? val[1].split(',')[0] : '';
        this.pushData.districtId = val.length === 3 ? val[2].split(',')[0] : '';
        this.areaStatus = true;
      },
      //获取子城市地区
      handleSelectionChange(val) {
        let id, pIndex, index, data = [], selectVal = null, arr = [110000, 120000, 310000, 500000];
        if (val.length === 1) {
          id = parseInt(val[0].split(',')[0]);
          index = val[0].split(',')[1];
        } else if (val.length === 2) {
          pIndex = val[0].split(',')[1];
          id = parseInt(val[1].split(',')[0]);
          index = val[1].split(',')[1];
        }
        if (!id) return false;
        getChild(id).then(res => {
          if (res.code !== 0) {
            Message({
              message: res.msg,
              type: 'error',
              duration: 3 * 1000
            })
          } else {
            res.data.forEach((a, i) => {
              let b = {};
              b.id = a.id + ',' + i;
              b.name = a.name;
              if (arr.indexOf(id) === -1 && val.length === 1) {
                b.cities = [];
              }
              if (this.pushData.cityId === a.id || this.pushData.districtId === a.id) {
                selectVal = a.id + ',' + i;
              }
              data.push(b);
            });

            if (val.length === 1) {
              this.options[index].cities = data;
            } else if (val.length === 2) {
              this.options[pIndex].cities[index].cities = data;
            }
            if (selectVal) {
              this.areaData.push(selectVal);
              if (val.length === 2 && arr.indexOf(id) === -1) {
                this.handleSelectionChange(this.areaData);
              }
            }
          }
        });
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
          if (!this.areaStatus) {
            Message({
              message: '操作失败,请选择所在地',
              type: 'error',
              duration: 3 * 1000
            });
            return false;
          }

          if (valid) {
            saveData(this.pushData).then((res) => {
              this.pushData.dialogFormVisible = false;
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
        this.$router.push({path: '/user/apiExtUserShippingAddress/list'});
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
</style>
