<template>
  <div class="app-container">

    <el-form :rules="rules" ref="addEditPopForm" :model="pushData" :label-position="labelPosition" label-width="100px">
      <el-form-item label="所属店铺" prop="shopId">
        <el-col :span="8">
          <el-select style="width: 100%" class="filter-item" v-model="pushData.shopId" placeholder="不选择店铺">
            <el-option
              v-for="item in shopData"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="16" class="orange" style="padding-left:10px;">
          没有多店铺的不需要选择
        </el-col>
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-col :span="8">
          <el-select style="width: 100%" class="filter-item" v-model="pushData.categoryId"
                    placeholder="商品分类">
            <el-option
              v-for="item in categoryData"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item label="条码编号" prop="barCode">
        <el-input v-model="pushData.barCode" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="视频编号" prop="videoId">
        <el-col :span="20">
          <el-input v-model="pushData.videoId" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-col>
        <el-col :span="4" class="orange">&nbsp;&nbsp;&nbsp;便于您展示商品视频</el-col>
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="pushData.name" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item v-for="(v, k) in extJson" :key="k" :label="k">
        <el-col :span="8">
          <el-input v-model="extJson[k]" clearable @keyup.enter.native="handleCreateSave"></el-input>
        </el-col>
        <el-col :span="8" style="padding-left:10px;">
          <el-button type="danger" size="small" @click="deleteExtJson(k)">删除属性</el-button>
        </el-col>
      </el-form-item>
      <el-form-item label="商品特色" prop="characteristic">
        <el-input v-model="pushData.characteristic" type="textarea" clearable
                  @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="选择物流模板" prop="logisticsId">
        <el-select style="width: 100%" class="filter-item" v-model="pushData.logisticsId"
                   placeholder="选择物流模板">
          <el-option
            v-for="item in logisticsIdData"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="paixu">
        <el-input-number v-model="pushData.paixu" controls-position="right" :min="0"
                         style="width: 100%;"></el-input-number>
      </el-form-item>
      <el-form-item label="是否推荐" prop="recommendStatus">
        <el-select style="width: 100%" class="filter-item" v-model="pushData.recommendStatus"
                   placeholder="是否推荐">
          <el-option label="不推荐" value="0"></el-option>
          <el-option label="推荐" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品状态" prop="status">
        <el-select style="width: 100%" class="filter-item" v-model="pushData.status" placeholder="商品状态">
          <el-option label="上架" value="0"></el-option>
          <el-option label="下架" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品图片" prop="photos">
        <el-col :span="3" class="orange">
          <el-upload class="upload-demo" action="https://user.api.it120.cc/fileUpload"
                     list-type="picture"
                     :data="upLoadData" :headers="fileHeaders" :on-success="uploadSuccess"
                     :file-list="fileList"
                     accept="image/jpeg,.jpg,image/gif,.gif,image/png,.png,image/bmp,.bmp,.jpeg,.JPG,.JPEG,.PBG,.GIF,.BMP,.JPEG"
                     :before-upload="beforeImgUpload">
            <el-button size="small" type="primary">[选择本地文件]</el-button>
          </el-upload>
        </el-col>
        <el-col :span="19" class="orange">第一张图片默认为商品封面图片，可拖动排序</el-col>
        <ul class="el-upload-list el-upload-list--picture-card">
          <draggable :list="pushData.photos">
            <li v-for="(item, index) in pushData.photos" :key="index" tabindex="0"
                class="el-upload-list__item is-success"><img
              :src="item.pic" alt=""
              class="el-upload-list__item-thumbnail" draggable="false"><span class="el-upload-list__item-actions">
              <span
                class="el-upload-list__item-delete"><i @click="deletePhotos(item,index)"
                                                       class="el-icon-delete"></i></span></span></li>
          </draggable>
        </ul>


      </el-form-item>
      <el-form-item label="详细介绍" prop="content">
        <Tinymce :height=500 ref="editor" v-model="pushData.content"/>
      </el-form-item>
      <el-form-item label="原价" prop="originalPrice">
        <el-input-number v-model="pushData.originalPrice" clearable @keyup.enter.native="handleCreateSave" :min="0"
                         label="请输入原价" style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="现价" prop="minPrice">
        <el-input-number v-model="pushData.minPrice" clearable @keyup.enter.native="handleCreateSave" :min="0"
                         label="请输入现价" style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="拼团价" prop="pingtuanPrice">
        <el-input-number v-model="pushData.pingtuanPrice" clearable @keyup.enter.native="handleCreateSave" :min="0"
                         label="请输入拼团价" style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="需要积分" prop="minScore">
        <el-input-number v-model="pushData.minScore" clearable @keyup.enter.native="handleCreateSave" :min="0"
                         label="请输入需要积分" style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="库存数" prop="stores">
        <el-input-number v-model="pushData.stores" clearable @keyup.enter.native="handleCreateSave" :min="0"
                         label="请输入库存数" style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="商品重量" prop="weight">
        <el-col :span="23">
          <el-input-number v-model="pushData.weight" clearable @keyup.enter.native="handleCreateSave" :min="0"
                           label="请输入商品重量" style="width: 100%"></el-input-number>
        </el-col>
        <el-col :span="1">
          &nbsp;&nbsp;KG
        </el-col>
      </el-form-item>
      <el-form-item label="分享奖励" prop="commissionType">
        <el-col :span="10">
          <el-select style="width: 100%" v-model="pushData.commissionType" placeholder="请选择">
            <el-option label="关闭" value='0'></el-option>
            <el-option label="送积分" value='1'></el-option>
            <el-option label="送现金" value='2'></el-option>
          </el-select>
        </el-col>
        <el-col :span="1">
          &nbsp;
        </el-col>
        <el-col :span="13">
          <el-input-number v-model="pushData.commission" controls-position="right" :min="0"
                           style="width: 100%;"></el-input-number>
        </el-col>
      </el-form-item>
      <el-form-item label="拼团功能" prop="pingtuan">
        <el-select style="width: 100%" v-model="pushData.pingtuan" placeholder="请选择">
          <el-option label="关闭" value='false'></el-option>
          <el-option label="开启" value='true'></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="起售时间" prop="dateStartStr">
        <el-col :span="5">
          <el-date-picker
            v-model="pushData.dateStartStr"
            type="datetime"
            placeholder="选择起售时间">
          </el-date-picker>
        </el-col>
        <el-col :span="13" class="orange">
          &nbsp;&nbsp;商品开始销售时间，填写格式为：2017-09-08 08:00:07 请务必按照格式填写，常规销售请不要填写
        </el-col>
      </el-form-item>
      <el-form-item label="停售时间" prop="dateEndStr">
        <el-col :span="5">
          <el-date-picker
            v-model="pushData.dateEndStr"
            type="datetime"
            placeholder="选择停售时间">
          </el-date-picker>
        </el-col>
        <el-col :span="13" class="orange">
          &nbsp;&nbsp;商品停止销售时间，填写格式为：2017-09-08 08:00:07 请务必按照格式填写，常规销售请不要填写
        </el-col>
      </el-form-item>
      <el-form-item label="规格与尺寸">
        <el-checkbox-group
          v-model="radioPropertyIds">
          <el-checkbox v-for="(item,index) in propertyMap" :label="item.id" :key="item.id"
                       @change="createPropertyPrice(index)">
            {{item.name}}
          </el-checkbox>
        </el-checkbox-group>
        <div v-for="(item,index) in detailsJsonStr" :key="index" v-if="item.name" style="margin-top:30px;">
          <p class="red">{{item.name}}</p>
          <span class="col-sm-2">
              原价：
          <el-input-number v-model="item.originalPrice" controls-position="right" :min="0"
                           style="width: 10%;"></el-input-number>
          </span>
          <span class="col-sm-3">
          现价：
          <el-input-number v-model="item.minPrice" controls-position="right" :min="0"
                           style="width: 10%;"></el-input-number>
          </span>
          <span class="col-sm-3">
          拼团价：
          <el-input-number v-model="item.pingtuanPrice" controls-position="right" :min="0"
                           style="width: 10%;"></el-input-number>
          </span>
          <span class="col-sm-3">
            积分：
          <el-input-number v-model="item.score" controls-position="right" :min="0"
                           style="width: 10%;"></el-input-number>
          </span>
          <span class="col-sm-3">
            库存数
          <el-input-number v-model="item.stores" controls-position="right" :min="0"
                           style="width: 10%;"></el-input-number>
          </span>
          <a href="javascript:" @click="deleteThisElement(index)" class="red"> 删除 </a>
          <a href="javascript:" @click="copyDataDown(index)" class="red"> 向下填充 </a></div>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer" style="text-align: center;">
      <el-button @click="goBack();">返回</el-button>
      <el-button type="primary" @click="handleCreateSave">确定</el-button>
    </div>

  </div>
</template>

<script>
  import {
    getFreightTemplate,
    getGoodsCategoryData,
    getProperty,
    getPropertyChild,
    getShopData,
    info,
    saveData
  } from '@/api/apiExtShopGoodsAdd'
  import {Message} from 'element-ui'
  import {mapGetters} from 'vuex'
  import {getToken} from '@/utils/auth'
  import draggable from 'vuedraggable'
  import Tinymce from '@/components/Tinymce'

  export default {
    computed: {
      ...mapGetters([
        'centerUserBase'
      ])
    },
    data() {
      return {
        categoryData: [],
        shopData: [{label: '不选择店铺', value: 0}],
        logisticsIdData: [{label: '不使用物流', value: 0}],
        labelPosition: 'right',
        //表单验证
        rules: {
          categoryId: [
            {required: true, message: '请选择商品分类', trigger: 'blur'}
          ], name: [
            {required: true, message: '请输入店铺名称', trigger: 'blur'}
          ],
          photos: [
            {required: true, message: '请上传商品图片', trigger: 'blur'}
          ], content: [
            {required: true, message: '请输入详细介绍', trigger: 'blur'}
          ], status: [
            {required: true, message: '请选择商品状态', trigger: 'blur'}
          ], originalPrice: [
            {required: true, message: '请输入商品原价', trigger: 'blur'}
          ], minPrice: [
            {required: true, message: '请输入商品现价', trigger: 'blur'}
          ], stores: [
            {required: true, message: '请输入总库存数', trigger: 'blur'}
          ]
        },

        pushData: {
          id: undefined,
          shopId: 0,
          categoryId: undefined,
          barCode: undefined,
          videoId: undefined,
          name: undefined,
          characteristic: undefined,
          logisticsId: 0,
          paixu: 0,
          recommendStatus: '0',
          status: '0',
          originalPrice: 0,
          minPrice: 0,
          pingtuanPrice: 0,
          minScore: 0,
          stores: 0,
          weight: 0,
          commissionType: '0',
          commission: 0,
          pingtuan: 'false',
          pics: [],
          photos: [],
          content: undefined,
          detailsJsonStr: [],
          deleteOldPics:'true',
          dateStartStr: new Date(),
          dateEndStr: undefined,
          dateAddStr: undefined,
        },

        listLoading: true,

        propertyIds: undefined,
        //图片参数
        fileList: [],
        upLoadData: {upfile: null},
        fileHeaders: {'X-Token': getToken()},
        //规格与尺寸
        radioPropertyIds: [],
        properties: [],
        propertyChildMap: [],
        propertyChilds: [],
        propertyMap: [],
        curPropertyNumber: 0,
        propertyPrice: [],
        subPriceArrayStack: [],
        detailsJsonStr: [],
        priceExts: [],
        // 扩展属性
        extJson:{}
      }
    },
    components: {
      draggable,
      Tinymce
    },
    created() {
      this.getShopData();
      this.getGoodsCategoryData();
      this.getFreightTemplate();

      //获取基本数据
      this.fetchData();

      this.handleCreate();

    },
    mounted() {
      this.pushDataTmp = Object.assign({}, this.pushData)
    },
    methods: {
      //删除图片
      deletePhotos(item, index) {
        this.pushData.photos.splice(index, 1);
      },
      //获取店铺数据
      getShopData() {
        getShopData().then(response => {
          if (response.code == 0) {
            response.data.result.forEach((a) => {
              let v = {};
              v.value = a.id;
              v.label = a.name;
              this.shopData.push(v);
            })
          }
        })
      },
      //获取商品分类列表
      getGoodsCategoryData() {
        getGoodsCategoryData().then(response => {
          const data = [];
          if (response.code == 700) {
            Message({message: '您当前还未设置商品分类，无法添加商品', type: 'error', duration: 3 * 1000})
            return;
          }
          if (response.code == 0) {
            response.data.forEach((a, index) => {
              if (index === 0) {
                this.pushData.categoryId = a.id;
              }
              let v = {}, s = '';
              v.value = a.id;
              if (a.level > 1) {
                for (let i = 2; i < a.level; i++) {
                  s += '　　　　'
                }
                s += '╚═══'
              }
              v.label = s + a.name;
              data.push(v)
            })
          }
          this.categoryData = data;
        })
      },
      //运费模板列表
      getFreightTemplate() {
        getFreightTemplate().then(response => {
          if (response.code == 0) {
            response.data.forEach((a) => {
              let v = {};
              v.value = a.id;
              v.label = a.name;
              this.logisticsIdData.push(v);
            })
          }
        })
      },
      //规格与尺寸选择事件
      createPropertyPrice(index) {
        this.detailsJsonStr = [];
        this.curPropertyNumber = 0;
        this.radioPropertyIds.forEach((key) => {
          this.getPropertyChild(key, this.propertyMap[key] ? this.propertyMap[key].name : this.propertyMap[index].name);
        });
      },
      //获取某个规格尺寸的所有子属性
      getPropertyChild(id, name) {
        getPropertyChild(id).then(response => {
          if (response.code !== 0) {
            Message({message: response.msg, type: 'error', duration: 3 * 1000})
          } else {
            let propertyPriceSingle = [];
            response.data.forEach((item) => {
              let propertyPriceMap = {};
              propertyPriceMap.propertyId = id;
              propertyPriceMap.propertyName = name;
              propertyPriceMap.propertyChildId = item.id;
              propertyPriceMap.propertyChildName = item.name;
              propertyPriceSingle.push(propertyPriceMap);
            });

            if (propertyPriceSingle.length > 0) {
              this.propertyPrice.push(propertyPriceSingle);
            }
            this.curPropertyNumber++;
            if (this.curPropertyNumber === this.radioPropertyIds.length) {
              this.createPropertyHTML(0);
            }
          }
        })
      },
      //生成规格尺寸
      createPropertyHTML(index) {
        if (index === this.radioPropertyIds.length) {
          // 取出当前堆栈中的数据
          let detailsStr = {}, properties = [], name = '', propertyChildIdc = '', propertyChildIds = '';
          this.subPriceArrayStack.forEach((item) => {
            let propertyChildId = {};
            name += " - " + item.propertyName + "(" + item.propertyChildName + ")";
            propertyChildIds = propertyChildIds + item.propertyId + ":" + item.propertyChildId + ",";
            propertyChildIdc = item.propertyId + ":" + item.propertyChildId + "," + propertyChildIdc;
            propertyChildId.pid = item.propertyId;
            propertyChildId.cid = item.propertyChildId;
            properties.push(propertyChildId);
          });

          detailsStr.name = name;
          detailsStr.properties = properties;
          if (this.priceExts.length > 0) {
            this.priceExts.forEach((d) => {
              if (d.propertyChildIds === propertyChildIds || d.propertyChildIds === propertyChildIdc) {
                detailsStr.originalPrice = d.originalPrice;
                detailsStr.minPrice = d.price;
                detailsStr.pingtuanPrice = d.pingtuanPrice;
                detailsStr.score = d.score;
                detailsStr.stores = d.stores;
              }
            });
          } else {
            detailsStr.originalPrice = 0;
            detailsStr.minPrice = 0;
            detailsStr.pingtuanPrice = 0;
            detailsStr.score = 0;
            detailsStr.stores = 0;
          }

          this.detailsJsonStr.push(detailsStr);

          // 退出最后一个堆栈
          this.subPriceArrayStack.pop();
          return;
        }

        this.propertyPrice[index].forEach((item) => {
          this.subPriceArrayStack.push(item);
          this.createPropertyHTML(index + 1)
        });
        this.subPriceArrayStack.pop();
      },
      //删除规格尺寸
      deleteThisElement(index) {
        this.detailsJsonStr.splice(index, 1);
      },
      //规格尺寸向下填充
      copyDataDown(index) {
        for (let i = index + 1, len = this.detailsJsonStr.length; i < len; i++) {
          this.detailsJsonStr[i].originalPrice = this.detailsJsonStr[index].originalPrice;
          this.detailsJsonStr[i].minPrice = this.detailsJsonStr[index].minPrice;
          this.detailsJsonStr[i].pingtuanPrice = this.detailsJsonStr[index].pingtuanPrice;
          this.detailsJsonStr[i].score = this.detailsJsonStr[index].score;
          this.detailsJsonStr[i].stores = this.detailsJsonStr[index].stores;
        }
      },
      //获取基本数据
      fetchData() {
        this.listLoading = true;
        this.pushData.id = this.$route.query.id ? this.$route.query.id : '';
        if (this.pushData.id > 0) {
          info(this.pushData.id).then(res => {
            if (res.code !== 0) {
              Message({message: res.msg, type: 'error', duration: 3 * 1000})
            } else {
              this.pushData = Object.assign({}, this.pushDataTmp, res.data.info, {
                recommendStatus: '' + res.data.info.recommendStatus,
                commissionType: '' + res.data.info.commissionType,
                pingtuan: '' + res.data.info.pingtuan,
                status: '' + res.data.info.status,
                dateStart: res.data.info.dateStart,
                dateAdd: res.data.info.dateAdd,
                dateUpdate: res.data.info.dateUpdate,
                dateAddStr: res.data.info.dateAddStr,
                dateEndStr: res.data.info.dateEndStr,
                photos: res.data.pics,
                dateStartStr: new Date(),
                content: res.data.content.content
              });
              this.extJson = Object.assign({}, res.data.extJson)
              this.propertyIds = res.data.info.propertyIds;
              //编辑器
              this.$refs['editor'].setContent(res.data.content ? res.data.content.content : '');

              this.properties = res.data.properties;
              this.propertyChildMap = res.data.propertyChildMap;
              this.propertyChilds = res.data.propertyChilds;
              this.propertyMap = res.data.propertyMap;
              this.priceExts = res.data.priceExts;
              if (this.propertyIds) {
                this.propertyIds.split(',').forEach((a) => {
                  if (a) {
                    this.radioPropertyIds.push(parseInt(a));
                  }
                });
              }

              //初始化规格与尺寸
              if (this.radioPropertyIds.length > 0) {
                this.createPropertyPrice();
              }

              this.$nextTick(() => {
                this.$refs['addEditPopForm'].clearValidate()
              })
            }

          }).then(() => {
            this.listLoading = false;
          });
        } else {

          getProperty().then(res => {
            if (res.code !== 0) {
              Message({message: res.msg, type: 'error', duration: 3 * 1000})
            } else {
              this.propertyMap = res.data;
            }
          });
        }
      },
      //赋值
      setLatLng(val) {
        this.pushData.latitude = val.lat;
        this.pushData.longitude = val.lng;
      },
      //赋值图片参数
      beforeImgUpload(file) {
        this.upLoadData.upfile = file;
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
          this.pushData.photos.push({id: res.data.name, name: `店铺图片${res.data.type}`, pic: res.data.url});
          this.fileList = [];
          this.handleCreate();
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
            this.pushData.detailsJsonStr = JSON.stringify(this.detailsJsonStr);
            let photos = [];
            this.pushData.photos.forEach((a) => {
              photos.push(a.pic)
            });
            this.pushData.pic = photos[0];
            this.pushData.pics = photos.toString();
            this.pushData.extJsonStr = JSON.stringify(this.extJson)
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
              message: '操作失败,请填写正确信息',
              type: 'error',
              duration: 3 * 1000
            });
          }
        });

      },
      goBack() {
        this.$router.push({path: '/user/apiExtShopGoods/list'});
      },
      deleteExtJson(k) {
        let newextJson = {}
        Object.keys(this.extJson).forEach(kkk => {
          if (k != kkk) {
            newextJson[kkk] = this.extJson[kkk]
          }
        })
        this.extJson = newextJson
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

  .orange {
    color: #FF892A !important;
  }

  .red {
    color: #DD5A43 !important;
  }
</style>
