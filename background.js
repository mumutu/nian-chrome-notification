
function getNianUrl(user) {
  if(user){
    return "http://nian.so/#!/user/"+user;
  }
  return "http://www.nian.so/";
}

function isNianUrl(url) {
  // Return whether the URL starts with the Gmail prefix.
  return url.indexOf(getNianUrl()) == 0;
}


function scheduleRequest() {
  console.log('scheduleRequest');
  // var randomness = Math.random() * 2;
  // var exponent = Math.pow(2, localStorage.requestFailureCount || 0);
  // var multiplier = Math.max(randomness * exponent, 1);
  // var delay = Math.min(multiplier * pollIntervalMin, pollIntervalMax);
  // delay = Math.round(delay);
  // console.log('Scheduling for: ' + delay);
  console.log('Creating alarm');
  // Use a repeating alarm so that it fires again if there was a problem
  // setting the next alarm.
  chrome.alarms.create('refresh', {periodInMinutes: 1});
}


function onAlarm(alarm) {
  console.log('Got alarm', alarm);
  // |alarm| can be undefined because onAlarm also gets called from
  // window.setTimeout on old chrome versions.
  if (alarm && alarm.name == 'watchdog') {
    onWatchdog();
  } else {
    startRequest({scheduleRequest:true});
  }
}

function onWatchdog() {
  chrome.alarms.get('refresh', function(alarm) {
    if (alarm) {
      console.log('Refresh alarm exists. Yay.');
    } else {
      console.log('Refresh alarm doesn\'t exist!? ' +
                  'Refreshing now and rescheduling.');
      startRequest({scheduleRequest:true});
    }
  });
}

function onInit() {
  console.log('onInit');
  startRequest({scheduleRequest:true});
}

function getUserSteps(user){
  var url = "http://api.nian.so/v2/user/" + user + "/steps?page=1";

  fetch(url)
    .then(function(rep){
      return rep.json();
    })
    .then(function(rep){
      var lastStep = rep.data.steps[0];
      console.log(lastStep);
      var lastDate = getUserLastDate(user);
      if(!lastDate || lastDate < lastStep.lastdate){
        //has no
        notify(lastStep.user + ":" + lastStep.title, lastStep.content.substring(0,20)+"...", lastStep.uid);
        setUserLastDate(lastStep.uid, lastStep.lastdate);
      }
    });
}

function getUserLastDate(user){
  return localStorage["nian-"+ user];
}

function setUserLastDate(user, lastDate){
  localStorage["nian-"+ user] = lastDate;
}

function getNewestAndNotify(user){
  getUserSteps(user)
}

// ajax stuff
function startRequest(params) {
  // Schedule request immediately. We want to be sure to reschedule, even in the
  // case where the extension process shuts down while this request is
  // outstanding.
  if (params && params.scheduleRequest) scheduleRequest();

  if(localStorage.users){
    var ids = localStorage.users.split(",");
    ids.forEach(getNewestAndNotify);
  }
}

function goToNian(user){
  console.log('Going to inbox...');
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isNianUrl(tab.url)) {
        console.log('Found Nian tab: ' + tab.url + '. ' +
                    'Focusing and refreshing count...');
        chrome.tabs.update(tab.id, {selected: true});
        return;
      }
    }
    console.log('Could not find Nian tab. Creating one...');
    chrome.tabs.create({url: getNianUrl(user)});
  });
}

function notify(title, message, user){
  chrome.notifications.create("nian::" + user, {"title":title, "message":message, "type":"basic", "iconUrl":"http://img.nian.so/head/"+user+".jpg"}, function(id){console.log(id)})
}

chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.browserAction.onClicked.addListener(goToNian);
chrome.notifications.onClicked.addListener(function(id){
  goToNian(id.split("::")[1]);
})