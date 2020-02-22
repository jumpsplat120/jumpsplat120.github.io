class HackmudAPI {
	constructor(token, timecode, users, channels) {
		this.http     = new XMLHttpRequest()
		this.interval   = null
		this.response   = null
		this.validation = false
		this._        = {
			token:    undefined,
			timecode: undefined
		}
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
					throw new Error(`Unable to access main user, as no main user was set.`)
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
					throw new Error(`Unable to access main channel, as no main channel was set.`)
				}
			},
			_: {
				main: undefined,
			},
			all: channels
		}
	}
	
	set token(value)    {
		console.log(`Token has been set as ${value}`)
		this._.token = value
	}
	set timecode(value) {
		console.log(`Timecode is ${value}`)
		this._.timecode = value
	}
	
	get token() { 
		if (this._.token) {
			return this._.token
		} else {
			throw new Error(`Unable to access token as no token was ever set.`)
		}
	}	
	get timecode() { 
		return this._.timecode 
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
	}
	
	//unfinished
	receiveChat() {
		//builder.modifyExistingElement(j.getL("default_chat"))
		if (j_log.length > 0) {			
			const a_time = a_log[a_log.length - 1] ? a_log[a_log.length - 1].t : 0
			const j_time = j_log[j_log.length - 1] ? j_log[j_log.length - 1].t : 0
			j.timecode = j_time > a_time ? j_time : a_time
			const chat_log = a_log.concat(j_log)
			chat_log.sort(function(a, b) { return a.t - a.b })
			
			chat_log.forEach(obj => {
				const channel   = obj.channel ? obj.channel : "from"
				const username  = obj.from_user
				
				const newline = `<p><span class="color_b">${getIngameTimestamp(obj.t)}</span> <span class="color_vv">${channel}</span> <span class ="color_${usernameColor(username)}">${username}</span><span class="color_b"> :::</span>${sanitizeString(obj.msg)}<span class="color_b">:::</span></p>`
				getL("default_chat").insertAdjacentHTML("beforeend", newline)
			})
		}
		
		j.timecode += .5
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

