class CoolestKatzLib {
	constructor() {
		
	}
	
	getL(name) {
		return document.getElementById(name) || false
	}
	
	randomString(length = 4) {
		return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length)
	}
}

let j = new CoolestKatzLib()