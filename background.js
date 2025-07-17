console.log('background.js')

const searchArr = ['What even is an AI Agent?!', 'THIS BLEW MY MIND']

chrome.action.onClicked.addListener((tab) => {
  console.log('chrome.action running')

  chrome.tabs.sendMessage(tab.id, {message: 'Remove videos', data: searchArr})
})