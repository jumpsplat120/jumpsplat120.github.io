class ElementConstructor {
	constructor(element) {
		if (element !== undefined) {
			if (!this.isValidElement(element)) { throw new Error("Passed element was not a valid HTML element.") }
		}
		this._ = { element }
	}
	
	isValidElement(element) {
		if (typeof element !== "object") { return false } else {
			let string_name, r1, r2
			
			string_name = element.toString()
			r1 = /\[object HTML.+Element\]/
			r2 = /\[object HTMLUknownElement\]/
			
			if (r1.test(string_name)) {
				return !r2.test(string_name) //Anything except HTMLUknownElement
			} else {
				return false //Not an HTMLElement
			}
		}
	}
	
	isValidElementType(element_type) {
		let div = document.createElement("div")
		div.innerHTML = `<${element_type}></${element_type}>`.toFragment().childNodes[0]
		return div.innerHTML.toString() !== "[object HTMLUnknownElement]"
	}
	
	get elementExists() {
		return this._.element !== undefined
	}
	
	createElement(type) {
		if (this.elementExists) {
			throw new Error("Element already exists within builder! Return the current element before creating a new one.")
		} else {
			if (this.isValidElementType(type)) {
				this._.element = `<${type}></${type}>`.toFragment().childNodes[0]
			} else {
				throw new Error(`'${type}' is not a valid HTML Element type.`)
			}
		}
	}
	
	modifyExistingElement(element) {
		if (element) {
			if (this.elementExists) {
				throw new Error("Element already exists within builder! Return the current element before creating a new one.")
			} else {
				if (this.isValidElement(element)) {
					this._.element = element
				} else {
					throw new Error("Provided element was not a valid HTML Element.")
				}
			}
		} else {
			throw new Error("No element was passed.")
		}
	}
	
	hasClass(class_name) {
		return this.element.classList.contains(class_name)
	}
	
	addClass(class_name) {
		if (this.hasClass(class_name)) {
			throw new Error(`Element already contains the '${class_name}' class.`)
		} else {
			this.element.classList.add(class_name)
		}
	}
	
	addClasses(array) {
		array = typeof array !== "array" ? arguments : array
		
		for (let i = 0; array.length > i; i++) {
			this.addClass(array[i])
		}
	}
	
	removeClass(class_name) {
		if (this.hasClass(class_name)) {
			this.element.classList.remove(class_name)
		} else {
			throw new Error(`Element does not contain a '${class_name}' class to remove.`)
		}
	}
	
	removeClasses(array) {
		array = typeof array !== "array" ? arguments : array
		
		for (let i = 0; array.length > i; i++) {
			this.removeClass(array[i])
		}
	}
	
	toggleClass(class_name) {
		this.element.classList.toggle(class_name)
	}
	
	toggleClasses(array) {
		array = typeof array !== "array" ? arguments : array
		
		for (let i = 0; array.length > i; i++) {
			this.toggleClass(array[i])
		}
	}
	
	hasAttribute(attr_name) {
		return this.element.dataset[attr_name] !== undefined
	}
	
	addAttribute(attr_name, value) {
		if (this.hasAttribute(attr_name)) {
			throw new Error(`Element already contains a '${attr_name}' attribute.`)
		} else {
			this.element.dataset[attr_name] = value
		}
	}
	
	removeAttribute(attr_name) {
		if (this.hasAttribute(attr_name)) {
			delete this.element.dataset[attr_name]
		} else {
			throw new Error(`Element does not contain a '${attr_name}' attribute to remove.`)
		}
	}
	
	toggleAttribute(attr_name) {
		if (this.hasAttribute(attr_name)) {
			delete this.element.dataset[attr_name]
		} else {
			this.element.dataset[attr_name] = true
		}
	}
	
	modifyAttributeValue(attr_name, value) {
		if (this.hasAttribute(attr_name)) {
			this.element.dataset[attr_name] = value
		} else {
			throw new Error(`Unable to modify attribute value; attribute '${attr_name}' does not exist.`)
		}
	}
	
	getAttributeValue(attr_name) {
		if (this.hasAttribute(attr_name)) {
			return this.element.dataset[attr_name]
		} else {
			throw new Error(`Unable to retrieve attribute value for attribute '${attr_name}', as '${attr_name}' doesn't exist.`)
		}
	}
	
	get allAttributes() {
		if (this.element.dataset.length !== 0) {
			return this.element.dataset
		} else {
			throw new Error("No attributes exist.")
		}
	}
	
	/*A flag is just an attribute with no value*/
	hasFlag(flag_name) {
		return this.hasAttribute(flag_name)
	}
	
	addFlag(flag_name) {
		if (this.hasFlag(flag_name)) {
			throw new Error(`Element already contains a '${flag_name}' flag.`)
		} else {
			this.addAttribute(flag_name, true)
		}
	}
	
	removeFlag(flag_name) {
		if (this.hasFlag(flag_name)) {
			this.removeAttribute(flag_name)
		} else {
			throw new Error(`Element does not contain a '${flag_name}' flag to remove.`)
		}
	}
	
	toggleFlag(flag_name) {
		this.toggleAttribute(flag_name)
	}
	
	get checked() {
		return this.element.checked
	}
	
	set checked(bool) {
		if (typeof bool !== "boolean") { 
			throw new Error("Checked can only be set to true or false.")
		} else {
			this.element.checked = bool
		}
	}
	
	toggleChecked() {
		this.checked = !this.checked
	}
	
	get hasInnerHTML() {
		return this.element.innerHTML !== ""
	}
	
	addInnerHTML(string) {
		if (this.hasInnerHTML) {
			throw new Error("Element already contains something within innerHTML. You must use removeInnerHTML() first, or appendInnerHTML() to modify the existing text.")
		} else {
			this.element.innerHTML = string
		}
	}
	
	removeInnerHTML() {
		if (this.hasInnerHTML) {
			delete this.element.innerHTML
		} else {
			throw new Error("Element does not contain anything within innerHTML to remove.")
		}
	}
	
	replaceInnerHTML(string) {
		this.removeInnerHTML()
		this.addInnerHTML(string)
	}
	
	appendInnerHTML(string, position) {
		if (!position) {
			throw new Error("appendInnerHTML() requires a position parameter; you may use 'before' or 'after' to declare the position.")
		}
		
		position = position.toLowerCase()
		
		if (this.hasInnerHTML) {
			let innerHTML = this.element.innerHTML
			
			innerHTML = position == "before" ? string + innerHTML :
						position == "after"  ? innerHTML + string : true
			
			this.removeInnerHTML()
			this.addInnerHTML(innerHTML)
			
		} else {
			throw new Error("Element contains nothing within innerHTML to append to.")
		}
	}
	
	get innerHTML() {
		if (this.hasInnerHTML) {
			return this.element.innerHTML
		} else {
			throw new Error("No innerHTML exists.")
		}
	}
	
	set innerHTML(value) {
		throw new Error("You must use innerHTML methods to manipulate innerHTML.")
	}
	
	get hasID() {
		return this.element.id !== ""
	}
	
	set id(value) {
		throw new Error("Can not set id directly; you must use one of the ID methods.")
	}
	
	get id() { 
		if (this.hasID) {
			return this.element.id
		} else {
			throw new Error("Element does not have an ID.")
		}
	}
	
	addID(new_id) {
		if (this.hasID) {
			throw new Error(`Element already contains id '${this.id}'.`)
		} else {
			this.element.id = new_id
		}
	}
	
	removeID() {
		if (this.hasID) {
			this.element.id = ""
		} else {
			throw new Error("No id exists to remove.")
		}
	}
	
	replaceID(new_id) {
		if (this.hasID) {
			this.element.id = new_id
		} else {
			throw new Error("No ID exists to replace.")
		}
	}
	
	get childrenAmount() {
		return this.element.children.length
	}
	
	childExists(index) {
		return this.element.children[index] !== undefined
	}
	
	child(index) {
		if (this.childExists(index)) {
			return this.element.children[index]
		} else {
			throw new Error(`Unable to access child at index ${index}.`)
		}
	}
	
	addChild(element) {
		this.element.appendChild(element)
	}
	
	removeChild(index) {
		if (this.childExists(index)) {
			this.child.remove()
		} else {
			throw new Error(`Unable to remove child at index ${index}.`)
		}
	}
	
	get text() {
		//innerText is more performant heavy, but is a more accurate representation of what is
		//actually being shown in the document. However, not all Nodes use innerText. Therefore
		//we want to use innerText if it exists, otherwise use textContent. However, textContent
		//will ignore certain formatting, so it's important to throw an warn as it may provide
		//undesired effects.
		if (this.element.innerText !== undefined) {
			return this.element.innerText
		} else {
			console.warn("Element does not contain .innerText; using .textContent as a fallback.")
			return this.element.textContent
		}
	}
	
	get hasLabel() {
		if (this.element.label !== undefined) { return true } else { return false }
	}
	
	get labelText() {
		if (this.hasLabel) {
			return this.element.label.innerText
		} else {
			throw new Error("Element does have an assigned label.")
		}
	}
	
	get element() {
		if (this.elementExists) {
			return this._.element
		} else {
			throw new Error("No current element exists.")
		}
	}
	
	clear() {
		if (this.elementExists) {
			delete this._.element
		} else {
			throw new Error("Unable to clear saved element, as no element currently exists.")
		}
	}
	
	get returnElement() {
		if (this.elementExists) {
			let element = this.element
			this.clear()
			return element
		} else {
			throw new Error("Unable to return element, as no element currently exists.")
		}
	}
	
	get returnElementAsText() {
		if (this.elementExists) {
			let element = this.element
			this.clear()
			return element.outerHTML
		} else {
			throw new Error("Unable to return element, as no element currently exists.")
		}
	}
}