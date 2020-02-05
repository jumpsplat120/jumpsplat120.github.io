function fade(_, el) {
	//The first parameter doesn't do anything anymore. It used to define the fade direction but that's no longer needed when we are using .toggle(). It's left in as a way to specify the fade direction when calling this function, that way you're not left wondering which direction the intent to fade is for.
	let cl, curr_time, timeout
	
	cl        = j.getL(el).classList
	curr_time = new Date().getTime()
	timeout   = curr_time > fade_ends ? 0 : fade_ends - curr_time
	
	setTimeout(_=> { 
		if (cl.contains("invisible")) {
			cl.toggle("no-display")
			setTimeout(_=>{ cl.toggle("invisible") }, 10)
		} else {
			cl.toggle("invisible") 
			setTimeout(_=> { cl.toggle("no-display") }, 500)
		}}, timeout)
	
	fade_ends = new Date().getTime() + timeout + 500
}
window.onload =_=> {
	hmAPI.http.onload    = hmAPI.handleResponse()
	document.onkeydown   = chat.handleOnKeyDown.bind(chat)
	document.onpointerup = chat.handleOnMouseClick.bind(chat)
}
