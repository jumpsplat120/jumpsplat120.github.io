class HackmudAPI {
	constructor(token, timecode, users, channels) {
		this.http     = new XMLHttpRequest()
		this.interval   = null
		this.response   = null
		this.validation = false
		this.users    = {
			set main(value) {
				if (this.all.contains(value)) {
					this.primary = value
				} else {
					throw new Error(`Unable to set main user to '${value}', as '${value}' is not a user of the account.`)
				}
			},
			get main() {
				if (this._.main) {
					return this._.main
				} else {
					console.warn("No main user has been set.")
					return false
				}
			},
			_: {
				main: undefined
			},
			all: users
		}
		this.channels = {
			set main(value) {
				if (this.all.contains(value)) {
					this.primary = value
				} else {
					throw new Error(`Unable to set main channel to '${value}', as no user is logged into ${value}.`)
				}
			},
			get main() {
				if (this._.main) {
					return this._.main
				} else {
					console.warn("No main channel has been set.")
					return false
				}
			},
			_: {
				main: undefined,
			},
			all: channels
		}
		this._        = {
			token: undefined
		}
	}
	
	set token(value)    {
		console.log(`Token has been set as ${value}`)
		this._.token = value
	}
	
	get token() { 
		if (this._.token) {
			return this._.token
		} else {
			throw new Error(`Unable to access token, as no token was ever set.`)
		}
	}
	
	get timecode() { 
		return new Date().getTime() / 1000
	}
	
	validateToken() {
		this.validation = true
		this.requestUsers()
	}
	
	openConnection(to) {
		this.http.open("POST", "https://www.hackmud.com/mobile/" + to + ".json")
		this.http.setRequestHeader("Content-Type","application/json")
	}
	
	sendData(obj) {
		this.http.send(JSON.stringify(obj))
	}
	
	requestToken(pass) {
		this.validation = true
		this.openConnection("get_token")
		this.sendData({ pass })
	}
	
	requestChat() {
		this.openConnection("chats")
		this.sendData({
			chat_token: this.token,
			usernames: this.users.all,
			after: this.timecode
		})
	}
	
	requestUsers() {
		this.openConnection("account_data")
		this.sendData({ chat_token: this.token })
	}
	
	sendMessage(message, whisper) {
		openConnection("create_chat")
		
		let data = { chat_token: this.token,
					username: this.users.main,
					msg: message }
		
		if (whisper) {
			data.tell = whisper
		} else {
			data.channel = this.channels.main
		}
		
		this.sendData(data)
	}
	
	sendWhisper(message, recipient) {
		this.sendMessage(message, recipient)
	}
	
	receiveChatToken() {
		this.validation = false
		
		storage.save("chat_token", this.response.chat_token)
		
		this.token = this.response.chat_token
		
		this.requestUsers()
	}
	
	receiveUsers() {
		let channels = []
		
		this.users.all = Object.keys(this.response.users)
		
		this.response.users.forEach(channel => { channels.push(Object.keys(channel)) })
		
		this.channels.all = channels.deduplicate()
		
		console.log(`Users for this account: ${this.users.all.join(", ")}`)
		console.log(`Channels for this account: ${this.channels.all.join(", ")}`)
		
		this.interval = setInterval(this.requestChat.bind(this), 1250)
		
		gooey.fadeOut("login")
		gooey.fadeIn("main")
		
		chat.state = "main"
	}
	
	//unfinished
	receiveChat() {
		
	}
	
	handleResponse() {
		this.response = this.http.readyState == 4 ? JSON.parse(this.http.response) : this.http.status
		
		if (this.response.ok === false) {
			if (this.validation) {
				gooey.fadeOut("loading_animation")
				gooey.fadeInMultiple("password", "password_error")
				
				this.token = null
				this.validation = false
			} else {
				throw new Error(this.response.msg.toCapitalCase())
			}
		} else if (this.response.chat_token) {
			this.receiveChatToken()
		} else if (this.response.users) {
			if (this.validation) {
				storage.save("chat_token", this.token)
				this.validation = false
			}
			this.receiveUsers()
		} else if (this.response.chats) {
			this.receiveChat() 
		}
	}
	
	handleError() {
		if (this.validation) {
			gooey.fadeOut("loading_animation")
			gooey.fadeInMultiple("password", "password_error")
			
			this.token = null
			this.validation = false
		} else {
			throw new Error("Yo some shit went down and your handle error function doesn't really handle anything other than token validation issues sooo....")
		}
	}
}

