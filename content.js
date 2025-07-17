console.log('content.js')

function remove(videoNames) {
  const allVideosInfoEl = document.querySelectorAll('#contents > ytd-rich-item-renderer a#video-title-link')

  for (const element of allVideosInfoEl) {
    videoNames.forEach(videoTitle => {
      if (element.title === videoTitle) {
        element.closest('ytd-rich-item-renderer').remove()
      }
    })
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request:', request)

  if (request.message === 'Remove videos') {
    const videoTitles = request.data
    remove(videoTitles)
  }
})