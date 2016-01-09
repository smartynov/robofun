var robot = require("node-robot");
var scheduler = new robot.Scheduler();
var adapter = new robot.ev3.Adapter("/dev/tty.EV3-SerialPort");
var motors = new robot.ev3.Motors(adapter);

var leapjs = require('leapjs');
var controller = new leapjs.Controller();

var smooth = 0.5;
var speed = 0;
var speedDiff = 0;
var speedLeft = 0;
var speedRight = 0;

process.on('SIGINT', function() {
  //when the user hits ctrl+c, close the adapter
  scheduler.interrupt(function(){
    console.log("stop!");
    motors.set("*", 0, function(){
      console.log("STOP!");
      adapter.close();
      process.exit(0);
    });
  });
});

controller.on('deviceFrame', function(frame) {
//  console.log(frame.hands.length);
  if (frame.hands.length>0) {
    var hand = {};
    ['palmPosition','direction','palmVelocity','palmNormal','valid','type','confidence','roll','pitch','yaw']
      .map(function(k){ hand[k] = typeof(frame.hands[0][k]) == 'function' ? frame.hands[0][k]() : frame.hands[0][k]; });
//    console.log(hand);
    speed = smooth * speed + (1.0-smooth) * Math.max(-100, Math.min(100, -180 * hand.pitch));
    speedDiff = smooth * speedDiff + (1.0-smooth) * Math.max(-70, Math.min(70, 80 * (hand.roll)));
//    speed = smooth * speed + (1.0-smooth) * Math.max(-100, Math.min(100, -120 * hand.pitch * hand.pitch * (hand.pitch>0?1:-1)));
//    speedDiff = smooth * speedDiff + (1.0-smooth) * Math.max(-70, Math.min(70, 80 * hand.roll * hand.roll * (hand.roll>0?1:-1)));
    speedLeft  = Math.round( speed - speedDiff );
    speedRight = Math.round( speed + speedDiff );
  }
  else {
    speed = speedDiff = speedLeft = speedRight = 0;
  }
});

adapter.on("ready", function(){
  scheduler.sequence(function(){
    motors.set("*", 0);
  })
  .wait(function(){
    console.log("motors.set",speed);
    console.log("   speedLeft",speedLeft);
    console.log("  speedRight",speedRight);
    motors.set({"A": speedLeft, "D": speedRight});
    return false;
  })
  .schedule();
});

controller.connect();
