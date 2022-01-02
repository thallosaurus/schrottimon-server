const socket = io();

socket.on("joinroom", (args) => {
    console.log(args);

    //populate levels

    let levels = document.getElementById("levels");
    levels.innerHTML = "";

    for (let l of args) {
        let r = document.createElement("li");

        r.dataset.roomName = l;
        r.innerText = l;
        
        levels.appendChild(r);

        levels.addEventListener("click", (event) => {
            changeRoom(event.target.dataset.roomName);
        });
    }
});

socket.on("message", (args, msg) => {
    console.log(args, msg);

    let d = document.getElementById("messageArea");

    let row = document.createElement("p");
    row.insertAdjacentHTML("afterbegin", `<strong>${args}:</strong>${msg}</p>`);

    d.appendChild(row);
});

function changeRoom(room) {
    socket.emit("room", room);
}

function sendMessage() {
    let msg = document.getElementById("msg").value;
    socket.emit("message", msg);
}