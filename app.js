var express = require('express');
var app = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mqtt = require('mqtt')
var client = mqtt.connect({
  host: 'localhost',
  port: 1883
})
var fs = require('fs')

var temperature_filename = undefined
var humidity_filename = undefined

io.on('connection', function(socket) {
  if (!temperature_filename || !humidity_filename) {
    return;
  } else {
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
  }
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
server.listen(3000);
