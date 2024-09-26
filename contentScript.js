(() => {
  chrome.runtime.sendMessage({ action: "startRecording" });
})();
