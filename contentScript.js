(() => {
    let youtubeLeftControls, youtubePlayer, youtubeRightControls;
    let currentVideo = "";
    let currentVideoBookmarks = [];
  
    const fetchBookmarks = () => {
      return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        });
      });
    };
  
    const addNewBookmarkEventHandler = async () => {
      const currentTime = youtubePlayer.currentTime;
      const newBookmark = {
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
      };
  
      currentVideoBookmarks = await fetchBookmarks();
  
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
    };
  
    const newVideoLoaded = async () => {
      const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  
      currentVideoBookmarks = await fetchBookmarks();
  
      if (!bookmarkBtnExists) {
        const bookmarkBtnBox = document.createElement("div")
        bookmarkBtnBox.className = "ytn-button-box"
        bookmarkBtnBox.style = "width: 48px; height: 100%; display: inline-block; float: right; display: flex;align-items: center; justify-content: center;"

        const bookmarkBtn = document.createElement("img");
  
        // bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
        bookmarkBtn.src = chrome.runtime.getURL("assets/icon-plus.svg");
        bookmarkBtn.className = "ytp-button " + "bookmark-btn";
        bookmarkBtn.title = "Click to bookmark current timestamp";
        bookmarkBtn.style = "width: 24px; height: 24px"
  
        // youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];
        youtubePlayer = document.getElementsByClassName('video-stream')[0];
  
        // youtubeLeftControls.appendChild(bookmarkBtn);
        bookmarkBtnBox.appendChild(bookmarkBtn)
        youtubeRightControls.appendChild(bookmarkBtnBox);
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
      }
    };
  
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const { type, value, videoId } = obj;
  
      if (type === "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
      } else if (type === "PLAY") {
        youtubePlayer.currentTime = value;
      } else if ( type === "DELETE") {
        console.log('---onMessage[DELETE] value:', value);
        currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
  
        response(currentVideoBookmarks);
      }
    });
  
    newVideoLoaded();
  })();
  
  const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substr(11, 8);
  };
  