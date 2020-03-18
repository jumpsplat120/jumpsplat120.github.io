class Particle {
	constructor(canvas) {
		this.canvas = canvas
		this.x        = 0
		this.y        = 0
		this.size     = 0
		this.speed    = 0
		this.speedMax = 0
		this.color    = "#FFFFFF"
		this.life     = 0
		this.end      = false
	}
	
	initalize(x, y, life, color, size, speed, speedMax) {
		this.x     = x     || rand(0, this.canvas.canvas.width)
		this.y     = y     || rand(0, this.canvas.canvas.height)
		this.life  = life  || rand(90, 600)
		this.maxLife = this.life
		this.color = color || rgbToHex([rand(0, 255), rand(0, 255), rand(0, 255)])
		this.size  = size  || this.life / 120
		this.speed = speed || rand(1, 5)
		this.speedMax = speedMax || rand(30, 50)
	}
	
	draw() {
		this.canvas.fillStyle = this.color
		this.canvas.beginPath()
		this.canvas.arc(this.x, this.y, this.size, 0, Math.TAU)
		this.canvas.fill()
	}
	
	update(dx, dy) {
		this.x += dx !== undefined ? dx : this.speed * -2
		this.y += dy !== undefined ? dy : this.speed * -.05
		this.life  -= rand(1, 3)
		this.size   = this.life / 120
		this.speed  = ((this.maxLife - this.life) / this.maxLife) * this.speedMax
		this.end    = this.life <= 0
	}
}