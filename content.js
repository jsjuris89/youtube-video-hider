console.log('content.js')
setTimeout(() => {
  const testEl = document.querySelector('#contents');
  console.log('Element check after 3s:', testEl);

  chrome.storage.local.get(['videos'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      return;
    }
  
    const videosArr = result.videos
    const onlyVideoTitles = videosArr.map(item => item.title)
    remove(onlyVideoTitles)
  })
}, 3000);

function remove(videoNames) {
  console.log('removing....')
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

function waitForElement(selector, callback) {
  const el = document.querySelector(selector);
  if (el) {
    callback(el);
  } else {
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
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

    chrome.storage.local.get('videos', (result) => {
      const savedVideos = result.videos || [];
      savedVideos.push({ title, url })

      chrome.storage.local.set({ videos: savedVideos }, () => {
        console.log('Video info added to chrome.storage')
      })
    })
  });
});
