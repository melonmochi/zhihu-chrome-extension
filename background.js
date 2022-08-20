// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("zhihu auto reply started");
  onInit();
});

function onInit() {
  // 每分钟check下
  console.log("Initializing...");
  chrome.alarms.create("newMessage", { when: Date.now(), periodInMinutes: 1 });
}

function handleNewMessage() {
  var messageApiUrl = "https://www.zhihu.com/api/v4/messages";
  console.log("Scanning auto reply targets...");
  var messageThreadsURL = "https://www.zhihu.com/api/v4/me/message-threads";
  fetch(messageThreadsURL, {
    method: "get",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Received message data successfully", data);
      var results = data.data;
      var unreadUsers = results.filter(
        (user) =>
          // user.unread_count > 0 &&
          // !user.is_replied &&
          user.participant.url_token == "kon-67-47" &&
          user.participant.user_type == "people" &&
          !user.participant.is_org
      );

      console.log("UnreadUsers count:", unreadUsers.length);

      unreadUsers.forEach((user) => {
        var userId = user.participant.id;
        console.log(`User: ${userId}`);
        var body = {
          type: "common",
          content: "Hi",
          receiver_hash: userId,
        };
        console.log(`Message body: ${JSON.stringify(body)}`);
        fetch(`${messageApiUrl}`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }).then((response) => console.log(response));
      });
      // .map((user) => {
      //   // 有新私信
      //   console.log(`I'm user ${user.participant.id}`);
      // });
      console.log(unreadUsers);
    });
}

function checkUnreadMessage(alarm) {
  console.log("Got alarm", alarm);
  var targetLink_new = "https://www.zhihu.com/api/v4/me";

  // 获取新私信计数
  fetch(targetLink_new, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Data received successfully", data);
      var messageCount = data.messages_count;
      console.log("Unread messages counts: ", messageCount);

      // // TODO: Testing use!!!
      // handleNewMessage();

      // 有新私信
      if (messageCount > 0) {
        console.log(
          `There is unread message!! Total unread message: ${messageCount}`
        );
        handleNewMessage();
      }
    });
}

function onAlarm(alarm) {
  console.log("Got alarm", alarm);
  if (alarm && alarm.name == "newMessage") {
    checkUnreadMessage();
  }
}

chrome.alarms.onAlarm.addListener(onAlarm);
