import { isAndroid, isIos, isChromeIPhone } from './device'

function login () {
  try {
    if (isAndroid) {
      if (window.nativeBridge != null && typeof (window.nativeBridge) !== 'undefined') {
        window.nativeBridge.reLogin()
      }
    }
    if (isIos) {
      if (window.webkit.messageHandlers.gotoLogin != null && typeof (window.webkit.messageHandlers.gotoLogin) !== 'undefined') {
        window.webkit.messageHandlers.gotoLogin.postMessage(null)
      }
    }
  } catch (error) {
    console.log('token失效，调用登录方法失败')
  }
}

// 是否关闭指标说明问号 true 显示  false隐藏
function isShowQuestionMark (type = '1') {
  if (isAndroid || isIos) {
    try {
      if (isAndroid) {
        if (window.nativeBridge != null && typeof (window.nativeBridge) !== 'undefined') {
          window.nativeBridge.isShow(type)
        }
      }
      if (isIos) {
        if (window.webkit.messageHandlers.isShow != null && typeof (window.webkit.messageHandlers.isShow) !== 'undefined') {
          window.webkit.messageHandlers.isShow.postMessage(type)
        }
      }
    } catch (error) {
      if (!isChromeIPhone) {
        console.log(error)
        console.log('调用问号显示隐藏方法失败')
      }
    }
  }
}

export {
  login,
  isShowQuestionMark
}
