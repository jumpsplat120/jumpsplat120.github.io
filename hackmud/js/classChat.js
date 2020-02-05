class Chat {
	constructor() {
		this._ = {}
		
		this.tutorial_has_run = false
	}
	
	get usernameL()          { return j.getL("usernames")         }
	get usernamesL()         { return j.getL("usernames_body")    }
	get usernamesButtonsL()  { return j.getL("usernames_buttons") }
	get usernamesButtonsWL() { return j.getL("username_wl")       }
	get usernamesButtonsBL() { return j.getL("username_bl")       }
	get usernamesButtonsTL() { return j.getL("username_toggle")   }
	get channelL()           { return j.getL("channels")          }
	get channelsL()          { return j.getL("channels_body")     }
	get channelsButtonsL()   { return j.getL("channels_buttons")  }
	get channelsButtonsWL()  { return j.getL("channel_wl")        }
	get channelsButtonsBL()  { return j.getL("channel_bl")        }
	get channelsButtonsTL()  { return j.getL("channel_toggle")    }
	get chatL()              { return j.getL("chat")              }
	get chatsL()             { return j.getL("chat_body")         }
	get tabsL()              { return j.getL("tabs")              }
	
	getActiveFilter(type) {
		if (builder) {
			this[type + "ButtonsL"].children.forEach(element => { 
			
			builder.modifyExistingElement(element)
			
			if (builder.checked) { auf = builder.id.includes("wl") ? "whitelist" : "blacklist" }})
				
			builder.clearSavedElement()
			
			return auf
		} else {
			throw new Error("Missing an [object ElementConstructor] object called 'builder'.")
		}
	}
	
	get activeTabID() {
		let active_tab_id
		
		this.elements.tabs.children.forEach(element => { if (element.checked) { active_tab_id = element.id.match(/tabs_(\w\w\w\w)/)[1] } })
	
		return active_tab_id
	}
	
	get activeTabElement() {
		return j.getL("tabs-" + this.activeTabID)
	}
	
	set activeTabElement(element) {
		j.getL("tabs-" + this.activeTabID) = element
	}
	
	get activeTabUsers() {
		builder.modifyExistingElement(this.activeTabElement)
		let users = Object.keys(builder.allAttributes)
		builder.clearSavedElement()
		return users.filter(element => { return element !== "userWhitelist" && element !== "chanWhitelist" })
	}

	determineTarget() {
		let type, target
		
		type   = event.type
		target = event.target
		
		if (target.id == "") { return false } //Anything we interact with that we care about will have an ID; skip anything without one
		console.log(target.id)
		if (type == "keydown") {
			let valid = [
				"password_input",
				"chat_input",
				"new_label"
			]
			
			if (valid.contains(target.id)) { 
				//Only return id if it's valid for that specific event type; don't return password_input on click for example
				return target.id 
			} else {
				return false
			}
		} else if (type == "pointerup") {
			let valid = [
			]
			if (valid.contains(target.id)) { 
				//Only return id if it's valid for that specific event type; don't return password_input on click for example
				return target.id 
			} else {
				return false
			}
		}
	}
	
	changeToTab(tab_id) {
		let remove, toggle, onOff
		let user_wl, chan_wl
		
		builder.modifyExistingElement(j.getL(`tabs_${tab_id}`))
		
		user_wl = builder.hasFlag("userWhitelist")
		chan_wl = builder.hasFlag("chanWhitelist")
		
		builder.clearSavedElement()
		
		//remove element
		remove = element => {
			builder.modifyExistingElement(element)
			
			if (builder.hasFlag(tab_id)) {
				builder.removeClass("no-display")
			} else {
				builder.addClass("no-display")
			}
			
			element = builder.returnElement
		}
		
		//toggle between blacklist/whitelist
		toggle = (type, whitelist) => {
			let wl, bl
			
			wl = builder
			bl = new ElementConstructor()
			
			wl.modifyExistingElement(this[type + "ButtonsWL"])
			bl.modifyExistingElement(this[type + "ButtonsBL"])
			
			wl.checked = whitelist
			bl.checked = !whitelist
			
			if (whitelist) {
				wl.addClass("button-choice")
				bl.removeClass("button-choice")
			} else {
				wl.removeClass("button-choice")
				bl.addClass("button-choice")
			}
			
			this[type + "ButtonsWL"] = wl.returnElement
			this[type + "ButtonsBL"] = bl.returnElement
		}
		
		//toggle the on/off button
		onOff  = element => {
			
			builder.modifyExistingElement(element)
			
			if (builder.getAttributeValue(tab_id) !== builder.innerHTML) {
				builder.toggleClass("button-toggle")
				builder.replaceInnerHTML(element.innerHTML == "off" ? "on" : "off")
				builder.addAttribute(this.getActiveTabID(), element.innerHTML)
				
				element = builder.returnElement
			}
		}

		this.usernamesL.children.forEach(remove)
		this.channelsL.children.forEach(remove)
		this.chatsL.children.forEach(remove)
		
		toggle("usernames", user_wl)
		toggle("channels", chan_wl)
		
		onOff(this.channelsButtonsTL)
		onOff(this.usernamesButtonsTL)
		
	}
	
	//Unfinished
	labelInput() {
		let key, input, span
	
		key   = event.data
		input = event.target
		span  = input.previousSibling
		
		span.textContent = input.value != "" ? input.value : placeholder
		
		input.style.width = span.offsetWidth + "px"
	}
	
	submitPassword() {
		if (hmAPI && storage) {
			if (event.key.toLowerCase() == "enter") {
				let pass = event.target.value
				
				fade("out", "password")
				fade("in", "loading_animation")
				
				if (pass.length <= 5) {
					hmAPI.requestToken(pass)
				} else {
					storage.save("chat_token", pass)
					
					hmAPI.token = pass
					hmAPI.requestUsers()
				
					fade("out", "login")
					fade("in", "main")
				}
				
			}
		} else {
			throw new Error(`Missing [Storage Object] named "storage" or [HackmudAPI Object] named "hmAPI".`)
		}
	}
	
	//unfinished
	submitChat() {
		let key, value, match, response, tab_name, value_as_element
		let auf, acf //active_user_filter - active_channel_filter
		let commands_array, command_functions_array
		let joinItems, createFilter
	
		key   = event.key.toLowerCase()
		value = event.target.value
		match = false
		
		value    = value.split(" ")[1] || "" //Split the command from the... not command.
		value    = value.toLowerCase()
		
		builder.createElement("span")
		builder.addClass("generic-name")
		builder.addInnerHTML(value)
		
		value_as_element = builder.returnElementAsText
		
		createFilter = type => {
			builder.createElement("span")
			builder.addClass("generic-item")
			builder.addInnerHTML(this.getActiveFilter(type))
			return builder.returnElementAsText
		}
		
		joinItems = items => {
			builder.createElement("span")
			builder.addClass("generic-item")
			builder.addInnerHTML("/")
			
			items = items.join(builder.returnElementAsText)
			
			builder.createElement("span")
			builder.addClass("generic-name")
			builder.addInnerHTML(items)
			
			return builder.returnElementAsText
		}
		
		auf = createFilter("usernames")
		acf = createFilter("channels")
		
		builder.createElement("span")
		builder.addClass("generic-tab")
		builder.addInnerHTML(this.activeTabElement.label.innerText.replace(/\WX/, "")) //Remove the 'X' from any tabs that have it
		tab_name = builder.returnElementAsText
		
		commands_array = [
			/^\/add_user/,
			/^\/remove_user/,
			/^\/add_username/,
			/^\/remove_username/,
			/^\/add_channel/,
			/^\/remove_channel/,
			/^\/replay_tutorial/,
			/^\/commands/,
			/^\/channel/
		]
		
		command_functions_array = [
			_=> { //add_user
				let users
				
				if (hmAPI.users.contains(value)) {
					
					builder.modifyExistingElement(this.activeTabElement)
					builder.addFlag(value)
					this.activeTabElement = builder.returnElement
					
					users = joinItems(this.activeTabUsers)
					
					response = [`TAB ${tab_name} IS NOW SHOWING CHAT FOR ${users}`, "system"]
				} else {
					let user
					
					user  = value_as_element
					users = joinItem(this.activeTabUsers)
					
					response = [`THIS ACCOUNT DOES NOT CONTAIN A ${user} USER; VALID USER OPTIONS ARE ${users}`, "error"]
				}
			},
			_=> { //remove users
				let users, user
				
				builder.modifyExistingElement(this.activeTabElement)
				builder.removeAttribute(value)
				this.activeTabElement = builder.returnElement
				
				users = joinItems(this.activeTabUsers)
				user  = value_as_element
				
				response = [`REMOVED ${user} FROM TAB ${tab_name}; NOW SHOWING {users}`, "alert"]
			},
			_=> {
				if (value) {
					let usernames = usernames_el.children
					
					for (i = 0; usernames.length > i; i++) {
						if (usernames[i].dataset.hasFlag(active_tab)) {
							if (usernames[i].textContent == value) {
								response = [`USERNAME ${value_el} ALREADY EXISTS IN ${auf} IN ${tab_name}`, "alert"]
								return
							}
						}
					}
					
					response = [`ADDED USERNAME ${value_el} TO ${auf} FOR ${tab_name}`, "system"]
					usernames_el.appendChild(fragment)
				} else {
					response = [`NO USERNAME ADDED [MAKE THIS MORE VERBOSE]`, "error"]
				}
			},
			_=> {
				let usernames = usernames_el.children
				
				for (i = 0; usernames.length > i; i++) {
					if (usernames[i].dataset.hasFlag(active_tab)) {
						if (usernames[i].textContent == value) {
							response = [`REMOVED USERNAME ${value_el} FROM ${auf} FOR ${tab_name}`, "system"]
							usernames[i].remove()
							break
						}
					}
				}
				
				response = response || [`NO USERNAME REMOVED [MAKE THIS MORE VERBOSE]`, "error"]
			},
			_=> {
				if (value) {
					let channels = channels_el.children
				
					for (i = 0; channels.length > i; i++) {
						if (channels[i].dataset.hasFlag(active_tab)) {
							if (channels[i].textContent == value) {
								response = [`CHANNEL ${value_el} ALREADY EXSISTS IN ${auf} IN ${tab_name}`, "alert"]
								return
							}
						}
					}
					
					response = [`ADDED CHANNEL ${value_el} TO ${auf} for ${tab_name}`, "system"]
					channels_el.appendChild(fragment)
				} else {
					response = [`NO USERNAME ADDED [MAKE THIS MORE VERBOSE]`, "error"]
				}
			},
			_=> {
				
				let channels = channels_el.children
				
				for (i = 0; channels.length > i; i++) {
					if (channels[i].dataset.hasFlag(active_tab)) {
						if (channels[i].textContent == value) {
							response = [`REMOVED CHANNEL ${value_el} FROM ${active_filter} FOR ${tab_name}`, "alert"]
							channels[i].remove()
							break
						}
					}
				}
				
				response = response || [`NO CHANNEL REMOVED [MAKE THIS MORE VERBOSE]`, "alert"]
			},
			_=> { response = [`replay tutorial unfinished`, "error"] },
			_=> { response = [`commands unfinished`, "error"] },
			_=> {
				
				j.main_channel = value
			}
		]
		
		if (key == "enter") {
			command_array.forEach((element, index) => {if (element.test(value)) { match = index }})
			
			if (tutorial_run) {
				if (match !== false) {
					//run a command
					fragment = `<p data-${active_tab} class="clear default-text list-entry">${value}</p>`.toFragment()
					
					command_functions_array[match]()
				} else {
					//regular chat
					let users = getActiveTabUsers()
					
					if (users.isEmpty) {
						response = [`NO USERS ACTIVE FOR TAB ${tab_name}. ADD USERS VIA THE <span class="generic-item">/add_user</span> COMMAND`, "alert"]
					} else {
						if (users.length == 1) {
							if (j.main_channel) {
								sendMessage(users[0], j.main_channel, value)
							} else {
								response = [`NO MAIN CHANNEL SELECTED. CHOOSE A CHANNEL TO CHAT IN WITH THE <span class="generic-item">/channel</span> COMMAND`, "alert"]
							}
						}
					}
				}
			} else {
				response = [
	`Welcome to <span class="generic-name">jumpsplat120</span>'s hackmud webclient! Feel free to get in touch in game or on Discord (<span class="generic-name">jumpsplat120#0001</span>) if you encounter any issues.
	<br><br>
	This tutorial is an overview of the various abilities of the webclient. By default, this tutorial displays after attempting to send your first message or issue your first command, and shouldn't display after that. However, if you need to reset the tutorial, simply run <span class="generic-item">/reset_tutorial</span>, and you will be able to see this tutorial again.
	<br><br>
	This webclient adds a few functions over the regular in game chat. The first thing you will need to do is add a user, to display chat logs for that user in particular. You can add multiple users, or only add one. To add a user, simply type <span class="generic-tab">/add_user </span><span class="generic-item">[username]</span>. If you try to add a user that isn't part of your account, you will recieve an error, so make sure you check spelling. The command is case insensitive, so <span class="generic-name">jUmPsPlAt120</span> and <span class="generic-name">jumpsplat120</span> would both be considered valid parameters for me. To remove a user, use the command <span class="generic-tab">/remove_user</span> <span class="generic-item">[username]</span>.<br> 
	This webclient is focused on multitasking, through the use of tabs. Up at the top, you can see <span class="generic-tab">default_tab</span>, as well as an addition button. Anything displayed in one tab won't show within another tab, so you can keep various tabs that display various forms of information without having them conflict with each other. For example, one tab could be all your users chat, but you've blacklisted well known bots. Another tab could be only one user, with a whitelist that only allows whispers. To modify the tabs, simply right click on a tab and you can rename it. Any tab beyond the first tab can be closed as well, by either middle clicking the tab, or clicking the X. You are unable to close the default tab. There is a limit of 10 tabs in total. Once a tab is closed, that information is lost! So be extra careful not delete any tabs you still need the information within.<br>
	Adding and removing users and channels is easy. Simply use the command <span class="generic-tab">/{add/remove}_{channel/username}</span> <span class="generic-item">[username OR channel]</span> to initiate the appropriate action. To filter by whispers, you can add the <span class="generic-item">WSPR</span> channel to the channel filter list. For more explicit information on each command, you can run <span class="generic-tab">/commands</span>, which will show you every command available to you.<br>
	Lastly, there are buttons in the bottom right hand corner which will allow you to tweak various settings of the webclient, such as the noise and scanline effects. If you have any requests, notice any bugs, or simply want to say thanks, feel free to message me in game, or on Discord! Thank you so much for using my client.`, "system"]
				tutorial_run = true
			}
			j.getL("chat_input").value = ""
		} else {
			response = false
		}
		
		if (response) { addMessage(response) }
	}
	
	handleOnKeyDown() {
		let target
		
		target = this.determineTarget()
		
		if (target) { //don't bother checking if false; saves cycles
			if (target == "password_input") {
				this.submitPassword()
			} else if (target == "chat_input") {
				this.submitChat()
			} else if (target == "new_label") {
				this.labelInput()
			} else {
				throw new Error(`Unable to handle target ${target} onKeyDown; confirm valid entry within 'determineTarget()' method first, or confirm entry within 'handleOnKeyDown()'.`)
			}
		}
	}
	
	handleOnMouseClick() {
		let target
		console.log("The mouse was clicked somewhere on the page!")
		target = this.determineTarget()
	}
}

function tabClick() {
	let target, dflt
	
	target = event.target
	dflt   = j.getL("tabs_dflt")
	
	const options = [
		_=> { //left click
			let id = changeListType()
			changeTab(id)
		},
		_=> { //middle click
			let label, radio, is_active
			
			label     = target
			radio     = label.control
			is_active = radio.checked

			if (radio.id != "tabs_dflt") {
				radio.remove()
				target.remove()
			}
			
			if (is_active) {
				dflt.checked = true
				dflt.label.classList.add("button-choice")
			}
			
			replaceAddTabButton()
			changeTab("dflt")
		},
		_=> { //right click
			let label, radio, text, prev, input
			
			const PLACEHOLDER = "input new name here"
			
			label = target
			radio = label.control
			text  = radio.id == "tabs_dflt" ? label.innerText : label.innerText.slice(0, -2)
			prev  = {
				index: label.htmlFor.match(/tabs_(\w\w\w\w)/)[1],
				choice: label.className.match(/button-choice/) || [""],
				value: text,
				name: text.replace(/\\/g, "[SLASH]").replace(/'/g, "\\'")
			}
			
			label.outerHTML = `<div class="default-text input-wrapper"><span id="new_label_measure" class="clear input-measure">${prev.value}</span><input id="new_label" maxlength="15" class="clear default-text input" placeholder="${PLACEHOLDER}" value="${prev.value}" oninput="labelInput('${PLACEHOLDER}')" onkeydown="labelSubmit('${prev.index}:${prev.choice[0]}:${prev.name}')" onfocusout="labelFocusLost('${prev.index}:${prev.choice[0]}:${prev.name}')" /></div>`
			
			input = j.getL("new_label")
			span  = j.getL("new_label_measure")
			
			input.style.width = span.offsetWidth + "px"
			input.focus()
		}
	]
	
	options[event.button]()
}

function labelFocusLost(literal) {
	let param, input, prev, span, label, div
	
	param = literal.split(":")
	input = event.target
	prev  = {
		index: param[0],
		choice: param[1],
		name: input.value.toLowerCase().replace(/ /g, "_") || param[2],
		active: param[1] != "" ? "data-active" : ""
	}
	span  = prev.index != "dflt" ? `&nbsp;<span ${prev.active} class="button-exit" onmouseover="event.stopPropagation();" onpointerup="spanClose()">X</span>` : ""
	label = `<label for="tabs_${prev.index}" class="default-text radio-label button ${prev.choice}" onpointerup="tabClick()" onmouseover="event.target.firstElementChild.dataset.hover = true;" onmouseleave="delete event.target.firstElementChild.dataset.hover;">${prev.name}${span}</label>`
	div   = input.parentElement
	
	div.outerHTML = label
}

function spanClose() {
	let span, label, input, is_active
	
	span      = event.target
	label     = span.parentElement
	input     = label.control
	is_active = input.checked
	
	input.remove()
	label.remove()
	
	if (is_active) {
		const dflt = document.getLementById("tabs_dflt")
		
		dflt.checked = true
		dflt.labels[0].classList.add("button-choice")
	}
	
	replaceAddTabButton()
	changeTab("dflt")
	
	event.stopPropagation()
}

function replaceAddTabButton() {
	const tree = event.path
	
	for (let i = 0; tree.length > i ;i++) {
		const element = tree[i]
		
		if (element.id == "tabs") {
			const tab_amount = (element.children.length - 1) / 2
			if (tab_amount == 9) { j.getL("add_button").classList.remove("no-display") }
		}
	}
}

function addTab() {
	let tabs_el, tabs, tabs_array, new_id, index
	
	tabs_el    = j.getL("tabs")
	tabs       = tabs_el.childNodes
	tabs_array = []
	new_id     = j.randomString(4)
	index      = 0
	
	for (let i = 0; tabs.length > i; i++) { 
		index += tabs[i].nodeName.toLowerCase() == "input" ? (tabs_array.push(i), 1) : 0
	}
	
	//Maximum 10 tabs allowed; hide add button after 10th element
	if (index == 9) { tabs_el.lastElementChild.classList.add("no-display") }
	
	for (let i = 0; tabs_array.length > i; i++) {
		let input, label, span
		
		input = tabs[tabs_array[i]]
		label = input.label
		span  = label.children ? label.children[0] : false
		
		input.checked = false
		label.classList.remove("button-choice")
		if (span) { delete span.dataset.active }
	}
	
	const new_tab = `<input data-user-whitelist data-chan-whitelist id="tabs_${new_id}" type="radio" name="tabs" class="no-display" checked /><label for="tabs_${new_id}" class="default-text radio-label button button-choice" onpointerup="tabClick()" onmouseover="event.target.firstElementChild.dataset.hover = true;" onmouseleave="delete event.target.firstElementChild.dataset.hover;">new_tab_${index + 1}&nbsp;<span data-active class="button-exit" onmouseover="event.stopPropagation();" onpointerup="spanClose()">X</span></label>`.toFragment()
	
	j.getL("username_toggle").dataset[new_id] = "off"
	j.getL("channel_toggle").dataset[new_id]  = "off"
	
	tabs_el.insertBefore(new_tab, tabs[tabs.length - 2])
	
	changeTab(new_id)
}

function submitPass() {	
	if (event.key.toLowerCase() == "enter") {
		let pass = event.target.value
		
		fade("out", "password")
		fade("in", "loading_animation")
		
		if (pass.length <= 5) {
			hmAPI.requestToken(pass)
		} else {
			storage.save("chat_token", pass)
			
			hmAPI.token = pass
			hmAPI.requestUsers()
		
			fade("out", "login")
			fade("in", "main")
		}
		
	}
}

//This has become sort of a catch all for clicking on buttons; this should probably be refactored at some point to just be for wl/bl buttons
function changeListType(is_list) {
	let elements, target, span, radio
	let active_tab, id, tab_dataset, type
	
	elements   = event.path[1].children
	target     = event.target
	span       = target.children ? target.children[0] : false
	radio      = target.control	
	active_tab = getActiveTab()
	
	for (let i = 0; elements.length > i; i++) {
		let el, span
		
		el   = elements[i]
		span = el.children ? el.children[0] : false
		
		el.checked = false
		el.classList.remove("button-choice")
		if (span) { delete span.dataset.active }
	}
	
	target.control.checked = true
	target.classList.add("button-choice")
	
	id          = target.control.id
	tab_dataset = j.getL(`tabs_${active_tab}`).dataset
	type        = id.includes("username") ? "user" : "chan"
	
	if (is_list) { //Only trigger on whitelist/blacklist buttons
		if (id.includes("wl")) {
			tab_dataset[type + "Whitelist"] = true
		} else {
			delete tab_dataset[type + "Whitelist"]
		}
	}
	
	if (span) { span.dataset.active = true }
	
	//returns tab id if tab; for use in tabClick => changeTab
	if (radio) {
		let match = radio.id.match(/tabs_(\w\w\w\w)/)
		
		if (match) { return match[1] }
	}
}

function addMessage(response) {
	let template, message, type
	let active_tab, remove_x
	
	message = response[0]
	type    = response[1]
	
	active_tab = getActiveTab()
	
	template  = `<p data-${active_tab} class="clear default-text main-entry`
	template += type ? ` ${type}` : template
	
	message   = type == "system" ? `### ${message} ###` :
				type == "alert"  ? `### ${message} ###` :
				type == "error"  ? `!!! ${message} !!!` : message
	template += `">${message}</p>`
	
	j.getL("chat_body").appendChild(template.toFragment())
}