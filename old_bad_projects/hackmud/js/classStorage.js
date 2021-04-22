class Storage {
	constructor() {
		this.storage = localStorage
	}
	
	forEach(callback) {
		for (var i = 0; i < this.storage.length; i++) {
			callback(this.storage.key(i));
		}
	}
	
	save(name, data) {
		this.storage.setItem(name, JSON.stringify(data))
	}
	
	has(name) {
		return this.storage.getItem(name) !== null
	}
	
	safeSave(name, data) {
		if (!this.storage.has(name)) { 
			this.save(name, data) 
		} else {
			throw new Error(`Unable to save data as ${name} already exists!`)
		}
	}

	get(name) {
		return JSON.parse(this.storage.getItem(name))
	}

	delete(name) {
		this.storage.removeItem(name)
	}
	
	clear() {
		this.storage.clear()
	}
	
	get allKeys() {
		let table = []
		
		if (this.storage.length > 0) {
			this.storage.forEach( element => { table.push(element) })
		}
		
		return table
	}
	
	get isEmpty() {
		return this.length > 0 
	}
}