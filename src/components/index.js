import SvgIcon from './svgIcon'// svg组件
import { Toast } from 'vux-toast'
const Yto = {
  install: function (Vue) {
    Vue.component('svg-icon', SvgIcon)
    Vue.component('toast', Toast)
  }
}
export default Yto
