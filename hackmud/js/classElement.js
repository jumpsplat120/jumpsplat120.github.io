class ElementConstructor {
	constructor(element) {
		
		if (element !== undefined) {
			if (this.isValidElement(element)) {
				//element = element
			} else if (this.isValidElementType(element)) {
				element = `<${element}></${element}>`.toFragment().childNodes[0]
			} else {
				throw new Error("Passed element was not a valid HTML element, nor valid element type.")
			}
		}
		this._ = { element }
	}
	
	isValidElement(element) {
		if (element) {
			if (typeof element !== "object") { return false } else {
				let string_name, r1, r2
				
				string_name = element.toString()
				r1 = /\[object HTML.+Element\]/
				r2 = /\[object HTMLUnknownElement\]/
				if (r1.test(string_name)) {
					return !r2.test(string_name) //Anything except HTMLUnknownElement
				} else {
					return false //Not an HTMLElement
				}
			}
		} else { return false }
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
	
	get type() {
		return this.element.tagName.toLowerCase()
	}
	
	set sizeUnit(value) {
		const valid_units = {
			em: true,
			ex: true,
			ch: true,
			rem: true,
			vw: true,
			vh: true,
			vmin: true,
			vmax: true,
			cm: true,
			mm: true,
			Q: true,
			in: true,
			pc: true,
			pt: true,
			px: true
		}
		
		if (valid_units[value]) {
			return this._.unit = value
		} else {
			throw new Error(`'${value}' is not a valid unit of measurement. Be aware that size units are case sensitive.`)
		}
	}
	
	get hasAssignedSizeUnit() {
		return this._.unit !== undefined
	}
	
	get sizeUnit() {
		if (this.hasAssignedSizeUnit) {
			return this._.unit
		} else {
			console.warn("No assigned size unit; using 'px' as a default.")
			return "px"
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
			this.element.innerHTML = ""
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
	
	get parent() {
		if (this.elementExists) {
			
		} else {
			throw new Error( )
		}
	}
	
	get childrenAmount() {
		return this.element.children.length
	}
	
	get hasChildren() {
		return this.childrenAmount !== 0
	}
	
	get children() {
		if (!this.hasChildren) {
			console.warn("This element has no children.")
		}
		return this.element.children
	}
	
	childExists(index) {
		return this.element.children[index] !== undefined
	}
	
	child(index) {
		if (this.childExists(index)) {
			return new ElementConstructor(this.element.children[index])
		} else {
			console.dir(this.element)
			throw new Error(`Unable to access child at index ${index}.`)
		}
	}
	
	addChild(element) {
		this.element.appendChild(element)
	}
	
	addChildAt(index, element) {
		if (this.childrenAmount > 0) {
			index = Math.max(0, index - 1)
			if (index == 0) {
				this.child(0).element.insertAdjacentElement("beforebegin", element)
			} else {
				if (this.childExists(index)) {
					this.child(index).element.insertAdjacentElement("afterend", element)
				} else {
					throw new Error(`Unable to insert after child, as no child exists at index '${index}'`)
				}
			}
		} else {
			throw new Error("No other children exist; use addChild to add a child element regardless of index.")
		}
	}
	
	removeChild(index) {
		if (this.childExists(index)) {
			this.child(index).element.remove()
		} else {
			throw new Error(`Unable to remove child at index ${index}.`)
		}
	}
	
	remove() {
		if (this.elementExists) {
			this.element.remove()
		} else {
			throw new Error("Unable to remove an element that does not exist.")
		}
	}
	
	get hasPreviousSibling() {
		return this.element.previousSibling !== null
	}
	
	get hasNextSibling() {
		return this.element.nextSibling !== null
	}
	
	get previousSibling() {
		if (this.hasPreviousSibling) {
			return new ElementConstructor(this.element.previousSibling)
		} else {
			throw new Error("Element does not have a sibling that precedes it.")
		}
	}
	
	get nextSibling() {
		if (this.hasNextSibling) {
			return new ElementConstructor(this.element.nextSibling)
		} else {
			throw new Error("Element does not have a sibling that follows it.")
		}
	}
	
	get width() {
		return this.element.offsetWidth + this.sizeUnit
	}
	
	//unfinished
	loseFocus() {
		this.element.blur()
	}
	
	//unfinished
	gainFocus() {
		this.element.focus()
	}
	
	get takesInput() {
		return this.element.value !== undefined
	}
	
	get hasCurrentInput() {
		return this.element.value !== ""
	}
	
	get currentInput() {
		if (this.takesInput) {
			if (!this.hasCurrentInput) {
				console.warn("The input of this element was empty.")
			}
			return this.element.value
		} else {
			throw new Error("This element does not take input.")
		}
	}
	
	//unfinished
	modifyProperty(property, value) {
		this.element.setAttribute(property, value)
	}
	
	get hasControl() {
		return this.element.control !== undefined
	}
	
	get control() {
		if (this.hasControl) {
			return new ElementConstructor(this.element.control)
		} else {
			throw new Error("Element does not have an assigned control.")
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
		return this.element.label !== undefined
	}
	
	get label() {
		if (this.hasLabel) {
			return new ElementConstructor(this.element.label)
		} else {
			throw new Error("Element does not have an assigned label.")
		}
	}
	
	get labelText() {
		if (this.hasLabel) {
			return this.element.label.innerText
		} else {
			throw new Error("Element does not have an assigned label.")
		}
	}
	
	replaceWith(element) {
		if (new ElementConstructor(element).isValidElement) {
			this.element.replaceWith(element)
			this._.element = element
		} else {
			throw new Error("Unable to replace as passed element was not a valid element.")
		}
	}
	
	//unfinished
	modifyStyle(style_name, value) {
		this.element.style[style_name] = value
	}
	
	//unfinished
	getStyleValue(style_name) {
		return this.element.style[style_name]
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