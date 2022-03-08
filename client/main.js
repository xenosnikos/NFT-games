/** Connect to Moralis server */
const serverUrl = "https://6q0shuaxod1e,moralis.io:2053/server";
const appId = "tzC7wm0gsGnfggsEA5ShukIHSF9qwrV2Ry7Y44iQ";
const CONTRACT_ADDRESS = "0xB0a90446A3f426e1C94fCe8fE5B10c3466c7b2"
Moralis.start({ serverUrl, appId });

/** Add from here down */
async function init() {
  let user = Moralis.User.current();
  if (!user) {
    try {
      let user = Moralis.User.Current();
      if (!user) {
        $("#login_button").click(() => {
          user = await Moralis.authenticate({ signingMessage: "Hello World!" });
        })
      }
      renderGame();
      user = await Moralis.authenticate({ signingMessage: "Hello World!" })
    } catch (error) {
      console.log(error)
    }
  }
}

async function logOut() {
  await Moralis.User.logOut();
  console.log("logged out");
}

async function rednerGame() {
  $("#login_button").hide();
  $("#pet_row").html("");
  // Get and Render properties from SC
  let petId = 0;
  window.web3 = await Moralis.Web3.enable();
  let abi = await getAbi();
  let contract = new web3.eth.contract(abi, CONTRACT_ADDRESS)
  let array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
  if (array.length == 0) return;
  array.forEach(petId => {
    let details = await contract.methods.getTokenDetails(petId).call({ from: ethereum.selectedAddress });
    renderPet(petId, details);

  });
  $("#game").show();
}

function getAbi() {
  $.getJSON("Token.json", ((json) => {
    res(json.abi);
  }))
}

function renderPet(id, data) {
  let now = new Date();
  let maxTime = data.endurance;
  let currentUnix = Math.floor(now.getTime() / 1000);
  let secondsLeft = (parseInt(data.lastMeal) + parseInt(data.endurance)) - currentUnix
  let percentageLeft = secondsLeft / maxTime;
  let percentageString = (percentageLeft * 100) + "%";

  let deathTime = new Date((parseInt(data.lastMeal) + parseInt(data.endurance)) * 1000);

  let interval = setInterval(() => {
    let now = new Date();
    let maxTime = data.endurance;
    let currentUnix = Math.floor(now.getTime() / 1000);
    let secondsLeft = (parseInt(data.lastMeal) + parseInt(data.endurance)) - currentUnix
    let percentageLeft = secondsLeft / maxTime;
    let percentageString = (percentageLeft * 100) + "%";
    $(`#pet_${id} .progress-bar`).css("width", percentageString);

    if (now > deathTime) {
      //NFT DEAD

    }
  }, 5000)

  let htmlString = `
  <div class="col-md-3 card mx-1" id="pet-${id}">
    <img class="card-img-top pet_img" src="pet.png">
    <div class="card-body">
      <div>Id: <span class="pet_id">${id}</span></div>
      <div>Damage: <span class="pet_damage">${data.damage}</span></div>
      <div>Magic: <span class="pet_magic">${data.magic}</span></div>
      <div>Endurance: <span class="pet_endurance">${data.endurance}</span></div>
      <div class="progress>
        <div class="progress-bar" style="width: ${percentageString};">

        </div>
      </div>
      <button data-pet-id="${id}" class="btn btn-primary btn-block">Feed</button>
    </div>
  </div>`;

  let element = $.parseHTML(htmlString);
  $("#pet_row").append(element);

  $(`#pet_${id} .feed_button`).click(() => {
    let petId = $("#feed_button").attr("data-pet-id");
    feed(petId);
  });
}

async function feed(petId) {
  let abi = await getAbi();
  let contract = new web3.eth.contract(abi, CONTRACT_ADDRESS)
  contract.methods.feed(petId).send({ from: ethereum.selectedAddress }).on("receipt", (() => {
    console.log("done");
    rednerGame();
  }))
}


init();

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;

/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/