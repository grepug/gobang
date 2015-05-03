var gb = io.connect('http://localhost:3001/')
$(function () {

  gb.on('list the rooms', function (data) {
    console.log(data)
  })

  gb.on('welcome', function (data) {
    console.log(data)
    gb.emit('res', {})
  })


})

function create(id) {
  gb.emit('create a room', {
    roomId: id || '14112313',
    roomName: 'first',
  })
}

function leave() {
  gb.emit('leave room')
}

function ql() {
  gb.emit('query room list')
}

function room() {
  gb.emit('get room')
}