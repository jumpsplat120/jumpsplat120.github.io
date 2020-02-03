class ColoredText {
	constructor(string) {
		this.text = JSON.stringify(string)
	}
	
	get asSystem() { return `<span class="system">### ${this.text} ###</span>` }
	get asAlert() { return `<span class="alert">### ${this.text} ###</span>` }
	get asError() { return `<span class="error">!!! ${this.text} !!!</span>` }
	
	asGeneric(type) {
		let generic_types = ["item", "name", "tab"]
		
		if (generic_types.contains(type)) {
			return `<span class="generic-${type}">${this.text}</span>`
		} else {
			throw new Error(`${type} is not a valid generic type. (Make sure CSS and ColoredText constructor match!)`)
		}
	}
	
	get asUser() {
		
	}
	
	get asChannel() {
		
	}
	
	get asKey() {
		
	}
	
	get asValue() {
		
	}
	
	isKeyValuePair() {
		
	}
	
	get hackmudify() {
		
	}
}