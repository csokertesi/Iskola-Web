import './style.css'

const url = "https://petrik-utazas-default-rtdb.europe-west1.firebasedatabase.app/travelDestinations.json";
const container = document.getElementById("container");
const template = document.getElementById("kartyatemplate");
const spinner = document.getElementById("toltesikon");

async function loadData() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    spinner.parentElement.removeChild(spinner);

    data.forEach(dest => {
      const card = template.content.cloneNode(true);

      card.querySelector(".card-img-top").src = dest.img;
      card.querySelector(".card-img-top").alt = dest.title;
      card.querySelector(".card-title").textContent = dest.title;
      card.querySelector(".card-text").textContent = dest.content;
      container.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    spinner.innerHTML = '<h1>Hiba történt az adatok betöltése közben</h1>';
  }
}

loadData();