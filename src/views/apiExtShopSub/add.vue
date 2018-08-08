<template>
  <div class="app-container">

    <el-form :rules="rules" ref="addEditPopForm" :model="pushData" :label-position="labelPosition" label-width="100px">
      <el-form-item label="店铺类型" prop="type">
        <el-col :span="12">
          <el-input v-model="pushData.type" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-col>
        <el-col :span="10">&nbsp;&nbsp;&nbsp;自定义店铺类型，32个字符以内</el-col>
      </el-form-item>
      <el-form-item label="门店编号" prop="number">
        <el-col :span="12">
          <el-input v-model="pushData.number" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-col>
        <el-col :span="10">&nbsp;&nbsp;&nbsp;达达、美团配送的时候需要填写</el-col>
      </el-form-item>
      <el-form-item label="生鲜配送" prop="expressType">
        <el-col :span="12">
          <el-input v-model="pushData.expressType" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-col>
        <el-col :span="10">&nbsp;&nbsp;&nbsp;达达配送填 dada ,其他留空不要填写</el-col>
      </el-form-item>
      <el-form-item label="所在地" prop="areaSelect">

        <el-cascader :options="options" placeholder="- 请选择 -" @active-item-change="handleSelectionChange"
          @change="handleAreaData" :props="props" v-model="areaData">
        </el-cascader>
      </el-form-item>
      <el-form-item label="店铺名称" prop="name">
        <el-input v-model="pushData.name" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="pushData.address" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="linkPhone">
        <el-input v-model.number="pushData.linkPhone" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="店铺介绍" prop="introduce">
        <el-input v-model="pushData.introduce" type="textarea" clearable
                  @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="店铺特色" prop="characteristic">
        <el-input v-model="pushData.characteristic" type="textarea" clearable
                  @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="地图位置" prop="mapAddressSearch">
        <el-input v-model="pushData.mapAddressSearch" clearable
                  @keyup.native="codeAddress" placeholder="输入关键词搜索地图坐标"></el-input>
        <el-col :span="12">
          <div id="container">
          </div>
        </el-col>
      </el-form-item>
      <el-form-item label="排序" prop="paixu">
        <el-input v-model.number="pushData.paixu" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="pushData.status" placeholder="请选择">
          <el-option label="正常" value='0'></el-option>
          <el-option label="禁用" value='1'></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="图片" prop="pic">
        <el-upload class="upload-demo" action="https://user.api.it120.cc/fileUpload"
          :data="upLoadData" :headers="fileHeaders" :on-remove="handleRemove" :on-success="uploadSuccess" :file-list="fileList"
           accept="image/jpeg,.jpg,image/gif,.gif,image/png,.png,image/bmp,.bmp,.jpeg,.JPG,.JPEG,.PBG,.GIF,.BMP,.JPEG"
          :before-upload="beforeImgUpload" list-type="picture">
          <el-button size="small" type="primary">[选择本地文件]</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="打折优惠信息" prop="activity">
        <el-input v-model="pushData.activity" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer" style="text-align: center;">
      <el-button @click="goBack()">返回</el-button>
      <el-button type="primary" @click="handleCreateSave">确定</el-button>
    </div>

  </div>
</template>

<script>
  import {getChild, getProvince, info, saveData} from '@/api/apiExtShopSubAdd'
  import {getToken} from '@/utils/auth' // 验权
  import {Message} from 'element-ui'
  import {mapGetters} from 'vuex'
  import {TMap} from '@/utils/TMap'

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
          type: [
            {min: 0, max: 32, message: '长度在32个字符以内', trigger: 'blur'}
          ],
          areaSelect: [
            {message: '请选择所在地', trigger: 'blur'},
            {validator: this.handleArea, trigger: 'change'}
          ],
          name: [
            {required: true, message: '请输入店铺名称', trigger: 'blur'}
          ],
          linkPhone: [
            {validator: this.validPhone, message: '请输入正确的11位手机号码', trigger: 'blur'}
          ]
        },

        pushData: {
          dialogFormVisible: false,

          id: undefined,
          type: undefined,
          number: undefined,
          expressType: undefined,
          provinceId: undefined,
          cityId: undefined,
          districtId: undefined,
          name: undefined,
          pic: undefined,
          address: undefined,
          linkPhone: undefined,
          introduce: undefined,
          characteristic: undefined,
          latitude: undefined,
          longitude: undefined,
          paixu: undefined,
          status: '0'
        },

        listLoading: true,
        //腾讯地图参数
        geocoder: null,
        map: null,
        marker: null,
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
        //图片参数
        fileList: [],
        upLoadData: {upfile: null},
        fileHeaders: {'X-Token': getToken()}

      }
    },
    created() {
      //获取基本数据
      this.fetchData();

      this.handleCreate();
    },
    mounted() {
      setTimeout(() => {
        TMap().then(qq => {
          //纬度值
          this.pushData.latitude = this.pushData.latitude ? this.pushData.latitude : '39.916527';
          //经度值
          this.pushData.longitude = this.pushData.longitude ? this.pushData.longitude : '116.397128';
          let center = new qq.maps.LatLng(this.pushData.latitude, this.pushData.longitude);
          let map = new qq.maps.Map(document.getElementById('container'), {
            center: center,
            zoom: 13
          });
          // 地图的中心地理坐标。
          this.marker = new qq.maps.Marker({
            position: center,
            draggable: true,
            map: map
          });
          //搜索 调用地址解析类
          this.geocoder = new qq.maps.Geocoder({
            complete: (result) => {
              //清空标注
              this.marker.setMap(null);
              //赋值
              this.setLatLng(result.detail.location);
              map.setCenter(result.detail.location);
              this.marker = new qq.maps.Marker({
                map: map,
                draggable: true,
                position: result.detail.location
              });
              //拖动标注
              qq.maps.event.addListener(this.marker, 'dragend', () => {
                this.setLatLng(this.marker.getPosition());
              });
            }
          });
          //拖动标注
          qq.maps.event.addListener(this.marker, 'dragend', () => {
            this.setLatLng(this.marker.getPosition());
          });

        });
      }, 500);

    },
    methods: {
      fetchData() {
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

              if (this.pushData.pic) {
                this.fileList = [{name: '店铺图片', url: this.pushData.pic}];
              }

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
      //赋值
      setLatLng(val) {
        this.pushData.latitude = val.lat;
        this.pushData.longitude = val.lng;
      },
      codeAddress() {
        let mapAddressSearch = this.pushData.mapAddressSearch;
        //通过getLocation();方法获取位置信息值
        this.geocoder.getLocation(mapAddressSearch);
      },
      //赋值图片参数
      beforeImgUpload(file) {
        this.upLoadData.upfile = file;
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
      //上传图片成功
      uploadSuccess(res) {
        if (res.code !== 0) {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000
          })
        } else {
          this.pushData.pic = res.data.url;
          this.fileList = [{name: `店铺图片${res.data.type}`, url: res.data.url}];
        }
      },
      //图片删除
      handleRemove(file, fileList) {
        this.pushData.pic = '';
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
        this.$router.push({path: '/user/apiExtShopSub/list'});
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
