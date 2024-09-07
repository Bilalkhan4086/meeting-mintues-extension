// adding a new bookmark row to the popup
const addNewBookmark = () => {};

const viewBookmarks = () => {};

const onPlay = (e) => {};

const onDelete = (e) => {};

const setBookmarkAttributes = () => {};

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Get the URL of the active tab
    let activeTab = tabs[0];
    let activeTabUrl = activeTab.url;
    let isInMeeting = activeTabUrl.match(
      /\b(?:https?:\/\/)?(?:www\.)?meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}\b/
    );
    console.log("isInMeeting", isInMeeting);
    // Display the URL in the popup
    if (isInMeeting) {
      document.getElementById(
        "url"
      ).textContent = `You are in meeting and your meeting link is ${activeTabUrl.slice(
        24
      )}`;

      ///

      let recognition;
      let isRecognizing = false;

      document.getElementById("startBtn").addEventListener("click", () => {
        if (!isRecognizing) {
          startRecognition();
        }
      });

      document.getElementById("stopBtn").addEventListener("click", () => {
        if (isRecognizing) {
          stopRecognition();
        }
      });

      function startRecognition() {
        recognition = new (window.SpeechRecognition ||
          window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.interimResults = true; // Get real-time results
        recognition.continuous = true; // Keep listening until manually stopped

        recognition.onresult = function (event) {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          document.getElementById("transcript").textContent = transcript;
        };

        recognition.onerror = function (event) {
          if (event.error === "not-allowed") {
            alert(
              "Microphone access is blocked. Please allow the microphone in your browser settings."
            );
          } else {
            console.error("Error occurred in recognition:", event.error);
          }
        };

        recognition.onend = function () {
          isRecognizing = false;
          document.getElementById("stopBtn").disabled = true;
          document.getElementById("startBtn").disabled = false;
        };

        recognition.start();
        isRecognizing = true;
        console.log("Is recognizing", isRecognizing);
        document.getElementById("startBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;
      }

      function stopRecognition() {
        if (recognition) {
          recognition.stop();
          isRecognizing = false;
          document.getElementById("startBtn").disabled = false;
          document.getElementById("stopBtn").disabled = true;
        }
      }

      ///
    } else {
      document.getElementById("url").textContent = activeTabUrl;
    }
  });
});
