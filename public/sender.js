const socket = io("https://peersync.onrender.com");
// const socket = io("http://localhost:3000")
function generateUUID() {
  var code = "";
  for (var i = 0; i < 3; i++) {
    var segment = Math.floor(Math.random() * 256).toString(16);
    if (segment.length < 2) {
      segment = "0" + segment; // Pad with leading zero if necessary
    }
    code += segment + "-";
  }
  return code.slice(0, -1); // Remove the trailing dash
}

function convertToGB(fileSizeKB) {
  const fileSizeGB = fileSizeKB / (1024 * 1024 * 1024);
  return fileSizeGB.toFixed(2); // Round to 2 decimal places
}

const senderID = generateUUID();
function copyRoomCode() {
  const copyBtn = document.getElementById("copy-btn");
  copyBtn.innerText = "Copied!";
  const copyText = document.getElementById("room-code").innerText;
  navigator.clipboard
      .writeText(copyText)
      .then(() => {
          console.log("Text copied to clipboard");
      })
      .catch((error) => {
          console.error("Unable to copy text to clipboard:", error);
      });
      setInterval(()=>{
          copyBtn.innerText = 'Copy';
      }, 3000)
}

console.log(senderID);
receiverID = "";
socket.emit("create-room", { senderID });

socket.on("init", () => {
  const postReceiverJoined = document.getElementById('post-receiver-joined')
  postReceiverJoined.classList.remove('d-none', 'justify-content-around');
  postReceiverJoined.classList.add('justify-content-between')
  const preReceiverJoined = document.getElementById('pre-receiver-joined')
  preReceiverJoined.classList.add('d-none')
  const successTxt = document.getElementById('success-txt');
  successTxt.classList.remove('d-none');
  setTimeout(() => {
    successTxt.classList.add("d-none");
  }, 3000);
  console.log("One receiver joined sucessfully")
});

const fileInput = document.getElementById("fileInput");
const sendbtn = document.getElementById("send-btn");
sendbtn.addEventListener("click", (event) => {
  const files = fileInput.files;
  let totalSize = 0;

  for (let i = 0; i < files.length; i++) {
    totalSize += files[i].size;
  }
  totalSize = convertToGB(totalSize)
  console.log(totalSize);
  if(totalSize >=2 ){
    alert("File size should be less than 2GB");
    fileInput.value = ""
  }
  else{
    const numFiles = files.length;
  console.log(files.size)
  if(numFiles != 0){
    console.log(files);
  console.log("Number of files selected:", numFiles);
  const formData = new FormData();
  for (let i = 0; i < numFiles; i++) {
    const file = files[i];
    const fileName = file.name;
    formData.append("files[]", file, fileName);
  }

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        console.log("File uploaded successfully");
        alert("File Sent");
      } else {
        console.error("File upload failed");
      }
    })
    .catch((error) => {
      console.error("An error occurred during file upload:", error);
    });
  }else{
    alert("Please select files to send")
  }
  }
  
});

socket.on("room-created", (roomCode) => {
  const roomcode = document.getElementById('room-code');
  roomcode.innerText = senderID;
});
