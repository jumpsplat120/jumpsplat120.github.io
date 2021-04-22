fetch("js/polyfill.js").then(response => {
	console.assert(response.ok, "Polyfill file is missing! Please supply polyfill file, or modify library to include various functionality (outlined within the file.)")
})

/* [Number].toHex() => returns hex representation of a number, as a string
 * [Number].clamp(min, max) => returns the number as is if between values, or min if below min, or max if above max
 * [Array].isEmpty => Returns true is the length of the array is 0
 * [Array].smallest => Returns the smallest number in an array
 * [Array].biggest => Returns the biggest number in an array
 * [Array].last => Returns the last element of an array
 * [String].shift() => Emulates array.shift() by removing the first character of the string
 */
 
function chk(value, error) {
	if (!value) {
		throw new Error(error)
	}
}

//Converts a string into a boolean. Strict conversion
def(String.prototype, "asBoolean", { get: function() {
	let lower = this.toLowerCase()
	
	if (lower === "true" || lower === "false") {
		return lower === "true"
	} else {
		throw new Error(`'${this}' can not be read as a boolean; string 'true' or string 'false' expected.`)
	}
}})

//Capitalize the first letter of a string
def(String.prototype, "toCapitalCase", { value: function() {
	return this.charAt(0).toUpperCase() + this.slice(1)
}})

export class Container {
	constructor(array) {
		this._ = {}
		
		this._set(array)
	}
	
	//============Setters============//
	
	//============Getters============//
	
	get root() {
		return this._.data
	}
	
	get length() {
		return this._.data.length
	}
	
	//============Front End Methods============//
	
	index(i) {
		return this._.data[i]
	}
	
	first() {
		const item = this._.data[0]
		
		return item instanceof Container ? item                :
					 Array.isArray(item) ? new Container(item) :
					                       item
	}
	
	last() {
		const item = this._.data[this._.data.length - 1]
		
		return item instanceof Container ? item                :
					 Array.isArray(item) ? new Container(item) :
					                       item
	}
	
	//============Static Methods============//
	
	//============Internal Methods============//
	
	_validate(x) {
		
	}
	
	_set(x) {
		this._.data = x
	}
}

export class Char {
	constructor(character) {
		this._ = {}
		
		this._set(character)
	}

	//============Setters============//
	
	set root(x) {
		this._set(x)
	}
	
	//============Getters============//
	
	get root() {
		return this._.data
	}
	
	get asUnicodePoint() {
		return this._.data.codePointAt(0)
	}
	
	get unicodeName() {
		//NOTE THAT THIS USES A PROXY SERVER TO REQUEST INFORMATION FROM UNICODE LOOKUP, AS AN ALTERNATIVE TO INCLUDING A HUGE LOOKUP TABLE. HOWEVER THE UNICODELOOKUP SITE DOES NOT TECHNICALLY OFFER IT'S DATA (THERE'S NO HEADERS ON THE DATA) AND AS SUCH YOU NEED TO WORK AROUND IT IN SOME WAY. THE HEROKUAPP ONLY ALLOWS 50 REQUEST IN 3 MINUTES. CONSIDER INCLUDING A LOOKUP TABLE IF YOU NEED ACCESS TO THIS INFORMATION AT A HIGHER RATE, OR DON'T WANT TO USE THE PROXY SERVER. IT'S ALSO USING A SYNCRONOUS REQUEST, CONSIDER USING FETCH IF YOU'D LIKE A PROMISE
		const cors_anywhere  = "https://cors-anywhere.herokuapp.com/"
		const url            = "https://unicodelookup.com/lookup?q=" + this._.data.codePointAt(0).toString()
		const xhr            = new XMLHttpRequest()
	
		xhr.open("GET", cors_anywhere + url, false)
		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.addEventListener("load",data => {
			result = new Container(JSON.parse(data.target.response).results).last().last()
		})
		xhr.send()
		
		return result
	}
	
	get length() {
		return 1
	}
	
	//============Front End Methods============//
	
	next() {
		this._.data = String.fromCodePoint(this._.data.codePointAt(0) + 1)
		
		return this
	}
	
	position(i) {
		this._.data = String.fromCodePoint(this._.data.codePointAt(0) + i)
		
		return this
	}
	
	//============Static Methods============//
	
	//============Internal Methods============//
	
	_set(value) {
		const type = this._determineType(value)
		
		const owie = err => {
			throw new Error(err)
		}
		
		this._.data = type === "unicode" ? this._validateUnicode(value)   :
					  type === "char"    ? this._validateCharacter(value) :
					  owie("_determineType returned type '" + type + "' which does not exist within the setter.")
	}
	
	_validateUnicode(unicode) {
		return String.fromCodePoint(unicode)
	}
	
	_validateCharacter(character) {
		return character[0]
	}
	
	_determineType(x) {
		return typeof x === "string" ? "char" : "unicode"
	}
}

export class Text {
	constructor(string) {
		this._ = { data: null }
		
		this._set(string)
	}
	
	//============Setters============//
	
	//============Getters============//
	
	get root() {
		return this._.data
	}
	
	get toUpperCase() {
		return this._.data
	}
	
	//============Front End Methods============//
	
	.index(i) {
		return this._.data[i]
	}
	
	//============Static Methods============//
	
	//============Internal Methods============//
	
	_set(string) {
		if (this._validate(string)) {
			const result = new Array(string.length)
			
			for (let i = 0; i < string.length; i++) {
				result[i] = typeof string === "string" ? new Char(string[i]) : string
			}
			
			this._.data = result
		} else {
			throw new Error("Text class can only be passed String or Char values.")
		}
	}
	
	_validate(string) {
		return typeof string === "string" || string instanceof Char
	}
}

export class Scalar {
	constructor(number) {
		this._ = {}
		
		this._set(number)
	}
	
	//============Setters============//
	
	set root(x) {
		this._set(x)
	}
	
	//============Getters============//
	
	get root() {
		return this._.data
	}
	
	get asHex() {
		return new Text((this._.data >>> 0).toString(16))
	}
	
	//============Front End Methods============//
	
	clamp(min, max) {
		this._.data = Math.min(max, Math.max(min, this._.data))
		
		return this
	}
	
	cycle(min, max) {
		const delta = max - min
		this._.data = this._.data > max ? this._.data - delta :
					  this._.data < min ? this._.data + delta :
					  this._.data
					  
		return this
	}
	
	round(decimal) {
		const pow = Math.pow(10, decimal) 
		
		this._.data = decimal == 0 || decimal === undefined ? Math.round(this._.data) : Math.round( this._.data * pow + Number.EPSILON ) / pow
		
		return this
	}
	
	map(from_min, from_max, to_min, to_max) {
		this._.data = (this._.data - from_min) * (to_max - to_min) / (from_max - from_min) + to_min
		
		return this
	}
	
	add() {
		chk(arguments, "Scalar add method requires arguments.")

		let result = this._.data
		
		arguments.forEach(item => {
			result = item instanceof Scalar ? item.natural : (chk(typeof item === "number", "Scalar class can only add other Scalar objects of number literals."), item)
		})
		
		this._.data = result
		
		return this
	}
	
	//============Static Methods============//
	
	//============Internal Methods============//
	
	_set(x) {
		if (this._validate(x)) {
			this._.data = x
		}
	}
	
	_validate(x) {
		if (typeof x === "number") {
			return true
		} else {
			throw new Error("A scalar value must be a number.")
		}
	}
}

export class Vector {
	constructor() {
		chk(arguments, "Missing arguments for Vector class.")
		
		const values = Array.isArray(arguments[0]) ? 1 : 1
	}
}

export const jMath = {
	between: function(value, min, max) {
		//inclusive min, exclusive max
		return min <= value && value < max
	}
}

export class Color {
	constructor(value) {
		this._ = {
			alpha: null,
			rgb:   null,
			hsl:   null,
			hex:   null,
			cmyk:  null
		}
		
		if (value === undefined) { //No value passed
			this._.rgb  = [0, 0, 0]
			this._.hsl  = [0, 0, 0]
			this._.hex  = "FFFFFF"
			this._.cmyk = [0, 0, 0, 0]
		} else if (typeof value === "string") { //Hex
			if (value[0] === "#") { value = value.shift() }
			
			const len = value.length
			
			this._.hexa = value in Color._.names ? Color._.names[value] + "FF" :
						len == 3 ? value[0] + value[0] + value[1] + value[1] + value[1] + "FF" :
						len == 4 ? value[0] + value[0] + value[1] + value[1] + value[1] :
						len == 6 ? value + "FF" :
						len == 8 ? value : false
						
			if (!(this._.hexa.length === 8 && !isNaN(Number('0x' + this._.hexa)))) { throw new Error(`Unable to construct color as value ${value} is not a valid hex code.`) }
			
			this._recalculate("hexa")
		} else {
			const values          = Array.isArray(value) && arguments.length > 1 ? [...value, ...arguments] :
									Array.isArray(value)                         ? [...value]               :
																				   arguments
			const has_type        = typeof values.last === "string"
			const has_alpha_value = has_type ? values.length === 5 : values.length == 4
			const type            = (has_type ? values.last.toLowerCase() : false) || "rgba"

			const options = {
				rgba: function() {
					values.forEach((x, i) => {
						if (typeof x === "number") {
							values[i] = x.clamp(0, 255)
							values[i] = Math.round(x)
						} else {
							throw new Error(`Unable to construct color as value ${x} at index ${i} is not a number.`)
						}
					})
					
					if (has_alpha_value) { values[3].clamp(0, 1) }
					
					this._.rgba = has_alpha_value ? [...values] : [...values, 1]
				},
				hsla: function() {
					
					values.forEach(x => {
						if (typeof x !== "number") { throw new Error(`Unable to construct color as value ${x} at index ${i} is not a number.`) }
					})
					
					values[0] = Math.round(values[0])
					values[0] = values[0].clamp(0, 360)
					
					values[1] = values[1].clamp(0, 1)
					
					values[2] = values[2].clamp(0, 1)
					
					if (has_alpha_value) { values[3].clamp(0, 1) }
					
					this._.hsla = has_alpha_value ? [...values] : [...values, 1]
				}
			}
			
			if (type in options) {
				options[type].bind(this)()
				this._recalculate(type)
			} else {
				console.warn(`Unknown type '${type}'. Defaulting to RGBA...`)
				options.rgba.bind(this)()
				this._recalculate("rgba")
			}
		}
	}
	
	//============Getters============//
	
	get rgba()  { return this._.rgba  }
	get hexa()  { return this._.hexa  }
	get hhexa() { return "#" + this._.hexa }
	get hsla()  { return this._.hsla  }
	get cmyka() { return this._.cmyka }
	get name()  { return "BITCH"      }
	
	//============Setters============//
	
	set rgba(value) {
		if (value instanceof Vector) {
			//I don't have a vector class yet
		} else if (Array.isArray(value)) {
			this._.rgba = this._validateRGBA(value)
		} else {
			throw new Error("Value is expected as either a Vector or Array object.")
		}
		
		this._recalculate("rgba")
	}
	
	set hexa(x)  {
		}
	set hhexa(x) {
		}
	set hsla(x)  {
		}
	set cmyka(x) {
		}
	set name(x) {
		}
	
	//============Front End Methods============//
	
	lighten(percentage) {
		this._.hsla[2] = new Scalar(this._.hsla[2] + percentage).clamp(0, 1).value

		this._recalculate("hsla")
		
		return this
	}
	
	darken(percentage) {
		this._.hsla[2] = new Scalar(this._.hsla[2] - percentage).clamp(0, 1).value
		
		this._recalculate("hsla")
		
		return this
	}
	
	invert() {
		this._.hsla[0] = new Scalar(this._.hsla[0] + 180).cycle(0, 360).value
		
		this._recalculate("hsla")
		
		return this
	}
	
	add(color, blend_mode) {
		console.log("AAAAA")
	}	

	warm(value, true_calculation) {
		if (true_calculation) {
			
		} else {
			this._.rgba[0] += value
			this._.rgba[2] -= value
			
			this._recalculate("rgba")
			
			return this
		}
	}
	
	cool(value, true_calculation) {
		if (true_calculation) {
			
		} else {
			this._.rgba[0] -= value
			this._.rgba[2] += value
			
			this._recalculate("rgba")
			
			return this
		}
	}
	
	saturate(percentage) {
		this._.hsla[1] = new Scalar(this._.hsla[1] + percentage).clamp(0, 1).value

		this._recalculate("hsla")
		
		return this
	}
	
	desaturate(percentage) {
		this._.hsla[1] = new Scalar(this._.hsla[1] - percentage).clamp(0, 1).value

		this._recalculate("hsla")
		
		return this
	}
	
	hue(degrees) {
		this._.hsla[0] = new Scalar(this._.hsla[0] + degrees).cycle(0, 360).value

		this._recalculate("hsla")
		
		return this
	}
	
	//============Static Methods============//
	
	static temperature(kelvin) {
		const result = new Array(4)
		const smol_k = new Scalar(kelvin).clamp(1000, 40000).value / 100
		
		//I only moved these values up here cause it was a nightmare trying to understand when it was all in one line. And that's coming from the queen of one liners!
		const r1 = 329.698727446  * Math.pow(smol_k - 60, -0.1332047592)
		const g1 = 99.4708025861  * Math.log(smol_k) - 161.1195681661
		const g2 = 288.1221695283 * Math.pow(smol_k - 60, -0.0755148492)
		const b1 = 138.5177312231 * Math.log(smol_k - 10) - 305.0447927307
		
		result[0] = smol_k <= 66 ? 255                                : 
								   new Scalar(r1).clamp(0, 255).value
		result[1] = smol_k <= 66 ? new Scalar(g1).clamp(0, 255).value : 
								   new Scalar(g2).clamp(0, 255).value
		result[2] = smol_k >= 66 ? 255                                :
				    smol_k <= 19 ? 0                                  :
								   new Scalar(b1).clamp(0, 255).value
		
		result[3] = 1
		
		return new Color(result)
		
		//http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
	}
	
	//============Internal Methods============//
	
	_recalculate(updated) {
		chk(updated, "Recalculate requires the updated color key.")
		const choices = {
			hexa: function() {
				this._.rgba  = this._hexaToRGBA(this._.hexa)
				this._.hsla  = this._rgbaToHSLA(this._.rgba)
				this._.cmyka = this._rgbaToCYMKA(this._.rgba)
			},
			rgba: function() {
				this._.hexa  = this._rgbaToHexa(this._.rgba)
				this._.hsla  = this._rgbaToHSLA(this._.rgba)
				this._.cmyka = this._rgbaToCYMKA(this._.rgba)
			},
			hsla: function() {
				this._.rgba  = this._hslaToRGBA(this._.hsla)
				this._.hexa  = this._rgbaToHexa(this._.rgba)
				this._.cmyka = this._rgbaToCYMKA(this._.rgba)
			}
		}
		
		choices[updated].bind(this)()
	}
	
	_validateHex(array) {
		
	}
	
	_validateRGB(array) {
		let result = new Array(4)
		
		array.forEach((x, i) => {
				result[i] = new Scalar(x).clamp(0, 255).value
			})
		
		result[3] = this._validateAlpha(array[3])
		
		return result
	}
	
	_validateHSL(array) {
		
	}
	
	_validateCYMKA() {
		
	}
	
	_validateAlpha(value) {
		return value ? new Scalar(value).clamp(0, 1).value : 1
	}
	
	_rgbaToHexa(array) {
		const result     = new Array(4)
		const temp_array = [array[0], array[1], array[2], Math.round(array[3].map(0, 1, 0, 255))]

		temp_array.forEach(value => {
			
			const hex = value.toHex()

			result.push(hex.length < 2 ? `0${hex}` : hex)
		})
		
		return result.join('').toUpperCase()
	}
	
	_rgbaToHSLA(array) {
		const result     = new Array(4)
		const temp_array = [...array]
		
		result[3] = temp_array[3]
		
		temp_array.pop() //Remove alpha from the calculation

		temp_array.forEach((value, i) => { temp_array[i] = new Scalar(value).clamp(0, 255).root / 255 })

		const min = temp_array.smallest
		const max = temp_array.biggest
		
		const delta = max - min
		
		//lightness
		result[2] = new Scalar((min + max) / 2).round(3)
		
		//saturation
		result[1] = max === min ? 0                                             : 
		         result[2] < .5 ? new Scalar(delta / (max + min)).round(3).root : 
							      new Scalar(delta / (2 - delta)).round(3).root
										   
		//hue
		result[0] = max === min ? 0                                                                                           :
		  temp_array[0] === max ? new Scalar((((temp_array[1] - temp_array[2]) / delta) % 6) * 60).round().cycle(0, 360).root : //r
	      temp_array[1] === max ? new Scalar((((temp_array[2] - temp_array[0]) / delta) + 2) * 60).round().cycle(0, 360).root : //g
						          new Scalar((((temp_array[0] - temp_array[1]) / delta) + 4) * 60).round().cycle(0, 360).root   //b

		return result
		
		//http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
	}
	
	_rgbaToCYMKA(array) {
		const result = new Array(5)
		const temp_array = [array[0], array[1], array[2]]
		
		result[4] = array[3]
		
		temp_array.forEach((value, i) => {
			temp_array[i] = value / 255
		})
		
		result[3] = 1 - temp_array.biggest
		
		const k    = result[3]
		const flip = 1 - k
		
		result[2] = (1 - temp_array[0] - k) / flip
		
		result[1] = (1 - temp_array[1] - k) / flip
		
		result[0] = (1 - temp_array[2] - k) / flip
		
		return result
	}
	
	_hexaToRGBA(string) {
		const result = string.match(/([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})/i)
		
		return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), new Scalar(parseInt(result[4], 16)).map(0, 255, 0, 1).round(2).root]
	}	
	
	_hslaToRGBA(array) {
		const result     = new Array(4)
		const temp_array = [array[0], array[1], array[2]]
		
		result[3] = array[3]
		
		const hue = temp_array[0]
		const a   = (1 - Math.abs(2 * temp_array[2] - 1)) * temp_array[1]
		const b   = a * (1 - Math.abs((temp_array[0] / 60) % 2 - 1))
		const c   = temp_array[2] - a / 2
		
		const between = jMath.between
		
		//r
		result[0] = Math.round(((between(hue, 120, 240) ? 0 : between(hue, 0, 60) || between(hue, 300, 360) ? a : b) + c) * 255)
		
		//g
		result[1] = Math.round(((between(hue, 60, 180) ? a : between(hue, 240, 360) ? 0 : b) + c) * 255)
		
		//b
		result[2] = Math.round(((between(hue, 0, 120)  ? 0 : between(hue, 180, 300) ? a : b) + c) * 255)
		
		return result
		
		//https://css-tricks.com/converting-color-spaces-in-javascript/
	}
	
	_cymkaToRGBA(array) {
		const result = new Array(4)
		
		const temp_array = [array[0], array[1], array[2], array[3]]
		const flip       = 1 - temp_array[3]
		
		result[0] = (1 - temp_array[0]) * 255 * flip
		result[1] = (1 - temp_array[2]) * 255 * flip
		result[2] = (1 - temp_array[1]) * 255 * flip
		
		return result
	}
}

Color._       = {}

Color._.names = {
	white: "FFFFFF", ivory: "FFFFF0", portafino: "FFFFB4", palecanary: "FFFF99", laserlemon: "FFFF66", yellow: "FFFF00", romance: "FFFEFD",
	blackwhite: "FFFEF6", ricecake: "FFFEF0", apricotwhite: "FFFEEC", halfandhalf: "FFFEE1", quarterpearllusta: "FFFDF4", 
	orchidwhite: "FFFDF3", travertine: "FFFDE8",chileanheath: "FFFDE6",cream: "FFFDD0",islandspice: "FFFCEE", butterywhite: "FFFCEA",
	witchhaze: "FFFC99", soapstone: "FFFBF9", scotchmist: "FFFBDC", bridalheath: "FFFAF4", lemonchiffon: "FFFACD", earlydawn: "FFF9E6",
	ginfizz: "FFF9E2", bajawhite: "FFF8D1", rosewhite: "FFF6F5", varden: "FFF6DF", milkpunch: "FFF6D4", sauvignon: "FFF5F3",
	seashellpeach: "FFF5EE", chablis: "FFF4F3", serenade: "FFF4E8", sazerac: "FFF4E0", eggsour: "FFF4DD", barleywhite: "FFF4CE", 
	parisdaisy: "FFF46E", chardon: "FFF3F1", picasso: "FFF39D", tutu: "FFF1F9", forgetmenot: "FFF1EE", pinklady: "FFF1D8", 
	buttermilk: "FFF1B5", gorse: "FFF14F", lavenderblush: "FFF0F5", peachcream: "FFF0DB", fairpink: "FFEFEC", papayawhip: "FFEFD5", 
	eggwhite: "FFEFC1", visvis: "FFEFA1", derby: "FFEED8", colonialwhite: "FFEDBC", broom: "FFEC13", karry: "FFEAD4", 
	sandybeach: "FFEAC8", kournikova: "FFE772", tequila: "FFE6C7", peach: "FFE5B4", creambrulee: "FFE5A0", negroni: "FFE2C5", 
	palerose: "FFE1F2", pippin: "FFE1DF", frangipani: "FFDEB3", navajowhite: "FFDEAD", pinklace: "FFDDF4", watusi: "FFDDCF", 
	tuftbush: "FFDDCD", caramel: "FFDDAF", peachschnapps: "FFDCD6", mustard: "FFDB58", cosmos: "FFD8D9", schoolbusyellow: "FFD800", 
	gold: "FFD700", grandis: "FFD38C", romantic: "FFD2B7", pastelpink: "FFD1DC", chardonnay: "FFCD8C", peachorange: "FFCC99", 
	goldentainoi: "FFCC5C", sunglow: "FFCC33", flesh: "FFCBA4", supernova: "FFC901", yourpink: "FFC3C0", pink: "FFC0CB", 
	waxflower: "FFC0A8", amber: "FFBF00", koromiko: "FFBD5F", selectiveyellow: "FFBA00", macaroniandcheese: "FFB97B", 
	cottoncandy: "FFB7D5", texasrose: "FFB555", mysin: "FFB31F", sundown: "FFB1B3", cornflowerlilac: "FFB0AC", 
	yelloworange: "FFAE42", hitpink: "FFAB81", carnationpink: "FFA6C9", weborange: "FFA500", monalisa: "FFA194", 
	orangepeel: "FFA000", sunshade: "FF9E2C", vividtangerine: "FF9980", atomictangerine: "FF9966", neoncarrot: "FF9933", 
	pinksalmon: "FF91A4", westside: "FF910F", pizazz: "FF9000", salmon: "FF8C69", coral: "FF7F50", flushorange: "FF7F00", 
	flamenco: "FF7D07", pumpkin: "FF7518", burningorange: "FF7034", blushpink: "FF6FFF", persimmon: "FF6B53", 
	hotpink: "FF69B4", orange: "FF681F", pinkflamingo: "FF66FF", blazeorange: "FF6600", outrageousorange: "FF6037", 
	internationalorange: "FF4F00", vermilion: "FF4D00", coralred: "FF4040", redorange: "FF3F34", radicalred: "FF355E", 
	razzledazzlerose: "FF33CC", wildstrawberry: "FF3399", scarlet: "FF2400", magenta: "FF00FF", purplepizzazz: "FF00CC", 
	rose: "FF007F", red: "FF0000", orangewhite: "FEFCED", offyellow: "FEF9E3", whitepointer: "FEF8FF", solitaire: "FEF8E2", 
	halfdutchwhite: "FEF7DE", provincialpink: "FEF5F1", wisppink: "FEF4F8", halfspanishwhite: "FEF4DB", pipi: "FEF4CC", 
	bleachwhite: "FEF3D8", beeswax: "FEF2C7", bridesmaid: "FEF0EC", oasis: "FEEFCE", remy: "FEEBF3", capehoney: "FEE5AC", 
	salomie: "FEDB8D", dandelion: "FED85D", brightsun: "FED33C", melon: "FEBAAD", yellowsea: "FEA904", 
	california: "FE9D04", bittersweet: "FE6F5E", sunsetorange: "FE4C40", persianrose: "FE28A2", cumulus: "FDFFD5",
	paleprim: "FDFEB8", drover: "FDF7AD", halfcolonialwhite: "FDF6D3", oldlace: "FDF5E6", lemon: "FDE910", 
	goldenglow: "FDE295", cinderella: "FDE1DC", pigpink: "FDD7E4", lightapricot: "FDD5B1", sweetpink: "FD9FA2", 
	sorbus: "FD7C07", crusta: "FD7B33", wildwatermelon: "FD5B78", torchred: "FD0E35", ceramic: "FCFFF9", 
	chinaivory: "FCFFE7", moonglow: "FCFEDA", bianca: "FCFBF3", vistawhite: "FCF8F7", pearllusta: "FCF4DC", 
	doublepearllusta: "FCF4D0", cherokee: "FCDA98", candlelight: "FCD917", goldenrod: "FCD667", 
	lightningyellow: "FCC01E", treepoppy: "FC9C1D", ticklemepink: "FC80A5", shockingpink: "FC0FC0", 
	shalimar: "FBFFBA", hintofred: "FBF9F9", candycorn: "FBEC5D", sweetcorn: "FBEA8C", festival: "FBE96C", 
	marigoldyellow: "FBE870", bananamania: "FBE7B2", apricotpeach: "FBCEB1", classicrose: "FBCCE7", cupid: "FBBEDA", 
	rosebud: "FBB2A3", lavenderpink: "FBAED2", sun: "FBAC13", seabuckthorn: "FBA129", lavenderrose: "FBA0E3", 
	geraldine: "FB8989", brinkpink: "FB607F", milan: "FAFFA4", hintofyellow: "FAFDE4", alabaster: "FAFAFA", 
	citrinewhite: "FAF7D6", fantasy: "FAF3F0", linen: "FAF0E6", champagne: "FAECCC", astra: "FAEAB9", 
	turbo: "FAE600", peachyellow: "FADFAD", corvette: "FAD3A2", tanhide: "FA9D5A", ecstasy: "FA7814", 
	sugarcane: "F9FFF6", dolly: "F9FF8B", rumswizzle: "F9F8E4", amour: "F9EAF3", portica: "F9E663", 
	dairycream: "F9E4BC", carouselpink: "F9E0ED", saffronmango: "F9BF58", carnation: "F95A61", mimosa: "F8FDD3", 
	cornfield: "F8FACD", texas: "F8F99C", desertstorm: "F8F8F7", whitelilac: "F8F7FC", coconutcream: "F8F7DC", 
	springwood: "F8F6F1", magnolia: "F8F4FF", whitelinen: "F8F0E8", givry: "F8E4BF", energyyellow: "F8DD5C", 
	marzipan: "F8DB9D", cherub: "F8D9E9", chantilly: "F8C3DF", casablanca: "F8B853", snowdrift: "F7FAF7", 
	whisper: "F7F5FA", quarterspanishwhite: "F7F2E1", wepeep: "F7DBE6", azalea: "F7C8DA", rajah: "F7B668", 
	persianpink: "F77FBE", chileanfire: "F77703", violetred: "F7468A", springsun: "F6FFDC", blackhaze: "F6F7F7", 
	merino: "F6F0E6", illusion: "F6A4C9", brilliantrose: "F653A6", frenchrose: "F64A8A", australianmint: "F5FFBE", 
	goldenfizz: "F5FB3D", beige: "F5F5DC", ecruwhite: "F5F3E5", softpeach: "F5EDEF", albescentwhite: "F5E9D3", 
	potpourri: "F5E7E2", sandwisp: "F5E7A2", wheat: "F5DEB3", maize: "F5D5A0", manhattan: "F5C999", creamcan: "F5C85C", 
	froly: "F57584", zircon: "F4F8FF", wildsand: "F4F4F4", pampas: "F4F2EE", janna: "F4EBD3", ripelemon: "F4D81C", 
	saffron: "F4C430", sandybrown: "F4A460", hollywoodcerise: "F400A1", carla: "F3FFD8", orinoco: "F3FBD4", 
	canary: "F3FB62", wheatfield: "F3EDCF", dawnpink: "F3E9E5", sidecar: "F3E7BB", vanillaice: "F3D9DF", 
	neworleans: "F3D69D", buttercup: "F3AD16", pomegranate: "F34723", blacksqueeze: "F2FAFA", concrete: "F2F2F2", 
	mandyspink: "F2C3B2", tangerine: "F28500", flamingo: "F2552A", chiffon: "F1FFC8", tidal: "F1FFAD", 
	saltpan: "F1F7F2", seashell: "F1F1F1", mintjulep: "F1EEC1", bluechalk: "F1E9FF", parchment: "F1E9D2", 
	saharasand: "F1E788", wewak: "F19BAB", golddrop: "F18200", feta: "F0FCEA", aliceblue: "F0F8FF", 
	titanwhite: "F0EEFF", selago: "F0EEFD", khaki: "F0E68C", prim: "F0E2EC", buff: "F0DC82", 
	goldensand: "F0DB7D", goldendream: "F0D52D", mauvelous: "F091A9", porcelain: "EFF2F3", gallery: "EFEFEF", 
	jaffa: "EF863F", riceflower: "EEFFE2", jonquil: "EEFF9A", twilightblue: "EEFDFF", catskillwhite: "EEF6F7", 
	loafer: "EEF4DE", tusk: "EEF3C3", athensgray: "EEF0F3", tahunasands: "EEF0C8", manz: "EEEF78", 
	cararra: "EEEEE8", doublecolonialwhite: "EEE3AD", bizarre: "EEDEDA", flax: "EEDC82", almond: "EED9C4", 
	chalky: "EED794", beautybush: "EEC1BE", lavendermagenta: "EE82EE", honeysuckle: "EDFC84", 
	narvik: "EDF9F1", zumthor: "EDF6FF", aquahaze: "EDF5F5", frost: "EDF5DD", primrose: "EDEA99", 
	chamois: "EDDCB1", pancho: "EDCDAB", desertsand: "EDC9AF", tacao: "EDB381", seapink: "ED989E", 
	carrotorange: "ED9121", tango: "ED7A1C", redribbon: "ED0A3F", starship: "ECF245", athsspecial: "ECEBCE", 
	fallgreen: "ECEBBD", wildrice: "ECE090", justright: "ECCDB9", frenchlilac: "ECC7EE", ronchi: "ECC54E", 
	fuelyellow: "ECA927", zinnwaldite: "EBC2AF", apricot: "EB9373", dew: "EAFFFE", aquaspring: "EAF9F5", 
	solitude: "EAF6FF", panache: "EAF6EE", whiterock: "EAE8D4", raffia: "EADAB8", robroy: "EAC674", 
	tuliptree: "EAB33B", porsche: "EAAE69", carissma: "EA88A8", clearday: "E9FFFD", ottoman: "E9F8ED", 
	ebb: "E9E3E3", confetti: "E9D75A", oysterpink: "E9CECD", tahitigold: "E97C07", burntsienna: "E97451", 
	clementine: "E96E00", aquasqueeze: "E8F5F2", gin: "E8F2EB", chromewhite: "E8F1D4", greenwhite: "E8EBE0", 
	pearlbush: "E8E0D5", shilo: "E8B9B3", firebush: "E89928", bubbles: "E7FEFF", lilywhite: "E7F8FF", 
	graynurse: "E7ECE6", putty: "E7CD8C", corn: "E7BF05", rosefog: "E7BCB4", kobi: "E79FC4", 
	tonyspink: "E79F8C", christine: "E7730A", mangotango: "E77200", tranquil: "E6FFFF", hintofgreen: "E6FFE9", 
	offgreen: "E6F8F3", harp: "E6F2EA", satinlinen: "E6E4D4", doublespanishwhite: "E6D7B9", cashmere: "E6BEA5", 
	goldsand: "E6BE8A", trinidad: "E64E03", polar: "E5F9F6", mercury: "E5E5E5", bonjour: "E5E0E1", 
	hampton: "E5D8AF", starkwhite: "E5D7BD", duststorm: "E5CCC9", zest: "E5841B", amaranth: "E52B50", 
	snowflurry: "E4FFD1", frostee: "E4F6E7", zombie: "E4D69B", grainbrown: "E4D5B7", sunflower: "E4D422", 
	bone: "E4D1C0", twilight: "E4CFDE", melanie: "E4C2D5", gamboge: "E49B0F", deepblush: "E47698", 
	mindaro: "E3F988", peppermint: "E3F5E1", cavernpink: "E3BEBE", cinnabar: "E34234", alizarincrimson: "E32636", 
	razzmatazz: "E30B5C", applegreen: "E2F3EC", mystic: "E2EBED", snuff: "E2D8ED", lightorchid: "E29CD2", 
	dixie: "E29418", shocking: "E292C0", goldenbell: "E28913", terracotta: "E2725B", mandy: "E25465", 
	tara: "E1F6E8", kidnapper: "E1EAD4", periglacialblue: "E1E6D6", pinkflare: "E1C0C8", equator: "E1BC64", 
	sunglo: "E16865", babyblue: "E0FFFF", calico: "E0C095", harvestgold: "E0B974", anzac: "E0B646", 
	mauve: "E0B0FF", chartreuseyellow: "DFFF00", willowbrook: "DFECDA", lola: "DFCFDB", chenin: "DFCD6F", 
	apache: "DFBE6F", heliotrope: "DF73FF", pattensblue: "DEF5FF", berylgreen: "DEE5C0", barberry: "DED717", 
	sapling: "DED4A4", wafer: "DECBC6", brandy: "DEC196", goldtips: "DEBA13", tumbleweed: "DEA681", 
	roman: "DE6360", cerisered: "DE3163", whiteice: "DDF9F1", swisscoffee: "DDD6D5", swansdown: "DCF0EA", 
	caper: "DCEDB4", moonmist: "DCDDCC", westar: "DCD9D2", wattle: "DCD747", blossom: "DCB4BC", galliano: "DCB20C", 
	punch: "DC4333", crimson: "DC143C", frostedmint: "DBFFF8", alto: "DBDBDB", diserria: "DB995E", 
	petiteorchid: "DB9690", cranberry: "DB5079", oysterbay: "DAFAFF", iceberg: "DAF4F0", zanah: "DAECD6", 
	goldengrass: "DAA520", copperfield: "DA8A67", orchid: "DA70D6", reddamask: "DA6A41", bamboo: "DA6304", 
	flamepea: "DA5B38", cerise: "DA3287", mabel: "D9F7FF", linkwater: "D9E4F5", tana: "D9DCC1",
	timberwolf: "D9D6CF", cameo: "D9B99B", burningsand: "D99376", cabaret: "D94972", foam: "D8FCFA", maverick: "D8C2D5", 
	thistle: "D8BFD8", japonica: "D87C63", valencia: "D84437", fog: "D7D0FF", pavlova: "D7C498", newyorkpink: "D7837F",
	snowymint: "D6FFDB", quillgray: "D6D6D1", moonraker: "D6CEF6", tacha: "D6C562", mypink: "D69188", grannyapple: "D5F6E3",
	winterhazel: "D5D195", whiskey: "D59A6F", cancan: "D591A4", grenadier: "D54600", hawkesblue: "D4E2FC", geyser: "D4DFE2",
	iron: "D4D7D9", birdflower: "D4CD16", akaroa: "D4C4A8", straw: "D4BF8D", clamshell: "D4B6AF", charm: "D47494", 
	swirl: "D3CDC5", sisal: "D3CBBA", gossip: "D2F8B0", blueromance: "D2F6DE", deco: "D2DA97", tan: "D2B48C", 
	careyspink: "D29EAA", rawsienna: "D27D46", hotcinnamon: "D2691E", pear: "D1E231", mischka: "D1D2DD", celeste: "D1D2CA", 
	softamber: "D1C6B4", vanilla: "D1BEA8", geebung: "D18F1B", teagreen: "D0F0C0", prelude: "D0C0E5", perfume: "D0BEF8", 
	meteor: "D07D12", hopbush: "D06DA1", redstage: "D05F04", scandal: "CFFAF4", hummingbird: "CFF9F3", surfcrest: "CFE5D2",
	tasman: "CFDCCF", oldgold: "CFB53B", eunry: "CFA39D", chino: "CEC7A7", yuma: "CEC291", coldturkey: "CEBABA", 
	sorrellbrown: "CEB98F", onahau: "CDF4FF", brandypunch: "CD8429", chestnutrose: "CD5C5C", tenn: "CD5700", 
	electriclime: "CCFF00", periwinkle: "CCCCFF", thistlegreen: "CCCAA8", puce: "CC8899", ochre: "CC7722", 
	burntorange: "CC5500", persianred: "CC3333", nebula: "CBDBD6", greenmist: "CBD3B0", foggygray: "CBCAB6", viola: "CB8FA9", 
	skeptic: "CAE6DA", bitterlemon: "CAE00D", pariswhite: "CADCD4", turmeric: "CABB48", flushmahogany: "CA3435",
	aeroblue: "C9FFE5", reef: "C9FFA2", conch: "C9D9D2", silverrust: "C9C0BB", earlsgreen: "C9B93B", sundance: "C9B35B", 
	rodeodust: "C9B29B", lightwisteria: "C9A0DC", pizza: "C99415", piper: "C96323", edgewater: "C8E3D7", laser: "C8B568",
	lily: "C8AABF", hokeypokey: "C8A528", lilac: "C8A2C8", antiquebrass: "C88A65", botticelli: "C7DDE5", pineglade: "C7CD90",
	ghost: "C7C9D5", cloud: "C7C4BF", melrose: "C7C1FF", coralreef: "C7BCA2", redviolet: "C71585", monza: "C7031E", 
	laspalmas: "C6E610", kangaroo: "C6C8BD", ash: "C6C3B5", roti: "C6A84B", orientalpink: "C69191", contessa: "C6726B", 
	brickred: "C62D42", yellowgreen: "C5E17A", seamist: "C5DBCA", tussock: "C5994B", nugget: "C59922", mulberry: "C54B8C",
	minttulip: "C4F4EB", coriander: "C4D0B0", mistgray: "C4C4BC", orangeroughy: "C45719", fuzzywuzzybrown: "C45655", 
	cardinal: "C41E3A", tropicalblue: "C3DDF9", tiara: "C3D1D1", periwinklegray: "C3CDE6", graynickel: "C3C3BD", 
	paleslate: "C3BFC1", indiankhaki: "C3B091", maroonflush: "C32148", jaggedice: "C2E8E5", pumice: "C2CAC4", 
	cottonseed: "C2BDB6", twine: "C2955D", indochine: "C26B03", sulu: "C1F07C", sprout: "C1D7B0", graysuit: "C1BECD", 
	tea: "C1BAB0", bisonhide: "C1B7A4", buddhagold: "C1A004", fuchsiapink: "C154C1", tiamaria: "C1440E", 
	pixiegreen: "C0D8B6", paleleaf: "C0D3B9", silver: "C0C0C0", oldrose: "C08081", mojo: "C04737", thunderbird: "C02B18", 
	lime: "BFFF00", ziggurat: "BFDBE2", keylimepie: "BFC921", silversand: "BFC1C2", bluehaze: "BFBED8", tide: "BFB8B0", 
	roseofsharon: "BF5500", fuego: "BEDE0D", pinkswan: "BEB5B7", londonhue: "BEA6C3", frenchpass: "BDEDFD", loblolly: "BDC9CE", 
	clayash: "BDC8B3", frenchgray: "BDBDC6", lavendergray: "BDBBD7", chatelle: "BDB3C7", malta: "BDB2A1", silk: "BDB1A8",
	quicksand: "BD978E", tuscany: "BD5E2E", powderash: "BCC9C2", surf: "BBD7C1", riogrande: "BBD009", brandyrose: "BB8983", 
	mediumredviolet: "BB3385", charlotte: "BAEEF9", submarine: "BAC7C9", nomad: "BAB1A2", pirategold: "BA7F03", 
	bourbon: "BA6F1E", rockspray: "BA450C", guardsmanred: "BA0101", rainee: "B9C8AC", wildwillow: "B9C46A", marigold: "B98D28", 
	crail: "B95140", chestnut: "B94E48", sail: "B8E0F9", celery: "B8C25D", greenspring: "B8C1B1", gimblet: "B8B56A", 
	copper: "B87333", milanored: "B81104", madang: "B7F0BE", heather: "B7C3D0", nobel: "B7B1B1", husk: "B7A458", 
	sahara: "B7A214", muddywaters: "B78E5C", rust: "B7410E", gumleaf: "B6D3BF", spindle: "B6D1EA", eagle: "B6BAA4", 
	heatheredgray: "B6B095", thatch: "B69D98", hibiscus: "B6316C", cruise: "B5ECDF", jetstream: "B5D2CE", olivegreen: "B5B35C", 
	mongoose: "B5A27F", lavender: "B57EDC", turkishrose: "B57281", junglemist: "B4CFD3", blush: "B44668", wellread: "B43332", 
	larioja: "B3C110", taupegray: "B3AF95", hottoddy: "B38007", fieryorange: "B35213", tallpoppy: "B32D29", 
	bilobaflower: "B2A1EA", shiraz: "B20931", icecold: "B1F4E7", fringyflower: "B1E2C1", teak: "B19461", santafe: "B16D52", 
	pumpkinskin: "B1610B", vesuvius: "B14A0B", brightred: "B10000", inchworm: "B0E313", powderblue: "B0E0E6", delrio: "B09A95", 
	maitai: "B06608", tapestry: "B05E81", matrix: "B05D54", cadillac: "B04C6A", pigeonpost: "AFBDD9", bombay: "AFB1B8", 
	martini: "AFA09E", lucky: "AF9F1C", alpine: "AF8F2C", driftwood: "AF8751", brownrust: "AF593E", appleblossom: "AF4D43", 
	mediumcarmine: "AF4035", bouquet: "AE809E", desert: "AE6020", hippiepink: "AE4560", greenyellow: "ADFF2F", padua: "ADE6C4", 
	mossgreen: "ADDFAD", casper: "ADBED1", mandalay: "AD781B", celadon: "ACE1AF", conifer: "ACDD4D", springrain: "ACCBB1", 
	swampgreen: "ACB78E", silverchalice: "ACACAC", cloudy: "ACA59F", hillary: "ACA586", napa: "ACA494", lemonginger: "AC9E22", 
	eastside: "AC91CE", limedoak: "AC8A56", bronco: "ABA196", coldpurple: "ABA0D9", sandrift: "AB917A", royalheath: "AB3472", 
	lipstick: "AB0563", magicmint: "AAF0D1", regentstblue: "AAD6E6", spunpearl: "AAABB7", logan: "AAA9CD", shadylady: "AAA5A9", 
	sandal: "AA8D6F", muesli: "AA8B5B", fire: "AA4203", nightshadz: "AA375A", opal: "A9C6C2", perano: "A9BEF2", towergray: "A9BDBF", 
	schist: "A9B497", cadetblue: "A9B2C3", aluminium: "A9ACB6", grayolive: "A9A491", chinook: "A8E3BD", norway: "A8BD9F", 
	locust: "A8AF8E", bud: "A8AE9C", tallow: "A8A589", dulllavender: "A899E6", dustygray: "A8989B", coraltree: "A86B6B", 
	renosand: "A86515", richgold: "A85307", luxorgold: "A7882C", mexicanred: "A72525", dawn: "A6A29A", donkeybrown: "A69279", 
	barleycorn: "A68B5B", paarl: "A65529", roofterracotta: "A62F20", bahia: "A5CB0C", zorba: "A59B91", jazzberryjam: "A50B5E", 
	greensmoke: "A4AF6E", wistful: "A4A6D3", delta: "A4A49D", blizzardblue: "A3E3ED", amethystsmoke: "A397B4", pharlap: "A3807B", 
	edward: "A2AEAB", graychateau: "A2AAB3", capepalliser: "A26645", rouge: "A23B6C", flirt: "A2006D", waterleaf: "A1E9DE", 
	aquaisland: "A1DAD7", citrus: "A1C50A", hitgray: "A1ADB5", butteredrum: "A1750D", tabasco: "A02712", feijoa: "9FDD8C", 
	sinbad: "9FD7D3", santasgray: "9FA0B1", stardust: "9F9F9C", reefgold: "9F821C", cognac: "9F381D", morningglory: "9EDEE0", 
	rockblue: "9EB1CD", citron: "9EA91F", sage: "9EA587", sepiaskin: "9E5B40", chelseagem: "9E5302", anakiwa: "9DE5FF", 
	grannysmithapple: "9DE093", pistachio: "9DC209", gullgray: "9DACB7", hawaiiantan: "9D5616", stiletto: "9C3336", 
	lemongrass: "9B9E8F", oregon: "9B4703", shadowgreen: "9AC2B8", olivine: "9AB973", gurkha: "9A9577", toast: "9A6E61", 
	prairiesand: "9A3820", bluebell: "9999CC", mountbattenpink: "997A8D", amethyst: "9966CC", copperrose: "996666", 
	totempole: "991B07", tamarillo: "991613", violeteggplant: "991199", fresheggplant: "990066", mintgreen: "98FF98", 
	paleoyster: "988D77", hacienda: "98811B", bazaar: "98777B", lilacbush: "9874D3", vinrouge: "983D61", atlantis: "97CD2D", 
	wisteria: "9771B5", auchico: "97605D", summergreen: "96BBAB", pewter: "96A8A1", lavenderpurple: "967BB6", 
	purplemountainsmajesty: "9678B6", leather: "967059", brown: "964B00", carmine: "960018", mountainmist: "959396", 
	strikemaster: "956387", scarlett: "950015", arrowtown: "948771", copperrust: "944747", algaegreen: "93DFB8", 
	cornflower: "93CCEA", mediumpurple: "9370DB", venus: "928590", stonewall: "928573", beaver: "926F5B", cumin: "924321", 
	sangria: "92000A", sycamore: "908D39", almondfrost: "907B71", hemp: "907874", oldbrick: "901E1E", burgundy: "900020", 
	vistablue: "8FD6B4", squirrel: "8F8176", korma: "8F4B0E", elsalva: "8F3E33", pohutukawa: "8F021C", nepal: "8EABC1", 
	mamba: "8E8190", domino: "8E775E", opium: "8E6F70", rope: "8E4D1E", redberry: "8E0000", poloblue: "8DA8CC", manatee: "8D90A1", 
	granitegreen: "8D8974", cement: "8D7662", tosca: "8D3F3F", sanguinebrown: "8D3D38", paprika: "8D0226", trendypink: "8C6495", 
	pottersclay: "8C5738", mulefawn: "8C472F", cardinalpink: "8C055E", riptide: "8BE6D8", cascade: "8BA9A5", envy: "8BA690", 
	portage: "8B9FEE", mantle: "8B9C90", naturalgray: "8B8680", schooner: "8B847E", olivehaze: "8B8470", cornharvest: "8B6B0B", 
	monarch: "8B0723", electricviolet: "8B00FF", jordyblue: "8AB9F1", stack: "8A8F8A", monsoon: "8A8389", claycreek: "8A8360", 
	truev: "8A73D6", burntumber: "8A3324", makara: "897D6D", cannonpink: "894367", solidpink: "893843", camelot: "893456", 
	avocado: "888D65", suvagray: "888387", kumera: "886221", spicymix: "885342", sushi: "87AB39", oslogray: "878D91", 
	hurricane: "877C7B", americano: "87756E", disco: "871550", regentgray: "86949F", bitter: "868974", rustynail: "86560A", 
	bullshot: "864D1E", ironstone: "86483C", lotus: "863C3C", reddevil: "860111", halfbaked: "85C4CC", balihai: "859FAF", 
	bandicoot: "858470", chetwodeblue: "8581D9", grannysmith: "84A0A0", plum: "843179", montecarlo: "83D0C6", 
	chelseacucumber: "83AA5D", shadow: "837050", merlot: "831923", battleshipgray: "828F72", gunsmoke: "828685", 
	sanddune: "826F65", spanishgreen: "819885", empress: "817377", spicypink: "816E71", nutmeg: "81422C", seagull: "80CCEA", 
	glacier: "80B3C4", gulfstream: "80B3AE", gray: "808080", olive: "808000", friargray: "807E79", russet: "80461B", 
	vividviolet: "803790", redrobin: "80341F", falured: "801818", rosebudcherry: "800B47", 
	maroon: "800000", aquamarine: "7FFFD4", chartreuse: "7FFF00", moodyblue: "7F76D3", mobster: "7F7589", falcon: "7F626D", 
	perutan: "7F3A02", claret: "7F1734", coppercanyon: "7E3A15", bermuda: "7DD8C6", malibu: "7DC8F7", bayleaf: "7DA98D", 
	pueblo: "7D2C14", neptune: "7CB7BB", acapulco: "7CB0A1", gumbo: "7CA1A6", trendygreen: "7C881A", jumbo: "7C7B82", 
	concord: "7C7B7A", topaz: "7C778A", pesto: "7C7631", kenyancopper: "7C1C05", asparagus: "7BA05B", amulet: "7B9F80", 
	flaxsmoke: "7B8265", waterloo: "7B7C94", tapa: "7B7874", yukongold: "7B6608", cinnamon: "7B3F00", redbeech: "7B3801", 
	deyork: "7AC488", wildblueyonder: "7A89B8", boulder: "7A7A7A", fuchsiablue: "7A58C1", siren: "7A013A", spray: "79DEEC", 
	sandstone: "796D62", fedora: "796A78", rum: "796989", oldlavender: "796878", romancoffee: "795D4C", seanymph: "78A39C", 
	shipcove: "788BBA", wasabi: "788A25", camouflagegreen: "78866B", peanut: "782F16", mocha: "782D19", japanesemaple: "780109", 
	pastelgreen: "77DD77", oxley: "779E86", pacifika: "778120", pablo: "776F61", walnut: "773F1A", crownofthorns: "771F1F", 
	darkburgundy: "770F05", skyblue: "76D7EA", lima: "76BD17", bluemarguerite: "7666C6", cosmic: "76395D", deluge: "7563A8", 
	russett: "755A57", mantis: "74C365", laurel: "749378", bluesmoke: "748881", rollingstone: "747D83", limedash: "747D63", 
	spicymustard: "74640D", xanadu: "738678", crete: "737829", crocodile: "736D58", kimberly: "736C9F", rawumber: "734A12", 
	eance: "731E8F", raven: "727B89", goben: "726D4E", oldcopper: "724A2F", venetianred: "72010F", aquamarineblue: "71D9E2", 
	sirocco: "718080", stormgray: "717486", olivetone: "716E10", peat: "716B56", yellowmetal: "716338", tobaccobrown: "715D47", 
	studio: "714AB2", affair: "714693", metalliccopper: "71291D", cedarwoodfinish: "711A00", slategray: "708090", 
	coffee: "706555", ferra: "704F50", antiquebronze: "704A07", sepia: "704214", persianplum: "701C1C", downy: "6FD0C5", 
	limeade: "6F9D02", highland: "6F8E63", flint: "6F6A61", caferoyale: "6F440C", palesky: "6E7783", kokoda: "6E6D57", 
	dallas: "6E4B26", pickledbean: "6E4826", moccaccino: "6E1D14", redoxide: "6E0902", gothic: "6D92A1", juniper: "6D9292", 
	dovegray: "6D6C6C", pinecone: "6D5E54", lonestar: "6D0101", turquoiseblue: "6CDAE7", eminence: "6C3082", olivedrab: "6B8E23", 
	bermudagray: "6B8BA2", dorado: "6B5755", shinglefawn: "6B4E31", royalpurple: "6B3FA0", hairyheath: "6B2A14", soyabean: "6A6051", 
	himalaya: "6A5D1B", spice: "6A442E", lynch: "697E9A", scorpion: "695F62", finn: "692D54", tawnyport: "692545", saltbox: "685E6E", 
	zambezi: "685558", nutmegwoodfinish: "683600", christi: "67A712", viridiangreen: "678975", ironsidegray: "676662", 
	scampi: "675FA6", blackrose: "67032D", screamingreen: "66FF66", brightgreen: "66FF00", silvertree: "66B58F", 
	darktan: "661010", tyrianpurple: "66023C", purple: "660099", pompadour: "660045", hoki: "65869F", willowgrove: "65745D", 
	fernfrond: "657220", purpleheart: "652DC1", cherrywood: "651A14", rosewood: "65000B", viking: "64CCDB", 
	cornflowerblue: "6495ED", nevada: "646E75", siam: "646A54", stormdust: "646463", dolphin: "646077", blueviolet: "6456B7", 
	fern: "63B76C", patina: "639A8F", finch: "626649", westcoast: "625119", butterflybush: "624E9A", quincy: "623F2D", 
	buccaneer: "622F30", gladegreen: "61845F", costadelsol: "615D30", eggplant: "614051", espresso: "612718", danube: "6093D1", 
	corduroy: "606E68", smoky: "605B73", horsesneck: "604913", tradewind: "5FB3AC", aquaforest: "5FA777", shuttlegray: "5F6672", 
	midgray: "5F5F6E", irishcoffee: "5F3D26", hemlock: "5E5D3B", kabul: "5E483E", breakerbay: "5DA19F", dingley: "5D7747", 
	verdigris: "5D5E37", chicago: "5D5C58", donjuan: "5D4C51", redwood: "5D1E0F", comet: "5C5D75", carnabytan: "5C2E01", 
	mulberrywood: "5C0536", bordeaux: "5C0120", jambalaya: "5B3013", horizon: "5A87A0", waikawagray: "5A6E9C", millbrook: "594433", 
	congobrown: "593737", brownbramble: "592804", wineberry: "591D35", hippieblue: "589AAF", cactus: "587156", scarpaflow: "585562", 
	saddlebrown: "583401", springleaves: "578363", fountainblue: "56B4BE", havelockblue: "5590D9", finlandia: "556D56", 
	saratoga: "555B10", cioccolato: "55280C", vidaloca: "549019", fuscousgray: "54534D", judgegray: "544333", heath: "541012", 
	hippiegreen: "53824B", victoria: "534491", voodoo: "533455", gigas: "523C94", maroonoak: "520C17", castro: "52001F", 
	smaltblue: "51808F", como: "517C66", chaletgreen: "516E3D", emperor: "514649", emerald: "50C878", cuttysark: "507672", 
	kashmirblue: "507096", mortar: "504351", apple: "4FA83D", fruitsalad: "4F9D5D", ferngreen: "4F7942", indigo: "4F69C6", 
	daisybush: "4F2398", honeyflower: "4F1C70", shakespeare: "4EABD1", wedgewood: "4E7F9E", axolotl: "4E6649", mulledwine: "4E4562", 
	bronzeolive: "4E420C", matterhorn: "4E3B41", bossanova: "4E2A5A", mahogany: "4E0606", woodland: "4D5328", bronzetone: "4D400F", 
	punga: "4D3D14", rock: "4D3833", lividbrown: "4D282E", cowboy: "4D282D", indiantan: "4D1E01", cabsav: "4D0A18", 
	blackberry: "4D0135", abbey: "4C4F56", saddle: "4C3024", nandor: "4B5D52", pigmentindigo: "4B0082", trout: "4A4E5A", 
	gravel: "4A444B", tundora: "4A4244", mondo: "4A3C30", deepbronze: "4A3004", bracken: "4A2A04", bismark: "497183", 
	bluebayoux: "496679", verdungreen: "495400", metallicbronze: "49371B", brownderby: "492615", vancleef: "49170C", 
	taupe: "483C32", woodybrown: "483131", cocoabean: "481C1C", clairvoyant: "480656", bulgarianrose: "480607", 
	rusticred: "480404", steelblue: "4682B4", grayasparagus: "465945", craterbrown: "462425", loulou: "460B41", pictonblue: "45B1E8", 
	sanmarino: "456CAC", kelp: "454936", mako: "444954", moroccobrown: "441D00", barossa: "44012D", greenleaf: "436A0D", 
	riverbed: "434C59", armadillo: "433E37", iroko: "433120", scarletgum: "431560", fadedjade: "427977", lisbonbrown: "423921", 
	burntmaroon: "420303", oceangreen: "41AA78", royalblue: "4169E1", eastbay: "414C7D", gunpowder: "414257", merlin: "413C37", 
	deepoak: "412010", paco: "411F10", ripeplum: "410056", chateaugreen: "40A860", viridian: "40826D", fiord: "405169", 
	thatchgreen: "403D19", masala: "403B38", cork: "40291D", brownpod: "401801", harlequin: "3FFF00", puertorico: "3FC1AA", 
	mineralgreen: "3F5D53", tomthumb: "3F583B", cabbagepont: "3F4C3A", minsk: "3F307F", madras: "3F3002", cola: "3F2500", 
	bronze: "3F2109", pelorous: "3EABBF", shipgray: "3E3A44", blackmarlin: "3E2C1C", englishwalnut: "3E2B23", cedar: "3E1C14", 
	kingfisherdaisy: "3E0480", goblin: "3D7D52", bistre: "3D2B1F", bean: "3D0C02", lunargreen: "3C493A", capecod: "3C4443", 
	brightgray: "3C4151", camouflage: "3C3910", darkebony: "3C2005", meteorite: "3C1F76", rebel: "3C1206", windsor: "3C0878", 
	bostonblue: "3B91B4", amazon: "3B7A57", treehouse: "3B2820", jon: "3B1F1F", aubergine: "3B0910", temptress: "3B000B", 
	keppel: "3AB09E", killarney: "3A6A47", william: "3A686C", jacarta: "3A2A6A", sambuca: "3A2010", toledo: "3A0020", 
	dell: "396413", limedspruce: "394851", clover: "384910", oxfordblue: "384555", dune: "383533", grape: "381A51", 
	bluediamond: "380474", oracle: "377475", birch: "373021", browntumbleweed: "37290E", clinker: "371D09", chocolate: "370202", 
	lapalma: "368716", ming: "36747D", waiouru: "363C0D", tuatara: "363534", martinique: "363050", chambray: "354E8C", 
	tuna: "353542", jagger: "350E57", valentino: "350E42", mardigras: "350036", tamarind: "341515", shamrock: "33CC99", 
	thunder: "33292F", christalle: "33036B", astral: "327DA0", bilbao: "327C14", stromboli: "325D52", mineshaft: "323232",
	blackcurrant: "32293A", persianindigo: "32127A", paradiso: "317D82", calypso: "31728D", azure: "315BA1", 
	pickledbluewood: "314459", eclipse: "311C17", turquoise: "30D5C8", sanjuan: "304B6A", woodrush: "302A0F", cocoabrown: "301F1E", 
	melanzane: "300529", casal: "2F6168", spectra: "2F5A57", sapphire: "2F519E", governorbay: "2F3CB3", onion: "2F270E", 
	scooter: "2EBFD4", seagreen: "2E8B57", rhino: "2E3F62", rangitoto: "2E3222", jackobean: "2E1905", jacaranda: "2E0329", 
	sttropaz: "2D569B", outerspace: "2D383A", mikado: "2D2510", lochinvar: "2C8C84", bleachedcedar: "2C2133", revolver: "2C1632", 
	bluegem: "2C0E8C", heavymetal: "2B3228", valhalla: "2B194F", sepiablack: "2B0202", ceruleanblue: "2A52BE", turtlegreen: "2A380B", 
	alticsea: "2A2630", coffeebean: "2A140E", cherrypie: "2A0359", junglegreen: "29AB87", jellybean: "297B9A", charade: "292937", 
	zeus: "292319", bastille: "292130", violentviolet: "290C5E", mariner: "286ACD", astronaut: "283A77", oil: "281E15", 
	eucalyptus: "278A5B", plantation: "27504B", bayofmany: "273A81", ebonyclay: "26283B", steelgray: "262335", gondola: "261414", 
	woodbark: "261105", parism: "26056A", paua: "260368", curiousblue: "2596D1", greenkelp: "25311C", shark: "25272C", 
	portgore: "251F4F", cannonblack: "251706", graphite: "251607", greenhouse: "24500F", blackolive: "242E16", logcabin: "242A1D", 
	ilamanjaro: "240C02", violet: "240A40", mallard: "233418", forestgreen: "228B22", deepblue: "220878", eternity: "211A0E",  
	bluedianne: "204852", cloudburst: "202E54", jacksonspurple: "20208D", java: "1FC2C2", nightrider: "1F120F", easternblue: "1E9AB0", 
	odgerblue: "1E90FF", tepapagreen: "1E433C", cello: "1E385B", elpaso: "1E1708", karaka: "1E1609", creole: "1E0F04", 
	greenpea: "1D6142", elm: "1C7C7D", everglade: "1C402E", persianblue: "1C39BB", rangoongreen: "1C1E13", crowshead: "1C1208", 
	matisse: "1B659D", biscay: "1B3162", seaweed: "1B2F11", acadia: "1B1404", deepkoamaru: "1B127B", haiti: "1B1035", tolopea: "1B0245", 
	mountainmeadow: "1AB385", luckypoint: "1A1A68", funblue: "1959A8", nileblue: "193751", palmleaf: "19330E", blumine: "18587A", 
	deepforestgreen: "182D09", chathamsblue: "175579", pinetree: "171F04", gablegreen: "163531", timbergreen: "16322C", celtic: "163222", 
	bigstone: "162A40", huntergreen: "161D10", mirage: "161928", genoa: "15736B", denim: "1560BD", bunting: "151F4C", toryblue: "1450AA", 
	nero: "140600", parsley: "134F19", bluezodiac: "13264D", asphalt: "130A06", diesel: "130000", jewel: "126B40", elephant: "123447", 
	ultramarine: "120A8F", arapawa: "110C6C", eden: "105852", greenwaterloo: "101405", vulcan: "10121D", toreabay: "0F2D9E", 
	firefly: "0E2A30", cinder: "0E0E18", bush: "0D2E1C", aztec: "0D1C19", bunker: "0D1117", blackrock: "0D0332", bluechill: "0C8990", 
	surfiegreen: "0C7A79", racinggreen: "0C1911", woodsmoke: "0C0D0F", ebony: "0C0B1D", malachite: "0BDA51", sanfelix: "0B6207", 
	blackforest: "0B1304", gordonsgreen: "0B1107", marshland: "0B0F08", codgray: "0B0B0B", atoll: "0A6F75", japaneselaurel: "0A6906", 
	darkfern: "0A480D", blackrussian: "0A001C", salem: "097F4B", deepseagreen: "095859", bottlegreen: "093624", madison: "09255D", 
	palmgreen: "09230F", downriver: "092256", brightturquoise: "08E8DE", elfgreen: "088370", deepsapphire: "082567", blackbean: "081910", 
	jaguar: "080110", tarawera: "073A50", niagara: "06A189", gossamer: "069B81", tiber: "063537", catalinablue: "062A78", 
	watercourse: "056F57", veniceblue: "055989", gulfblue: "051657", deepcove: "051040", tealblue: "044259", zuccini: "044022", 
	bluewhale: "042E4C", blackpearl: "041322", midnightmoss: "041004", mosque: "036A6E", greenvogue: "032B52", tangaroa: "03163C", 
	cerulean: "02A4D3", observatory: "02866F", bahamablue: "026395", eveningsea: "024E46", congressblue: "02478E", 
	sherwoodgreen: "02402C", englishholly: "022D15", greenhaze: "01A368", deepsea: "01826B", bluelagoon: "017987", 
	pinegreen: "01796F", fungreen: "016D39", bluestone: "016162", orient: "015E85", aquadeep: "014B43", regalblue: "013F6A", 
	astronautblue: "013E62", countygreen: "01371A", cardingreen: "01361C", daintree: "012731", holly: "011D13", midnight: "011635", 
	bluecharcoal: "010D1A", cyan: "00FFFF", springgreen: "00FF7F", green: "00FF00", robinseggblue: "00CCCC", caribbeangreen: "00CC99", 
	jade: "00A86B", persiangreen: "00A693", pacificblue: "009DC4", bondiblue: "0095B6", teal: "008080", azureradiance: "007FFF", 
	lochmara: "007EC7", deepcerulean: "007BA7", allports: "0076A3", tropicalrainforest: "00755E", blueribbon: "0066FF", 
	scienceblue: "0066CC", camarone: "00581A", endeavour: "0056A7", sherpablue: "004950", crusoe: "004816", cobalt: "0047AB", 
	kaitokegreen: "004620", cyprus: "003E40", deepteal: "003532", smalt: "003399", midnightblue: "003366", prussianblue: "003153", 
	internationalkleinblue: "002FA7", burnham: "002E20", deepfir: "002900", resolutionblue: "002387", swamp: "001B1C", stratos: "000741", 
	blue: "0000FF", darkblue: "0000C8", navyblue: "000080", black: "000000"
}

