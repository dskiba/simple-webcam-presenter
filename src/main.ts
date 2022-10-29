import './style.css'

type TOptions = Record<'pip' | 'width' | 'webcam', any>

chrome.storage.sync.get(['width', 'pip', 'webcam'], (result) => {
  const options: TOptions = { webcam: true, pip: false, width: '250' }
  Object.assign(options, result)
  const width = options.width ? options.width : '250'
  let os = 'MacOS'
  if (navigator.appVersion.indexOf('Win') != -1) os = 'Windows'
  if (navigator.appVersion.indexOf('Mac') != -1) os = 'MacOS'
  if (navigator.appVersion.indexOf('X11') != -1) os = 'UNIX'
  if (navigator.appVersion.indexOf('Linux') != -1) os = 'Linux'

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class='wrapper' id="options">
<h1 class="mb-1 leading-4 text-3xl font-extrabold text-gray-900 dark:text-white"><span class="text-xl text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Simple Webcam<span/></h1>
        <div class="mb-4">
            <label for="widht" class="block mb-2 text-sm font-medium text-gray-300">Radius (px)</label>
            <input type="number" id="width" class=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
            placeholder=${width} value=${width} 
            >
        </div>
            <label for="webcam" class="inline-flex relative items-center cursor-pointer">
      <span class="mr-3 text-sm font-medium text-gray-300">Webcam</span>
      <div class="inline-block relative">
      <input type="checkbox" value="" id="webcam" class="sr-only peer" checked>
      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
</div>
</label>
    <label for="pip" class="inline-flex relative items-center cursor-pointer">
      <span class="mr-3 text-sm font-medium text-gray-300">Picture in Picture</span>
      <div class="inline-block relative">
      <input type="checkbox" value="" id="pip" class="sr-only peer">
      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
</div>
</label>
<div class="mt-auto">
    <span class="text">
      Shortcut: 
<kbd class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Shift</kbd>
<kbd class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">${os === 'MacOS' ? '⌥ Option' : 'Alt'}</kbd>
<kbd class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">W</kbd>

      <br/>
      <span class="text-small">configurable at: chrome://extensions/shortcuts</span> 
    </span>
</div>
  </div>
`

  function changeSettings({ k, v, meta }: { k: string, v: string, meta: Record<string, any> }) {
    const VIDEO_ID = 'SWP_draggable-web-cam'
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement
    if (k === 'webcam') {
      if (meta.checked) {
        const showWebcamStream = () => {
          navigator.mediaDevices
            .getUserMedia({
              audio: false,
              video: {
                facingMode: 'user' // Can be 'user' or 'environment' to access back or front camera (NEAT!)
                ,
              },
            })
            .then(stream => {
              chrome.storage.sync.get(['width'], (result) => {
                video.style.width = result.width + 'px'
                video.srcObject = stream
                video.onloadedmetadata = () => video.play()
              })
            })
        }
        showWebcamStream()
      } else {
        const hideWebcamStream = () => {
          video.style.width = '0px'
          const stream = video.srcObject
          // @ts-ignore
          stream?.getTracks().forEach(track => track.stop())
        }
        hideWebcamStream()
      }
    }
    if (k === 'pip') {
      if (!document.pictureInPictureElement) {
        chrome.storage.sync.set({ 'pip': true }, () => {})
        video.requestPictureInPicture()
      } else {
        chrome.storage.sync.set({ 'pip': false }, () => {})
        document.exitPictureInPicture()
      }
      return
    }
    if (k === 'width') {
      video.style.width = v + 'px'
      video.style.height = v + 'px'
    }
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
            args: [{ k: id, v: inputEl.value, meta: { checked: inputEl.checked } }]
          })
          chrome.storage.sync.set({ [id]: inputEl.value }, () => {})
        }
      })
    })
  }
})

function AddCam() {
  chrome.storage.sync.get(['width', 'pip'], (result) => {
    const VIDEO_ID = 'SWP_draggable-web-cam'
    const video = document.createElement('video')
    const showWebcamStream = () => {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: 'user' // Can be 'user' or 'environment' to access back or front camera (NEAT!)
            ,
          },
        })
        .then(stream => {
          const video = document.getElementById(VIDEO_ID) as HTMLVideoElement
          video.style.width = result.width + 'px'
          video.srcObject = stream
          video.onloadedmetadata = () => video.play()
        })
    }
    if (document.getElementById(VIDEO_ID)) {
      showWebcamStream()
      return
    }
    const el = document.querySelector('body')
    if (!el) return
    video.setAttribute('playsinline', '')
    video.setAttribute('autoplay', '')
    video.setAttribute('muted', '')


    const options: TOptions = { webcam: true, pip: false, width: '250' }
    Object.assign(options, result)
    const width = options.width ? options.width : '250'
    video.style.width = width + 'px'
    video.style.height = width + 'px'

    video.id = VIDEO_ID
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
      target.style.width = options.width ? options.width + 'px' : '250px'
      target.style.height = options.width ? options.width + 'px' : '250px'
    })

    showWebcamStream()

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

    dragElement(video)
  })
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

let tab: chrome.tabs.Tab;
(async () => {
  tab = await getCurrentTab()
  if (tab?.id) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: AddCam })
  }
})()
