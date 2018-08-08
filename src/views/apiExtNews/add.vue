<template>
  <div class="app-container">
    <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-width="120px">
      <el-form-item label="标题" prop="title">
        <el-input v-model.number="pushData.title" clearable></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="categoryId">
        <el-select clearable v-model="pushData.categoryId" placeholder="请选择">
          <el-option v-for="item in CmsCategoryList" :key="item.value" :label="item.name" :value="item.id">
            <span>
              <span v-for="lv in item.level-1" :key="lv">&#8195;&#8195;&#8195;&#8195;&#8195;</span>
              <span v-if="item.level > 1">╚═══</span>
              {{item.name}}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键词" prop="keywords">
        <el-input v-model.number="pushData.keywords" clearable></el-input>
      </el-form-item>
      <el-form-item label="标签" prop="tags">
        <el-input v-model.number="pushData.tags" clearable></el-input>
      </el-form-item>
      <el-form-item label="摘要" prop="descript">
        <el-input v-model="pushData.descript" type="textarea" :rows="4" clearable @keyup.enter.native="handleCreateSave"></el-input>
      </el-form-item>
      <el-form-item label="上传图标">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          name="upfile"
          :headers="uploadUrlHeaders"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload">
          <img v-if="imageUrl" :src="imageUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="来源" prop="income">
        <el-input v-model.number="pushData.income" clearable></el-input>
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model.number="pushData.author" clearable></el-input>
      </el-form-item>
      <el-form-item label="是否推荐" prop="isRecommend" >
        <el-select v-model="pushData.isRecommend" placeholder="请选择">
          <el-option label="推荐" value="true"></el-option>
          <el-option label="不推荐" value="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status" >
        <el-select v-model="pushData.status" placeholder="请选择">
          <el-option label="审核通过" value="2"></el-option>
          <el-option label="待审核" value="0"></el-option>
          <el-option label="审核不通过" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="paixu">
        <el-input v-model.number="pushData.paixu" clearable></el-input>
      </el-form-item>
      <el-form-item label="扩展属性">
        <div v-for="kv in kvList" v-bind:key="kv.k" style="padding-bottom:10px;">
          <el-col :span="4">
            <el-form-item>
              <el-input v-model="kv.k" @keyup.enter.native="handleCreateSave"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1" align="center">:</el-col>  
          <el-col :span="4">
            <el-form-item>
              <el-input v-model="kv.v" @keyup.enter.native="handleCreateSave"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="14"> &nbsp;&nbsp;&nbsp;
            <el-button type="success" @click="addKV()">添加</el-button>
            <el-button type="danger" @click="delKV(kv.k)">删除</el-button>
          </el-col>     
          <div style="clear:both;"></div>     
        </div>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <Tinymce :height=500 ref="editor" v-model="pushData.content"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import { saveData, infoData } from '@/api/apiExtNews'
import { fetchCmsCategoryList } from '@/api/apiExtNewsCategory'
import { Message, MessageBox } from 'element-ui'
import { getToken } from '@/utils/auth'
import Tinymce from '@/components/Tinymce'

let vm

export default {
  data() {
    return {

      imageUrl:undefined,
      uploadUrl:process.env.BASE_API + '/fileUpload',
      uploadUrlHeaders:{
        "X-Token":getToken()
      },

      kvList:[
        {k:"", v:""}
      ],

      rules: {
        title: [
          { required: true, message: '不能为空'}
        ],
        categoryId: [
          { required: true, message: '不能为空'},
        ],
        keywords: [
          { required: true, message: '不能为空'}
        ],
        descript: [
          { required: true, message: '不能为空'}
        ],
        isRecommend: [
          { required: true, message: '不能为空'}
        ],
        status: [
          { required: true, message: '不能为空'}
        ],
        paixu: [
          { required: true, message: '不能为空'}
        ],
        kv: [
          { required: true, message: '不能为空'}
        ],
      },

      pushData: {
        id:undefined,
        paixu:0,
        isRecommend:'true',
        status:'2',
      },

      dialogTitle : undefined,
      dialogFormVisible:false,

      CmsCategoryList:[],
      extJson:{},



      curAddCityExceptionIndex:undefined,

      provinces:undefined,
      provinceSel:undefined,
      provinceShow:false,

      citys:undefined,
      citySel:undefined,
      cityShow:false,

      districts:undefined,
      districtSel:undefined,
      districtShow:false,

    }
  },
  components: {
    Tinymce
  },
  mounted() {
    vm = this
    fetchCmsCategoryList().then(response => {
      if (response.code == 0) {
        this.CmsCategoryList = response.data
      }
    })
    if (this.$route.query.id) {
      infoData(this.$route.query.id).then(res => {
        if (res.code != 0) {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000,
            onClose: () => {
              this.$router.push({ path: '/user/apiExtNews/list' })
            }
          })
        } else {
          vm.pushData = Object.assign({}, res.data.info, {status:'' + res.data.info.status, isRecommend:'' + res.data.info.isRecommend})
          if (vm.pushData.pic) {
            this.imageUrl = new URL(vm.pushData.pic);
          }          
          // 计算扩展属性
          let kvList = [];
          if (res.data.extJson) {
            Object.keys(res.data.extJson).forEach(k => {
              let aaaa = '{"k":"'+ k +'", "v":"'+ res.data.extJson[k] +'"}'
              kvList.push(JSON.parse(aaaa))
            })
          }
          if (kvList.length == 0) {
            kvList = [ {k:"", v:""} ];
          }
          vm.kvList = kvList
        }
      }).catch(e=>{
        console.error(e);
      })
    }
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
      this.pushData.pic = res.data.url;
    },
    beforeAvatarUpload(file) {
      const isJPG = (file.type.indexOf('image/') != -1);
      const isLt1M = file.size / 1024 / 1024 < 1;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是图片格式!');
      }
      if (!isLt1M) {
        this.$message.error('上传头像图片大小不能超过 1MB!');
      }
      return isJPG && isLt1M;
    },
    addKV(){
      let kvMap = {k:"", v:""}
      this.kvList.push(kvMap)
    },
    delKV(k){
      let newArray = []
      this.kvList.forEach(ele => {
        if (ele.k != k) {
          newArray.push(ele)
        }
      })
      if (newArray.length == 0) {
        newArray.push({k:"", v:""})
      }
      this.kvList = newArray
    },
    onSubmit() {
      let pushDataDetailsJsonStr = {}
      this.kvList.forEach(item => {
        // {k:"", v:""}
        if (item.k && item.v) {
          let aaaa = '{"'+ item.k +'":"'+ item.v +'"}'
          pushDataDetailsJsonStr = Object.assign({}, pushDataDetailsJsonStr, JSON.parse(aaaa))
        }        
      })
      this.pushData.extJsonStr = JSON.stringify(pushDataDetailsJsonStr)
      this.$refs['addEditPopForm'].validate((valid) => {
        if (valid) {
          saveData(this.pushData).then((res) => {
            this.pushData.dialogFormVisible = false
            if (res.code == 0) {
              Message({
                message: '操作成功',
                type: 'success',
                duration: 1 * 1000,
                onClose: () => {
                  this.$router.push({ path: '/user/apiExtNews/list' })
                }
              })
            } else {
              Message({
                message: res.msg,
                type: 'error',
                duration: 3 * 1000
              })
            }
          }).catch(e=>{
            console.error(e);
          })
        }
      })
    },
    onCancel() {
      this.$router.back();
    },
    addCityException(feeType){
      this.curAddCityExceptionIndex = feeType
      
      this.dialogTitle = '请选择配送地'
      this.dialogFormVisible = true

      this.provinceSel = undefined

      this.citys = undefined
      this.citySel = undefined
      this.cityShow = false

      this.districts = undefined
      this.districtSel = undefined
      this.districtShow = false
    },
    handleCreateSave(){
      let addExceptionObj = {name:'为指定地区城市设置运费', cityType:0, cityId:0, firstNumber:1, firstAmount:5, addNumber:1, addAmount:5}
      if (this.districtSel) {
        addExceptionObj.cityType = 2
        addExceptionObj.cityId = this.districtSel
        addExceptionObj.name = this.districts.find(item => {
          return item.id == addExceptionObj.cityId
        }).name
      } else if (this.citySel) {
        addExceptionObj.cityType = 1
        addExceptionObj.cityId = this.citySel
        addExceptionObj.name = this.citys.find(item => {
          return item.id == addExceptionObj.cityId
        }).name
      } else if (this.provinceSel) {
        addExceptionObj.cityType = 0
        addExceptionObj.cityId = this.provinceSel
        addExceptionObj.name = this.provinces.find(item => {
          return item.id == addExceptionObj.cityId
        }).name
      } else {
        this.$message({
          message: '请至少选择配送省份',
          type: 'error'
        })
        return
      }
      this.feeTypes[this.curAddCityExceptionIndex].details.push(addExceptionObj)
      this.dialogFormVisible = false    
    },
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>

