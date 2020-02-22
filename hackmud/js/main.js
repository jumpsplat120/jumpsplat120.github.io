window.onload =_=> {
	hmAPI.http.onload    = hmAPI.handleResponse.bind(hmAPI)
	hmAPI.http.onerror   = hmAPI.handleError.bind(hmAPI)
	document.onkeydown   = chat.handleOnKeyDown.bind(chat)
	document.onpointerup = chat.handleOnMouseClick.bind(chat)
}
