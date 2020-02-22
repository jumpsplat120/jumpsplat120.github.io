//Access the first label of an input element (because why do you have more than one?)
Object.defineProperty(HTMLInputElement.prototype, "label", { get: function() { 
	return this.labels[0] 
}})

//Loop through each item in a HTMLCollection (EVERYTHING SHOULD HAVE A FOR EACH COME ON IT'S 2020)
Object.defineProperty(HTMLCollection.prototype, "forEach", { value: function(callback, thisArg) { 
	thisArg = thisArg || window;
	for (var i = 0; i < this.length; i++) {
		callback.call(thisArg, this[i], i);
	}
}})

//Loop through each item in an Object
Object.defineProperty(Object.prototype, "forEach", { value: function(callback, thisArg) { 
	thisArg = thisArg || window;
	
	for (var i = 0; i < Object.keys(this).length; i++) {
		callback.call(thisArg, this[Object.keys(this)[i]], i);
	}
}})

//Convert text into a DocumentFragment, which extends Node, and can be inserted into the DOM
Object.defineProperty(String.prototype, "toFragment", { value: function() {
	let temp = document.createElement("template")
	temp.innerHTML = this
	return temp.content
}})

//Capitalize the first letter of a string
Object.defineProperty(String.prototype, "toCapitalCase", { value: function() {
	return this.charAt(0).toUpperCase() + this.slice(1)
}})

//Checks each element contains some part of the submitted string; this differs from .includes
//which requires you to have the entire string as an element. If elements that are not strings
//are passed as a parameter, then it will be converted to a string. If the submitted item is a
//regular expression, then the expression will be used as is. If no match is made, returns false,
//otherwise will return an array with the indexes of matched items.
Object.defineProperty(Array.prototype, "contains", { value: function(string) {
	let regex, match
	
	regex = typeof string != "string" && !(string instanceof RegExp) ? new RegExp(string.toString()) : new RegExp(string)
	match = []
	
	this.forEach((element, index) => { if (regex.test(element.toString())) { match.push(index) }})
	
	return match.length > 0 ? match : false
}})

//Returns true if array is empty, otherwise returns false
Object.defineProperty(Array.prototype, "isEmpty", { get: function() {
	return this.length === 0
}})

//Remove duplicate items within an array
Object.defineProperty(Array.prototype, "deduplicate", { value: function() {
	return [... new Set(this)]
}})