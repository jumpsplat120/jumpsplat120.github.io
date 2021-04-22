const def = Object.defineProperty

//Access the first label of an input element (because why do you have more than one?)
def(HTMLInputElement.prototype, "label", { get: function() { 
	return this.labels[0] 
}})

//Loop through each item in a HTMLCollection (EVERYTHING SHOULD HAVE A FOR EACH COME ON IT'S 2020)
def(HTMLCollection.prototype, "forEach", { value: function(callback, thisArg) { 
	thisArg = thisArg || window;
	for (var i = 0; i < this.length; i++) {
		callback.call(thisArg, this[i], i);
	}
}})

//Loop through each item in an Object
def(Object.prototype, "forEach", { value: function(callback, thisArg) { 
	thisArg = thisArg || window;
	
	for (var i = 0; i < Object.keys(this).length; i++) {
		callback.call(thisArg, this[Object.keys(this)[i]], i);
	}
}})

//Convert text into a DocumentFragment, which extends Node, and can be inserted into the DOM
def(String.prototype, "toFragment", { value: function() {
	let temp = document.createElement("template")
	temp.innerHTML = this
	return temp.content
}})

//Checks each element contains some part of the submitted string; this differs from .includes
//which requires you to have the entire string as an element. If elements that are not strings
//are passed as a parameter, then it will be converted to a string. If the submitted item is a
//regular expression, then the expression will be used as is. If no match is made, returns false,
//otherwise will return an array with the indexes of matched items.
def(Array.prototype, "contains", { value: function(string) {
	let match = []
	string = typeof string == "string" ? string : string.toString()
	
	this.forEach((element, index) => {
		let regex = typeof element != "string" && !(element instanceof RegExp) ? new RegExp(element.toString().asUTF16) : new RegExp(element.asUTF16)
		if (regex.test(string)) { match.push(index) }
	})

	return match.length > 0 ? match : false
}})

//Removes first character of a string and returns the string
def(String.prototype, "shift", { get: function() {
	return this.substr(1)
}})

//Returns true if array is empty, otherwise returns false
def(Array.prototype, "isEmpty", { get: function() {
	return this.length === 0
}})

//Remove duplicate items within an array
def(Array.prototype, "deduplicate", { value: function() {
	return [... new Set(this)]
}})

//Adds TAU to the Math Object
def(Math, "TAU", { value: Math.PI * 2 })

//Finds the smallest number in an array
def(Array.prototype, "smallest", { get: function() {
	let smallest = Infinity
	
	this.forEach(value => {
		if (typeof value !== "number") { throw new Error("Unable to find smallest value in array as '" + value + "' is not a number.") }
		smallest = value <= smallest ? value : smallest 
	})
	
	return smallest
}})

//Finds the biggest number in an array
def(Array.prototype, "biggest", { get: function() {
	let biggest = -Infinity
	
	this.forEach(value => {
		if (typeof value !== "number") { throw new Error("Unable to find smallest value in array as '" + value + "' is not a number.") }
		biggest = value >= biggest ? value : biggest 
	})
	
	return biggest
}})

def(Array.prototype, "last", { get: function() {
	return this[this.length - 1]
}})