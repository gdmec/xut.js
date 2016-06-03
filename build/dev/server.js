const fs = require('fs')
const express = require('express')
const webpack = require('webpack')
const ora = require('ora')
const open = require("open");
const watch = require('gulp-watch');
const path = require('path')
const _ = require("underscore");
const child_process = require('child_process');
//https://github.com/webpack/webpack-dev-middleware#usage
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpacHotMiddleware = require('webpack-hot-middleware')

//数据库
if (!fs.existsSync("./src/content/xxtebook.db")) {
    console.log('data not available!')
    return
}

var spinner = ora('Begin to pack , Please wait for\n')

if (!fs.existsSync("./src/content/SQLResult.js")) {
    require('../sqlite/index').resolve()
}

var app = express()
var config = require('../../config')
var port = process.env.PORT || config.dev.port
var conf = _.extend(config.dev.conf, {
    rollup: config.dev.conf.tarDir + 'rollup.js'
});

var webpackConfig = require('./webpack.dev.conf')


//启动代码测试
//eslint
if (config.dev.eslint.launch) {
    webpackConfig.module.preLoaders = [{
            test: /\.js$/,
            loader: 'eslint',
            include: config.dev.eslint.dir,
            exclude: /node_modules/
        }]
        // community formatter
    webpackConfig.eslint = {
        formatter: require("eslint-friendly-formatter")
    }
}

var compiler = webpack(webpackConfig)


var devMiddleware = webpackDevMiddleware(compiler, {
    //The path where to bind the middleware to the server.
    //In most cases this equals the webpack configuration option output.publicPath
    publicPath: webpackConfig.output.publicPath,

    //Output options for the stats. See node.js API.
    //http://webpack.github.io/docs/node.js-api.html
    stats: {
        //With console colors
        colors: true,
        //add chunk information
        chunks: false
    }
})


//Webpack热重载连接服务器
//https://github.com/glenjamin/webpack-hot-middleware
//Add webpack-hot-middleware attached to the same compiler instance
var hotMiddleware = webpacHotMiddleware(compiler)

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function(compilation) {
    //https://github.com/ampedandwired/html-webpack-plugin
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
        hotMiddleware.publish({
            action: 'reload'
        })
        cb()
    })
})


// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

app.use('/lib', express.static('src/lib'));
app.use('/css', express.static('src/css'));
app.use('/images', express.static('src/images'));
app.use('/content', express.static('src/content'));


if (config.dev.debug.launch) {
    /**
     * 监控文件变化
     * 打包
     */
    watch(conf.assetsRoot + '/app.js', function() {
        console.log(
            '\n' +
            'watch file change.....await....:\n'
        )
        var child = child_process.spawn('node', ['build/dev/debug.js', ['debug=' + config.dev.debug.dir]]);
        // 捕获标准输出并将其打印到控制台 
        child.stdout.on('data', function(data) {
            console.log('\n' + data);
        });
        // 捕获标准错误输出并将其打印到控制台 
        child.stderr.on('data', function(data) {
            console.log('fail out：\n' + data);
        });
        child.on('close', function(code) {
            console.log('complete：' + code);
        });
    })
}

module.exports = app.listen(port, function(err) {
    if (err) {
        console.log(err)
        return
    }
    console.log('Listening at http://localhost:' + port + '\n')
})

spinner.start()
setTimeout(function() {
    spinner.stop()
}, 5000)