// background.js
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
      chrome.tabs.update(tab.id, { url: "https://contributor.stock.adobe.com/en/uploads" });
  }
});