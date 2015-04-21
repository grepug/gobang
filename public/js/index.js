var role = 'white';
var versus = [];
var myturn = true;

$(function () {

  var $table = $('table');
  for (var i = 0; i < 15; i++) {
    versus[i] = [];
    for (var j = 0; j < 15; j++)
      versus[i][j] = null;
  }
  $table.html(createTable()).delegate('.empty', 'click', function () {
    if (firstFlag) {
      alert('请先进入房间');
      return;
    }

    if (!myturn) {
      alert('对面还没走，别着急！！！！');
      return;
    }

    role = role == 'white' ? 'black' : 'white';
    var $this = $(this),
      x = $this.data('x'),
      y = $this.data('y');
    $this.replaceWith("<img class='pawn' data-x='" + x + "' data-y='" + y + "' src='img/" + role + ".jpg'>");
    versus[x][y] = role;

    console.log(versus);

    room.send({
      currentStep: [x, y],
      versus: versus,
      nextRole: role
    }, function (data) {

      // 发送成功之后的回调
      myturn = false;

      showLog('自己： ', "x:" + x + " y:" + y);
      printWall.scrollTop = printWall.scrollHeight;

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
    });
  });


  $(".empty").text('`');


  //  $(window).bind('beforeunload', function () {
  //    return '您输入的内容尚未保存，确定离开此页面吗？';
  //  });
});

function createTable() {
  var ret = '';
  for (i = 0; i < 15; i++) {
    ret += '<tr>';
    for (j = 0; j < 15; j++) {
      ret += '<td><a class="pawn empty" data-x="' + i + '" data-y="' + j + '"></td>';
    }
    ret += '</tr>';
  }
  return ret;
}

function isWin() {
  //横着赢
  for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 15; j++) {
      var winArr = straightEqual(false, '+', i, j)
      if (winArr) return winArr;
    }
  }
  //竖着赢
  for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 15; j++) {
      var winArr = straightEqual('+', false, i, j)
      if (winArr) return winArr;
    }
  }
  //躺着赢
  for (var i = 0; i < 14; i++) {

    for (var j = 0; j < 14; j++) {

      if (i <= 10 && j <= 10) {
        var winArr = straightEqual('+', '+', i, j);
        if (winArr) return winArr;
      }
      if (i >= 4 && j >= 4) {
        var winArr = straightEqual('-', '-', i, j);
        if (winArr) return winArr;
      }
      if (i >= 4 && j <= 10) {
        var winArr = straightEqual('-', '+', i, j);
        if (winArr) return winArr;
      }
      if (i <= 10 && j >= 4) {
        var winArr = straightEqual('+', '-', i, j);
        if (winArr) return winArr;
      }
    }
  }
  return false;
}

function straightEqual(m, m1, _i, _j) {
  if (versus[_i][_j] == null) return false;
  var winArr = [[_i, _j]];
  for (var i = 1; i <= 4; i++) {

    if (!m && m1 == '+') {
      if (versus[_i][_j] != versus[_i][_j + i]) return false;
      winArr.push([_i, _j + i]);
    }
    if (!m && m1 == '-') {
      if (versus[_i][_j] != versus[_i][_j - i]) return false;
      winArr.push([_i, _j - i]);
    }
    if (m == '+' && !m1) {
      if (versus[_i][_j] != versus[_i + i][_j]) return false;
      winArr.push([_i + i, _j]);
    }
    if (m == '+' && m1 == '+') {
      if (versus[_i][_j] != versus[_i + i][_j + i]) return false;
      winArr.push([_i + i, _j + i]);
    }
    if (m == '+' && m1 == '-') {
      if (versus[_i][_j] != versus[_i + i][_j - i]) return false;
      winArr.push([_i + i, _j - i]);
    }
    if (m == '-' && !m1) {
      if (versus[_i][_j] != versus[_i - i][_j]) return false;
      winArr.push([_i - i, _j]);
    }
    if (m == '-' && m1 == '+') {
      if (versus[_i][_j] != versus[_i - i][_j + i]) return false;
      winArr.push([_i - i, _j + i]);
    }
    if (m == '-' && m1 == '-') {
      if (versus[_i][_j] != versus[_i - i][_j - i]) return false;
      winArr.push([_i - i, _j - i]);
    }

  }
  return winArr;
}