<template>
  <div class="app-container">
    <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-width="120px">
      <el-form-item label="名称" prop="name">
        <el-input v-model.number="pushData.name" clearable></el-input>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-col :span="4">
          <el-form-item prop="price">
            <el-input v-model.number="pushData.price" clearable @keyup.enter.native="handleCreateSave"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20">&nbsp;&nbsp;&nbsp;元</el-col>
      </el-form-item>
      <el-form-item label="已售" prop="buyNumber">
        <el-col :span="4">
          <el-form-item prop="buyNumber">
            <el-input v-model.number="pushData.buyNumber" clearable @keyup.enter.native="handleCreateSave"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20">&nbsp;&nbsp;&nbsp;份</el-col>
      </el-form-item>
      <el-form-item label="状态" prop="status" >
        <el-select v-model="pushData.status" placeholder="请选择">
          <el-option label="上架" value="0"></el-option>
          <el-option label="下架" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="付费属性">
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
      <el-form-item label="付费详情" prop="content">
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
import { saveData, infoData } from '@/api/virtualTraderSet'
import { Message, MessageBox } from 'element-ui'
import Tinymce from '@/components/Tinymce'

let vm

export default {
  data() {
    return {

      kvList:[
        {k:"", v:""}
      ],

      rules: {
        name: [
          { required: true, message: '不能为空'}
        ],
        price: [
          { required: true, message: '不能为空'},
        ],
        buyNumber: [
          { required: true, message: '不能为空'}
        ],
        status: [
          { required: true, message: '不能为空'}
        ],
        kv: [
          { required: true, message: '不能为空'}
        ],
      },

      pushData: {
        id:undefined,
        name:undefined,
        price:undefined,
        buyNumber:0,
        status:'0',
        content:undefined
      },

      dialogTitle : undefined,
      dialogFormVisible:false,

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
    if (this.$route.query.id) {
      infoData(this.$route.query.id).then(res => {
        if (res.code != 0) {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000,
            onClose: () => {
              this.$router.push({ path: '/user/virtualTraderSet/list' })
            }
          })
        } else {
          vm.pushData = Object.assign({}, res.data, {status:'' + res.data.status, json:undefined})
          // 计算付费属性
          let kvList = [];
          if (vm.pushData.jsonObj) {
            Object.keys(vm.pushData.jsonObj).forEach(k => {
              console.log(k);
              console.log(vm.pushData.jsonObj[k]);
              let aaaa = '{"k":"'+ k +'", "v":"'+ vm.pushData.jsonObj[k] +'"}'
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
      console.log(pushDataDetailsJsonStr)      
      this.pushData.detailsJsonStr = JSON.stringify(pushDataDetailsJsonStr)
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
                  this.$router.push({ path: '/user/virtualTraderSet/list' })
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
</style>

