class Chat {
	constructor() {
		this._ = {
			tutorial: {
				run: false,
				step: -1
			},
			intro: {
				viewed: false
			},
			state: {
				current: "INTRO",
				valid: ["INTRO", "LOGIN", "MAIN"]
			}
		}
	}
	
	get tutorialHasRun() { return this._.tutorial.run  }
	get tutorialStep()   { return this._.tutorial.step }
	get state()          { return this._.state.current }
	get introViewed()    { return this._.intro.viewed  }
	
	set tutorialHasRun(value) {
		if (typeof value === "boolean") {
			this._.tutorial.run = value
			storage.save("tutorial_has_run", value)
		} else {
			throw new Error("tutorialHasRun can only be set to a boolean value.")
		}
	}
	set tutorialStep(value) {
		if (typeof value === "number") {
			this._.tutorial.step = value
		} else {
			throw new Error("tutorialStep can only be set to a number value.")
		}
	}
	set state(value) {
		console.log("Changing state to " + value + ".")
		console.log(this._.state)
		if (typeof value === "string") {
			if (this._.state.valid.contains(value.toUpperCase())) {
				this._.state.current = value.toUpperCase()
			} else {
				throw new Error(value + " is not a valid state.")
			}
		} else {
			throw new Error("State can only be set to a string value.")
		}
	}
	set introViewed(value) {
		if (typeof value === "boolean") {
			this._.intro.viewed = value
			storage.save("intro_viewed", value)
		} else {
			throw new Error("introViewed can only be set to a boolean value.")
		}
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
	get defaultTabL()        { return j.getL("tabs_dflt")         }
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
		let result
		
		this[type + "ButtonsL"].children.forEach(element => {
			let builder = new ElementConstructor()
			
			builder.modifyExistingElement(element)
			
			if (builder.checked) { result = builder.id.includes("wl") ? "whitelist" : "blacklist" }})
		
		return result !== undefined ? result : false
	}
	
	get activeTabID() {
		let active_tab_id
		
		this.tabsL.children.forEach(element => { if (element.checked) { active_tab_id = element.id.match(/tabs_(\w\w\w\w)/)[1] } })
		
		return active_tab_id
	}
	
	get activeTabElement() {
		return j.getL("tabs_" + this.activeTabID)
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
	
	get activeTabPosition() {
		let index
		
		this.tabsL.children.forEach((element, i) => { if (element.id == this.activeTabID) { index = i } })
			
		return index
	}
	
	getTabID(tab_name) {
		return tab_name.match(/tabs_(\w\w\w\w)/)[1]
	}
	
	changeToTab(tab_id) {
		let remove, toggle, onOff, disable
		let tab, is_default
		
		tab        = new ElementConstructor(j.getL(`tabs_${tab_id}`))
		is_default = tab_id == "dflt"
		
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
			let list_type = whitelist ? "wl" : "bl"

			this.changeListType(type + "_" + list_type)
		}
		
		//toggle the on/off button
		onOff = element => {
			builder.modifyExistingElement(element)
			
			if (builder.getAttributeValue(tab_id) !== builder.text) {
				builder.toggleClass("button-toggle")
				builder.replaceInnerHTML(element.innerHTML == "off" ? "on" : "off")
				if (builder.hasAttribute(this.activeTabID)) {
					builder.modifyAttributeValue(this.activeTabID, element.innerHTML)
				} else {
					builder.addAttribute(this.activeTabID, element.innerHTML)
				}
			}
			
			builder.clear()
		}
		
		//disable all other tabs
		disable = element => {
			let span_x, is_default_tab
			
			builder.modifyExistingElement(element)

			if (builder.type == "input") {
				is_default_tab = builder.id == "tabs_dflt"
				
				if (!is_default_tab) { span_x = builder.label.child(0) }
				
				builder.checked = false
				
				if (builder.label.hasClass("button-choice")) { builder.label.removeClass("button-choice") }
				if (span_x && span_x.hasFlag("active")) { span_x.removeFlag("active") }
			}
			
			builder.clear()
		}
		
		this.tabsL.children.forEach(disable)
		
		/*--activate tab--*/
		tab.checked = true
		tab.label.addClass("button-choice")

		if (!is_default) { tab.label.child(0).addFlag("active") }
		/*-------------*/
		
		this.usernamesL.children.forEach(remove)
		this.channelsL.children.forEach(remove)
		this.chatsL.children.forEach(remove)
		
		toggle("username", tab.hasFlag("usernameWhitelist"))
		toggle("channel", tab.hasFlag("channelWhitelist"))
		
		onOff(this.channelsButtonsTL)
		onOff(this.usernamesButtonsTL)
	}
	
	removeTab(tab_id) {	
		if (tab_id !== "dflt") {
			let tab, was_active, add_button
			
			tab        = new ElementConstructor(j.getL("tabs_" + tab_id))
			add_button = new ElementConstructor(j.getL("add_button"))
			
			was_active = tab.checked
			
			tab.label.remove()
			tab.remove()
			
			if (add_button.hasClass("no-display")) { add_button.removeClass("no-display") }
			
			if (was_active) { this.changeToTab("dflt") }
		}
	}
	
	//returns the label and the button!
	createNewTab(tab_parameters) {
		let button, label, span
		let has_alphanum, has_spaces
		
		button = new ElementConstructor("input")
		label  = new ElementConstructor("label")
		span   = new ElementConstructor("span")
		
		if (tab_parameters) { //I don't know why I feel like I'm going to end up missing something, so we've got a bunch of asserts. Normally I don't but eh
			console.assert(tab_parameters.tabID             !== undefined, "Missing tabID.")
			console.assert(tab_parameters.original_name     !== undefined, "Missing original_name.")
			console.assert(tab_parameters.was_active        !== undefined, "Missing was_active.")
			console.assert(tab_parameters.position          !== undefined, "Missing position.")
			console.assert(tab_parameters.user_whitelist    !== undefined, "Missing user_whitelist.")
			console.assert(tab_parameters.channel_whitelist !== undefined, "Missing channel_whitelist.")
			console.assert(tab_parameters.new_name          !== undefined, "Missing new_name.")
		}

		button.addID("tabs_" + tab_parameters.tabID)
		
		button.modifyProperty("type", "radio")
		button.modifyProperty("name", "tabs")
		
		if (tab_parameters.user_whitelist) { button.addFlag("usernameWhitelist") }
		if (tab_parameters.chan_whitelist) { button.addFlag("channelWhitelist") }
		
		button.addClass("no-display")
		
		if (tab_parameters.was_active) { button.checked = true }
		
		label.modifyProperty("for", `tabs_${tab_parameters.tabID}`)
		
		label.addClasses("default-text", "radio-label", "button")
		if (tab_parameters.was_active) { label.addClass("button-choice") }
		
		label.addInnerHTML(tab_parameters.new_name.match(/\w+/) ? tab_parameters.new_name.replace(/ /g, "_") : tab_parameters.original_name)
		
		if (tab_parameters.tabID !== "dflt") {
			if (tab_parameters.was_active) { span.addFlag("active") }
			
			span.addID(`close_${tab_parameters.tabID}`)
			
			span.addClass("button-exit")
			
			span.addInnerHTML("&nbsp;X")
			
			span.element.addEventListener("mouseover", function() { event.stopPropagation() })
			
			label.addChild(span.returnElement)
		}
		
		return { label: label.returnElement, button: button.returnElement }
	}
	
	saveNewTabName() {
		let input, tab_param, elements, tabs
		
		input = new ElementConstructor(event.target)
		tabs  = new ElementConstructor(this.tabsL)
		
		tab_param = {
			tabID:             input.getAttributeValue("tabID"),
			original_name:     input.getAttributeValue("originalName"),
			was_active:        input.getAttributeValue("wasActive").asBoolean,
			position:          input.getAttributeValue("position"),
			user_whitelist:    input.hasFlag("usernameWhitelist"),
			channel_whitelist: input.hasFlag("channelWhitelist"),
			new_name:          input.currentInput
		}
		
		elements = this.createNewTab(tab_param)
		
		j.getL("new_label").remove()

		tabs.addChildAt(tab_param.position, elements.label)
		tabs.addChildAt(tab_param.position, elements.button)
	}
	
	newTabInput() {
		let target, key, measuring_stick
		
		target = new ElementConstructor(event.target)
		key    = event.key.toLowerCase()

		measuring_stick = new ElementConstructor(target.previousSibling.returnElement)
		
		if (!measuring_stick.hasAssignedSizeUnit) { measuring_stick.sizeUnit = "px" }
		
		if (key == "enter") {
			target.loseFocus()
		} else {
			let curr_input, input, at_max_length, cursor_at_start
			
			curr_input      = target.currentInput
			at_max_length   = curr_input.length >= 15
			cursor_at_start = event.target.selectionStart == 0
			
			input = key.match(/^.$/)    ? 
						at_max_length   ? curr_input : curr_input + key :
					key == "backspace"  ? 
						cursor_at_start ? curr_input : curr_input.slice(0, -1)  :
					curr_input
			
			input += " "
			
			measuring_stick.replaceInnerHTML(input !== " " ? input : "input new name here ")

			target.modifyStyle("width", measuring_stick.width)
		}
	}
	
	addTab() {
		let index, elements, tab_param, tabs
		
		tabs = new ElementConstructor(this.tabsL)
		
		index = tabs.childrenAmount
		
		tab_param = {
			tabID:             j.randomString(4),
			original_name:     "new_tab_" + (((index - 1) / 2) + 1).toString(),
			was_active:        false,
			position:          index - 1,
			user_whitelist:    false,
			channel_whitelist: false
		}
		
		tab_param.new_name = tab_param.original_name
		
		elements = this.createNewTab(tab_param)
		
		tabs.addChildAt(tab_param.position, elements.label)
		tabs.addChildAt(tab_param.position, elements.button)
		
		//Each button takes two elements, the label + the button. The add button is one as well
		if (index == 19) { new ElementConstructor(j.getL("add_button")).addClass("no-display") }
		
		new ElementConstructor(this.usernamesButtonsTL).addAttribute(tab_param.tabID, "off")
		new ElementConstructor(this.channelsButtonsTL).addAttribute(tab_param.tabID, "off")
		
		this.changeToTab(tab_param.tabID)
	}
	
	handleTabClick() {
		let map, click, target, clicked_element, is_default_tab, tab_id
		
		target          = event.target
		clicked_element = new ElementConstructor(target)
		is_default_tab  = clicked_element.control.id == "tabs_dflt"
		tab_id          = clicked_element.control.id.match(/tabs_(\w\w\w\w)/)[1]
		
		function leftClick() {
			this.changeToTab(tab_id)
		}
		
		function rightClick() {
			let prev, input, span, old_text, index
			
			span  = new ElementConstructor()
			input = new ElementConstructor()
			
			old_text = is_default_tab ? clicked_element.text : clicked_element.text.slice(0, -2)
			
			this.tabsL.children.forEach((element, i) => { if (element.id == clicked_element.control.id) { index = i } })
			
			builder.createElement("div")
			span.createElement("span")
			input.createElement("input")
			
			builder.addID("new_label")
			span.addID("new_label_measuring_stick")
			input.addID("new_label_input")
			
			builder.addClasses("default-text", "input-wrapper")
			span.addClasses("clear", "input-measure")
			input.addClasses("clear", "default-text", "input")
			
			input.addAttribute("tabID", tab_id)
			input.addAttribute("originalName", clicked_element.text)
			input.addAttribute("wasActive", clicked_element.hasClass("button-choice"))
			input.addAttribute("position", index)
			
			if (clicked_element.control.hasFlag("usernameWhitelist")) { input.addFlag("usernameWhitelist") }
			if (clicked_element.control.hasFlag("channelWhitelist")) { input.addFlag("channelWhitelist") }

			old_text = is_default_tab ? clicked_element.text : clicked_element.text.slice(0, -2)
			
			input.modifyProperty("maxlength", "15")
			input.modifyProperty("placeholder", "input new name here")
			input.modifyProperty("value", old_text)
			
			span.addInnerHTML(old_text + " ")
			
			builder.addChild(span.returnElement)
			builder.addChild(input.returnElement)
			
			clicked_element.replaceWith(builder.returnElement)
			
			input.modifyExistingElement(j.getL("new_label_input"))
			
			j.getL("tabs_" + tab_id).remove()
			
			input.modifyStyle("width", new ElementConstructor(j.getL("new_label_measuring_stick")).width) //Can't get width of measuring stick until it exists in the DOM
			input.gainFocus()

			input.element.addEventListener("blur", this.saveNewTabName.bind(this))
		}
		
		function middleClick() {
			this.removeTab(tab_id)
		}

		click = [leftClick, middleClick, rightClick]
		
		click[event.button].bind(this)()
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
	
	//returns true on successful removal, false otherwise
	removeEntry(tab_id) {		
		let entry, container, result
		
		entry     = new ElementConstructor(event.target)
		container = new ElementConstructor(entry.parent)
				
		for (let i = 0; container.childrenAmount > i; i++) {
			let child = container.child(i)

			if (child.hasFlag(tab_id) && child.text == value) {
				child.remove()
				result = true
				break
			}
		}
		
		return result !== undefined ? result : false
	}
	
	parseCommand() {
		//LAT = eLementAsText, auf = activeUserFilter, acf = activeChannelFilter
		let value, valueLAT, command, tab, tab_id, entry, response
		let auf, acf
		let joinItems, commands
		
		tab_id = this.activeTabID
		
		value   = event.target.value
		value   = value.split(" ") //[/command, value OR nothing]
		command = value[0].slice(1) //We don't need the slash
		value   = value[1] || ""
		
		valueLAT   = new ColoredText(value).asGeneric("name")
		auf        = new ColoredText(this.getActiveFilter("usernames")).asGeneric("item")
		acf        = new ColoredText(this.getActiveFilter("channels")).asGeneric("item")
		tab        = new ColoredText(this.activeTabDisplayName).asGeneric("tab")
		
		builder.createElement("p")
		builder.addFlag(tab_id)
		builder.addClasses("clear", "default-text", "list-entry")
		builder.addID("entry_" + j.randomString(8))
		builder.addInnerHTML(value)
		
		entry = builder.returnElement
		
		joinItems = items => {	
			items = items.join(new ColoredText("/").asGeneric("item"))
			return new ColoredText(items).asGeneric("name")
		}
		
		//A bit repatative, maybe think about rewriting some of the add/remove username/channel stuff?
		commands = {
			add_user        :_=> {
				if (value == "") {
					response = [`NO USER WAS ENTERED`, "alert"]
					return
				}

				if (hmAPI.users.all.contains(value)) {
					
					builder.modifyExistingElement(this.activeTabElement)
					builder.addFlag(value)
					builder.clear()
					
					let users = joinItems(this.activeTabUsers)
					
					response = [`TAB ${tab} IS NOW SHOWING CHAT FOR ${users}`, "system"]
				} else {
					let user, users
					
					user  = valueLAT
					users = joinItems(hmAPI.users.all)
					
					response = [`THIS ACCOUNT DOES NOT CONTAIN A ${user} USER; VALID USER OPTIONS ARE ${users}`, "error"]
				}
			},
			remove_user     :_=> {
				if (value == "") { 
					response = [`NO USER WAS ENTERED`, "alert"]
					return
				}
				let users, user
				
				user = valueLAT
				
				if (hmAPI.users.all.contains(value)) {
					builder.modifyExistingElement(this.activeTabElement)
					builder.removeAttribute(value)
					builder.clear()
					
					users = joinItems(this.activeTabUsers)
					
					response = [`REMOVED ${user} FROM TAB ${tab}; NOW SHOWING ${users}`, "alert"]
				} else {
					let shown_users
					
					users = joinItems(this.activeTabUsers)
					
					if (this.activeTabUsers.isEmpty) {
						shown_users = `THERE ARE NO ACTIVE USERS TO REMOVE.`
					} else {
						shown_users = `CURRENTLY SHOWING USERS ARE ${users}`
					}
					response = [`UNABLE TO REMOVE USER ${user} FROM TAB ${tab}; ${shown_users}`, "error"]
				}
			},
			add_username    :_=> {
				if (value == "") { 
					response = [`NO USERNAME WAS ENTERED`, "alert"]
					return
				}
				
				let user, builder
				
				user    = new ColoredText(value).asGeneric("name")
				builder = new ElementConstructor(this.usernamesL)
				
				for (let i = 0; builder.childrenAmount > i; i++) {
					let child = builder.child(i)
					
					if (child.hasFlag(tab_id) && child.text == value) {
						response = [`USERNAME ${user} ALREADY EXISTS IN ${auf} IN TAB ${tab}`, "alert"]
						return
					}
				}
				
				response = [`ADDED USERNAME ${user} TO ${auf} FOR TAB ${tab}`, "system"]
				
				builder.addChild(entry)
				builder.clear()
			},
			remove_username :_=> {
				let succ, user
				
				succ = this.removeEntry(tab_id, this.usernamesL)
				user = valueLAT
				
				response = succ ? [`REMOVED USERNAME ${user} FROM ${auf} FOR ${tab}`, "system"] : 
								  [`UNABLE TO REMOVE USERNAME ${user} FROM ${auf} FOR ${tab}`, "error"]
			},
			add_channel     :_=> {
				let chan, builder
				
				chan    = valueLAT
				builder = new ElementConstructor(this.channelsL)
				
				for (let i = 0; builder.childrenAmount > i; i++) {
					let child = builder.child(i)
					
					if (child.hasFlag(tab_id) && child.text == value) {
						response = [`CHANNEL ${chan} ALREADY EXISTS IN ${acf} IN TAB ${tab}`, "alert"]
						return
					}
				}
				
				response = [`ADDED CHANNEL ${chan} TO ${acf} FOR TAB ${tab}`, "system"]
				
				builder.addChild(entry)	
				builder.clear()
			},
			remove_channel  :_=> {
				let succ, chan
				
				succ = this.removeEntry(tab_id, this.channelsL)
				chan = valueLAT
				
				response = succ ? [`REMOVED CHANNEL ${chan} FROM ${acf} FOR ${tab}`, "system"] :
								  [`UNABLE TO REMOVE CHANNEL ${chan} FROM ${acf} FOR ${tab}`, "error"]
			},
			reset_tutorial  :_=> {
				this.tutorialStep = -1
				this.tutorialHasRun = false
				response = [`TUTORIAL HAS BEEN RESET`, "system"]
			},
			finish_tutorial :_=> {
				this.tutorialHasRun = true
				response = [`Thank you so much for using my client!`, "system"] 
			},
			play_intro      :_=> {
				
			},
			commands        :_=> { response = [`commands unfinished`, "error"] },
			user            :_=> {
				hmAPI.users.main = value
			},
			channel         :_=> {
				
				hmAPI.channels.main = value
			}
		}
		
		if (command in commands) {
			commands[command]()

		} else {
			let commands, command
			
			commands = new ColoredText("/commands").asGeneric("command")
			command  = new ColoredText("/" + command).asGeneric("command")
			
			response = [`COMMAND ${command} NOT FOUND. CONSIDER RUNNING ${commands} TO VIEW AVAILABLE COMMANDS`, "error"]
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
		
		this.tutorialStep++
		this.tutorialHasRun = this.tutorialStep >= steps.length - 1
		
		return [steps[this.tutorialStep], "system"]
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
					   !this.tutorialHasRun    ? this.runThroughTutorial() :
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
		let mod, message, type, colored_message

		mod = new ElementConstructor()
		mod.modifyExistingElement(this.chatsL)
		
		message = response[0]
		type    = response[1]
		
		colored_message = new ColoredText(message)["as" + type.toCapitalCase()]
		
		if (colored_message !== undefined) {
			message = type ? colored_message : message
		} else {
			throw new Error("colored_message returned undefined; check passed type.")
		}
		
		builder.createElement("p")
		builder.addFlag(this.activeTabID)
		builder.addClasses("clear", "default-text", "main-entry")
		builder.addInnerHTML(message)
		
		mod.addChild(builder.returnElement)
		mod.clear()
	}
	
	changeListType(to, click_event) {
		let clicked, unclicked, unclickedL, active_tab, flag
		
		clicked = new ElementConstructor(j.getL(to))

		if (!clicked.checked) {
			unclickedL = to.contains("username") ? 
				to.contains("bl") ? this.usernamesButtonsWL : this.usernamesButtonsBL :
				to.contains("bl") ? this.channelsButtonsWL : this.channelsButtonsBL
			
			flag = to.contains("username") ? "usernameWhitelist" : "channelWhitelist"
			
			active_tab = new ElementConstructor(this.activeTabElement)
			unclicked  = new ElementConstructor(unclickedL)
			
			clicked.checked = true
			clicked.label.addClass("button-choice")

			unclicked.checked = false
			unclicked.label.removeClass("button-choice")
			
			//We use this to only try to add or remove a flag if changeListType is being run via a click on one of the list buttons. If we are running changeListType through something else (via changeToTab for ex.) Then we won't need to worry about the flag since the state the flag represents isn't changing. 
			if (click_event) { active_tab[`${to.contains("wl") ? "add" : "remove"}Flag`](flag) } 
		}
	}
	
	toggleListState(target) {
		let button, state
		
		button = new ElementConstructor(j.getL(target))
		
		state = button.text == "off" ? "on" : "off"

		button.toggleClass("button-toggle")
		button.replaceInnerHTML(state)
		
		if (button.hasAttribute(this.activeTabID)) {
			button.modifyAttributeValue(this.activeTabID, state)
		} else {
			button.addAttribute(this.activeTabID, state)
		}
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
				"new_label_input"
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
				"add_button",
				"close_",
				"entry_"
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
				password_input:  this.submitPassword.bind(this),
				chat_input:      this.submitChat.bind(this),
				new_label_input: this.newTabInput.bind(this)
			}
			
			if (target in sorter) {
				sorter[target]()
			} else {
				throw new Error(`Unable to handle target ${target} onKeyDown.`)
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
				username_toggle: this.toggleListState.bind(this),
				channel_bl:      this.changeListType.bind(this),
				channel_wl:      this.changeListType.bind(this),
				channel_toggle:  this.toggleListState.bind(this),
				add_button:      this.addTab.bind(this)
			}
			
			if (target in sorter) {
				//true flag for changeListType
				sorter[target](target, true)
			} else if (target.contains("tabs_")) { //dynamic names means tabs have to be handled here
				this.handleTabClick()
			} else if (target.contains("close_")) {
				this.removeTab()
			} else if (target.contains("entry_")) {
				this.removeEntry()
			} else {
				throw new Error(`Unable to handle target ${target} onKeyDown.`)
			}
		}
	}
}
