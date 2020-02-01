//Access the first label of an input element (because why do you have more than one?)
Object.defineProperty(HTMLInputElement.prototype, "label", { get: function() { 
	return this.labels[0] 
}})

//Access the first label of an input element (because why do you have more than one?)
Object.defineProperty(HTMLCollection.prototype, "forEach", { value: function(callback, thisArg) { 
	thisArg = thisArg || window;
	for (var i = 0; i < this.length; i++) {
		callback.call(thisArg, this[i], i, this);
	}
}})

//Convert text into a DocumentFragment, which extends Node, and can be inserted into the DOM
Object.defineProperty(String.prototype, "toFragment", { value: function() {
	let temp = document.createElement("template")
	temp.innerHTML = this
	return temp.content
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

//Returns true/false based on whether a dataset does or doesn't contain a data-attribute. This
//will return true, regardless of the value of the attribute itself! This only checks to see
//if the attribute exists or not
Object.defineProperty(DOMStringMap.prototype, "hasFlag", { value: function(search) {
	return this[search] !== undefined
}})