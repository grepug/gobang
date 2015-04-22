// 请将 AppId 改为你自己的 AppId，否则无法本地测试
var appId = '3l36nhyvwa2gg80zqq14lkkyhmmx1ukt7t89yg0byzyfqv4m';


//var Conv = AV.Object.extend('Conversation');

// 请换成你自己的一个房间的 conversation id
var roomId = '5535f631e4b078a90713c406';

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

  // 创建实时通信实例
  rt = AV.realtime({
    appId: appId,
    clientId: clientId
  });
  rt.on('join', function (data) {
    data.m[0] != clientId && showLog(data.m[0] + "进来了");
    firstJoin++;
    firstJoin > 0 && initTheGame();
    console.log(firstJoin);
  });
  rt.on('left', function (data) {
    console.log(data);
//    if (data.peerId == clientId) {
  //      rt.close();
  //      firstFlag = true;
  //    }
  });
  rt.on('close', function () {
    console.log('实时通信服务被断开！');
    firstFlag = true;
  });
  // 监听连接成功事件
  rt.on('open', function () {
    firstFlag = false;
    showLog('服务器连接成功！');

    initTheGame();
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
              $('#open-btn').replaceWith('<button id="leave-btn" type="button" class="btn btn-danger btn-sm">退出房间</button>');
              $('#leave-btn').on('click', function () {
                room.leave();
                rt.close();
                location.reload();
              })
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
            $("[data-role='black']").attr('src', 'img/black.jpg');
            $("[data-role='white']").attr('src', 'img/white.jpg');
            $("[data-x='" + x + "'][data-y='" + y + "']").replaceWith("<img class='pawn' data-x='" + x + "' data-y='" + y + "' data-role='" + data.msg.nextRole + "' src='img/" + data.msg.nextRole + "-win.jpg'>");
            versus = data.msg.versus;
            role = data.msg.nextRole;
            myturn = true;
            console.log(versus);
            onWin();
            text = "x:" + data.msg.currentStep[0] + " y:" + data.msg.currentStep[1];
          } else {

          }
          showLog(data.fromPeerId + '： ', text);
        });
        room.receipt(function (d) {
          console.log(d);
          clearTimeout(kickOutTimeout);
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
      } else {
        room = rt.conv({
          // 人员的 id
          members: [
        'LeanCloud02'
    ],
          // 创建暂态的聊天室
          // transient: true,
          // 默认的数据，可以放 Conversation 名字等
          data: {
            title: 'testTitle'
          }
        }, function (result) {
          console.log('Conversation created callback');
        });

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
    type: 'text',
    receipt: true
  }, function (data) {

    // 发送成功之后的回调
    inputSend.value = '';
    showLog('自己： ', val);
    //    kickOutTimeout = setTimeout(function () {
    //      room.list(function (data) {
    //        //console.log(data);
    //        for (var i = 0; i < data.length; i++) {
    //          if (data[i] == clientId) data.splice(i, 1);
    //        }
    //        room.send({
    //          text: '您已经被踢出房间',
    //        }, {
    //          type: 'text'
    //        }, function () {
    //          room.remove(data, function () {
    //            console.log(data + ' have been removed!');
    //          });
    //        });
    //      });
    //    }, 3000);
    room.list(function (data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i] == clientId) data.splice(i, 1);
      }
      rt.ping(data, function (d) {
        if (d.length == 0) {
          showLog('你的对手已离线');
          room.remove(data);
        }
      })
    });
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
  printWall.scrollTop = printWall.scrollHeight;
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