const socket = io("https://peersync.onrender.com");

receiverID = "";

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
  <td style="font-size: 20px">${fileName}</td>
  <td>${mimeType}</td>
  <td>
    <a id="download-btn" href="${URL.createObjectURL(blob)}" download="${fileName}.${extension}">
      <button class="btn text-white btn-primary btn-md">Download</button>
    </a>
  </td>
</tr>
  `;

  const downloadButton = document.getElementById('download-btn');
  downloadButton.addEventListener("click", () => {
    setTimeout(() => {
      URL.revokeObjectURL(downloadButton.href);
    }, 100);
  });

  filesContainer.appendChild(document.createElement("br"));
});



