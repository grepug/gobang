// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server)

// App全局配置
app.use(express.static(__dirname + '/../public'));
app.set('views', 'cloud/views'); //设置模板目录
app.set('view engine', 'jade'); // 设置template引擎
//app.use(express.bodyParser()); // 读取请求body的中间件

app.get('/', function (req, res) {
  res.render('gobang')
})

console.log(__dirname)

//var gobang = io.of('/')
var roomList = {
  rooms: []
}
io.on('connection', function (sk) {
    //send the room list to the client
    sk.emit('list the rooms', roomList)
    sk.on('query room list', function (data) {
      console.log(roomList)
      sk.emit('list the rooms', roomList)
    })
    sk.on('create a room', function (data) {
      console.log(data)
      roomList.rooms.push({
        roomId: data.roomId || '123123123',
        roomName: data.roomName,
        description: data.description || 'we can play!',
        players: [sk.username]
      })
      sk.join(data.roomId)
      sk.emit('room creation', {
        msg: 'created successfully',
        code: 1
      })
    })

    sk.on('join a room', function (data) {
      var roomId = data.roomId,
        emit = function (msg, code) {
          sk.emit('room join', {
            msg: msg,
            code: code
          })
        }
      roomList.rooms.forEach(function (e) {
        if (e.roomId == roomId) {
          if (e.players.length < 2) {
            sk.join(e.roomId)
            emit('successfully', 0)
            return
          } else emit('room full', 1)
        }
      })
      emit('no such room', 2)
    })

    sk.on('get room', function () {
      console.log(sk.rooms)
    })

    sk.on('leave room', function () {
      var i = sk.rooms.length - 1
      sk.leave(sk.rooms[i])
      setTimeout(function () {
        console.log(sk.rooms)
      }, 100)
    })
  })
  //app.listen(3000)

server.listen(3001);