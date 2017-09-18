$(window.document).ready(function() {
  var socket = new Primus('http://localhost:3000', { });
  socket.on('error', function(error) {
    console.log(error) 
  })
  socket.on('connect', function() {
    console.log('connected') 
  })
  socket.on('connect.fail', function(reason) {
    console.log('Connection failed: ' + reason) 
  })
  socket.on('disconnect', function() { 

  })
  socket.on('xmpp.connection', function(status) {
      console.log(JSON.stringify(status))
      console.log(status.status)
    // if(status.status == 'online'){ socket.send('xmpp.presence' , {"show":"online"} ) // } 
    })
    socket.on('xmpp.error', function(error) {
      console.log(error) 
    })
    socket.on('xmpp.chat.message', function(data) {
      console.log(data) 
    })
    socket.on('xmpp.presence', function(data) {
      console.log(data); 
    })
    socket.on('xmpp.presence.error',function(data) {
      console.log(data); 
    })
    socket.on('xmpp.presence.subscribe', function(data) {
      console.log(data) 
    })
    socket.on('xmpp.roster.push', function(data) {
      console.log(data); 
    })
  });