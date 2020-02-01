window.onload =_=> {
}

function tabClick() {
	let target, dflt
	
	target = event.target
	dflt   = j.getEl("tabs_dflt")
	
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
			
			input = j.getEl("new_label")
			span  = j.getEl("new_label_measure")
			
			input.style.width = span.offsetWidth + "px"
			input.focus()
		}
	]
	
	options[event.button]()
}

function labelInput(placeholder) {
	let key, input, span
	
	key   = event.data
	input = event.target
	span  = input.previousSibling
	
	span.textContent = input.value != "" ? input.value : placeholder
	
	input.style.width = span.offsetWidth + "px"
}

function labelSubmit(literal) {
	let key, exit, input
	
	input = event.target
	key   = event.key.toLowerCase()
	exit  = key == "escape" || key == "enter"

	if (exit) { input.blur() } 
	//losing focus triggers labelFocusLost(); 
	//running it directly would cause it to trigger twice, 
	//once on labelSubmit() and again when the element dissapears, 
	//as focus is lost then as well.
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
		const dflt = document.getElementById("tabs_dflt")
		
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
			if (tab_amount == 9) { j.getEl("add_button").classList.remove("no-display") }
		}
	}
}

function addTab() {
	let tabs_el, tabs, tabs_array, new_id, index
	
	tabs_el    = j.getEl("tabs")
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
	
	j.getEl("username_toggle").dataset[new_id] = "off"
	j.getEl("channel_toggle").dataset[new_id]  = "off"
	
	tabs_el.insertBefore(new_tab, tabs[tabs.length - 2])
	
	changeTab(new_id)
}

function changeTab(tab_id) {
	let usernames, channels, remove
	let user_toggle_button, channel_toggle_button, whitelist, toggle
	let chat_body
	
	usernames = j.getEl("usernames_body").children
	channels  = j.getEl("channels_body").children
	chat_body = j.getEl("chat_body").children
	
	u_whitelist = j.getEl(`tabs_${tab_id}`).dataset.hasFlag("userWhitelist")
	c_whitelist = j.getEl(`tabs_${tab_id}`).dataset.hasFlag("chanWhitelist")
	
	user_toggle_button    = j.getEl("username_toggle")
	channel_toggle_button = j.getEl("channel_toggle")
	
	remove = element => {
		if (element.dataset.hasFlag(tab_id)) { element.classList.remove("no-display") } else { element.classList.add("no-display") }
	}
	
	toggle = (wl_button, bl_button, whitelist) => {
		let wl_class, bl_class

		wl_button.checked = whitelist
		bl_button.checked = !whitelist
		
		wl_class = wl_button.label.classList
		bl_class = bl_button.label.classList
		
		if (whitelist) { 
			wl_class.add("button-choice")
			bl_class.remove("button-choice")
		} else {
			wl_class.remove("button-choice")
			bl_class.add("button-choice")
		}
	}
	
	usernames.forEach(remove)
	channels.forEach(remove)
	chat_body.forEach(remove)
	
	toggle(j.getEl("username_wl"), j.getEl("username_bl"), u_whitelist)
	toggle(j.getEl("channel_wl"), j.getEl("channel_bl"), c_whitelist)
	
	if (user_toggle_button.dataset[tab_id] !== user_toggle_button.innerHTML) { toggleList(user_toggle_button) }
	if (channel_toggle_button.dataset[tab_id] !== channel_toggle_button.innerHTML) { toggleList(channel_toggle_button) }
}

function submitPass() {
	
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
	tab_dataset = j.getEl(`tabs_${active_tab}`).dataset
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

function toggleList(el) {
	let button, list, tabs, active_tab
	
	tabs    = j.getEl("tabs").children
	button  = el || event.target
	dataset = button.dataset
	
	active_tab = getActiveTab()
		
	button.classList.toggle("button-toggle")
	button.innerHTML = button.textContent == "off" ? "on" : "off"

	dataset[active_tab] = button.innerHTML
}

function chatInput() {
	let key, input, value, match, fragment, response, active_tab, tab_name, value_el
	let active_user_filter, active_channel_filter
	let command_array, command_functions_array
	let usernames_el, channels_el
	
	key   = event.key.toLowerCase()
	input = event.target
	value = `${input.value}`
	match = false
	
	usernames_el = j.getEl("usernames_body")
	channels_el  = j.getEl("channels_body")
	
	active_tab = getActiveTab()
	
	j.getEl("usernames_buttons").children.forEach(element => { if (element.checked) { 
		active_user_filter = element.id.includes("wl") ? "whitelist" : "blacklist"
		active_user_filter = `<span class="generic-item">${active_user_filter}</span>`
	}})
	j.getEl("channels_buttons").children.forEach(element => { if (element.checked) { 
		active_channel_filter = element.id.includes("wl") ? "whitelist" : "blacklist"
		active_channel_filter = `<span class="generic-item">${active_channel_filter}</span>`
	}})
	
	tab_name = `<span class="generic-tab">${j.getEl("tabs_" + active_tab).label.innerText}</span>`
	
	command_array = [
		/^\/add_username/,
		/^\/remove_username/,
		/^\/add_channel/,
		/^\/remove_channel/
	]
	
	command_functions_array = [
		_=> {
			if (value) {
				let usernames = usernames_el.children
				
				for (i = 0; usernames.length > i; i++) {
					if (usernames[i].dataset.hasFlag(active_tab)) {
						if (usernames[i].textContent == value) {
							response = [`USERNAME ${value_el} ALREADY EXISTS IN ${active_user_filter} IN ${tab_name}`, "alert"]
							return
						}
					}
				}
				
				response = [`ADDED USERNAME ${value_el} TO ${active_user_filter} FOR ${tab_name}`, "system"]
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
						response = [`REMOVED USERNAME ${value_el} FROM ${active_user_filter} FOR ${tab_name}`, "system"]
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
							response = [`CHANNEL ${value_el} ALREADY EXSISTS IN ${active_user_filter} IN ${tab_name}`, "alert"]
							return
						}
					}
				}
				
				response = [`ADDED CHANNEL ${value_el} TO ${active_user_filter} for ${tab_name}`, "system"]
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
						response = [`REMOVED CHANNEL ${value_el} FROm ${active_filter} FOR ${tab_name}`, "alert"]
						channels[i].remove()
						break
					}
				}
			}
			
			response = response || [`NO CHANNEL REMOVED [MAKE THIS MORE VERBOSE]`, "alert"]
		}
	]
	
	if (key == "enter") {
		command_array.forEach((element, index) => {if (element.test(value)) { match = index }})
		
		if (match !== false) {
			value    = value.split(" ")[1] || ""
			value    = value.toLowerCase()
			value_el = `<span class="generic-name">${value}</span>`
			fragment = `<p data-${active_tab} class="clear default-text list-entry">${value}</p>`.toFragment()
			
			command_functions_array[match]()
		}
		
		j.getEl("chat_input").value = ""
	} else {
		response = false
	}
	
	if (response) { addMessage(response) } 
}

function addMessage(response) {
	let template, message, type
	let active_tab, remove_x
	
	message = response[0]
	type    = response[1]
	
	active_tab = getActiveTab()
	
	template  = `<p data-${active_tab} class="clear default-text main-entry`
	template += type ? (message = active_tab != "dflt" ? message.slice(0,-9) + "</span>" : message, ` ${type}`) : template
	
	message   = type == "system" ? `### ${message} ###` :
				type == "alert"  ? `### ${message} ###` :
				type == "error"  ? `!!! ${message} !!!` : message
	template += `">${message}</p>`
	
	j.getEl("chat_body").appendChild(template.toFragment())
}

function getActiveTab() {
	let active_tab
	
	j.getEl("tabs").children.forEach(element => {
		if (element.checked) { active_tab = element.id.match(/tabs_(\w\w\w\w)/)[1] }
	})
	
	return active_tab
}