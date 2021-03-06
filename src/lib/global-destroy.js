import { sceneController } from './scenario/scene-control'
import { clearAudio } from './component/audio/api'
import { clearVideo } from './component/video/api'
import { clearColumnDetection } from './component/column/detect'
import { clearFixAudio } from './component/audio/fix'
import { clearCache, clearResult } from './database/destroy'
import { config, clearConfig } from './config/index'
import { clearId } from './util/stroage'
import { clearAndroid } from './initialize/button'
import { clearGlobalEvent } from './initialize/golbal-event'
import { clearRootNode } from './initialize/root-node'

/**
 * 销毁接口
 * action 可能是
 * 1 exit 默认，单页面切换，只做销毁。但是代码还是同一份
 * 2 refresh 刷新，旋转切换（需要做一些数据保留，比如外联json数据）
 * 3 destory 退出应用，所以这个应该是全销毁
 * @param {[type]} action [description]
 */
export default function Destroy(action = 'exit') {

  //销毁所有场景
  sceneController.destroyAllScene()

  //销毁只创建一次的对象
  //修复的音频对象
  //数据的结果集
  if (action === 'destory') {
    //修复的音频对象
    clearFixAudio()
  }

  // refresh状态不删除结果集
  // 只处理destory与exit状态
  if (action === 'destory' || action === 'exit') {
    //删除结果集
    clearResult()

    //删除流式布局的数据
    let $flowNode = $("#xut-stream-flow")
    if ($flowNode.length) {
      $flowNode.remove()
      $flowNode = null
    }
  }

  //默认全局事件
  clearGlobalEvent()

  //config路径缓存
  clearConfig()

  //删除数据匹配缓存
  clearCache()

  //音视频
  clearAudio()

  //音频
  clearVideo()

  //销毁独立APK的键盘事件
  clearAndroid()

  /**
   * 重设缓存的UUID
   * 为了只计算一次
   * @return {[type]} [description]
   */
  clearId()

  Xut.TransformFilter = null
  Xut.CreateFilter = null

  //销毁节点
  clearRootNode()

  //删除动态加载的两个css文件
  $('link[data-type]').each(function (index, link) {
    let type = link.getAttribute('data-type')
    if (type === 'svgsheet' || type === 'xxtflow') {
      link.parentNode.removeChild(link)
    }
  })

  //停止分栏探测
  clearColumnDetection()

  //启动配置文件去掉
  config.launch = null
}
