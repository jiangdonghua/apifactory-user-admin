<template>
  <div class="app-container">
    <el-form :rules="rules" ref="addEditPopForm" :model="pushData" label-width="120px">
      <el-form-item label="名称" prop="name">
        <el-input v-model.number="pushData.name" clearable></el-input>
      </el-form-item>
      <el-form-item label="是否包邮" prop="isFree" >
        <el-select v-model="pushData.isFree" placeholder="请选择">
          <el-option label="包邮" value="true"></el-option>
          <el-option label="不包邮" value="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="计价方式" prop="feeType" >
        <el-select clearable v-model="pushData.feeType" placeholder="请选择">
          <el-option label="按件数" value="0"></el-option>
          <el-option label="按重量" value="1"></el-option>
          <el-option label="按体积" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运费设置">
        <div v-for="feeType in feeTypes" v-bind:key="feeType.type">
          <el-checkbox v-model="feeType.isChecked"> {{feeType.name}} </el-checkbox>
          <div v-if="feeType.isChecked">
            <el-form-item v-for="detail in feeType.details" v-bind:key="detail.name" :label="detail.name">
              <el-col :span="2">
                <el-form-item prop="firstNumber">
                  <el-input v-model.number="detail.firstNumber"></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="2" style="text-align:center;">件内</el-col>
              <el-col :span="2">
                <el-form-item prop="firstAmount">
                  <el-input v-model.number="detail.firstAmount"></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="3" style="text-align:center;">元，每增加</el-col>
              <el-col :span="2">
                <el-form-item prop="addNumber">
                  <el-input v-model.number="detail.addNumber"></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="3" style="text-align:center;">件，增加运费</el-col>
              <el-col :span="2">
                <el-form-item prop="addAmount">
                  <el-input v-model.number="detail.addAmount"></el-input>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="2" style="text-align:center;">元</el-col>
            </el-form-item>
            <el-button type="text" @click="addCityException(feeType.type)">为指定地区城市设置运费</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="selectCityForm" label-position="left">
        <el-select v-if="provinceShow" v-model="provinceSel" placeholder="请选择省份" @change="cityDataChanged(0)">
          <el-option v-for="province in provinces" :key="province.id" :label="province.name" :value="province.id"></el-option>
        </el-select>
        <el-select v-if="cityShow" v-model="citySel" placeholder="请选择城市" @change="cityDataChanged(1)">
          <el-option v-for="city in citys" :key="city.id" :label="city.name" :value="city.id"></el-option>
        </el-select>
        <el-select v-if="districtShow" v-model="districtSel" placeholder="请选择区县">
          <el-option v-for="district in districts" :key="district.id" :label="district.name" :value="district.id"></el-option>
        </el-select>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSave">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { saveData, infoData } from '@/api/apiExtShopFreightTemplate'
import { fetchProvinceList, fetchChildList } from '@/api/city'
import { Message, MessageBox } from 'element-ui'

let vm

export default {
  data() {
    return {

      feeTypes:[
        {type:0, name:'快递', isChecked:false, details:[
          {name:'默认运费', cityType:0, cityId:0, firstNumber:1, firstAmount:5, addNumber:1, addAmount:5}
        ]},
        {type:1, name:'EMS', isChecked:false, details:[
          {name:'默认运费', cityType:0, cityId:0, firstNumber:1, firstAmount:5, addNumber:1, addAmount:5}
        ]},
        {type:2, name:'平邮', isChecked:false, details:[
          {name:'默认运费', cityType:0, cityId:0, firstNumber:1, firstAmount:5, addNumber:1, addAmount:5}
        ]},
      ],

      rules: {
        name: [
          { required: true, message: '不能为空'}
        ],
        isFree: [
          { required: true, message: '不能为空'}
        ],
        feeType: [
          { required: true, message: '不能为空'}
        ],
      },

      pushData: {
        id:undefined,
        name:undefined,
        isFree:undefined,
        feeType:undefined,
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
  mounted() {
    vm = this
    this.fetchProvinceList()
    if (this.$route.query.id) {
      infoData(this.$route.query.id).then(res => {
        if (res.code != 0) {
          Message({
            message: res.msg,
            type: 'error',
            duration: 3 * 1000,
            onClose: () => {
              this.$router.push({ path: '/user/apiExtShopFreightTemplate/list' })
            }
          })
        } else {
          this.pushData = Object.assign({}, res.data.info, {isFree:'' + res.data.info.isFree, feeType:'' + res.data.info.feeType})
          res.data.details.forEach(detail => {
            vm.feeTypes[detail.type].isChecked = true
            res.data.exceptions.forEach(exception => {
              if (detail.id == exception.detailId) {
                let tempObj = {name:'默认运费', cityType:0, cityId:0, firstNumber:1, firstAmount:5, addNumber:1, addAmount:5}
                if (exception.districtId) {
                  tempObj.cityType = 2
                  tempObj.cityId = exception.districtId
                  tempObj.name = exception.areaStr
                }
                if (exception.cityId) {
                  tempObj.cityType = 1
                  tempObj.cityId = exception.cityId
                  tempObj.name = exception.cityStr
                }
                if (exception.provinceId) {
                  tempObj.cityType = 0
                  tempObj.cityId = exception.provinceId
                  tempObj.name = exception.provinceStr
                }
                tempObj.firstNumber = exception.firstNumber
                tempObj.firstAmount = exception.firstAmount
                tempObj.addNumber = exception.addNumber
                tempObj.addAmount = exception.addAmount
                vm.feeTypes[detail.type].details.push(tempObj)
              }
            })
          })
          
        }
      }).catch(e=>{
        console.error(e);
      })
    }
  },
  methods: {
    onSubmit() {
      let pushDataDetailsJsonStr = []
      this.feeTypes.forEach(item => {
        if (item.isChecked) {
          item.details.forEach(detail => {
            let tmpObj = Object.assign({}, detail, {type:item.type})
            pushDataDetailsJsonStr.push(tmpObj)
          })
        }
      })
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
                  this.$router.push({ path: '/user/apiExtShopFreightTemplate/list' })
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
    fetchProvinceList(){
      fetchProvinceList().then(res => {
        this.provinces = res.data
        this.provinceShow = true
      })
    },
    cityDataChanged(type){
      let pid = 0;
      if (type == 0) {
        this.districts = undefined
        this.districtSel = undefined
        this.districtShow = false

        this.citys = undefined
        this.citySel = undefined
        this.cityShow = false

        pid = this.provinceSel
      }
      if (type == 1) {
        this.districts = undefined
        this.districtSel = undefined
        this.districtShow = false
        pid = this.citySel
      }
      fetchChildList(pid).then(res => {
        if (res.code != 0) {
          return;
        }
        if (type == 0) {
          this.citys = res.data
          this.cityShow = true
        }
        if (type == 1) {
          this.districts = res.data
          this.districtShow = true
        }
      })
    },
    
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

