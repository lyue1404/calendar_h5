<template>
    <div class='detail-container'>
        <!-- <div class="demo-title">
            <a  @click='returnToHome'>
                <svg-icon icon-class="nav_back" class="svg-icon pointer back"></svg-icon>
            </a>
            <span class='title' v-if='!remindId'>添加提醒</span>
            <span class='title' v-else>修改提醒</span>
        </div> -->
        <ul class='remind-detail' v-title="pageTitle">
            <li >
                <textarea class='remind-content' rows="5" maxlength="200" v-model="remindInfo.content" placeholder="请输入提醒事务内容"></textarea>
            </li>
            <li class="line"></li>
            <li class='space' @click="showTime">
                <span class="title medium">设置时间</span>
                <span class='content'>{{showDate}} {{showInfo.time}}
                    <svg-icon icon-class="arrow_right" class="svg-icon pointer back" ></svg-icon>
                </span>
            </li>
            <li class="line right"></li>
            <li class='space' @click='showPreInfo'>
                <span class="title medium">设置提醒</span>
                <span class='content '>
                    {{showInfo.remindTimeText}}
                    <span class="tip" v-if='!showInfo.remindTimeText'>开始前提醒的时间</span>
                    <svg-icon icon-class="arrow_right" class="svg-icon pointer back"></svg-icon>
                </span>
            </li>
            <li class="line right"></li>
            <li class='space' @click="toggleDialog('showPriority')">
                <span class="title medium">优先级</span>
                <span class='content'>
                    {{showInfo.priorityText}}
                    <span class="tip"  v-if='!showInfo.priorityText'>高/中/低</span>
                    <svg-icon icon-class="arrow_right" class="svg-icon pointer back"></svg-icon>
                </span>
            </li>
            <li class="line right"></li>
            <li class="save-container">
                <button class='save medium' :disabled='ifDisabled' @click='save'>保存</button>
            </li>
            <li class='input-tip'>
                提醒将通过钉钉推送，立即提醒推送1次，其它提醒时间均推送2次（保存后立即推送1次、到达提醒时间推送1次）
            </li>
        </ul>
        <div class='modal' v-if='isShowModal'>
        </div>
        <div>
            <vue-pickers
                :show="show"
                :columns="columns"
                :defaultData="defaultData"
                :link="link"
                :selectData="pickData"
                @cancel="toggleDialog('show')"
                @confirm="confirmFn">
            </vue-pickers>
            <!-- <vue-pickers
                :title="'设置时间'"
                :show="show"
                :link="link"
                :columns="columns"
                :selectData="pickData"
                @cancel="close"
                @confirm="confirmFn">
            </vue-pickers> -->
        </div>
        <div>
            <vue-pickers
                :title="'设置提醒'"
                :show="showPreTime"
                :columns="columnsPreTime"
                :defaultData="defaultDataPreTime"
                :selectData="pickDataPreTime"
                v-on:cancel="toggleDialog('showPreTime')"
                v-on:confirm="confirmFnPreTime">            </vue-pickers>
        </div>
        <ul class='priority' v-if='showPriority' @click='setPriority($event)'>
            <li  >
                <span class='high'></span>高
            </li>
            <li class="line"></li>
            <li>
                <span class='medium'></span>中
            </li>
            <li class="line"></li>
            <li>
                <span class='low'></span>低
            </li>
            <li class="line"></li>
            <li>取消</li>
        </ul>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import vuePickers from '@/components/picker'
import { getRemindTimeList, addNewRemind, getRemindDetail, modifyRemind } from '../../api/calendar.js'

export default {
  name: 'remindDetail',
  components: {
    vuePickers
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.remindId = vm.$route.params.id ? vm.$route.params.id : ''
      document.title = vm.remindId ? '修改提醒' : '添加提醒'
    })
  },
  data () {
    return {
      remindInfo: {
        channel: 0,
        content: '',
        setDate: '',
        remindTime: '',
        priority: '',
        source: 1, // TODO:待和驾驶舱对接后更新
        type: 1
      },
      showInfo: {
        time: '',
        remindTimeText: '',
        priorityText: ''
      },
      isShowModal: false,
      show: false,
      columns: 3,
      defaultData: [],
      link: true,
      pickData: {
        // 第一列数据结构
        data1: [
          {
            text: '数码',
            value: 1999
          }
        ],
        // 第二列数据结构
        data2: {
          '1999': [
            {
              text: '相机',
              value: 101
            },
            {
              text: '手机',
              value: 102
            },
            {
              text: '音箱',
              value: 103
            }
          ]
        },
        data3: {
          101: [{
            text: 'test',
            value: 10
          }]
        }
      },
      showPreTime: false,
      columnsPreTime: 1,
      defaultDataPreTime: [],
      pickDataPreTime: {
        data1: []
      },
      showPriority: false,
      showDate: '',
      remindId: '',
      remindTypeInfo: {},
      remindTypeList: []
    }
  },
  computed: {
    pageTitle () {
      return this.remindId ? '修改提醒' : '添加提醒'
    },
    ifDisabled () {
      return !(this.remindInfo.content && this.remindInfo.setDate && this.remindInfo.priority && (this.remindInfo.remindTime !== ''))
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.remindId = this.$route.params.id ? this.$route.params.id : ''
      this.showDate = this.$route.query.showDate
      this.remindInfo.source = this.$route.query.source
      this.columns = this.remindId ? 3 : 2
      this.getDictionaryData()
      if (this.remindId) {
        this.getRemindInfo()
      }
    },
    getDictionaryData () {
      getRemindTimeList().then(res => {
        if (status == 0 && res.data && res.data.rows) {
          this.packageRemindType(res.data.rows)
        }
      })
    },
    getRemindInfo () {
      getRemindDetail(this.remindId).then(res => {
        if (res.status == 0) {
          if (res.data) {
            this.translateRemindInfo(res.data)
          }
        } else {
          this.$vux.toast.show({
            time: 3000,
            type: 'warn',
            width: '80vw',
            text: res.message,
            position: 'middle'
          })
        }
      })
    },
    translateRemindInfo (remindInfo) {
      this.remindInfo = remindInfo
      this.showInfo = {
        time: remindInfo.setDate.split(' ')[1],
        remindTimeText: this.remindTypeInfo[remindInfo.remindTime],
        priorityText: this.getPriorityText(remindInfo.priority)
      }
      this.defaultDataPreTime = [{ text: this.remindTypeInfo[remindInfo.remindTime], value: remindInfo.remindTime }]
      this.showDate = remindInfo.setDate.split(' ')[0]
    },
    getPriorityText (priority) {
      const priorityInfo = { 1: '低', 2: '中', 3: '高' }
      return priorityInfo[priority]
    },
    packageRemindType (remindTypeList) {
      this.remindTypeList = []
      if (remindTypeList.length) {
        remindTypeList.forEach(remindType => {
          this.remindTypeList.push({
            text: remindType.dictName,
            value: remindType.label
          })
          this.remindTypeInfo[remindType.label] = remindType.dictName
        })
      }
    },
    confirmFn (val) {
      this.toggleDialog('show')
      if (this.remindId) {
        this.pickData.default = [val.select1, val.select2, val.select3]
        this.showInfo.time = `${val.select2.text}:${val.select3.text}`
        this.showDate = val.select1.value
      } else {
        this.pickData.default = [val.select1, val.select2]
        this.showInfo.time = `${val.select1.text}:${val.select2.text}`
      }
      this.defaultData = this.pickData.default
      this.remindInfo.setDate = `${this.showDate} ${this.showInfo.time}`
    },
    showTime () {
      this.remindId ? this.setDateList() : this.setTime()
      this.toggleDialog('show')
    },
    // modify: has day selector
    setDateList () {
      this.pickData = { data1: [], data2: {}, data3: {} }
      for (let i = 0; i < 10; i++) {
        let date = this.getDateStr(dayjs(this.showDate).add(i, 'day'))
        this.pickData.data1.push({ text: date.split('-').splice(1).join('-'), value: date })
        if (this.ifAfterToday(date)) {
          this.setHourAndMinuList(date, 0, 0)
        } else {
          this.setHourAndMinuList(date, dayjs().hour(), dayjs().minute())
        }
      }
    },
    ifAfterToday (date = this.showDate) {
      return dayjs(`${dayjs().year()}-${dayjs().month() + 1}-${dayjs().date()}`).isBefore(date)
    },
    getDateStr (date) {
      return `${date.$y}-${String(date.$M + 1).padStart(2, 0)}-${String(date.$D).padStart(2, 0)}`
    },
    setHourAndMinuList (key, startHour, startMinute) {
      let hourList = []
      for (let i = startHour; i < 24; i++) {
        let minuList = []
        if ((i == startHour && startHour == 0 && startMinute == 0) || i != startHour) {
          minuList = this.getMinuteList(0)
        } else {
          let init = (startMinute + (5 - startMinute % 5))
          minuList = this.getMinuteList(init)
        }
        let showNum = (i + '').padStart(2, 0)
        minuList.length && hourList.push({ text: showNum, value: `${key} ${showNum}` })

        this.$set(this.pickData.data3, `${key} ${showNum}`, minuList)
      }
      this.$set(this.pickData.data2, key, hourList)
    },
    // add: has day selector
    setTime () {
      if (this.ifAfterToday(this.showDate)) {
        this.setTimeList(0, 0)
      } else {
        this.setTimeList(dayjs().hour(), dayjs().minute())
      }
    },
    setTimeList (startHour, startMinute) {
      this.pickData = { data1: [], data2: {} }
      for (let i = startHour; i < 24; i++) {
        let arr
        if ((i == startHour && startHour == 0 && startMinute == 0) || i != startHour) {
          arr = this.getMinuteList(0)
        } else {
          let init = (startMinute + (5 - startMinute % 5))
          arr = this.getMinuteList(init)
        }
        let showNum = (i + '').padStart(2, 0)
        arr.length && this.pickData.data1.push({ text: showNum, value: i })
        this.$set(this.pickData.data2, i, arr)
      }
    },
    getMinuteList (initMinute) {
      let arr = []
      for (let j = initMinute; j < 60; j += 5) {
        let showNum = (j + '').padStart(2, 0)
        arr.push({ text: showNum, value: j })
      }
      return arr
    },
    toggleDialog (whichDialog) {
      this.isShowModal = !this.isShowModal
      this[whichDialog] = !this[whichDialog]
    },
    confirmFnPreTime (val) {
      this.toggleDialog('showPreTime')
      this.pickDataPreTime.default = [val.select1]
      this.remindInfo.remindTime = val.select1.value
      this.showInfo.remindTimeText = val.select1.text
      this.defaultDataPreTime = [val.select1]
    },
    showPreInfo () {
      if (!this.showInfo.time) {
        this.$vux.toast.show({
          time: 2000,
          type: 'warn',
          width: '80vw',
          text: '请先选择设置时间',
          position: 'middle'
        })
      } else {
        this.filterRemindType()
        this.toggleDialog('showPreTime')
      }
    },
    filterRemindType () {
      if (this.ifAfterToday()) {
        this.pickDataPreTime.data1 = this.remindTypeList
        return
      }
      this.pickDataPreTime.data1 = []
      const totalMin = this.showInfo.time.split(':')[0] * 60 + Number(this.showInfo.time.split(':')[1])
      const currentMin = dayjs().hour() * 60 + dayjs().minute()
      const timeGap = totalMin - currentMin
      this.remindTypeList.forEach(remindType => {
        if (Number(remindType.value) < timeGap || Number(remindType.value) == timeGap) {
          this.pickDataPreTime.data1.push(remindType)
        }
      })
      if (!this.pickDataPreTime.data1.length) {
        this.$vux.toast.show({
          time: 2000,
          type: 'warn',
          width: '80vw',
          text: '请重新选择设置时间',
          position: 'middle'
        })
      }
    },
    setPriority (e) {
      const priorityInfo = { 高: 3, 中: 2, 低: 1 }
      this.remindInfo.priority = e.target.innerText == '取消' ? this.remindInfo.priority : priorityInfo[e.target.innerText]
      this.showInfo.priorityText = e.target.innerText == '取消' ? this.showInfo.priorityText : e.target.innerText
      this.toggleDialog('showPriority')
    },
    save () {
      if (this.remindId) {
        this.updateRemind()
      } else {
        this.addRemind()
      }
    },
    updateRemind () {
      modifyRemind(this.remindInfo).then(res => {
        if (res.status == 0) {
          this.$router.go(-1)
        } else {
          this.$vux.toast.show({
            time: 3000,
            type: 'warn',
            width: '80vw',
            text: res.message,
            position: 'middle'
          })
        }
      })
    },
    addRemind () {
      addNewRemind(this.remindInfo).then(res => {
        if (res.status == 0) {
          this.$router.go(-1)
        } else {
          this.$vux.toast.show({
            time: 3000,
            type: 'warn',
            width: '80vw',
            text: res.message,
            position: 'middle'
          })
        }
      })
    },
    returnToHome () {
      const _this = this
      this.$vux.confirm.show({
        content: '是否保存本次编辑结果?',
        confirmText: '保存',
        cancelText: '不保存',
        onCancel () {
          _this.isShowModal = false
          _this.$router.go(-1)
        },
        onConfirm () {
          _this.save()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.detail-container{
    width: 100vw;
    height: 100vh;
    background: #fff;
    position: relative;
    overflow: hidden;
    .line{
        display: block;
        width: 200%;
        height:1px !important;
        transform: scaleY(.5);
        background: #EDEFF2;
        &.right{
            margin-left:16px;
        }
    }
    .remind-detail{
        // position:absolute;
        .remind-content{
            color:#606266;
            font-size:14px;
            line-height:20px;
            width:100vw;
            height:120px;
            resize: none;
            padding:12px 16px;
            border:0;
            outline: none;
            &::-webkit-input-placeholder{
                color:#BFC4CD;
            }
        }
        .space{
            font-size:14px;
            display: flex;
            justify-content: space-between;
            height:56px;
            line-height:56px;
            padding:0 16px;
            .title{
                color:#303133;
            }
            .content{
                color:#606266;
                .tip{
                    color:#BFC4CD;
                }
            }
        }
    }
    .save-container{
        position: absolute;
        bottom:0;
        left:0;
        .save{
            color:#fff;
            font-size:14px;
            width:100vw;
            height:48px;
            border:0;
            outline: none;
            background: #4070FF;
            &:disabled{
                color:#BFC4CD;
                background: #EDEFF2;
            }
        }
    }
    .priority{
        width: 100vw;
        position:absolute;
        left:0;
        bottom:0;
        background:#fff;
        text-align: center;
        z-index:9901;
        border-radius:16px 16px 0 0;
        li{
            height:56px;
            line-height: 56px;
            vertical-align: middle;
            span{
                display: inline-block;
                margin-right:5px;

                width:8px;
                height:8px;
                border-radius: 50%;
                &.high{
                    background: #FF574B;
                }
                &.medium{
                    background: #FD9C4A;
                }
                &.low{
                    background:#638AFF;
                }
            }

        }

    }
    .modal{
        position:fixed;
        top:0;
        bottom:0;
        left:0;
        right:0;
        background:rgba(0, 0, 0, 0.6);
        z-index:999;
    }
    .input-tip{
        padding:10px 16px 0 16px;
        color:#BFC4CD;
        font-size:14px;
        line-height: 28px;
    }
}

</style>
