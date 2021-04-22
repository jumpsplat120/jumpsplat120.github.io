window.onload =_=> {
	hmAPI.http.onload    = hmAPI.handleResponse.bind(hmAPI)
	hmAPI.http.onerror   = hmAPI.handleError.bind(hmAPI)
	document.onkeydown   = chat.handleOnKeyDown.bind(chat)
	document.onpointerup = chat.handleOnMouseClick.bind(chat)
	
	if (storage.has("tutorial_has_run")) { chat.tutorialHasRun = true }
	
	if (storage.has("intro_viewed")) {
		new ElementConstructor(j.getL("intro")).addClasses("invisible", "no-display")
		new ElementConstructor(j.getL("login")).removeClasses("invisible", "no-display")
		
		
		if (storage.has("chat_token")) {
			gooey.fadeOutMultiple("password", "password_error")
			gooey.fadeIn("loading_animation")
			
			hmAPI.token = storage.get("chat_token")
			hmAPI.validateToken()
		}
	} else {
		gooey.playIntro()
	}
}
