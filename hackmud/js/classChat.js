class Chat {
	constructor() {
		this.tutorial_has_run = false
		this.tutorial_step    = -1
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
	get chatsInputL()        { return j.getL("chat_input")        }
	get tabsL()              { return j.getL("tabs")              }	
	get mainUser()			 { return hmAPI.users.main            }	
	get mainChannel()		 { return hmAPI.channels.main         }
	
	set usernameL(x)          { j.getL("usernames").replaceWith(x)         }
	set usernamesL(x)         { j.getL("usernames_body").replaceWith(x)    }
	set usernamesButtonsL(x)  { j.getL("usernames_buttons").replaceWith(x) }
	set usernamesButtonsWL(x) { j.getL("username_wl").replaceWith(x)       }
	set usernamesButtonsBL(x) { j.getL("username_bl").replaceWith(x)       }
	set usernamesButtonsTL(x) { j.getL("username_toggle").replaceWith(x)   }
	set channelL(x)           { j.getL("channels").replaceWith(x)          }
	set channelsL(x)          { j.getL("channels_body").replaceWith(x)     }
	set channelsButtonsL(x)   { j.getL("channels_buttons").replaceWith(x)  }
	set channelsButtonsWL(x)  { j.getL("channel_wl").replaceWith(x)        }
	set channelsButtonsBL(x)  { j.getL("channel_bl").replaceWith(x)        }
	set channelsButtonsTL(x)  { j.getL("channel_toggle").replaceWith(x)    }
	set chatL(x)              { j.getL("chat").replaceWith(x)              }
	set chatsL(x)             { j.getL("chat_body").replaceWith(x)         }
	set chatsInputL(x)        { j.getL("chat_input").replaceWith(x)        }
	set tabsL(x)              { j.getL("tabs").replaceWith(x)              }	
	
	getActiveFilter(type) {
		if (builder) {
			this[type + "ButtonsL"].children.forEach(element => {
				let builder = new ElementConstructor()
				builder.modifyExistingElement(element)
				
				if (builder.checked) { return builder.id.includes("wl") ? "whitelist" : "blacklist" }})
		} else {
			throw new Error("Missing an [object ElementConstructor] object called 'builder'.")
		}
	}
	
	get activeTabID() {
		let active_tab_id
		
		this.tabsL.children.forEach(element => { if (element.checked) { active_tab_id = element.id.match(/tabs_(\w\w\w\w)/)[1] } })
		
		return active_tab_id
	}
	
	get activeTabElement() {
		return j.getL("tabs_" + this.activeTabID)
	}
	
	set activeTabElement(element) {
		j.getL("tabs-" + this.activeTabID) = element
	}
	
	get activeTabUsers() {
		builder.modifyExistingElement(this.activeTabElement)
		let users = Object.keys(builder.allAttributes)
		builder.clear()
		return users.filter(element => { return element !== "userWhitelist" && element !== "chanWhitelist" })
	}
	
	get activeTabDisplayName() {
		let builder = new ElementConstructor()
		
		builder.modifyExistingElement(this.activeTabElement)
		
		return builder.labelText.replace(/\WX/, "")
	}
	
	changeToTab(tab_id) {
		let remove, toggle, onOff
		let user_wl, chan_wl
		
		builder.modifyExistingElement(j.getL(`tabs_${tab_id}`))
		
		user_wl = builder.hasFlag("userWhitelist")
		chan_wl = builder.hasFlag("chanWhitelist")
		
		builder.clear()
		
		//remove element for all except one we're changing to
		remove = element => {
			builder.modifyExistingElement(element)
			
			if (builder.hasFlag(tab_id)) {
				builder.removeClass("no-display")
			} else {
				builder.addClass("no-display")
			}
			
			builder.clear()
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
				builder.clear()
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
	
	//unfinished
	labelInput() {
		let key, input, span
	
		key   = event.data
		input = event.target
		console.log(input)
		builder.modifyExistingElement(input.previousSibling)
		
		span.textContent = input.value != "" ? input.value : placeholder
		
		input.style.width = span.offsetWidth + "px"
	}
	
	submitPassword() {
		if (event.key.toLowerCase() == "enter") {
			let pass = event.target.value
			
			gooey.fadeOutMultiple("password", "password_error")
			gooey.fadeIn("loading_animation")
			
			if (pass.length <= 5) {
				hmAPI.requestToken(pass)
			} else {
				hmAPI.token = pass
				hmAPI.validateToken()
			}
		}
	}
	
	parseCommand() {
		//LAT = eLementAsText, auf = activeUserFilter, acf = activeChannelFilter
		let value, valueLAT, command, commandLAT, tab, tabID, entry, response
		let auf, acf
		let joinItems, commands
		
		tabID = this.activeTabID
		
		value   = event.target.value
		value   = value.split(" ") //[/command, value OR nothing]
		command = value[0].slice(1) //We don't need the slash
		value   = value[1] || ""
		
		commandLAT = new ColoredText(command).asGeneric("command")
		valueLAT   = new ColoredText(value.toLowerCase()).asGeneric("item")
		auf        = new ColoredText(this.getActiveFilter("usernames")).asGeneric("item")
		acf        = new ColoredText(this.getActiveFilter("channels")).asGeneric("item")
		tab        = new ColoredText(this.activeTabDisplayName).asGeneric("tab")
		
		builder.createElement("p")
		builder.addFlag("data" + tabID.toCapitalCase())
		builder.addClasses("clear", "default-text", "list-entry")
		builder.addInnerHTML(value)
		
		entry = builder.returnElement
		
		joinItems = items => {	
			items = items.join(this.createSpanAsText("generic-item", "/"))
			return this.createSpanAsText("generic-name", items)
		}
		
		//A bit repatative, maybe think about rewriting some of the add/remove username/channel stuff?
		commands = {
			add_user        :_=> {
				let users = joinItem(this.activeTabUsers)
				
				if (hmAPI.users.all.contains(value)) {
					
					builder.modifyExistingElement(this.activeTabElement)
					builder.addFlag(value)
					builder.clear()
					
					response = [`TAB ${tab} IS NOW SHOWING CHAT FOR ${users}`, "system"]
				} else {
					let user = valueLAT
					
					response = [`THIS ACCOUNT DOES NOT CONTAIN A ${user} USER; VALID USER OPTIONS ARE ${users}`, "error"]
				}
			},
			remove_user     :_=> {
				let users, user
				
				user  = valueLAT
				users = joinItems(this.activeTabUsers)
				
				if (hmAPI.users.all.contains(value)) {
					builder.modifyExistingElement(this.activeTabElement)
					builder.removeAttribute(value)
					builder.clear()
					
					response = [`REMOVED ${user} FROM TAB ${tab}; NOW SHOWING ${users}`, "alert"]
				} else {
					response = [`UNABLE TO REMOVE USER ${user} FROM TAB ${tab}; CURRENTLY SHOWING USERS ARE ${users}`, "error"]
				}
			},
			add_username    :_=> {
				let user, builder
				
				user    = valueLAT
				builder = new ElementConstructor(this.usernamesL)
				
				for (let i = 0; builder.childrenAmount > i; i++) {
					let builder2 = new ElementConstructor(builder.child(i))
					
					if (builder2.hasFlag(tabID) && builder2.text == value) {
						response = [`USERNAME ${user} ALREADY EXISTS IN ${auf} IN TAB ${tab}`, "alert"]
						return
					}
				}
				
				response = [`ADDED USERNAME ${user} TO ${auf} FOR TAB ${tab}`, "system"]
				
				builder.addChild(entry)
				builder.clear()
			},
			remove_username :_=> {
				let user, builder
				
				user = valueLAT
				builder = new ElementConstructor()
				
				builder.modifyExistingElement(this.usernamesL)
				
				for (let i = 0; builder.childrenAmount > i; i++) {
					let builder2 = new ElementConstructor()
					
					builder2.modifyExistingElement(builder.child(i))
					
					if (builder2.hasFlag(tabID) && builder.text == value) {
						response = [`REMOVED USERNAME ${user} FROM ${auf} FOR ${tab}`, "system"]
						builder.removeChild(i)
						break
					}
				}
				
				response = response || [`UNABLE TO REMOVE USERNAME ${user} FROM ${auf} FOR ${tab}`, "error"]
			},
			add_channel     :_=> {
				let chan, builder
				
				chan    = valueLAT
				builder = new ElementConstructor(this.channelsL)
				
				for (let i = 0; builder.childrenAmount > i; i++) {
					let builder2 = new ElementConstructor()
					
					builder2.modifyExistingElement(builder.child(i))
					
					if (builder2.hasFlag(tabID) && builder2.text == value) {
						response = [`CHANNEL ${chan} ALREADY EXISTS IN ${acf} IN TAB ${tab}`, "alert"]
						return
					}
				}
				
				response = [`ADDED CHANNEL ${chan} TO ${acf} FOR TAB ${tab}`, "system"]
				
				builder.addChild(entry)	
				builder.clear()
			},
			remove_channel  :_=> {
				let chan, builder
				
				chan    = valueLAT
				builder = new ElementConstructor()
				
				builder.modifyExistingElement(this.channelsL)
				
				for (let i = 0; builder.childrenAmount > i; i++) {
					let builder2 = new ElementConstructor()
					
					builder2.modifyExistingElement(builder.child(i))
					
					if (builder2.hasFlag(tabID) && builder2.text == value) {
						response = [`REMOVED CHANNEL ${chan} FROM ${acf} FOR ${tab}`, "system"]
						builder.removeChild(i)
						break
					}
				}
				
				response = response || [`UNABLE TO REMOVE CHANNEL ${chan} FROM ${acf} FOR ${tab}`, "error"]
			},
			reset_tutorial :_=>  {
				this.tutorial_step = -1
				this.tutorial_has_run = false
				response = [`TUTORIAL HAS BEEN RESET`, "system"]
			},
			finish_tutorial :_=> {
				this.tutorial_has_run = true
				console.log(this)
				response = [`Thank you so much for using my client!`, "system"] 
			},
			commands        :_=> { response = [`commands unfinished`, "error"] },
			user            :_=> { hmAPI.users.main = value },
			channel         :_=> { hmAPI.channels.main = value }
		}
		
		if (command in commands) {
			commands[command]()
		} else {
			let commands = new ColoredText("/commands").asGeneric("command")
			response = [`COMMAND ${commandLAT} NOT FOUND. CONSIDER RUNNING ${commands} TO VIEW AVAILABLE COMMANDS`, "error"]
		}

		return response
	}
	
	runThroughTutorial() {
		let jumpsplat120, discord_name, cased_jumpsplat120
		let reset_tutorial, add_user, remove_user, finish_tutorial, mixed_command, commands
		let username, mixed_param, wspr, default_tab
		
		jumpsplat120       = new ColoredText("jumpsplat120").asGeneric("name")
		discord_name       = new ColoredText("jumpsplat120#0001").asGeneric("name")
		cased_jumpsplat120 = new ColoredText("jUmpSplAt120").asGeneric("name")
		
		reset_tutorial  = new ColoredText("/reset_tutorial").asGeneric("command")
		add_user        = new ColoredText("/add_user").asGeneric("command")
		remove_user     = new ColoredText("/remove_user").asGeneric("command")
		finish_tutorial = new ColoredText("/finish_tutorial").asGeneric("command")
		mixed_command   = new ColoredText("/{add/remove}_{channel/username}").asGeneric("command")
		commands        = new ColoredText("/commands").asGeneric("command")
		
		username    = new ColoredText("[username]").asGeneric("item")
		mixed_param = new ColoredText("[username] OR [channel]").asGeneric("item")
		wspr        = new ColoredText("WSPR").asGeneric("item")
		default_tab = new ColoredText("default_tab").asGeneric("tab")
		
		let steps = [`Welcome to ${jumpsplat120}'s Hackmud webclient! Feel free to get in touch in game or on Discord (${discord_name}) if you encounter an issues. This is a tutorial for the webclient. If you wish to skip this tutorial, simply use the command ${finish_tutorial}, and the tutorial will be over. If you do this on accident, you can always reset the tutorial with ${reset_tutorial}. Type anything to continue.`,
		`This tutorial is an overview of the various abilities of the webclient. By default, this tutorial displays after attempting to send your first message or issue your first command, and shouldn't display after that. As mentioned before, if you need to reset the tutorial, simply run ${reset_tutorial} at any time and you will be able to see this tutorial again. If you feel the tutorial didn't explain something in enough detail, message me using the contact info found above and I will gladly update the tutorial for you.`,
		`This webclient adds a few functions over the regular in game chat. The first thing you will need to do is add a user, to display chat logs for that user in particular. You can add multiple users, or only add one. To add a user, simply type ${add_user} ${username}. If you try to add a user that isn't part of your account, you will recieve an error, so make sure you check spelling. The command is case insensitive, so ${cased_jumpsplat120} and ${jumpsplat120} would both be considered valid parameters for me. To remove a user, simply use the command ${remove_user} ${username}.`,
		`This webclient is focused on multitasking, through the use of tabs. Up at the top, you can see ${default_tab}, as well as an addition button. Anything displayed in one tab won't show within another tab, so you can keep various tabs that display various forms of information without having them conflict with each other. For example, one tab could be all your users chat, but you've blacklisted well known bots. Another tab could be only one user, with a whitelist that only allows whispers. To modify the tabs, simply right click on a tab and you can rename it. Any tab beyond the first tab can be closed as well, by either middle clicking the tab, or clicking the X. You are unable to close the default tab. There is a limit of 10 tabs in total. Once a tab is closed, that information is lost! So be extra careful not delete any tabs you still need the information within.`,
		`Adding and removing users and channels is easy. Simply use the command ${mixed_command} ${mixed_param} to initiate the appropriate action. To filter by whispers, you can add the ${wspr} channel to the channel filter list. For more explicit information on each command, you can run ${commands}, which will show you every command available to you.`,
		`Lastly, there are buttons in the bottom right hand corner which will allow you to tweak various settings of the webclient, such as the noise and scanline effects. If you have any requests, notice any bugs, or simply want to say thanks, feel free to message me in game, or on Discord! Thank you so much for using my client!`]
		
		this.tutorial_step++
		this.tutorial_has_run = this.tutorial_step >= steps.length - 1
		
		return [steps[this.tutorial_step], "system"]
	}
	
	submitChat() {
		if (event.key.toLowerCase() == "enter") {
			let response, tab, value, add_user, channel, user
			
			value = event.target.value
			
			tab      = new ColoredText(this.activeTabDisplayName).asGeneric("tab")
			add_user = new ColoredText("/add_user").asGeneric("item")
			channel  = new ColoredText("/channel").asGeneric("item")
			user     = new ColoredText("/user").asGeneric("item")
			
			response =  value.charAt(0) == "/" ? this.parseCommand()       :
					   !this.tutorial_has_run  ? this.runThroughTutorial() :
						this.activeTabUsers.length == 0 ? [`NO USERS ACTIVE FOR TAB ${tab}. ADD USERS VIA THE ${add_user} COMMAND`, "alert"] : 
						this.activeTabUsers.length == 1 ? (this.mainChannel ? (hmAPI.sendMessage(value), false) : [`NO MAIN CHANNEL SELECTED. CHOOSE A CHANNEL TO CHAT IN WITH THE ${channel} COMMAND`, "alert"]) :
						this.activeTabUsers.length >= 2 ? (this.mainChannel && this.mainUser ? (hmAPI.sendMessage(value), false) : 
														  !this.mainChannel ? [`NO MAIN CHANNEL SELECTED. CHOOSE A CHANNEL TO CHAT IN WITH THE ${channel} COMMAND`, "alert"] :
														  !this.mainUser    ? [`NO MAIN USER SELECTED. CHOOSE A USER TO CHAT WITH WITH THE ${user} COMMAND`, "alert"] :
																			  [`ERR CODE: 541 - RESPONSE EVALUATED TO IMPOSSIBLE STATE.`, "error"]) : 
																			  [`ERR CODE: 542 - RESPONSE EVALUATED TO IMPOSSIBLE STATE.`, "error"]
		
			this.chatsInputL.value = ""
			
			if (response) { this.addMessageToChat(response) }
		}
	}
	
	//unfinished
	sanitize() {
		
	}
	
	addMessageToChat(response) {
		let mod, message, type
		
		mod = new ElementConstructor()
		mod.modifyExistingElement(this.chatsL)
		
		message = response[0]
		type    = response[1]

		message = type ? new ColoredText(message)["as" + type.toCapitalCase()] : message
		
		builder.createElement("p")
		builder.addFlag(this.activeTabID)
		builder.addClasses("clear", "default-text", "main-entry")
		builder.addInnerHTML(message)
		
		mod.addChild(builder.returnElement)
		mod.clear()
	}
	
	//unfinished
	changeListType(to) {
		let clicked_button, unclicked_button
		
		clicked_button   = new ElementConstructor(j.getL(to))
		unclicked_button = new ElementConstructor(to.contains("username") ? 
			to.contains("bl") ? this.usernamesButtonsWL : this.usernamesButtonsBL :
			to.contains("bl") ? this.channelsButtonsWL : this.channelsButtonsBL)
		
		clicked_button.checked = true
		clicked_button.addClass("button-choice")
		console.dir(unclicked_button.element)
		unclicked_button.checked = false
		unclicked_button.removeClass("button-choice")
		//builder.checked = true
		//builder.addClass("button-choice")
		
		
		/*
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
		}*/
	}
	
	//unfinished
	toggleState() {
		
	}
	
	//unfinished
	addTab() {
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
	
	//unfinished
	handleTabClick() {
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
	
	determineTarget() {
		let type, target, label
		
		type   = event.type
		target = event.target
		label  = target.control || { id: false }

		if (target.id == "" && label.id == "") { return false } //Anything we interact with that we care about will have an ID; skip anything without one

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
				"username_",
				"channel_",
				"tabs_",
				"add_button"
			]

			if (valid.contains(target.id) || valid.contains(label.id)) { 
				return target.id || label.id
			} else {
				return false
			}
		}
	}
	
	handleOnKeyDown() {
		let target
		
		target = this.determineTarget()
		
		if (target) { //don't bother checking if false; saves cycles
			let sorter = {
				password_input: this.submitPassword.bind(this),
				chat_input:     this.submitChat.bind(this),
				new_label:      this.labelInput.bind(this)
			}
			
			if (target in sorter) {
				sorter[target]()
			} else {
				throw new Error(`Unable to handle target ${target} onKeyDown; confirm valid entry within 'determineTarget()' method first, or confirm entry within 'handleOnKeyDown()'.`)
			}
		}
	}
	
	handleOnMouseClick() {
		let target

		target = this.determineTarget()
		
		if (target) {
			let sorter = {
				username_bl:     this.changeListType.bind(this),
				username_wl:     this.changeListType.bind(this),
				username_toggle: this.toggleState.bind(this),
				channel_bl:      this.changeListType.bind(this),
				channel_wl:      this.changeListType.bind(this),
				channel_toggle:  this.toggleState.bind(this),
				add_button:      this.addTab.bind(this)
			}
			
			if (target in sorter) {
				sorter[target](target)
			} else if (target.contains("tabs_")) { //dynamic names means tabs have to be handled here
				this.handleTabClick()
			} else {
				throw new Error(`Unable to handle target ${target} onKeyDown; confirm valid entry within 'determineTarget()' method first, or confirm entry within 'handleOnKeyDown()'.`)
			}
		}
	}
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
