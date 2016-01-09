var leapjs = require('leapjs');
var controller = new leapjs.Controller();

controller.on('deviceFrame', function(frame) {
  console.log(frame.hands.length);
  if (frame.hands.length>0) {
    var hand = {};
    ['palmPosition','direction','palmVelocity','palmNormal','valid','type','confidence','roll','pitch','yaw']
      .map(function(k){ hand[k] = typeof(frame.hands[0][k]) == 'function' ? frame.hands[0][k]() : frame.hands[0][k]; });
    console.log(hand);
  }
});

controller.connect();
