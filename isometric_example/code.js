function InvalidSizeException(message) {
    this.name = "InvalidSizeException"
    this.message = message
}

class Game {

    #width;
    #height;
    #parent_width;
    #parent_height;
    #drawables;
    #canvas;
    #context;
    #interval;
    #clear;

    /**
     * 
     * @param {string|HTMLCanvasElement} id - Id of the canvas element, or the canvas element directly.
     * @param {int=} width - The width of the canvas. If no width is specified, uses the full size of the parent node.
     * @param {int=} height  - The width of the canvas. If no width is specified, uses the full size of the parent node.
     */
    constructor(id, width, height) {
        /** @type {HTMLCanvasElement} */
        this.#canvas  = typeof id === "string" ? document.getElementById(id) : id;
        this.#context = this.canvas.getContext("2d");

        this.#getParentSize();

        this.#width  = (width  ?? this.#parent_width)  / this.#parent_width;
        this.#height = (height ?? this.#parent_height) / this.#parent_height;
        
        this.#drawables = [];
        this.#clear = true;

        function init() {
            this.#getParentSize();
            this.#initCanvas();
        }

        document.addEventListener("DOMContentLoaded", init.bind(this));
        window.addEventListener("resize", init.bind(this));

        this.#interval = setInterval(this.#runDrawCallbacks.bind(this), 60 / 1000);
    }
    
    get canvas()  { return this.#canvas;  }
    get context() { return this.#context; }
    get width()   { return this.#width  * this.#parent_width; }
    get height()  { return this.#height * this.#parent_height; }

    /**
     * Get the width and height of the parent node of the canvas and assigns them to the private
     * variables parent_width and parent_height.
     * @method
     * @private
     */
    #getParentSize() {
        const comp_style = window.getComputedStyle(this.#canvas.parentNode);

        this.#parent_width  = parseInt(comp_style.width.slice(0, -2));
        this.#parent_height = parseInt(comp_style.height.slice(0, -2));
    }

    /**
     * Takes the canvas, and uses the property {@link window.devicePixelRatio} to
     * determine the scale at which the canvas should be rendered. Then adjusts
     * the width and height of the canvas. Scales to the width/height that the Game
     * singleton was initilized at. Useful when working with retina displays and the like.
     * @method
     * @private
     */
     #scaleCanvas() {
        const scale  = window.devicePixelRatio;

        const width  = this.#width  * this.#parent_width;
        const height = this.#height * this.#parent_height;

        this.#canvas.style.width  = `${width}px`;
        this.#canvas.style.height = `${height}px`;

        this.#canvas.width  = Math.floor(width  * scale);
        this.#canvas.height = Math.floor(height * scale);

        this.#context.scale(scale, scale);
    }

    /**
     * Initialize the canvas. First scales the canvas by the {@link Game.width width}/{@link Game.height height},
     * then calls the internal draw function to immediately refresh the canvas for it's new size.
     */
    #initCanvas() {
        this.#scaleCanvas();
        this.#runDrawCallbacks();
    }
    
    /**
     * Goes through all added drawable and runs the draw method on them. Passes in the context for 
     * each callback to draw to. Translates the context by a half pixel and then resets the
     * translation after all callbacks to make sure that each draw is in the center of the pixel,
     * which helps  avoid some aliasing. This function is run 60 times a second, and clears at the
     * beginning of each call.
     */
    #runDrawCallbacks() {
        let dont_clear = false;
        if (this.#clear) { this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height); }
        this.#context.translate(0.5, 0.5);
        this.#drawables.forEach(drawable => {
            dont_clear = drawable.draw(this.#context, this.#canvas.width, this.#canvas.height, this.#canvas, this.#clear) || dont_clear;
        });
        this.#context.translate(-0.5, -0.5);
        this.#clear = !dont_clear;
    }

    /**
     * Resize the canvas to a new value. Resizes from the top left corner. Will 
     * throw an exception if you try to resize the canvas smaller than one pixel
     * for either the width or the height.
     * 
     * @param {int} width - The new width of the canvas.
     * @param {int} height - The new height of the canvas.
     */
    resize(width, height) {
        if (width < 1 || height < 1) { throw InvalidSizeException("The size of the canvas must be bigger than zero pixels for both the width and the height!") }
        
        this.#width  = width;
        this.#height = height;
    }

    /**
     * Takes a drawable (whenever I get around to implementing a drawable interface)
     * and draws it.
     * @param {Drawable} drawable - Adds the drawable object to the stack.
     * @return {int} Returns the index of that particular callback in the stack.
     */
    draw(drawable) {
        if (this.#interval) { clearInterval(this.#interval); }

        //Lazy has_draw check, probably should use an interface
        if (drawable.draw) {
            this.#drawables[this.#drawables.length] = drawable;
        } else {
            throw new Error("Object does not contain a drawable function.");
        }

        this.#interval = setInterval(this.#runDrawCallbacks.bind(this), 60 / 1000);

        return this.#drawables.length - 1;
    }

    /**
     * Remove a drawable from the stack.
     * @param {Drawable} drawable - The drawable object to remove.
     */
    remove(drawable) {
        clearInterval(this.#interval);

        this.#drawables.splice(this.#drawables.indexOf(drawable), 1);

        this.#interval = setInterval(this.#runDrawCallbacks.bind(this), 60 / 1000);
    }

    /**
     * Flush the drawables stack and stop the interval from running.
     */
    flush() {
        clearInterval(this.#interval);
        this.#drawables = [];
        this.#interval  = null;
    }

    ///**
    // * Checks the drawables stack for a specific object.
    // * @param {Drawable} drawable - The drawable object you want the index of.
    // * @return {bool} true if the drawables stack contains a specific drawable.
    // */
    //contains(drawable) {
    //    return this.#drawables.indexOf(drawable) > 0;
    //}

    /**
     * Returns the index of the specific drawable object in the drawables stack.
     * 
     * @param {Drawable} drawable - The drawable object you want the index of.
     * @return {int} The index of the specific drawable, or -1 if not found in the stack.
     */
    indexOf(drawable) {
        return this.#drawables.indexOf(drawable);
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    orientation(p1, p2) {
        const val = (this.y - p1.y) * (p2.x - this.x) - (this.x - p1.x) * (p2.y - this.y);

        return val == 0 ? "collinear" : val > 0 ? "clockwise" : "counterclockwise";
    }
}

class Line {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    containsPoint(point) {
        return point.x <= Math.max(this.p1.x, this.p2.x) && point.x >= Math.min(this.p1.x, this.p2.x) && point.y <= Math.max(this.p1.y, this.p2.y) && point.y >= Math.min(this.p1.y, this.p2.y);
    }

    intersects(line) {
        const a = this.p1.orientation(this.p2, line.p1);
        const b = this.p1.orientation(this.p2, line.p2);
        const c = line.p1.orientation(line.p2, this.p1);
        const d = line.p1.orientation(line.p2, this.p2);
        
        if (a != b && c != d) { return true; }
    
        if (a == "collinear" && this.containsPoint(line.p1)) { return true; }
        if (b == "collinear" && this.containsPoint(line.p2)) { return true; }
        if (c == "collinear" && line.containsPoint(this.p1)) { return true; }
        if (d == "collinear" && line.containsPoint(this.p2)) { return true; }

        return false;
    }
}

class Diamond {
    constructor(game, x, y, width, height, fill_color, line_width, line_color, dont_init) {
        this.x = x;
        this.y = y;

        this.width  = width;
        this.height = height;

        this.game = game;
        
        this.color = fill_color;

        this.line_width = line_width;
        this.line_color = line_color;

        this.vertices = [
            new Point(this.x - this.width * 0.5, this.y),
            new Point(this.x, this.y + this.height * 0.5),
            new Point(this.x + this.width * 0.5, this.y),
            new Point(this.x, this.y - this.height * 0.5)
        ];

        this.lines = [
            new Line(this.vertices[0], this.vertices[1]),
            new Line(this.vertices[1], this.vertices[2]),
            new Line(this.vertices[2], this.vertices[3]),
            new Line(this.vertices[3], this.vertices[0])
        ]

        if (!dont_init) { this.init(); }
    }

    init() {
        this.index = this.game.draw(this);
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.vertices[0].x, this.vertices[0].y);
        context.lineTo(this.vertices[1].x, this.vertices[1].y);
        context.lineTo(this.vertices[2].x, this.vertices[2].y);
        context.lineTo(this.vertices[3].x, this.vertices[3].y);
        context.closePath();
        context.lineWidth = this.line_width;
        context.fillStyle = this.color;
        context.fill();
        context.strokeStyle = this.line_color;
        context.stroke();
    }

    containsPoint(point) {
        if (point.y == this.y) {
            return this.x + (this.width * 0.5) > point.x && point.x > this.x - (this.width * 0.5);
        } else {
            const inf_line = new Line(point, new Point(1000000, point.y));

            let count = 0;

            for (let line of this.lines) {
                if (inf_line.intersects(line)) {
                    if (inf_line.p1.orientation(line.p1, line.p2) == "collinear") { return line.containsPoint(inf_line.p1); }
                    count++;
                }
            }

            return count % 2 == 1;
        }
    }

    clone() {
        return new this.constructor(this.game, this.x, this.y, this.width, this.height, this.color, this.line_width, this.line_color, true);
    }
}

class Map {
    constructor(game, size, rows, cols, x, y) {
        this.x = x;
        this.y = y;
        this.rows = rows;
        this.cols = cols;
        this.size = size;

        this.width  = this.size;
        this.height = this.size * 0.5;

        this.tiles = [];

        this.game = game;

        this.curr_tile = null;
        this.prev_tile = null;

        this.buildMap();

        this.game.canvas.addEventListener("mousemove", (function(e) {
            this.curr_tile = null;

            const mouse = new Point(e.pageX, e.pageY);

            this.tiles.some(tile_row => { return tile_row.some(tile => {
                if (tile.containsPoint(mouse)) {
                    this.curr_tile = tile;
                    return true;
                }
            });});

            if (this.prev_tile && this.prev_tile != this.curr_tile) { this.leaveTile(this.prev_tile); }
            if (this.curr_tile && this.game.indexOf(this.curr_tile) != this.tiles.length) {
                this.game.remove(this.curr_tile);
                this.game.draw(this.curr_tile);
                this.enterTile(this.curr_tile);
            }
            
            this.prev_tile = this.curr_tile;
        }).bind(this))

        this.game.canvas.addEventListener("mousedown", (function(e) {
            if (this.curr_tile) { this.clickTile(this.curr_tile); }
        }).bind(this));
    }

    buildMap() {
        for (let i = 0; i < this.rows; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.cols; j++) {
                const x_offset = i * this.width * 0.5 - (j * this.width * 0.5);
                const y_offset = j * this.height * 0.5 + (i * this.height * 0.5);
                const x = this.x + x_offset;
                const y = this.y + y_offset;
                const is_edge = i == 0 || i == this.rows - 1 || j == 0 || j == this.cols - 1;

                this.tiles[i][j] = new Diamond(this.game, x, y, this.width, this.height, is_edge ? "green" : "gray", 2, "black");
            }
        }
    }

    update(size, rows, cols, x, y) {
        this.game.flush();

        this.x = x;
        this.y = y;
        this.rows = rows;
        this.cols = cols;
        this.size = size;

        this.width  = this.size;
        this.height = this.size * 0.5;

        this.tiles = [];

        this.curr_tile = null;
        this.prev_tile = null;
        
        this.buildMap();
    }

    enterTile(tile) {
        tile.line_color = "yellow";
    }

    leaveTile(tile) {
        tile.line_color = "black";
    }

    clickTile(tile) {
        if (tile.old_color) {
            tile.color = tile.old_color;
            delete tile.old_color;
        } else {
            tile.old_color = tile.color;
            tile.color = "red";
        }
    }
}

const row_slider = document.getElementById("rows");
const col_slider = document.getElementById("cols");
const size_slider = document.getElementById("size");

const ROWS = parseInt(row_slider.value);
const COLS = parseInt(col_slider.value);
const SIZE = parseInt(size_slider.value);

const X = SIZE * ROWS * 0.5;
const Y = SIZE * 0.25;

const map = new Map(new Game("canvas"), SIZE, ROWS, COLS, X, Y);

function refreshMap() {
    const ROWS = parseInt(row_slider.value);
    const COLS = parseInt(col_slider.value);
    const SIZE = parseInt(size_slider.value);

    const X = SIZE * COLS * 0.5;
    const Y = SIZE * 0.25;

    map.update(SIZE, ROWS, COLS, X, Y);
}

row_slider.addEventListener("input", refreshMap)
col_slider.addEventListener("input", refreshMap)
size_slider.addEventListener("input", refreshMap)