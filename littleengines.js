(function(root) {
  var sets = new Set();

  // Start the animation loop that will be used by all sets
  function animLoop(render) {
    var running, lastFrame = +new Date;
    root.requestAnimFrame = (function() {
      return root.requestAnimationFrame || root.webkitRequestAnimationFrame || root.mozRequestAnimationFrame || function(callback) {
        root.setTimeout(callback, 1000 / 60);
      };
    })();

    function loop(now) {
      if (running !== false) {
        requestAnimFrame(loop);
        running = render(now - lastFrame);
        lastFrame = now;
      }
    }
    loop(lastFrame);
  };
  animLoop(function() {
    for (var set of sets) {
      if(set.isRunning) {
        set.next();
      }
    }
  });

  function drawDot(x, y, color, ctx) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };

  /**
   * Construct a new set in a given DOM element. 2 canvas elements will be created within, it's then up to you
   * to position them as you wish using CSS.
   * @constructor
   * @param {HTMLElement} rootEl
   * @param {Number} width
   * @param {Number} height
   */
  var LittleEnginesSet = function(rootEl, width, height) {
    this._rootEl = rootEl || root.document.body;
    this._engineCtx = this._trailCtx = null;
    this._width = width || 400;
    this._height = height || 400;
    this._engines = new Set();
    this.isRunning = false;

    this._init();

    sets.add(this);
  };

  LittleEnginesSet.prototype = {
    _init: function() {
      var engineCanvas = root.document.createElement('canvas');
      engineCanvas.setAttribute('width', this._width);
      engineCanvas.setAttribute('height', this._height);
      engineCanvas.setAttribute('class', 'engine');
      this._engineCtx = engineCanvas.getContext('2d');
      this._rootEl.appendChild(engineCanvas);

      var trailCanvas = root.document.createElement('canvas');
      trailCanvas.setAttribute('width', this._width);
      trailCanvas.setAttribute('height', this._height);
      trailCanvas.setAttribute('class', 'trail');
      this._trailCtx = trailCanvas.getContext('2d');
      this._rootEl.appendChild(trailCanvas);
    },

    /**
     * Stop and remove this set from the root DOM element
     */
    destroy: function() {
      sets.delete(this);
      this._rootEl.removeChild(this._engineCtx.canvas);
      this._rootEl.removeChild(this._trailCtx.canvas);
      this._rootEl = null;
      this._engines.clear();
    },

    /**
     * Add a new engine to the set
     * @param {Object} The engine configuration object.
     * The simplest form is {x,y,r,a,s} with x/y being the coordinates of the center of the engine,
     * r being the radius, a the start angle and s the rotation speed.
     * @return {Object} The engine object, to be used with removeEngine
     */
    addEngine: function(engine) {
      return this._engines.add(engine) || engine;
    },

    removeEngine: function(engine) {
      this._engines.delete(engine);
    },

    clearTrail: function() {
      this._trailCtx.clearRect(0, 0, this._trailCtx.canvas.width, this._trailCtx.canvas.height);
    },

    start: function() {
      this.isRunning = true;
    },

    stop: function() {
      this.isRunning = false;
    },

    toggle: function() {
      this.isRunning = !this.isRunning;
    },

    next: function() {
      this._engineCtx.clearRect(0, 0, this._engineCtx.canvas.width, this._engineCtx.canvas.height);

      var linksCoordinates = [];

      // Engines
      this._engineCtx.strokeStyle = 'rgba(255,255,255,.5)';
      this._engineCtx.lineWidth = 2;
      for(var engine of this._engines) {
        var posX = engine.x + (engine.r * Math.cos(engine.a)),
            posY = engine.y + (engine.r * Math.sin(engine.a));

        this._engineCtx.beginPath();
        this._engineCtx.moveTo(engine.x, engine.y);
        this._engineCtx.lineTo(posX, posY);
        this._engineCtx.closePath();
        this._engineCtx.stroke();

        drawDot(engine.x, engine.y, 'rgba(255,255,255,.5)', this._engineCtx);
        drawDot(posX, posY, 'rgba(255,255,255,.5)', this._engineCtx);

        engine.a += engine.s;

        linksCoordinates.push({
          x: posX,
          y: posY
        });
      }

      // Links
      this._engineCtx.strokeStyle = 'rgba(255,105,180,.5)';
      this._engineCtx.beginPath();
      this._engineCtx.moveTo(linksCoordinates[0].x, linksCoordinates[0].y);
      linksCoordinates.forEach(function(point, index) {
        if (index !== 0) {
          this._engineCtx.lineTo(point.x, point.y);
        }
      }.bind(this));
      this._engineCtx.closePath();
      this._engineCtx.stroke();

      // Links mid-points
      linksCoordinates.forEach(function(point, index, points) {
        var start = point, end = points[index + 1] || points[0];
        var midX = (start.x + end.x) / 2, midY = (start.y + end.y) / 2;
        drawDot(midX, midY, 'red', this._engineCtx);
        drawDot(midX, midY, 'rgba(255,105,200,.5)', this._trailCtx);
      }.bind(this));
    }
  };

  root.LittleEnginesSet = LittleEnginesSet;
})(window);
