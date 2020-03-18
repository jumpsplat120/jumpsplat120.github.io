class GirafficsUserInterface {
	constructor() {
		this.time = {
			fade: {
				ends: new Date().getTime(),
				length: 500
			},
			get now() {
				return new Date().getTime()
			},
			get out() {
				const now = this.now
				return now > this.fade.ends ? 0 : this.fade.ends - now
			}
		}
	}
	
	get fadeEnding() {
		return this.time.now + this.time.out + this.time.fade.length
	}
	
	fadeIn(el_name) {
		setTimeout(_=>{
			let builder = new ElementConstructor(j.getL(el_name))
			
			if (builder.hasClass("invisible")) {
				builder.removeClass("no-display")
				setTimeout(_=>{ builder.removeClass("invisible") }, 25) //data racing issues; anim doesn't trigger if they're removed too close to each other.
			} else {
				console.warn(`Unable to fade in '${el_name}' as it is already visible.`)
			}
		}, this.time.out)
		
		this.time.fade.ends = this.fadeEnding
	}
	
	fadeOut(el_name) {
		setTimeout(_=>{
			let builder = new ElementConstructor(j.getL(el_name))
			
			if (builder.hasClass("invisible")) {
				console.warn(`Unable to fade out '${el_name}' as it is already invisible.`)
			} else {
				builder.addClass("invisible")
				setTimeout(_=>{ builder.addClass("no-display") }, this.time.fade.length)
			}
		}, this.time.out)
		
		this.time.fade.ends = this.fadeEnding
	}
	
	toggleFade(el_name) {
		let builder = new ElementConstructor(j.getL(el_name))
		
		if (builder.hasClass("invisible")) { this.fadeIn(el_name) } else { this.fadeOut(el_name) }
	}
	
	fadeOutMultiple(array) {
		array = arguments[1] ? arguments : array
		array = Array.from(array)

		setTimeout(_=> {
			array.forEach(el_name => {
				let builder = new ElementConstructor(j.getL(el_name))
				
				if (builder.hasClass("invisible")) {
					console.warn(`Unable to fade out '${el_name}' as it is already invisible.`)
				} else {
					builder.addClass("invisible")
					setTimeout(_=>{ builder.addClass("no-display") }, this.time.fade.length)
				}
			})
		}, this.time.out)
		
		this.time.fade.ends = this.fadeEnding
	}
	
	fadeInMultiple(array) {
		array = arguments[1] ? arguments : array
		array = Array.from(array)

		setTimeout(_=> {
			array.forEach(el_name => {
				let builder = new ElementConstructor(j.getL(el_name))
				
				if (builder.hasClass("invisible")) {
					builder.removeClass("no-display")
					setTimeout(_=>{ builder.removeClass("invisible") }, 25)
				} else {
					console.warn(`Unable to fade in '${el_name}' as it is already visible.`)
				}
			})
		}, this.time.out)
		
		this.time.fade.ends = this.fadeEnding
	}
	
	toggleFadeMultiple(array) {
		array = arguments[1] ? arguments : array
		
		let fade_ins, fade_outs
		
		fade_ins  = []
		fade_outs = []
		
		setTimeout(_=> {
			array.forEach(el_name => {
				let builder = new ElementConstructor(j.getL(el_name))
				
				if (builder.hasClass("invisible")) { fade_outs.push(el_name) } else { fade_ins.push(el_name) }
			})
			
			fade_ins.forEach(el_name => {
				let builder = new ElementConstructor(j.getL(el_name))
				
				if (builder.hasClass("invisible")) {
					builder.removeClass("invisible")
					setTimeout(_=>{ builder.removeClass("no-display") }, 25)
				} else {
					console.warn(`Unable to fade in '${el_name}' as it is already visible.`)
				}
			})
			
			fade_outs.forEach(el_name => {
				let builder = new ElementConstructor(j.getL(el_name))
				
				if (builder.hasClass("invisible")) {
					console.warn(`Unable to fade out '${el_name}' as it is already invisible.`)
				} else {
					builder.addClass("invisible")
					setTimeout(_=>{ builder.addClass("no-display") }, this.time.fade.length)
				}
			})
		}, this.time.out)
		
		this.time.fade.ends = this.fadeEnding
	}
	
	playIntro() {
		console.warn("UNFINISHED")
		
		if (storage.has("chat_token")) {
			this.fadeOutMultiple("password", "password_error")
			this.fadeIn("loading_animation")
			
			hmAPI.token = storage.get("chat_token")
			hmAPI.validateToken()
		} else {
			chat.state = "login"
			
			this.fadeOut("intro")
			this.fadeIn("login")
		}
	}
}