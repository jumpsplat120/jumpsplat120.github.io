/*ON CLOSE IT WILL HAVE A DIALOG BOX THAT WILL POP UP ASKING IF YOUR SURE YOU WANNA CLOSE EBCAUSE IT WILL NOT SAVE AUTOMATICALLY AND WILL HAVE A CLOSE ANYWAY BUTTON, A SAVE NOW BUTTON AND A CANCEL BUTTON
	
Have a title screen with a click any where to continue before having that fade out to have Create a New Character option, Load Exsisting Character in the center of the screen 
	-have the load Character Sheet read Strings made by the program and load them up into the Character Screen in Play mode

Creating a new character: first it will have a page with just the Character information (There will be a Fill out later button to skip) then the page will move to the top of the screen to reveal the mechanics sheet below.
	-There will be a key in the upper left corner with the colors for the Free dots, normal dots and a planned dots option that will be numbered (they will not count against XP and there will be an option to toggle "Planning mode" where you will only fill in Planning dots. Planning dots will create a Wishlist on a optional tab to the side that you can open to rearrange the order of planning dots and see the XP they will cost. 
The first time you interact with a section (Skills/Attributes/Spheres) It will automactically fill in free dots first until all free dots are spent until it starts using normal XP, and once you are out of normal XP it will switch to planning mode automatically

Load sheet will have an Input Text box underneath that will ask you to paste the string that the text file gave you and will start up in Play mode with last current stats

Once you are done filling everything out it will have a Save Printable Character Sheet and Save Digital Character Sheet (on hover have note that explains that this will save any inforamtions currently on the play sheet as well as the base character information.) on the bottom
	-save printable sheet will save a pdf locally that is visually appealing and printable but not editable. The Health/Willpower/Quint will be unfilled.
	-save Digital sheet will save a txt file with a long string that is readable by the Load option
Playable mode will have Quint,Willpower,Paradox,Health, and paradox flaws editable but nothing else

Once you have saved it will switch to play mode where the dots will no longer be editable and the planning dots will dissapear health, willpower, and Quint will be the only ones that can be changed and an Edit Character Sheet button, Load New Character Sheet will be in the upper right.
*/

function loadCharSheet() {
	prompt("Place your import code here!")
}

function createCharSheet() {
	event.target.parentNode.parentNode.classList.add("no-display")
	document.getElementById("main").classList.remove("no-display")
}

var vec = new Vector(300, 300)
var canvas = document.getElementById("swirl").getContext("2d")

window.onload =_=> {
	document.getElementById("load_character_sheet").addEventListener("click", loadCharSheet)
	document.getElementById("create").addEventListener("click", createCharSheet)
	
	let swirl = new Swirl(20, .04, 10)
	
	swirl.setup()
	swirl.drawFlowField()
}
