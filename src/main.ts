// import typescriptLogo from './typescript.svg'
import './style.css'
// @ts-ignore
import { createVideo, dragElement, VIDEO_ID } from './utils'
import './chrome'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class='wrapper bg-gray-900' id="wrapper">
  <span>hello world</span>
  <button id="webcam_btn">click me</button>
  <div id="videoWrapper"/>
  </div>
`

const video = createVideo(VIDEO_ID, document.getElementById('wrapper'))
if (video) {
  document.querySelector('#videoWrapper')!.appendChild(video)
}


function getAlert() {
  alert('hello worldsx')
}
const btn = document.querySelector('#webcam_btn')
console.log('here', btn)
if (btn) {
  // btn.addEventListener('click', async () => {
  //   await chrome.tabs.getCurrent(tab => {
  //     console.log('tab', tab )
  //     if (tab?.id) {
  //       chrome.scripting.executeScript({
  //         target: { tabId: tab.id },
  //         func: getAlert
  //       })
  //     }
  //   })
  // })

  chrome.action.onClicked.addListener((tab) => {
      console.log({ tab })
        if (tab?.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getAlert
          })
        }
  })


}


// if(video) dragElement(video);

// setTimeout(() => video.requestPictureInPicture(), 3000);

// Make the DIV element draggable:
// dragElement(document.getElementById(id));

