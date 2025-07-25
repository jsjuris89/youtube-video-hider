console.log('content.js')

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

function getDomElements(mutationNode) {
  const container = mutationNode.parentElement
  // HTMLCollection --> array
  const children = [...container.children]
  return children
}
function maybeRemove(children, storageVideoTitles) {
  children.forEach(el => {
    const videoLinkEl = el.querySelector('a#video-title-link');
    const videoTitle = videoLinkEl.title

    const isVideoInDOM = storageVideoTitles.some(item => item === videoTitle)
    if (isVideoInDOM) {
      el.remove()
    }
  })
}
function removeNow(videoNames) {
  const allVideosInfoEl = document.querySelectorAll('#contents > ytd-rich-item-renderer a#video-title-link')

  for (const element of allVideosInfoEl) {
    videoNames.forEach(videoTitle => {
      if (element.title === videoTitle) {
        element.closest('ytd-rich-item-renderer').remove()
      }
    })
  }
}

waitForElement('#contents', (element) => {
  element.addEventListener('click', (e) => {
    const url = e.target.closest('a#thumbnail').href
    const title = e.target.closest('#dismissible').querySelector('#details a#video-title-link').title

    chrome.storage.local.get('videos', (result) => {
      const savedVideos = result.videos || [];
      savedVideos.push({ title, url })

      chrome.storage.local.set({ videos: savedVideos })
    })
  });
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // console.log('matches #contents:', mutation.target.matches('#contents'));
    if (mutation.target.matches('#contents')) {
      mutation.addedNodes.forEach((node) => {
        if (node.matches('ytd-rich-item-renderer')) {
          const children = getDomElements(node)

          chrome.storage.local.get(['videos'], (result) => {
            const videosArr = result.videos
            const onlyVideoTitles = videosArr.map(item => item.title)
            maybeRemove(children, onlyVideoTitles)
          })
        }
      });
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request:', request)

  if (request.message === 'Remove videos') {
    const videoTitles = request.data
    removeNow(videoTitles)
  }
})



