export const VIDEO_ID = 'SWP_draggable-web-cam';
export function createVideo(id: string, el: HTMLElement | null) {
  if(!el) return
  const video = document.createElement('video');
  video.setAttribute('playsinline', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.style.width = '200px';
  video.style.height = '200px';

  /* Setting up the constraint */
  const facingMode = 'user'; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
  const constraints = {
    audio: false,
    video: {
      facingMode: facingMode,
    },
  };

  video.id = id;
  video.style.position = 'absolute';
  video.style.top = '24px';
  video.style.borderRadius = '50%';
  video.style.zIndex = '99999999';
  video.style.objectFit = 'cover';
  /* Stream it to video element */
  navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
    video.srcObject = stream;
  });
  el.appendChild(video);
  return video;
}



export function dragElement(elmnt: HTMLElement) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  elmnt.onmousedown = dragMouseDown;
  // if (document.getElementById(elmnt.id + 'header')) {
  //     if present, the header is where you move the DIV from:
  // document.getElementById(elmnt.id + 'header').onmousedown = dragMouseDown;
  // } else {
  //     otherwise, move the DIV from anywhere inside the DIV:\
  // elmnt.onmousedown = dragMouseDown;
  //
  // }

  function dragMouseDown(e: MouseEvent) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
    elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
