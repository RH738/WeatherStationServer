var express = require('express');
var app = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mqtt = require('mqtt')
var client = mqtt.connect({
  host: '192.168.0.168',
  port: 1883,
  username: 'homeassistant',
  password: 'asd00222'
})
var fs = require('fs')

var temperature_filename = undefined
var humidity_filename = undefined

io.on('connection', function(socket) {
  var timestamp = new Date().toISOString().split('T');
  if(!temperature_filename){
    var temperature_filename_test = __dirname + "/weather_data/temperature_" + timestamp[0] + ".txt";
    if(fs.existsSync(temperature_filename_test)){
      temperature_filename = temperature_filename_test;
    } else {
      return
    }
  }
  if(!humidity_filename){
    var humidity_filename_test = __dirname + "/weather_data/humidity_" + timestamp[0] + ".txt";
    if(fs.existsSync(humidity_filename_test)){
      humidity_filename = humidity_filename_test;
    } else {
      return
    }
  }
  // if (!temperature_filename || !humidity_filename) {
  //   return;
  // } else {
    var temperature = fs.readFileSync(temperature_filename, encoding = 'utf8')
      .split('\n')
      .filter(curr => curr.length > 0)
      .map(curr => {
        var data = curr.split('\t')
        return {
          timestamp: data[0],
          temperature: data[1]
        }
      })
    socket.emit('temperature_data', temperature)

    var humidity = fs.readFileSync(humidity_filename, encoding = 'utf8')
      .split('\n')
      .filter(curr => curr.length > 0)
      .map(curr => {
        var data = curr.split('\t')
        return {
          timestamp: data[0],
          humidity: data[1]
        }
      })
    socket.emit('humidity_data', humidity)
  // }
});

client.on('connect', function() {
  console.log("connected to mqtt!");
  client.subscribe('weather/temperature')
  client.subscribe('weather/humidity')
})

client.on('message', function(topic, message) {
  var timestamp = new Date().toISOString().split('T');
  if (topic === 'weather/temperature') {
    temperature_filename = __dirname + "/weather_data/temperature_" + timestamp[0] + ".txt"
    fs.appendFile(temperature_filename, timestamp[1].split('.')[0] + '\t' + message.toString() + '\n', 'utf8')
  } else if (topic === 'weather/humidity') {
    humidity_filename = __dirname + "/weather_data/humidity_" + timestamp[0] + ".txt"
    fs.appendFile(humidity_filename, timestamp[1].split('.')[0] + '\t' + message.toString() + '\n', 'utf8')
  }
})

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
server.listen(55055);
