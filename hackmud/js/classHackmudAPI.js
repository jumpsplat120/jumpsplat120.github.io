class HackmudAPI {
	constructor(token, timecode, users, channels) {
		this.http     = new XMLHttpRequest()
		this.token    = undefined
		this.timecode = undefined
		this.users    = {
			set main(value) {
				if (this.all.contains(value)) {
					this.primary = value
				} else {
					throw new Error(`Unable to set main user to '${value}', as '${value}' is not a user of the account.`)
				}
			},
			get main() {
				return this.primary
			},
			primary: undefined,
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
				return this.primary
			},
			primary: undefined,
			all: channels
		}
	}
	
	openConnection(to) {
		this.http.open("POST", "https://www.hackmud.com/mobile/" + to + ".json")
		this.http.setRequestHeader("Content-Type","application/json")
	}
	
	sendData(obj) {
		this.http.send(JSON.stringify(obj))
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
	
	handleResponse() {
		let response, date
		
		response = this.http.readyState == this.http.DONE ? JSON.parse(this.http.response) : this.http.status
		date     = new Date()
		
		if (response.ok === false) { 
			console.log(response.msg)
		} else if (response.chat_token) {
			localStorage.setItem("chat_token", response.chat_token)
			j.chat_token = response.chat_token
			
			getUsers()
			//j.interval = setInterval(getNewChats, 1250)
			
			console.log(`Token is ${j.chat_token}`)
			
			fade("out", "login")
			fade("in", "main")
		} else if (response.users) {
			j.users = Object.keys(response.users)
			j.channels = []
			response.users.forEach(channel => { j.channels.push(Object.keys(channel)) })
			j.channels = j.channels.deduplicate()
			console.log(`Users for this account are ${j.users}`)
			console.log(`Channels for this account are ${j.channels}`)
		} else if (response.chats) {
			const j_log = response.chats["jumpsplat120"]
			const a_log = response.chats["aiphos"]
			const html  = j.getEl("default_chat").innerHTML
			
			if (j_log.length > 0 || a_log.length > 0) {			
				const a_time = a_log[a_log.length - 1] ? a_log[a_log.length - 1].t : 0
				const j_time = j_log[j_log.length - 1] ? j_log[j_log.length - 1].t : 0
				j.timecode = j_time > a_time ? j_time : a_time
				const chat_log = a_log.concat(j_log)
				chat_log.sort(function(a, b) { return a.t - a.b })
				
				chat_log.forEach(obj => {
					const channel   = obj.channel ? obj.channel : "from"
					const username  = obj.from_user
					
					const newline = `<p><span class="color_b">${getIngameTimestamp(obj.t)}</span> <span class="color_vv">${channel}</span> <span class ="color_${usernameColor(username)}">${username}</span><span class="color_b"> :::</span>${sanitizeString(obj.msg)}<span class="color_b">:::</span></p>`
					getEl("default_chat").insertAdjacentHTML("beforeend", newline)
				})
			}
			
			j.timecode += .5
		}
	}
}

