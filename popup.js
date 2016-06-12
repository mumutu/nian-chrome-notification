function loadUsers(){
  $("#list").empty();
  if(localStorage.users){
    localStorage.users.split(",").forEach(appendUser);
    $('.remove').click(function(evt){
      var user = $(this).prev().text();
      removeUser(user);
      loadUsers();
    });
  }
}

function appendUser(uid){
  $("#list").append("<li>"+ uid +"</li><button class='remove'>删除</button>");
}

function removeUser(user){
  if(localStorage.users){
    var userArray = localStorage.users.split(",");
    var index = userArray.indexOf(user);
    userArray.splice(index,1);
    localStorage.users = userArray;
  }
}

function addUser(user){
  var userArray = [];
  if(localStorage.users){
    userArray = localStorage.users.split(",");
  }

  if(userArray.indexOf(user) == -1 && /\d+/.test(user)){
    userArray.push(user);
  }

  localStorage.users = userArray;
}

document.addEventListener('DOMContentLoaded', function () {
  loadUsers();


  $('#add_button').click(function(evt){
    var user = $("#add").val();
    if(user && user.length){
      addUser(user);
      loadUsers();
    }
  });
});
