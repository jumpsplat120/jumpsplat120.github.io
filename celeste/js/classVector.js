class Vector {
	constructor(x, y) {
		this._ = {
			x1: x,
			x2: x,
			y1: y,
			y2: y
		}
	}
	
	get x()  { return this._.x1 }
	get y()  { return this._.y1 }
	get x2() { return this._.x2 }
	get y2() { return this._.y2 }
	
	set x(value) {
		this._.x1 = value
		this.recalcXY(this.magnitude, this.angle)
	}
	
	set y(value) {
		this._.y1 = value
		this.recalcXY(this.magnitude, this.angle)
	}
	
	get angle() {
		return Math.atan2(this.y2 - this.y, this.x2 - this.x)
	}
	
	set angle(value) {
		this.recalcXY(this.magnitude, value)
	}
	
	get magnitude() {
		let dx, dy
		
		dx = this.x - this.x2
		dy = this.y - this.y2
		
		return Math.sqrt(dx * dx + dy * dy)
	}
	
	set magnitude(value) {
		this.recalcXY(value, this.angle)
	}
	
	recalcXY(length, angle) {
		this._.x2 = length * Math.cos(angle) + this.x
		this._.y2 = length * Math.sin(angle) + this.y
	}
	
	rotateByDegrees(degrees) {
		let prev_angle = this.angle * 180 / Math.PI
		this.angle = (degrees + prev_angle) * Math.PI / 180
	}
	
	rotateToDegree(degree) {
		this.angle = degree * Math.PI / 180
	}
}