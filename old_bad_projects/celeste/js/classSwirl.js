//flow field based on simplex noise
//high complexity field, slow change over time
//particles to be created within zone
//particles to be squares

class Swirl {
	constructor(scale, increment, speed) {
		this._ = {
			canvas:    document.getElementById("swirl").getContext("2d"),
			scale:     scale     !== undefined ? scale     : 3,
			increment: increment !== undefined ? increment : .01,
			noise:     [],
			flowfield: [],
			particles: [],
			z_offset:  0
		}
		
		this._.width  = this._.canvas.canvas.width
		this._.height = this._.canvas.canvas.height
		this._.cols   = Math.floor(this._.width  / this._.scale)
		this._.rows   = Math.floor(this._.height / this._.scale)
		this._.speed  = speed !== undefined ? this.increment / speed : this.increment
	}
	
	get canvas()    { return this._.canvas    }
	get scale()     { return this._.scale     }
	get particles() { return this._.particles }
	get width()     { return this._.width     }
	get height()    { return this._.height    }
	get columns()   { return this._.cols      }
	get rows()      { return this._.rows      }
	get flowfield() { return this._.flowfield }
	get noise()     { return this._.noise     }
	get increment() { return this._.increment }
	get z_offset()  { return this._.z_offset  }
	get speed()     { return this._.speed     }
	
	set flowfield(value) { this._.flowfield = value } 
	set noise(value)     { this._.noise     = value }
	set z_offset(value)  { this._.z_offset  = value }
	
	setup() {
		noise.seed(Math.random())
		
		let y_offset = 0
		
		this.amount = this.density * 500
		
		for (let y = 0; y < this.rows; y++) {
			let x_offset = 0
				
			this.noise[y] = []
			
			for (let x = 0; x < this.columns; x++) {
				this.noise[y][x] = this.calculateNoiseAt(x_offset, y_offset)
				x_offset += this.increment
			}
			
			y_offset += this.increment	
		}
	}
	
	calculateFlowFieldAt(i, x, y) {
		this.flowfield[i] = new Vector(x, y)
		
		this.flowfield[i].x = x * this.scale
		this.flowfield[i].y = y * this.scale

		this.flowfield[i].rotateToDegree(this.noise[y][x])

		this.flowfield[i].magnitude = this.scale
	}
	
	calculateNoise() {
		let y_offset = 0
		
		for (let y = 0; y < this.rows; y++) {
			let x_offset = 0
				
			this.noise[y] = []
			
			for (let x = 0; x < this.columns; x++) {
				this.noise[y][x] = this.calculateNoiseAt(x_offset, y_offset)
				x_offset += this.increment
			}
			
			y_offset += this.increment	
		}
		
		this.z_offset += this.speed
	}

	drawFlowField() {
		this.canvas.clearRect(0, 0, this.width, this.height)
		
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				let i = (y * this.columns) + x + 1

				this.calculateFlowFieldAt(i, x, y)
				
				this.canvas.beginPath()
					this.canvas.moveTo(this.flowfield[i].x, this.flowfield[i].y)
					this.canvas.lineTo(this.flowfield[i].x2, this.flowfield[i].y2)
				this.canvas.stroke()
			}	
		}
		
		this.calculateNoise()
		window.requestAnimationFrame(this.drawFlowField.bind(this))
	}
	
	calculateNoiseAt(x, y) {
		return noise.simplex3(x, y, this.z_offset).map(-1, 1, 0, 360)
	}
	
	draw() {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				let shade = Math.round(this.noise[y][x])
				this.canvas.fillStyle = rgbToHex([shade, shade, shade])
				this.canvas.fillRect(x * this.scale, y * this.scale, this.scale, this.scale)
			}	
		}
	}
}