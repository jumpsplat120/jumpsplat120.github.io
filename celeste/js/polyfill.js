Object.defineProperty(Math, "TAU", { value: Math.PI * 2 })

Object.defineProperty(Number.prototype, "map", { value: function(from_min, from_max, to_min, to_max) {
	return (this - from_min) * (to_max - to_min) / (from_max - from_min) + to_min
}})