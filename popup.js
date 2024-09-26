document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeTab = tabs[0];
    let activeTabUrl = activeTab.url;
    let isInMeeting = activeTabUrl.match(
      /\b(?:https?:\/\/)?(?:www\.)?meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}\b/
    );
    console.log("isInMeeting", isInMeeting);

    if (isInMeeting) {
      document.getElementById(
        "url"
      ).textContent = `You are in a meeting and your meeting link is ${activeTabUrl.slice(
        24
      )}`;

      let mediaRecorder;
      let recordedChunks = [];
      let combinedStream; // Store the combined stream globally
      let hasPermission = false; // Flag to track if we already have permissions

      // Function to get the media streams (screen + mic)
      async function getMediaStreams() {
        try {
          // Capture the screen (with tab/system audio)
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

          // Capture the microphone
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Use AudioContext to synchronize audio streams
          const audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();

          // Create audio nodes for microphone and screen audio
          const screenAudio =
            audioContext.createMediaStreamSource(screenStream);
          const micAudio = audioContext.createMediaStreamSource(micStream);

          // Connect both audio tracks to the same destination
          screenAudio.connect(destination);
          micAudio.connect(destination);

          // Combine both video and synchronized audio into one stream
          combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ]);

          hasPermission = true; // Set flag that we have permission now
        } catch (err) {
          console.error("Error capturing streams:", err);
        }
      }

      document.getElementById("start-record").onclick = async () => {
        if (!hasPermission) {
          await getMediaStreams(); // Request permissions only if not already done
        }

        if (combinedStream) {
          mediaRecorder = new MediaRecorder(combinedStream);

          mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
              recordedChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = function () {
            const blob = new Blob(recordedChunks, {
              type: "video/webm",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "google-meet-recording.webm";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          };

          mediaRecorder.start();
          document.getElementById("start-record").disabled = true;
          document.getElementById("stop-record").disabled = false;
        }
      };

      document.getElementById("stop-record").onclick = () => {
        mediaRecorder.stop();
        document.getElementById("start-record").disabled = false;
        document.getElementById("stop-record").disabled = true;
      };
    } else {
      document.getElementById("url").textContent = activeTabUrl;
    }
  });
});
