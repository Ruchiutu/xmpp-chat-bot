$(window.document).ready(function() {

  var socket = new Primus('//' + window.document.location.host)

  socket.on('error', function(error) { console.error(error) })
/*
  var handleItems = function(error, items) {
      if (error) return console.error(error)
      console.log('Node items received', items)
      $('ul.posts').empty()
      var content
      items.forEach(function(item) {
          content = '<li>'
          content += item.entry.atom.content.content
          content += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;by '
          content += item.entry.atom.author.name
          content += '</li>'
          $('ul.posts').append(content)
      })
  }

  var getNodeItems = function() {
      console.log('Retrieving node items')
      socket.send(
          'xmpp.buddycloud.retrieve',
          { node: '/user/team@topics.buddycloud.org/posts', rsm: { max: 5 } },
          handleItems
      )
  }

  var discoverBuddycloudServer = function() {
      socket.send(
          'xmpp.buddycloud.discover',
          { server: 'channels.buddycloud.org' },
          function(error, data) {
              if (error) return console.error(error)
              console.log('Discovered Buddycloud server at', data)
              getNodeItems()
          }
      )
  }
*/
  var login = function() {
      socket.send(
          'xmpp.login',
          {
               jid: 'deepak_webnexus@olark.com',
               password: 'Bewnexus(123)'
         }
      )
     
  }
socket.on('xmpp.connection', function(data) {
    console.log('Connected as', data.jid)
    window.jid= data.jid
    getRoomList()
    //discoverBuddycloudServer()
})
  var getRoomList = function()
  {
    var request = { of: 'deepak_webnexus@olark.com' }
     
      socket.send('xmpp.discover.items',request,function(error,items){
          console.log('Recieved room items',error,items);
          var list = $('#room-list ul')
          /* Remove our placeholder */
          list.find('li').remove()
          items.forEach(function(item) {
              /* only show the room name */
              var li = $('<li/>')
                    .attr('data-jid',item.jid)
                    .text(item.name)
                    .appendTo(list)
          });
      })
     /*
      setInterval(function(){
        console.log("xmpp presence get is called")
        getPersence()
       
       }, 3000);
       */
  }
  var getPersence = function(){
      socket.send('xmpp.presence.get',{
        "to": "deepak_webnexus@olark.com"
      })
  }
 
  
  socket.on('xmpp.muc.error',function(e){
      console.error('chat room error',e)
      if(e.error.condition === 'conflict')
      {
        return alert('nickname already in use')
      }
      alert('chat room error' + e.error.condition);
  })
  socket.on('xmpp-roster-push',function(user)
  {
      console.log('user_listing' + user)
  })

  socket.on('open', function() {
      console.log('Connected')
      login()
  })

  socket.on('timeout', function(reason) {
      console.error('Connection failed: ' + reason)
  })

  socket.on('end', function() {
      console.log('Socket connection closed')
      socket = null
  })
  
  socket.on('xmpp.error', function(error) {
      console.error('XMPP-FTW error', error)
  })
  
  socket.on('xmpp.error.client', function(error) {
      console.error('XMPP-FTW client error', error)
  })

  $(document).on('click', '#room-list li', function(e) {
    /* Clear any existing selected rooms */
    $('#room-list li.selected').attr('class', '')
    $(e.target).attr('class', 'selected')
    console.log('Chosen room is now', $(e.target).attr('data-jid'))
  })
  $('#room-list button').click(function() {
    var chosenRoom = $('#room-list li.selected')
    var nickname = $('#room-list input').val()
    if (0 === chosenRoom.length) {
        return alert('You must select a room')
    }
    if (!nickname) {
        return alert('You must enter a nickname')
    }
    var roomJid = chosenRoom.attr('data-jid')
    joinChatRoom(roomJid, nickname)
  })
  var joinChatRoom = function(roomJid, nickname) {
    var request = {
        room: roomJid,
        nick: nickname
    }
    window.mucDetails = request
    socket.send('xmpp.muc.join', request)
    }

    socket.on('xmpp.muc.error', function(e) {
        console.error('Chat room error', e)
        if (e.error.condition === 'conflict') {
            return alert('Nickname already in use')
        }
        alert('Chat room error: ' + e.error.condition)
    })

    socket.on('xmpp.muc.roster', function(user) {
        showChatWindow() 
        addUser(user)
    })
    var showChatWindow = function() {
    var isDisplayed = $('#chat-window').is(':visible')
    if (isDisplayed) return; /* Chat window is visible */
    $('#room-list').css('display', 'none')
    $('#chat-window').css('display', 'block')
    }

    var addUser = function(user) {
    /* remove the placeholder */
    $('li[data-role="placeholder"]').remove()
    var userEntry = $('.user-list li[data-nick="' + user.nick + '"]')
    if (0 === userEntry.length) return newUser(user)
    if ('none' === user.role) return removeUser(userEntry)
    /* Otherwise we have nothing to do */
    }

    var newUser = function(user) {
    cssClass = ''
    if (user.status && (-1 !== user.status.indexOf(110))) {
        cssClass = 'current-user'
    }
    entry = '<li data-nick="' + user.nick
        + '" class="' + cssClass + '">'
        + user.nick + '</li>'
    $('.user-list ul').append(entry)
    }

    var removeUser = function(user) {
    user.remove()
    }

    var addMessage = function(message) {
        console.log(message);
        if (!message.content) return /* ignore non-content messages */
        var cssClass = ''
        if (message.private) cssClass += ' muc-private'
        if (message.nick === window.mucDetails.nick) {
            cssClass += ' muc-current-user'
        }
        var dt = $('<dt class="' + cssClass + '"/>')
        dt.text(message.nick)
        var dd = $('<dd class="' + cssClass + '"/>')
        dd.text(message.content)
        /* If the message mentions us, highlight it */
        var regex = new RegExp(window.mucDetails.nick, 'gi')
        var replace = '<strong>' + window.mucDetails.nick + '</strong>'
        dd.html(dd.html().replace(regex, replace))
        $('.chat dl').append(dt)
        $('.chat dl').append(dd)
        /* Scroll to bottom of chat area */
        $('.chat').scrollTop($('.chat')[0].scrollHeight)
    } 

   socket.on('xmpp.muc.message',function(message){
       console.log("test");
   })
   /* 
   socket.on('xmpp.chat.message',function(message){
        console.log("message"+message)
    })
*/
    $('#chat-window button').click(function() {
    var chatMsg = $('.post textarea')
    if (!chatMsg.val()) return
    var message = {
        room: window.mucDetails.room,
        content: chatMsg.val()
    }
    socket.send('xmpp.muc.message', message)
            chatMsg.val('')
    })


    
    
})
