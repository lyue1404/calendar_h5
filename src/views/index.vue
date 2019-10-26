<template>
<!-- @scroll="updateBtnState" -->
  <div id="demo-9" class="demo"   :class="{ 'hasDialog': hasDialog }"   v-title="'圆通日历'" >
    <!-- <div class="demo-title">
      <svg-icon icon-class="nav_back" class="svg-icon pointer back"></svg-icon>
      <span class='title'>圆通日历</span>
    </div> -->
    <inlineCalendar :enableTouch='!ifCollapse' @change='getSelDate' @dateDuring='getDateDuring' @collapse='updateCollapse' :taskCount='taskCountInfo'>
      <template v-slot:day="scope">
        <div v-if='!ifCollapse && taskCountInfo[scope.date.dateStr]' class='count_tip'>{{taskCountInfo[scope.date.dateStr]}}</div>
        <div v-else class="point" :class="{'has_task':ifCollapse&&taskCountInfo[scope.date.dateStr] }"></div>
      </template>
    </inlineCalendar>
    <remind-list :ifScrolling='ifScrolling' ref='remindList' :remindDate='remindDate' :ifCollapse='ifCollapse' @updateTaskCount = 'reduce' @updateDialog='updateDialog'></remind-list>
    <div class='add medium' v-show='ifCanAdd && !ifScrolling'  @click='goToAdd'>
        <svg-icon icon-class="icon_add" class="svg-icon pointer back"></svg-icon>添加
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import remindList from '@/components/remindList'
import { getTaskCount } from '../api/calendar.js'
import { setInterval } from 'timers'
export default {
  components: {
    remindList
  },
  data () {
    return {
      year: undefined,
      month: undefined,
      ifScrolling: false,
      taskCountInfo: {},
      ifCollapse: false,
      remindDate: '',
      ifCanAdd: true,
      hasDialog: false,
      timer: null,
      topVal: 0,
      dateDuring: {}
    }
  },
  created () {
    sessionStorage.setItem('accessToken', this.$route.query.accessToken)
  },
  mounted () {
    this.remindDate = `${dayjs().year()}-${dayjs().month() + 1}-${dayjs().date()}`
  },
  activated () {
    document.title = '圆通日历'
    this.getTaskCountInfo()
    this.$refs.remindList.getRemindList()
  },
  methods: {
    updateBtnState () {
      if (!this.ifCanAdd) {
        return
      }
      this.ifScrolling = true
      this.timer = setInterval(this.judgeScrollState, 1000)
      this.topVal = document.documentElement.scrollTop
    },
    judgeScrollState () {
      if (document.documentElement.scrollTop == this.topVal) {
        this.ifScrolling = false
        clearInterval(this.timer)
        this.timer = null
      }
    },
    updateCollapse (ifCollapse) {
      this.ifCollapse = ifCollapse
    },
    getDateDuring (dateDuring) {
      this.dateDuring = dateDuring
      this.getTaskCountInfo()
    },
    getTaskCountInfo () {
      getTaskCount(this.dateDuring.startDate, this.dateDuring.endDate).then(res => {
        if (res.status == 0) {
          this.taskCountInfo = {}
          if (res.data && res.data.rows.length) {
            res.data.rows.forEach(count => {
              this.$set(this.taskCountInfo, count.date, count.taskCount)
            })
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
    getSelDate (selDate) {
      this.remindDate = `${selDate.$y}-${String(selDate.$M + 1).padStart(2, 0)}-${String(selDate.$D).padStart(2, 0)}`
      let nowDate = `${dayjs().year()}-${String(dayjs().month() + 1).padStart(2, 0)}-${String(dayjs().date()).padStart(2, 0)}`
      this.ifCanAdd = dayjs(this.remindDate).isAfter(dayjs(nowDate)) || dayjs(this.remindDate).isSame(dayjs(nowDate))
      this.getTaskCountInfo()
    },
    goToAdd () {
      this.$router.push({ path: '/add', query: { showDate: this.remindDate } })
    },
    reduce (reduceInfo) {
      this.$set(this.taskCountInfo, reduceInfo.remindDate, --this.taskCountInfo[reduceInfo.remindDate])
    },
    updateDialog (dialogStaus) {
      this.hasDialog = dialogStaus
    }
  }
}
</script>

<style scoped  lang="scss">
  #demo-9{
    position: relative;
    height:100vh;
    overflow-y:auto;
    &.hasDialog{
      overflow-y:hidden;
    }
    // background: #fff;
    .note{
      font-size: 14px;
      padding: 10px 0;
      color: red;
    }
  }
  .count_tip{
    color:#fff;
    font-size:10px;
    width:16px;
    height:16px;
    line-height: 16px;
    border-radius:50%;
    background:#4070FF;
    position:absolute;
    bottom:3px;
    left:18px;
  }
  .point{
    width: 6px;
    height: 6px;
    border: 1px solid #D5DBE6;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    bottom: 10px;
    right:42%;
    &.has_task{
      background: #4070FF;
      border:1px solid #4070ff;
    }
  }
  .svg-icon{
    &.back{
      color:#303133;
      width:22px;
      height:22px;
    }
  }

  .add{
    position:fixed;
    bottom:16px;
    left:0;
    margin-left:128px;
    color:#fff;
    text-align: center;
    width:120px;
    height:48px;
    line-height: 48px;
    background:#4070FF;
    box-shadow: 0 10px 40px 0 rgba(64, 112, 255, 0.3);
    border-radius: 24px;
    z-index: 10;
    .svg-icon{
      width:14px;
      height:14px;
      margin-right:10px;
      margin-top:-2px;
    }
    a{
      font-size:14px;
      line-height: 20px;
      color: #fff;
      text-decoration: none;
    }
    .fade-enter-active, .fade-leave-active {
      transition: opacity .5s;
    }
    .fade-enter, .fade-leave-active {
      opacity: 0;
    }
  }
</style>
