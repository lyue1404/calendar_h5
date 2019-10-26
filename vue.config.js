const merge = require('webpack-merge')
const path = require('path')

function resolve (dir) {
  return path.join(__dirname, '.', dir)
}
module.exports = {
  lintOnSave: true,
  css: {
    extract: false
  },
  publicPath: '/',
  configureWebpack: config => {
    config.resolve.extensions = ['.js', '.vue', '.json', '.css']

    require('vux-loader').merge(config, {
      options: {},
      plugins: ['vux-ui']
    })
  },
  devServer: {
    proxy: {
      '/calendar': {
        target: 'http://192.168.207.45:8421', // 源地址
        // target: 'http://192.168.204.34:8421',
        changeOrigin: true, // 改变源
        xfwd: true,
        autoRewrite: true,
        secure: false
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons'))
      .end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
    // config.module
    //   .rule('vue')
    //   .use('vue-loader')
    //   .loader('vue-loader')
    //   .tap(options => {
    //     options.compilerOptions.preserveWhitespace = false
    //     return options
    //   })
  }

}
