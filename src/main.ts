import './style.css'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class='wrapper' id="options">
    <span class="title">Simple Webcam Presenter.</span>
    <span class='sub-title'>Settings:</span>
    <label>
      Diagonal: 
      <input id="width" placeholder="200" value="200"/>
    </label>
    <label>
      Picture in Picture by default: 
      <input type="checkbox" id="pip" />
    </label>
    
    <span class="text">
      Base hotkey is: <span class="btn-key">⌘</span>+ <span class="btn-key">SHIFT</span>+ <span class="btn-key">W</span>
      <br/>
      Configurable at: chrome://extensions 
    </span>
    
    <div class="credits">
      <h4> Developed: by Dan Skiba</h4>
    </div>
  </div>
`

function changeSettings({ k, v }: { k: string, v: any }) {
  console.log({ k, v })
  function getRightValue(k: string,v: any) {
    if (k === 'width') return v + 'px'
    return v
  }
  const VIDEO_ID = 'SWP_draggable-web-cam'
  const video = document.getElementById(VIDEO_ID) as HTMLVideoElement
    if(k === 'pip') {
      if(!document.pictureInPictureElement) {
        video.requestPictureInPicture()
      } else {
        document.exitPictureInPicture()
      }
      return
    }
    const value = getRightValue(k,v)
    console.log({ value })
    // @ts-ignore
    video.style[k] = value
}

const inputs = document.querySelectorAll('input')
if (inputs) {
  inputs.forEach((input) => {
    const id = input.id
    input.addEventListener('change', async (e) => {
      const inputEl = e.currentTarget as HTMLInputElement
      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: changeSettings,
          args: [{ k: id, v: inputEl.value }]
        })
      }
    })
  })
}


function AddCam() {
  const VIDEO_ID = 'SWP_draggable-web-cam'
  if (document.getElementById(VIDEO_ID)) return
  const el = document.querySelector('body')
  if (!el) return
  const video = document.createElement('video')
  video.setAttribute('playsinline', '')
  video.setAttribute('autoplay', '')
  video.setAttribute('muted', '')

  const facingMode = 'user' // Can be 'user' or 'environment' to access back or front camera (NEAT!)
  const constraints = {
    audio: false,
    video: {
      facingMode: facingMode,
    },
  }

  video.id = VIDEO_ID
  video.style.width = '200px'
  video.style.height = '200px'
  video.style.position = 'fixed'
  video.style.bottom = '24px'
  video.style.right = '24px'
  video.style.borderRadius = '50%'
  video.style.zIndex = '10000000019'
  video.style.objectFit = 'cover'
  video.style.cursor = 'pointer'
  video.style.transition = 'width 0.2s easy-in-out'

  video.addEventListener('enterpictureinpicture', (e: Event) => {
    const target = e.currentTarget as HTMLVideoElement
    target.style.width = '0px'

  })

  video.addEventListener('leavepictureinpicture', (e: Event) => {
    const target = e.currentTarget as HTMLVideoElement
    target.style.width = '200px'
  })

  navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
    video.srcObject = stream
  })
  el.appendChild(video)

  function dragElement(elmnt: HTMLElement) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0
    elmnt.onmousedown = dragMouseDown

    function dragMouseDown(e: MouseEvent) {
      e.preventDefault()
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      document.onmousemove = elementDrag
    }

    function elementDrag(e: MouseEvent) {
      e.preventDefault()
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      elmnt.style.top = elmnt.offsetTop - pos2 + 'px'
      elmnt.style.left = elmnt.offsetLeft - pos1 + 'px'
    }

    function closeDragElement() {
      document.onmouseup = null
      document.onmousemove = null
    }
  }

  // const defaultOptions = c
  // console.log({ optoins })
  // const changeSettingsHandler = changeSetting()
  dragElement(video)
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

let tab: chrome.tabs.Tab;
(async () => {
  tab = await getCurrentTab()
  console.log(tab)
  if (tab?.id) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: AddCam })
  }
})()
