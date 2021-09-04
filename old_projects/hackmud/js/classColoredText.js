class ColoredText {
	constructor(string) {
		this._ = {
			newEmptySpan: _=> {
				return this.builder.createElement("span")
			}
		}
		this.builder = new ElementConstructor()
		this.text    = string
	}
	
	get asSystem() {
		this._.newEmptySpan()
		this.builder.addClass("system")
		this.builder.addInnerHTML(`### ${this.text} ###`)
		
		return this.builder.returnElementAsText
	}
	get asAlert()  {
		this._.newEmptySpan()
		this.builder.addClass("alert")
		this.builder.addInnerHTML(`### ${this.text} ###`)
		
		return this.builder.returnElementAsText 
	}
	get asError()  {
		this._.newEmptySpan()
		this.builder.addClass("error")
		this.builder.addInnerHTML(`!!! ${this.text} !!!`)
		
		return this.builder.returnElementAsText 
	}
	
	asGeneric(type) {
		let generic_types = ["item", "name", "tab", "command"]
		
		if (generic_types.contains(type)) {
			this._.newEmptySpan()
			this.builder.addClass("generic-" + type)
			this.builder.addInnerHTML(this.text)
			
			return this.builder.returnElementAsText
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