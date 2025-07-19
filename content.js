console.log('content.js')

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    // have full list of videos not just initial 2
    if (mutation.target.matches('#contents') && mutation.addedNodes.length > 3) {
      const videos = mutation.target.querySelectorAll('ytd-rich-item-renderer a#video-title-link')

      chrome.storage.local.get(['videos'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          return;
        }
        const videosArr = result.videos
        const onlyVideoTitles = videosArr.map(item => item.title)

        for (const element of videos) {
          onlyVideoTitles.forEach(videoTitle => {
            if (element.title === videoTitle) {
              element.closest('ytd-rich-item-renderer').remove()
              console.log(`Video with title %c${videoTitle}%c was removed.`, 'color: darkorange;', '')
            }
          })
        }
      })
    }
  })
})
observer.observe(document.body, { childList: true, subtree: true });
  
function remove(videoNames) {
  console.log('removing....')
  const allVideosInfoEl = document.querySelectorAll('#contents > ytd-rich-item-renderer a#video-title-link')
  console.log('allVideosInfoEl:', allVideosInfoEl)

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

function waitForElement(selector, callback) {
  const el = document.querySelector(selector);
  if (el) {
    callback(el);
  } else {
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        console.log('el:', el)
        observer.disconnect();
        callback(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

waitForElement('#contents', (element) => {
  element.addEventListener('click', (e) => {
    const url = e.target.closest('a#thumbnail').href
    const title = e.target.closest('#dismissible').querySelector('#details a#video-title-link').title
    console.log(title, url)

    chrome.storage.local.get('videos', (result) => {
      const savedVideos = result.videos || [];
      savedVideos.push({ title, url })

      chrome.storage.local.set({ videos: savedVideos }, () => {
        console.log('Video info added to chrome.storage')
      })
    })
  });
});
