console.log('background.js')

chrome.action.onClicked.addListener(async (tab) => {
  console.log('chrome.action - user clicked on extension icon!')

  const result = await chrome.storage.local.get(['videos'])
  const videosArr = result.videos
  const onlyVideoTitles = videosArr.map(item => item.title)

  chrome.tabs.sendMessage(tab.id, {message: 'Remove videos', data: onlyVideoTitles})
})