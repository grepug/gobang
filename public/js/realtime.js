// 请将 AppId 改为你自己的 AppId，否则无法本地测试
var appId = '3l36nhyvwa2gg80zqq14lkkyhmmx1ukt7t89yg0byzyfqv4m';


//var Conv = AV.Object.extend('Conversation');

// 请换成你自己的一个房间的 conversation id
var roomId = '5535a578e4b052897f517ede';

// 每个客户端自定义的 id
var clientId = 'mygobang';

var rt;
var room;

// 监听是否服务器连接成功
var firstFlag = true;

var openBtn = document.getElementById('open-btn');
var sendBtn = document.getElementById('send-btn');
var inputName = document.getElementById('input-name');
var inputSend = document.getElementById('input-send');
var printWall = document.getElementById('print-wall');
//var quitBtn = document.getElementById('quit-btn');

bindEvent(openBtn, 'click', main);
bindEvent(sendBtn, 'click', sendMsg);
//bindEvent(quitBtn, 'click', quit);

bindEvent(document.body, 'keydown', function (e) {
  if (e.keyCode === 13) {
    if (firstFlag) {
      main();
    } else {
      sendMsg();
    }
  }
});
$(function () {

})

function main() {

  showLog('正在连接服务器，请等待。。。');
  var val = inputName.value;
  if (val) clientId = val;
  firstFlag || rt.close();

  console.log(clientId)
    // 创建实时通信实例
  rt = AV.realtime({
    appId: appId,
    clientId: clientId
  });

  rt.on('left', function (data) {
    console.log(data);
  });
  // 监听连接成功事件
  rt.on('open', function () {
    firstFlag = false;
    showLog('服务器连接成功！');
    rt.room(roomId, function (object) {

      console.log(object)
        // 判断服务器端是否存在这个 room，如果存在
      if (object) {
        room = object;

        // 当前用户加入这个房间
        room.join(function () {

          room.count(function (data) {
            // 当前用户数量
            if (data > 2) {
              room.leave();
              showLog('该房间已满，已离开');
              return;
            } else {
              room.list(function (data) {
                showLog('当前 Conversation 的成员列表：', data);
              });
            }
          });
        });

        // 房间接受消息
        room.receive(function (data) {
          console.log(data);
          var text = '';
          if (data.msg.type) {
            text = data.msg.text;
          } else if (data.msg.currentStep) {
            var x = data.msg.currentStep[0],
              y = data.msg.currentStep[1];
            $("[data-x='" + x + "'][data-y='" + y + "']").replaceWith("<img class='pawn' data-x='" + x + "' data-y='" + y + "' src='img/" + data.msg.nextRole + ".jpg'>");
            versus = data.msg.versus;
            role = data.msg.nextRole;
            myturn = true;
            console.log(versus);
            var win = isWin();
            if (win) {
              console.log(role + " win!");
              console.log(win);
              for (var i = 0; i < win.length; i++) {
                $("[data-x='" + win[i][0] + "'][data-y='" + win[i][1] + "']").attr('src', 'img/' + role + '-win.jpg');
                console.log(win[i][0])
              }
              $('table').undelegate();
            }
          } else {
            text = data.msg;
          }
          showLog(data.fromPeerId + '： ', text);
        });
        //    } else {
        //      var room2 = rt.room({
        //        // 成员列表
        //        members: [
        //        'LeanCloud02'
        //    ],
        //        // 默认的数据，可以放 room 名字等
        //        data: {
        //          title: 'testTitle'
        //        }
        //      }, function (result) {
        //        console.log('Room created callback');
        //      });
        //
        //      // 当新 Room 被创建时触发
        //      rt.on('create', function (data) {
        //        console.log(data);
        //      });
        //    }
      }
    });
  });
  rt.on('resue', function () {
    showLog('服务器正在重连，请耐心等待。。。');
  });
  // 获得已有房间的实例


  // 监听服务情况

}

function sendMsg() {

  // 如果没有连接过服务器
  if (firstFlag) {
    alert('请先连接服务器！');
    return;
  }
  var val = inputSend.value;

  // 向这个房间发送消息，这段代码是兼容多终端格式的，包括 iOS、Android、Window Phone
  room.send({
    text: val
  }, {
    type: 'text'
  }, function (data) {

    // 发送成功之后的回调
    inputSend.value = '';
    showLog('自己： ', val);
    printWall.scrollTop = printWall.scrollHeight;
  });

  // 发送多媒体消息，如果想测试图片发送，可以打开注释
  // room.send({
  //     text: '图片测试',
  //     // 自定义的属性
  //     attr: {
  //         a:123
  //     },
  //     url: 'https://leancloud.cn/images/static/press/Logo%20-%20Blue%20Padding.png',
  //     metaData: {
  //         name:'logo',
  //         format:'png',
  //         height: 123,
  //         width: 123,
  //         size: 888
  //     }
  // }, {
  //    type: 'image'
  // }, function(data) {
  //     console.log('图片数据发送成功！');
  // });
}

function quit() {
  if (firstFlag) {
    alert('请先进入房间');
    return;
  }
  room.leave();

}

// demo 中输出代码
function showLog(msg, data) {
  if (data) {
    // console.log(msg, data);
    msg = msg + '<span class="strong">' + encodeHTML(JSON.stringify(data)) + '</span>';
  } else {
    // console.log(msg);
  }
  var p = document.createElement('p');
  p.innerHTML = msg;
  printWall.appendChild(p);
}

function encodeHTML(source) {
  return String(source)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // .replace(/\\/g,'&#92;')
  // .replace(/"/g,'&quot;')
  // .replace(/'/g,'&#39;');
}

function bindEvent(dom, eventName, fun) {
  if (window.addEventListener) {
    dom.addEventListener(eventName, fun);
  } else {
    dom.attachEvent('on' + eventName, fun);
  }
}