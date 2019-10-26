<template>
    <div class='remind-list' :class="{'collapse':ifCollapse}">
        <ul>
            <li class='empty' v-if='!remindList.length' :class="{'collapse': ifCollapse}">
                <img src="../../assets/images/img_default.gif">
                <div class='text'>
                    您在当日还没有添加事务～
                </div>
            </li>
            <li class='list' v-else  v-for='task,index in remindList'>
                <div class='list-item-outer' :key='task.id'
                    @touchstart.stop='touchStart' @touchmove.stop='touchMove($event,task.id)'
                    @touchend.stop='touchEnd($event,task.id)' :style="deleteSlider[task.id]">
                    <div class="list-item">
                        <div class='item-text' :class="{'finish':!ifFinish(task.setDate)}">
                            <svg-icon icon-class="list_icon_high" class="svg-icon" v-if='task.priority == 3'></svg-icon>
                            <svg-icon icon-class="list_icon_medium" class="svg-icon" v-if='task.priority == 2' ></svg-icon>
                            <svg-icon icon-class="list_icon_low" class="svg-icon" v-if='task.priority == 1' ></svg-icon>
                            <div class='time medium'>
                                {{task.setDate.split(' ')[1]}}
                            </div>
                            <div class='detail' :class='{"del":!ifFinish(task.setDate)}'>
                               {{task.content}}
                            </div>
                        </div>
                        <a class='more' @click="eidtTheTips(task, index)">
                            <svg-icon icon-class="list_btn_more" class="svg-icon" ></svg-icon>
                        </a>
                    </div>
                </div>
                <button class='delete medium' :class='{"disabled": !task.del}' ref='remove' @click='removeRemind(task.id, index, false, task.del)'>删除</button>
            </li>
        </ul>
        <div class='modal' v-if='isShowModal'>
            <ul>
                <li class='edit' @click="edit" v-if='ifCanEdit'>编辑</li>
                <li class="del" v-if='ifCanDel' @click="delTheRemind">删除</li>
                <li class="cancel" @click="cancel">取消</li>
            </ul>
        </div>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import { getSelDateTaskInfo, delRemind } from '../../api/calendar.js'
export default {
  name: 'remind',
  props: {
    ifScrolling: {
      type: Boolean,
      default: false
    },
    remindDate: {
      type: String,
      default: ''
    },
    ifCollapse: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      startX: 0, // 触摸位置
      endX: 0, // 结束位置
      moveX: 0, // 滑动时的位置
      disX: 0, // 移动距离
      deleteSlider: {}, // 滑动时的效果,使用v-bind:style="deleteSlider"
      isShowModal: false,
      remindList: [],
      selRemindId: null,
      selIndex: null,
      ifCanEdit: true,
      ifCanDel: true
    }
  },
  watch: {
    remindDate () {
      this.getRemindList()
    }
  },
  mounted () {
    sessionStorage.setItem('accessToken', this.$route.query.accessToken)
  },
  methods: {
    ifFinish (setDate) {
      return dayjs(setDate).isAfter(`${dayjs().year()}-${dayjs().month() + 1}-${dayjs().date()} ${dayjs().hour()}:${dayjs().minute()}`)
    },
    getRemindList () {
      getSelDateTaskInfo(this.remindDate).then(res => {
        if (res.status == 0) {
          if (res.data && res.data.rows) {
            this.remindList = res.data.rows || []
          } else {
            this.remindList = []
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
    touchStart (e) {
      e = e || event
      if (e.touches.length == 1) {
        this.startX = e.touches[0].clientX
      }
    },
    touchMove (e, key) {
      e = e || event
      let wd = this.$refs.remove[0].offsetWidth
      if (e.touches.length == 1) {
        this.moveX = e.touches[0].clientX
        this.disX = this.startX - this.moveX
        if (this.disX > 110) {
          this.$set(this.deleteSlider, key, 'transform:translateX(-' + (wd + 16) + 'px)')
        } else {
          this.$set(this.deleteSlider, key, 'transform:translateX(0px)')
        }
      }
    },
    touchEnd (e, key) {
      e = e || event
      let wd = this.$refs.remove[0].offsetWidth
      if (e.changedTouches.length == 1) {
        let endX = e.changedTouches[0].clientX
        this.disX = this.startX - endX
        if (this.disX > 110) {
          this.$set(this.deleteSlider, key, 'transform:translateX(-' + (wd + 16) + 'px)')
        } else {
          this.$set(this.deleteSlider, key, 'transform:translateX(0px)')
        }
      }
    },
    eidtTheTips (task, index) {
      if (!task.update && !task.del) {
        this.$vux.toast.show({
          time: 2000,
          type: 'warn',
          width: '80vw',
          text: '此任务不可操作',
          position: 'middle'
        })
        return
      }
      this.selRemindId = task.id
      this.selIndex = index
      this.ifCanEdit = task.update
      this.ifCanDel = task.del
      this.isShowModal = true
      this.$emit('updateDialog', true)
    },
    edit () {
      this.cancel()
      this.$router.push({ path: `/add/${this.selRemindId}` })
    },
    delTheRemind () {
      this.removeRemind(this.selRemindId, this.selIndex, true, this.ifCanDel)
    },
    cancel () {
      this.isShowModal = false
      this.$emit('updateDialog', false)
    },
    removeRemind (id, index, ifCloseDialog = false, ifCanDel) {
      if (!ifCanDel) {
        return
      }
      delRemind(id).then(res => {
        if (res.status == 0) {
          ifCloseDialog && this.cancel()
          this.updateRemindList(index)
          this.$emit('updateTaskCount', { remindDate: this.remindDate })
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
    updateRemindList (index) {
      this.remindList.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
    .remind-list{
        display: flex;
        background: #fff;
        position:relative;
        min-height:237px;
        &.collapse{
            min-height:485px;
        }
        .empty{
            width:100vw;
            min-height:calc( 100vh - 430px );
            text-align: center;
            &.collapse{
               min-height:calc( 100vh - 182px );
               img{
                   margin-top:64px;
               }
            }
            img{
                width:240px;
                height:120px;
            }
            .text{
                font-weight: normal;
                color:#909399;
                font-size:12px;
                margin:16px 0;
            }
        }
        .list{
            display: flex;
            user-select: none;
            width:343px;
            height:80px;
            position:relative;
            margin:0 16px 16px 16px;
            .list-item-outer{
                position: absolute;
                top:0;
                bottom:0;
                left:0;
                right:0;
                z-index:10;
                background: #fff;
                .list-item{
                    display: flex;
                    justify-content: space-between;
                    padding-left:8px;
                    box-shadow: 0 20px 50px 0 rgba(32, 63, 124, 0.08);
                    transition: 0.3s;
                    border-radius:4px;
                    .finish{
                        .svg-icon{
                            opacity: 0.8;
                        }
                    }
                    .time{
                        color:#BFC4CD;
                        font-family: GoogleSans-Medium;
                        font-size:20px;
                        line-height:24px;
                    }
                    .detail{
                        color:#606266;
                        font-size:14px;
                        line-height:20px;
                        font-weight: normal;
                        &.del{
                            color:#BFC4CD;
                            text-decoration: line-through;
                        }
                    }
                    .more{
                        width:24px;
                        height:24px;
                        margin:28px 8px 28px 0;
                        cursor: pointer;
                        .svg-icon{
                            width:24px;
                            height:24px;
                        }
                    }
                }

            }
            .delete {
                width:80px;
                height:80px;
                position:absolute;
                right:0;
                top:0;
                color:#fff;
                font-size:16px;
                line-height:22px;
                text-align: center;
                background: #FF574B;
                border:0;
                outline:none;
                border-radius:5px;
                &.disabled{
                    color:#BFC4CD;
                    background:#EDEFF2;
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
            ul{
                position: absolute;
                left:0;
                right:0;
                bottom:0;
                font-size:16px;
                text-align:center;
                li{
                    height:56px;
                    line-height:56px;
                    background: #fff;
                    border-bottom:1px solid #EDEFF2;
                    cursor: pointer;
                    &:first-child{
                        border-radius:16px 16px 0 0;
                    }
                    &.edit{
                        color:#303133;
                    }
                    &.del{
                        color:#FF574B;
                    }
                    &.cancel{
                        color:#909399;
                    }
                }
            }
        }
    }
</style>
