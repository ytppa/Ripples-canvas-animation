import "./styles.css";

// ==UserScript==
// @name         Ripples
// @version      8.5
// @description  Ripples - dynamicaly changing shape and its color fill
// @author       ytppa
// @match        http://honan.predikktadev.com/
// @grant        none
// ==/UserScript==

(function() {
  var debug = true;

  /**
   * Styles
   */
  var rippleStyle = document.createElement("style"),
    rippleRef = document.querySelector("script"),
    vidCoverImg = document.querySelector(".video-cover-img");
  rippleStyle.innerHTML =
    ".fullscreen-bg { position: absolute ; }" +
    ".video-center-content-inner { padding-top: 5em; }";

  rippleRef.parentNode.insertBefore(rippleStyle, rippleRef);

  /**
   * Some preparations
   */
  document.querySelector(".fullscreen-bg").innerHTML = ""; // removing the <video> tag
  if (!!vidCoverImg) {
    vidCoverImg.style.background = "#3d61e9 url()"; // removing the cover img
  }

  /**
   * Trottling function to improve performance while capturing window resize event
   */
  function throttle(type, name, obj) {
    obj = obj || window;
    var running = false,
      func = function() {
        if (running) {
          return;
        }
        running = true;
        requestAnimationFrame(function() {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };
    obj.addEventListener(type, func);
  }
  throttle("resize", "ripplesOptimizedResize");

  /**
   *
   * Main configuration
   *
   */
  var ripplesContainer = document.querySelector(".fullscreen-bg"),
    canvas = document.createElement("canvas"),
    // new ripples store
    bubblesArr = [],
    // main animation configurations
    bubblesArrMaxLength = 19,
    throttleMaxFrames = 1,
    currentThrottlingFrame = 0,
    animConf = {
      posStart: 0,
      posStop: 1,
      colorStart: [231, 47, 85], // from blue color
      colorStop: [61, 97, 233], // to red color
      // Scaling speed depends on PC performace (animationFrameRate) and this variable.
      // The more this variable the quicker ripples should move to the center.
      step: 0.0008,

      xAxisOffset: 0,
      yAxisOffset: 0
    },
    // On some screen sizes we need to correct the center coordinates and the center scale (scaleStop)
    correctionConf = [
      { minWidth: 1200, xao: 0, yao: 0.035 },
      { minWidth: 640, xao: 0, yao: 0.045 },
      { minWidth: 300, xao: 0, yao: 0.01 },
      { minWidth: 0, xao: 0, yao: 0.1 }
    ];

  // Append canvas element into container
  ripplesContainer.appendChild(canvas);

  var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;

  // var canvas,
  var ctx,
    render,
    init,
    blob,
    rippleStopBasis = [
      { x: 39 - 300, y: 194 - 300 },
      { x: 88 - 300, y: 183 - 300 },
      { x: 129 - 300, y: 173 - 300 },
      { x: 169 - 300, y: 152 - 300 },
      { x: 202 - 300, y: 131 - 300 },
      { x: 246 - 300, y: 128 - 300 },
      { x: 288 - 300, y: 138 - 300 },
      { x: 332 - 300, y: 146 - 300 },
      { x: 373 - 300, y: 140 - 300 },
      { x: 416 - 300, y: 126 - 300 },
      { x: 459 - 300, y: 122 - 300 },
      { x: 495 - 300, y: 139 - 300 },
      { x: 514 - 300, y: 171 - 300 },
      { x: 524 - 300, y: 204 - 300 },
      { x: 537 - 300, y: 246 - 300 },
      { x: 558 - 300, y: 273 - 300 },
      { x: 581 - 300, y: 302 - 300 },
      { x: 592 - 300, y: 337 - 300 },
      { x: 591 - 300, y: 372 - 300 },
      { x: 577 - 300, y: 399 - 300 },
      { x: 555 - 300, y: 423 - 300 },
      { x: 522 - 300, y: 440 - 300 },
      { x: 485 - 300, y: 451 - 300 },
      { x: 445 - 300, y: 456 - 300 },
      { x: 403 - 300, y: 451 - 300 },
      { x: 361 - 300, y: 455 - 300 },
      { x: 321 - 300, y: 473 - 300 },
      { x: 282 - 300, y: 492 - 300 },
      { x: 239 - 300, y: 510 - 300 },
      { x: 194 - 300, y: 509 - 300 },
      { x: 161 - 300, y: 482 - 300 },
      { x: 144 - 300, y: 446 - 300 },
      { x: 131 - 300, y: 408 - 300 },
      { x: 117 - 300, y: 374 - 300 },
      { x: 92 - 300, y: 339 - 300 },
      { x: 62 - 300, y: 313 - 300 },
      { x: 32 - 300, y: 288 - 300 },
      { x: 7 - 300, y: 252 - 300 },
      { x: 12 - 300, y: 220 - 300 }
    ],
    radius = 200,
    scale = 100;

  var rippleStop,
    rippleStartBasis = [
      { x: 31 - 300, y: 158 - 300 },
      { x: 74 - 300, y: 156 - 300 },
      { x: 121 - 300, y: 159 - 300 },
      { x: 164 - 300, y: 160 - 300 },
      { x: 211 - 300, y: 160 - 300 },
      { x: 262 - 300, y: 159 - 300 },
      { x: 313 - 300, y: 159 - 300 },
      { x: 364 - 300, y: 158 - 300 },
      { x: 427 - 300, y: 157 - 300 },
      { x: 486 - 300, y: 157 - 300 },
      { x: 534 - 300, y: 155 - 300 },
      { x: 576 - 300, y: 157 - 300 },
      { x: 576 - 300, y: 192 - 300 },
      { x: 575 - 300, y: 223 - 300 },
      { x: 576 - 300, y: 255 - 300 },
      { x: 577 - 300, y: 286 - 300 },
      { x: 577 - 300, y: 314 - 300 },
      { x: 578 - 300, y: 347 - 300 },
      { x: 577 - 300, y: 384 - 300 },
      { x: 577 - 300, y: 418 - 300 },
      { x: 577 - 300, y: 457 - 300 },
      { x: 524 - 300, y: 458 - 300 },
      { x: 481 - 300, y: 458 - 300 },
      { x: 443 - 300, y: 458 - 300 },
      { x: 393 - 300, y: 460 - 300 },
      { x: 344 - 300, y: 458 - 300 },
      { x: 291 - 300, y: 458 - 300 },
      { x: 239 - 300, y: 458 - 300 },
      { x: 186 - 300, y: 457 - 300 },
      { x: 135 - 300, y: 458 - 300 },
      { x: 79 - 300, y: 458 - 300 },
      { x: 27 - 300, y: 458 - 300 },
      { x: 24 - 300, y: 421 - 300 },
      { x: 27 - 300, y: 389 - 300 },
      { x: 30 - 300, y: 352 - 300 },
      { x: 30 - 300, y: 319 - 300 },
      { x: 29 - 300, y: 275 - 300 },
      { x: 28 - 300, y: 242 - 300 },
      { x: 30 - 300, y: 205 - 300 }
    ],
    rippleStart;

  function blobClass() {
    var o = {
      points: [],
      init: function() {
        var i, point;
        this.numPoints = rippleStopBasis.length;
        for (i = 0; i < this.numPoints; i++) {
          point = pointClass(rippleStopBasis[i], this);
          this.push(point);
        }
        this.radius = scale;
      },
      render: function() {
        currentThrottlingFrame += 1;
        if (currentThrottlingFrame >= throttleMaxFrames) {
          currentThrottlingFrame = 0;
          var canvas = this.canvas,
            ctx = this.ctx,
            position = this.position,
            pointsArray = this.points,
            radius = this.radius,
            points = this.numPoints,
            center = this.center;

          /// ctx.clearRect(0,0,canvas.width,canvas.height);

          pointsArray[0].solveWith(pointsArray[points - 1], pointsArray[1]);

          var p0 = pointsArray[points - 1].position,
            p1 = pointsArray[0].position,
            _p2 = p1,
            blobToBeUpdated = [],
            i,
            p2,
            xc,
            yc;

          blobToBeUpdated.push({ x: center.x, y: center.y });
          blobToBeUpdated.push({ x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 });

          for (i = 1; i < points; i++) {
            pointsArray[i].solveWith(
              pointsArray[i - 1],
              pointsArray[i + 1] || pointsArray[0]
            );
            p2 = pointsArray[i].position;
            xc = (p1.x + p2.x) / 2;
            yc = (p1.y + p2.y) / 2;
            blobToBeUpdated.push({ cx: p1.x, cy: p1.y, x: xc, y: yc });
            p1 = p2;
          }

          xc = (p1.x + _p2.x) / 2;
          yc = (p1.y + _p2.y) / 2;

          blobToBeUpdated.push({ cx: p1.x, cy: p1.y, x: xc, y: yc });

          updateRippleStop(blobToBeUpdated);
          bubblesUpdate();
        }

        requestAnimationFrame(this.render.bind(this));
      },
      push: function(item) {
        if (typeof item == "object") {
          this.points.push(item);
        }
      },
      set color(value) {
        this._color = value;
      },
      get color() {
        return this._color || "rgba(231, 47, 85)";
      },
      set canvas(value) {
        if (
          value instanceof HTMLElement &&
          value.tagName.toLowerCase() === "canvas"
        ) {
          this._canvas = canvas;
          this.ctx = this._canvas.getContext("2d");
        }
      },
      get canvas() {
        return this._canvas;
      },
      set numPoints(value) {
        if (value > 2) {
          this._points = value;
        }
      },
      get numPoints() {
        return this._points || 32;
      },
      set radius(value) {
        if (value > 0) {
          this._radius = value;
        }
      },
      get radius() {
        var r = 150;
        return this._radius || r; // Math.sqrt(r * r + r * r);
      },
      set position(value) {
        if (typeof value == "object" && value.x && value.y) {
          this._position = value;
        }
      },
      get position() {
        return this._position || { x: 0.5, y: 0.5 };
      },
      get center() {
        return {
          x: this.canvas.width * this.position.x,
          y: this.canvas.height * this.position.y
        };
      },
      set running(value) {
        this._running = value === true;
      },
      get running() {
        return this.running !== false;
      }
    };

    o.canvas = canvas;

    return o;
  }

  function pointClass(components, parent) {
    var o = {
      parent: parent,
      _basisComponents: components,
      _components: {
        x: components.x / parent.radius,
        y: components.y / parent.radius
      },
      solveWith: function(leftPoint, rightPoint) {
        this.acceleration =
          (-0.3 * this.radialEffect +
            (leftPoint.radialEffect - this.radialEffect) +
            (rightPoint.radialEffect - this.radialEffect)) *
            this.elasticity -
          this.speed * this.friction;
      },
      get azimuth() {
        var a,
          components = this.components,
          x = components.x,
          y = components.y;
        return Math.atan2(y, x);

        if (x === 0) return y > 0 ? Math.PI * 0.5 : Math.PI * 1.5;
        a = Math.atan(y / x);
        if (x < 0) {
          a = a + Math.PI;
        }
        if (x > 0 && y < 0) {
          a = a + 2 * Math.PI;
        }
        return a;
      },
      set acceleration(value) {
        if (typeof value == "number") {
          this._acceleration = value;
          this.speed += this._acceleration * 2;
        }
      },
      get acceleration() {
        return this._acceleration || 0;
      },
      set speed(value) {
        if (typeof value == "number") {
          this._speed = value;
          this.radialEffect += this._speed * 2;
        }
      },
      get speed() {
        return this._speed || 0;
      },
      set radialEffect(value) {
        if (typeof value == "number") {
          this._radialEffect = value;
        }
      },
      get radialEffect() {
        return this._radialEffect || 0;
      },
      get position() {
        return {
          x:
            this.parent.center.x +
            this.components.x * (this.parent.radius + this.radialEffect),
          y:
            this.parent.center.y +
            this.components.y * (this.parent.radius + this.radialEffect)
          /*x: this.parent.center.x + this.basisComponents.x * (1 + this.radialEffect),
                  y: this.parent.center.y + this.basisComponents.y * (1 + this.radialEffect) */
        };
      },
      get components() {
        return this._components;
      },
      set elasticity(value) {
        if (typeof value === "number") {
          this._elasticity = value;
        }
      },
      get elasticity() {
        return this._elasticity || 0.001;
      },
      set friction(value) {
        if (typeof value === "number") {
          this._friction = value;
        }
      },
      get friction() {
        return this._friction || 0.02; // 0.0085
      }
    };

    o.acceleration = -0.1 + Math.random() * 0.2;

    return o;
  }

  function pointSimpleClass(components, parent) {
    var o = {
      parent: parent,
      _components: {
        x: components.x / parent.radius,
        y: components.y / parent.radius
      },
      get azimuth() {
        var a,
          components = this.components,
          x = components.x,
          y = components.y;

        return Math.atan2(y, x);

        if (x === 0) return y > 0 ? Math.PI * 0.5 : Math.PI * 1.5;
        a = Math.atan(y / x);
        if (x < 0) {
          a = a + Math.PI;
        }
        if (x > 0 && y < 0) {
          a = a + 2 * Math.PI;
        }
        return a;
      },
      getRadius: function() {
        var w = document.documentElement.clientWidth,
          h = document.documentElement.clientHeight,
          length = w > h ? w : h;

        return length / 2;
      },
      get position() {
        var radius = this.getRadius();
        return {
          x: this.parent.center.x + this.components.x * radius,
          y: this.parent.center.y + this.components.y * radius
        };
      },
      get components() {
        return this._components;
      }
    };

    o.acceleration = 0;

    return o;
  }

  blob = blobClass();

  init = function() {
    // debugging circle
    /*var circle = document.createElement('div');
      circle.style.position = 'absolute';
      circle.style.left = '50%';
      circle.style.top = '50%';
      circle.style.transform = 'translate(-50%,-50%)';
      circle.style.width = radius * 2 + 'px';
      circle.style.height = radius * 2 + 'px';
      circle.style.borderRadius = '50%';
      circle.style.backgroundColor = '#eeeeee';
      circle.style.zIndex = '-1';
      document.body.appendChild(circle);*/

    // canvas = document.createElement('canvas');
    canvas.setAttribute("touch-action", "none");

    // document.body.appendChild(canvas);
    var resize = function() {
      canvas.width = document.documentElement.clientWidth; // window.innerWidth;
      canvas.height = document.documentElement.clientHeight; // window.innerHeight;
      rippleStart = updateRippleStart(rippleStartBasis, blob);
      bubblesArr = [];
    };
    window.addEventListener("ripplesOptimizedResize", resize);
    resize();

    var oldMousePoint = { x: 0, y: 0 };
    var hover = false;
    var mouseMove = function(e) {
      var pos = blob.center;
      var diff = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      var dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
      var angle = null;

      blob.mousePos = { x: pos.x - e.clientX, y: pos.y - e.clientY };

      if (dist < radius && hover === false) {
        var vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        angle = Math.atan2(vector.y, vector.x);
        hover = true;
        // blob.color = '#77FF00';
      } else if (dist > radius && hover === true) {
        var vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        angle = Math.atan2(vector.y, vector.x);
        hover = false;
        // blob.color = 'red';
      }

      if (typeof angle == "number") {
        var nearestPoint = null,
          distanceFromPoint = radius / 2,
          i,
          point;
        for (i = 0; i < blob.points.length; i += 1) {
          point = blob.points[i];
          if (Math.abs(angle - point.azimuth) < distanceFromPoint) {
            nearestPoint = point;
            distanceFromPoint = Math.abs(angle - point.azimuth);
          }
        }

        if (nearestPoint) {
          var strength = {
            x: oldMousePoint.x - e.clientX,
            y: oldMousePoint.y - e.clientY
          };
          strength =
            Math.sqrt(strength.x * strength.x + strength.y * strength.y) * 10;
          if (strength > 100) strength = 100;
          nearestPoint.acceleration = (strength / 100) * (hover ? -1 : 1);
        }
      }

      oldMousePoint.x = e.clientX;
      oldMousePoint.y = e.clientY;
    };
    // window.addEventListener('mousemove', mouseMove);
    window.addEventListener("pointermove", mouseMove);

    window.addEventListener("click", function() {
      debug = true;
    });

    blob.init();

    blob.render();
  };

  init();

  function updateRippleStart(b, aBlob) {
    var canvas = aBlob.canvas,
      ctx = aBlob.ctx,
      position = aBlob.position,
      pointsArray = [],
      i,
      point;

    for (i = 0; i < b.length; i++) {
      point = pointSimpleClass(b[i], aBlob);
      pointsArray.push(point);
    }

    var points = pointsArray.length,
      center = aBlob.center;

    /// ctx.clearRect(0,0,canvas.width,canvas.height);

    var p0 = pointsArray[points - 1].position,
      p1 = pointsArray[0].position,
      _p2 = p1,
      blobToBeUpdated = [],
      i,
      p2,
      xc,
      yc;

    blobToBeUpdated.push({ x: center.x, y: center.y });
    blobToBeUpdated.push({ x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 });

    for (i = 1; i < points; i++) {
      p2 = pointsArray[i].position;

      xc = (p1.x + p2.x) / 2;
      yc = (p1.y + p2.y) / 2;
      blobToBeUpdated.push({ cx: p1.x, cy: p1.y, x: xc, y: yc });
      ctx.fillStyle = "rgb(231, 47, 85)";
      p1 = p2;
    }

    xc = (p1.x + _p2.x) / 2;
    yc = (p1.y + _p2.y) / 2;
    blobToBeUpdated.push({ cx: p1.x, cy: p1.y, x: xc, y: yc });

    return blobToBeUpdated;
  }

  function updateRippleStop(b) {
    rippleStop = b;
  }

  // ------------------------------------------------------------------------------------------------

  /**
   * Adding one new ripple
   */
  function bubblesAdd(aPos) {
    var pos = aPos || animConf.posStart;

    if (bubblesArr.length <= bubblesArrMaxLength) {
      bubblesArr.push({
        aPos: pos
      });
    }
  }

  /**
   * Let's insert a several bubbles at the beginning
   */
  function insertSeveralBubbles() {
    var posStart = animConf.posStart,
      posStop = animConf.posStop,
      i,
      imax = bubblesArrMaxLength;

    for (i = imax; i >= 0; i -= 1) {
      bubblesAdd(posStart + (posStop - posStart) * (i / imax));
    }
    console.log(bubblesArr);
  }

  /**
   * Iterating the bubbles arr to redraw each ripple
   */
  function bubblesUpdate() {
    var posStart = animConf.posStart,
      posStop = animConf.posStop,
      step = animConf.step,
      i,
      isViewingSection1 = document.body.classList.contains(
        "fp-viewing-anchor-section1"
      );

    if (isViewingSection1) {
      if (bubblesArr.length) {
        // Updating the position and scale of each ripple
        for (i = 1; i < bubblesArr.length; i += 1) {
          bubblesArr[i].aPos += (posStop - posStart) * step;

          // if (debug & i == 3) debug = !debug, console.log(i, bubblesArr[i].aPos, posStop);

          bubblesArr[i].aPos =
            bubblesArr[i].aPos > posStop ? posStop : bubblesArr[i].aPos;

          if (bubblesArr[i].aPos >= posStop) {
            bubblesArr.splice(i, 1);
            bubblesAdd();
          }
        }
      } else {
        insertSeveralBubbles();
      }

      drawRipples();
    }
  }

  /**
   *
   */
  function drawRipples() {
    var i,
      j,
      b,
      path,
      ctx = blob.ctx || canvas.getContext("2d");

    // if (debug) console.log(rippleStart,rippleStop, bubblesArr), debug = !debug;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i = bubblesArr.length - 1; i >= 0; i -= 1) {
      b = bubblesArr[i];
      path = getPath(b.aPos);

      ctx.fillStyle = getColor(b.aPos);
      ctx.beginPath();

      for (j = 0; j < path.length; j += 1) {
        if (j <= 1) {
          ctx.moveTo(path[j].x, path[j].y);
        } else {
          ctx.quadraticCurveTo(path[j].cx, path[j].cy, path[j].x, path[j].y);
        }
      }

      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Preparing one path according to it's position and scale
   */
  function getPath(aPos) {
    var path = [],
      i;

    for (i = 0; i < rippleStart.length; i += 1) {
      path.push(toScaleCurveCoordinates(rippleStart[i], rippleStop[i], aPos));
    }
    return path;
  }

  /**
   * Calculating one cubicBezier line in a path
   */
  function toScaleCurveCoordinates(a1, a2, aPos) {
    var a3 = {},
      i;
    for (let key in a1) {
      a3[key] = a1[key] + (a2[key] - a1[key]) * aPos;
    }

    return a3;
  }

  /**
   * Find the current color value for the ripple according to it's position
   */
  function getColor(aPos) {
    var colorStart = animConf.colorStart,
      colorStop = animConf.colorStop,
      rgb = [
        colorStop[0] + aPos * (colorStart[0] - colorStop[0]),
        colorStop[1] + aPos * (colorStart[1] - colorStop[1]),
        colorStop[2] + aPos * (colorStart[2] - colorStop[2])
      ];
    return "rgb(" + rgb.join(" ") + ")";
  }
})();
