$(document).ready(() => {
  
    $(function () {
      //Check for the current task in the database, if it already exists then the current duration is shown
      chrome.tabs.query({active:true,currentWindow:true},function(tabs){
      //The task id are the digits after the last slash
      var taskId = tabs[0].url.substr(tabs[0].url.lastIndexOf('/')+1);
      $.ajax({ url: "https://api.mlab.com/api/1/databases/asana-time-tracker/collections/task-entry?q={\"task_id\":\""+taskId+"\"}&apiKey=omy9HzMATiLB1SlUDJfkjvB-Q1LVV0tj",
            type: "GET"}).then(function(tasks){
              console.log(tasks[0]);
              $('#duration').val(tasks[0].duration)
            })
      });


      $('#trackTask').click(function(){
        chrome.tabs.query({active:true,currentWindow:true},function(tabs){

        //The task id are the digits after the last slash
        var taskId = tabs[0].url.substr(tabs[0].url.lastIndexOf('/')+1);

        //Insert entry in mongo using REST API
        $.ajax({ url: "https://api.mlab.com/api/1/databases/asana-time-tracker/collections/task-entry?u=true&q={\"task_id\":\""+ taskId +"\"}&apiKey=omy9HzMATiLB1SlUDJfkjvB-Q1LVV0tj",
        		  data: JSON.stringify({ "$set":{"task_id" : taskId,"duration":$('#duration').val()}}),
        		  type: "PUT",
        		  contentType: "application/json" }).then(function(data){
                $('#duration').val('');
                var notificationOptions = {type:"basic",title:"Task Tracked",message:"The task has been successfully tracked.",iconUrl:"asana-exporter-icon.png"};
                chrome.notifications.create('tasktracked',notificationOptions,function(){
                  window.close();
                });
              });
          });

      });


      // Configure Timer
      // We first get all the variables we need
      let $duration = $("#duration")

      let $timer = $("#timer")
      let $startT = $("#start-t")
      let $pauseT = $("#pause-t")
      let $applyT = $("#apply-t")

      let seconds = 0;  // current seconds that have been measured by timer
      let tRunning = false; // whether timer is ticking or not (by defautlt timer is not ticking)

      (function timerTick() {
        setTimeout(function () {
          $timer.text(secondsFormat(seconds))
          if (tRunning) seconds += 1
          timerTick()
        }, 1000);
      })()

      function secondsFormat(s) {
        let hours = Math.floor(s / 3600);
        let minutes = Math.floor((s - (hours * 3600)) / 60);
        let seconds = s - (hours * 3600) - (minutes * 60);

        return hours + ":" + minutes + ":" + seconds
      }

      $startT.click(() => {
        tRunning = true
      })
      $pauseT.click(() => {
        tRunning = false
      })
      $applyT.click(() => {
        let currentDuration = $duration.val() ? parseFloat($duration.val()) : 0.0
        let timerDuration = seconds / 3600
        $duration.val(currentDuration + timerDuration)

        seconds = 0
        tRunning = false
      })

    });

  });
