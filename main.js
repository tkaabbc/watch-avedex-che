/**
 * 复制到https://avedex.cc/token/0x8179d97eb6488860d816e3ecafe694a4153f216c-oec
 * 即可将价格变化发送到你的telegram
 */

var targetTimeId = 0
var durationTimeId = 0

/** 隔断时间发一次 */
var durationTime = 1000 * 3600 * 30
/** 查询间隔 */
var queryTime = 5000
var transitionType = ''
/** 目标价 */
var targetPrice = 2.63
/** 记录以来的最低价 */
var minPirce = 999
/** 记录以来的最高价 */
var maxPrice = 1
var msgType = ''

function sendTelegramMsg(msg) {
  // 这里要替换成自己的电报机器人发送消息的链接
  const url = `https://api.telegram.org/bot666666:aaaaa/sendMessage?chat_id=-666666&text=${msg}&parse_mode=HTML`

  $.ajax({
    url: url,
    timeout:5000, // 超时时间
    beforeSend:function(xhr){
    　　console.log(xhr)
    　　console.log('发送前')
    },
    success:function(result){
    　　console.log(result)
    },
    error:function(xhr,textStatus){
    　　console.log('错误')
    　　console.log(xhr)
    　　console.log(textStatus)
    }
  })
}

function getMsgTpl(p) {
  const tpl = `
  类型：${msgType}\n
  ${transitionType}价格：${p[1]}\n
  成交量：${p[2]}\n
  成交额($)：${p[3]}\n
  最低成交价：${minPirce}\n
  最高成交价：${maxPrice}
  -----------------------------------`
  return encodeURIComponent(tpl)
}

function init() {
  injectJquery()

  if (queryTime) {
    targetTimeId = setInterval(() => {
      conditionSendMsg()
    }, queryTime);
  }

  if (durationTime) {
    durationTimeId = setInterval(() => {
      durationSendMsg()
    }, durationTime);
  }
}

function getOriginPrice() {
  var price = []
  const firstItem = $('.van-swipe-item:eq(1) .table-list').children().slice(1, 2)

  firstItem.children().each(function(){
    if ($(this).hasClass('red')) {
      transitionType = '卖出'
    } else if ($(this).hasClass('green')) {
      transitionType = '买入'
    }
    price.push($(this).text());
  });
  return price
}

// 满足条件则发送
function conditionSendMsg() {
  const price = getOriginPrice()
  const priceNum = parseFloat(price[1])
  const cost = parseFloat(price[3])

  if (targetPrice && priceNum < targetPrice) {
    msgType = '目标价'
    sendTelegramMsg(getMsgTpl(price))
    return
  }

  if (minPirce && priceNum < minPirce) {
    msgType = '新低'
    minPirce = priceNum
    sendTelegramMsg(getMsgTpl(price))
    return
  }
  
  if (maxPrice && priceNum > maxPrice) {
    msgType = '新高'
    maxPrice = priceNum
    sendTelegramMsg(getMsgTpl(price))
    return
  }
  
  if (cost > 10000) {
    msgType = '大额'
    sendTelegramMsg(getMsgTpl(price))
    return
  }
}

// 周期发送价格
function durationSendMsg() {
  const price = getOriginPrice()

  msgType = '周期'
  sendTelegramMsg(getMsgTpl(price))
}

function injectJquery() {
  var script = document.createElement("script")
  script.type = "text/javascript"
  script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"
  document.body.appendChild(script)
}

init()
