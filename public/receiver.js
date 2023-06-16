// const socket = io("https://peersync.onrender.com");
const socket = io("http://localhost:3000")
receiverID = "";
numFilesReceived = 0
// Input sanitation
const roomCodeInput = document.getElementById('roomCodeInput');
roomCodeInput.addEventListener('keyup', (e)=>{
  let userInput = e.target.value
  if(userInput.length == 2 || userInput.length == 5){
    userInput += "-"
  }
  if(userInput.length > 8){
    newValue = userInput.slice(0, 8)
    roomCodeInput.value = newValue
  }
  else{
    roomCodeInput.value = userInput
  }
})

function downloadAll(){
  var divElement = document.getElementById('post-received');
  var anchorTags = divElement.getElementsByTagName('a');
  
  var hrefs = Array.from(anchorTags).map(function(anchor) {
    return anchor.getAttribute('href');
  });

  var downloads = Array.from(anchorTags).map(function(download){
    return download.getAttribute('download')
  })
  
  console.log(hrefs);
  console.log(downloads)

  for (var i = 0; i < hrefs.length; i++) {
    var link = document.createElement('a');
    link.href = hrefs[i];
    link.download = downloads[i]; // Optional: Set a custom download filename if needed
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

const joinBtn = document.getElementById("join-btn");

joinBtn.addEventListener("click", () => {
  let senderID = document.getElementById("roomCodeInput").value;
  socket.on("connect", () => {
    receiverID = socket.id;
  });
  socket.emit("join-room", { senderID, receiverID });
});

function limitToTenChar(input){
  return input.slice(0, 9);
}

socket.on("wrong-code", () => {
  const errorTxt = document.getElementById('error-txt')
  errorTxt.classList.remove("d-none");
  setTimeout(() => {
    errorTxt.classList.add("d-none");
  }, 3000);
});

socket.on('init', ()=>{
  const receiverArea = document.getElementById('receiverArea')
  const roomcodeInputArea = document.getElementById('roomcode-input-area')
  const roomcode = document.getElementById('roomCodeInput').value
  const roomjoinedinfo = document.getElementById('roomjoinedinfo')
  receiverArea.classList.remove('d-none')
  roomcodeInputArea.classList.add('d-none')
  roomjoinedinfo.classList.remove('d-none');
  const element = document.createElement('p');
  element.innerText = `Room joined ${roomcode}`;
  element.classList.add('text-white')
  element.style.fontSize = "30px";
  roomjoinedinfo.appendChild(element);
  console.log("Joined")
})

socket.on("not-allowed", () => {
  alert("Maximum limit reached. Can't join");
});

socket.on("file-transfer", (fileData) => {
  const mimeType = fileData.mimeType;
  const blob = new Blob([fileData.data], { type: mimeType });
  const extension = mimeType.split("/")[1];
  const filesContainer = document.getElementById("post-received");
  const preReceived = document.getElementById('pre-received')
  preReceived.classList.add('d-none')
  const fileName = limitToTenChar(fileData.name)
  filesContainer.innerHTML += `
  <tr class="text-center bg-light p-4 justify-content-center align-items-center">
  <td class="fs-3">${fileName}</td>
  <td class="fs-4">${mimeType}</td>
  <td>
    <a id="download-btn" href="${URL.createObjectURL(blob)}" download="${fileName}.${extension}">
      <button class="btn text-white btn-primary btn-sm">Download</button>
    </a>
  </td>
</tr>
  `;
  numFilesReceived += 1;
  console.log(numFilesReceived)
  const downloadButton = document.getElementById('download-btn');
  downloadButton.addEventListener("click", () => {
    setTimeout(() => {
      URL.revokeObjectURL(downloadButton.href);
    }, 100);
  });

  filesContainer.appendChild(document.createElement("br"));
  if(numFilesReceived.toString() === fileData.length.toString()){
    console.log("Hello")
    const downloadAllBtnContainer = document.getElementById('downloadAllBtnContainer')
    const downloadAllBtn = document.createElement('button')
    downloadAllBtn.innerText = "Download All"
    downloadAllBtn.id = 'downloadAllBtn'
    downloadAllBtn.classList.add('btn', 'btn-primary', 'btn-sm')
    downloadAllBtnContainer.appendChild(downloadAllBtn)
    downloadAllBtn.onclick = downloadAll
  }else{
    console.log("not matched")
  }
});

// Alert when sender leaves the room

socket.on('left', (data)=>{
  if(data != socket.id){
    const errorTxt = document.getElementById('error-txt')
    errorTxt.innerText = "Sender left the room"
    errorTxt.classList.remove("d-none");
  }
})

