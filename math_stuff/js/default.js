import { Color, Char, Text } from "./library.js"

var test = new Text("string")
var test2 = new Text(new Char("a"))

console.log(test.root)
console.log(test2.root)