import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'

const API = "http://localhost:3000";

const addEventListeners = async () => {
  //#region Fields
  let fields = document.querySelectorAll(".id,.age,.email");
  fields.forEach(element => {
    element.addEventListener("keydown", (event)=>{
      let savebtn = element.parentElement.parentElement.parentElement.querySelector(".savebtn");
      if (event.key === "Enter" || event.key === "Return") {
        event.preventDefault();
        savebtn.focus();
        return;
      };
      if (element.classList.contains("age")){
        // Csak szám                                      Más gombok
        if (!"1234567890".includes(Number(event.key)) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Control", "Shift"].includes(event.key)){
          event.preventDefault();
          return;
        }
      }
      element.style.fontStyle = "italic";
      savebtn.style.display = "inline";
    });
  });
  //#endregion
  //#region Delete Buttons
  let deletebtns = document.querySelectorAll(".deletebtn");
  deletebtns.forEach(element => {
    element.addEventListener("click", async _=>{
      let id = element.parentElement.parentElement.querySelector(".id").innerText;
      DELETE(`users/${id}`);
      await loadUsers();
      addEventListeners();
      reload();
    })
  });
  //#endregion
  //#region Save Buttons
  let savebtns = document.querySelectorAll(".savebtn");
  savebtns.forEach(element => {
    element.addEventListener("click", async _=>{
      let id = element.parentElement.parentElement.querySelector(".id").innerText;
      let email = element.parentElement.parentElement.querySelector(".email").innerText;
      let age = element.parentElement.parentElement.querySelector(".age").innerText;
      PATCH(`users/${id}`, email, Number(age));
      reload();
    })
  });
  //#endregion
  //#region Profile Pictures
  let profilepics = document.querySelectorAll(".profilepic");
  profilepics.forEach(element => {
    element.addEventListener("click", _=>{
      let id = element.parentElement.parentElement.querySelector(".id").innerText;
      let input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (event)=>{
        let file = event.target.files[0];
        let formData = new FormData();
        formData.append("file", file);
        let url = `${API}/users/${id}/profile`;
        let f = await fetch(url, { method: "PUT", body: formData }).catch(e=>{ showModal("Sikertelen képfeltöltés", "Nem sikerült feltölteni a képet."); });
        reload();
      }
      input.click();
    });
  });
  //#endregion
  //#region Create User Button
  let createuserbtn = document.getElementById("createuser");
  createuserbtn.addEventListener("click", async _=>{
    let email = document.getElementById("newemail").value;
    let age = Number(document.getElementById("newage").value);
    let url = `${API}/users`;
    let f = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, age }) }).catch(e=>{ showModal("Sikertelen hozzáadás", "Nem sikerült hozzáadni a felhasználót."); });
    if (f.status != 201) {
      let message = await f.json();
      showModal("Sikertelen törlés", `Nem sikerült törölni a felhasználót.<br><span class='red'>${message.message[0]}</span>`);
    } else {
      reload();
    }
  });
  //#endregion
}

const createCardElement = (id, email, age) => {
  const template = document.getElementById("cardtemplate");
  let card = template.content.cloneNode(true);
  card.querySelector(".email").innerText = email;
  card.querySelector(".id").innerText = String(id);
  card.querySelector(".age").innerText = String(age);
  card.querySelector(".profilepic").src = `${API}/users/${id}/profile`;

  return card;
}

async function loadUsers() {
  const main = document.getElementById("main");
  main.innerHTML = "";
  let data = await GET("users");

  data.forEach(user => {
    main.appendChild( createCardElement(user.id, user.email, user.age) )
  });

  const createUserCard = `
    <div class="card m-3" style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">Új felhasználó</h5>
        <input type="email" class="form-control" id="newemail" placeholder="Email cím">
        <input type="number" class="form-control" id="newage" placeholder="Életkor">
        <div style="text-align: right; width: 100%;">
          <button class="btn btn-primary" id="createuser">Hozzáadás</button>
        </div>
      </div>
    </div>
  `;
  main.innerHTML += createUserCard;
}

async function GET(param) {
  let url = `${API}/${param}`;
  let f = await fetch(url).catch(e=>{ showModal("Nem sikerült elérni a szervert", "Hiba történt a lekérdezés közben. Próbálja meg később."); });
  let res = await f.json();
  return res;
}

const reload = () => {
  window.location.reload();
}

async function DELETE(param) {
  let url = `${API}/${param}`;
  let f = await fetch(url, { method: "DELETE" }).catch(async e=>{ showModal("Sikertelen törlés", "Nem sikerült törölni a felhasználót."); await loadUsers(); });
}

async function PATCH(param, email, age) {
  // PATCH /users/:id {email, age}
  let url = `${API}/${param}`;
  let f = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, age }) }).catch(e=>{ showModal("Sikertelen frissítés", "Nem sikerült frissíteni a felhasználót."); });
}

const showModal = (title, text) => {
  const myModal = new bootstrap.Modal(document.getElementById("modal"));
  document.getElementById("modaltitle").innerText = title;
  document.getElementById("modaltext").innerHTML = text;
  myModal.show();
}

await loadUsers();

addEventListeners();