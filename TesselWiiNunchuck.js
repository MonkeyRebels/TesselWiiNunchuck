
var tessel = require('tessel'); // import tessel
var port = tessel.port['GPIO'];

var slaveAddress = 0x52;
var i2c = new port.I2C(slaveAddress);

var interval = 100;

var status = [];
var acc = []; // x,y,z

var lastJoyX = 0;
var lastJoyY = 0;
var lastZ = false;
var lastC = false;

var zeroJoyX;
var zeroJoyY;

var DEFAULT_ZERO_JOY_X = 119;
var DEFAULT_ZERO_JOY_Y = 123;


//ini
i2c.send ( new Buffer([0xF0, 0x55]), function(err){ console.log('Connecting');} );

//a little timeout to warm up the chuck
setTimeout(function() {
	i2c.send ( new Buffer([0xFB, 0x00]), function(err){ console.log('Connected');} );
}, 1);


setInterval(function () {

    update();            

    zeroJoyX = DEFAULT_ZERO_JOY_X;
    zeroJoyY = DEFAULT_ZERO_JOY_Y;

    console.log("Z", lastZ);
    console.log("C", lastC);
    console.log("X", lastJoyX);
    console.log("Y", lastJoyY);
    console.log("Acceleration", acc);
	console.log("---");

},interval);


function update() {

	i2c.receive(6, function(err, rxbuf) { 
 	
    lastZ = buttonZ;
    lastC = buttonC;

    buttonZ = !((rxbuf[5] >> 0) & 1);
    buttonC = !((rxbuf[5] >> 1) & 1);

    lastJoyX = readJoyX();
    lastJoyY = readJoyY();

    joyX = (rxbuf[0]);
    joyY = (rxbuf[1]);

    for (i = 0; i < 3; i++)  {

        acc[i] = (rxbuf[i+2] << 2) | ((rxbuf[5] >> 2) & 3);
  		acc[i] = (rxbuf[i+2] << 2) | ((rxbuf[5] >> 4) & 3);
  		acc[i] = (rxbuf[i+2] << 2) | ((rxbuf[5] >> 6) & 3);

 	}

	i2c.send ( new Buffer([0x00, 0x00]), function(err){ console.log('Sending 0 to get new data');} );
 	
 });

}

//when calibrated
function readJoyX() {
    return joyX - zeroJoyX;
}

function readJoyY() {
    return joyY - zeroJoyY;
}

