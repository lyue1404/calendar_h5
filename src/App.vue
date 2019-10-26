<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  background: #eee;
}
#app{
  height: 100vh;
  background:#F5F7FA;
}
.btn{
  padding: 5px 10px;
}
.title{
  text-align: center;
}
.demo-title{
  color:#303133;
  padding: 10px 0 10px 18px;
  font-size: 16px;
  line-height:20px;
  margin-bottom: 10px;
  .title{
    margin-left:112px;
  }
}
.weui-dialog__btn_primary{
    font-size:14px;
    color:#4070FF;
}
.weui-dialog__btn_default{
    font-size:14px;
    color:#606266;
}

.weui-icon_toast.weui-icon-success-no-circle:before{
    font-size:30px !important;
}
.weui-icon_toast{
    display: inline-block;
    margin:0 10px 0 0;
}

.weui-toast__content{
    display: inline-block;
    margin-top:25px !important;
}
.weui-toast{
    min-height:4.6em;
}
.medium {
  font-weight:500;
}
</style>

