let j = {}

j.getEl = name => {
	return document.getElementById(name)
}

j.randomString = length => { return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length) }