console.log('content.js')

// removes videos as user scrolls has nothing to do with initial load
const observer = new MutationObserver((mutations) => {
  
  mutations.forEach((mutation) => {
    // console.log('matches #contents:', mutation.target.matches('#contents'));
    
    // Check if the mutation happened in the #contents container
    if (mutation.target.matches('#contents')) {
      // debug steps
      if (mutation.addedNodes.length) {
        console.log('mutation.target:', mutation.target);
        console.log('addedNodes:', mutation.addedNodes.length);
      }

      mutation.addedNodes.forEach((node) => {
        // debug
        // console.log('show addedNodes node:', node)
        if (node.matches('ytd-rich-item-renderer')) {
          console.log('Actual node!')
          console.log('PARENT --->', node.parentElement)

          const container = node.parentElement
          const htmlChildren = container.children
          const children = [...htmlChildren]

          // get data from storage
          chrome.storage.local.get(['videos'], (result) => {
            const videosArr = result.videos
            const onlyVideoTitles = videosArr.map(item => item.title)

            children.forEach(domEl => {
              const videoLinkEl = domEl.querySelector('a#video-title-link');
              const videoTitle = videoLinkEl.title

              const isVideoInDOM = onlyVideoTitles.some(item => item === videoTitle)
              if (isVideoInDOM) {
                domEl.remove()
              }
            })
          })
        }

        const videoLinkEl = node.querySelector('a#video-title-link');
        if (videoLinkEl) {
          chrome.storage.local.get(['videos'], (result) => {
            const videosArr = result.videos
            const onlyVideoTitles = videosArr.map(item => item.title)

            const currentVideoTitle = videoLinkEl.title
            // console.log('currentVideoTitle:', currentVideoTitle)

            const test = onlyVideoTitles.some(item => {
              return item === currentVideoTitle
            })

            if (test) {
              // console.log(`Removed video ${currentVideoTitle}`)
              videoLinkEl.closest('ytd-rich-item-renderer').remove()
            } else {
              // console.log('This video was not removed.')
            }
          })
        }
      });
    }
  });
});
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