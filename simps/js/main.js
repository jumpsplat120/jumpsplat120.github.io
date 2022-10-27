(async _ => {
const response = await fetch(`https://api.countapi.xyz/set/jumpsplat120/simp`);
const count    = await response.json();

document.getElementById("count").innerText = count.value;
})();