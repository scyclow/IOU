function genTokenData(projectNum) {
  let tokenId
  if (window.location.search.includes('?serial=')) {
    tokenId = window.location.search.slice(8)
  } else {
    tokenId = '00000000'
  }
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16)
  }

  return {
    hash,
    tokenId
  }
}

const tokenData = genTokenData(110)

function keyPressed() {
  if (keyCode === 83) {
    saveCanvas(__canvas, 'IOU-' + SERIAL_NUMBER, 'jpg');
  }
}

let __randomSeed = parseInt(tokenData.hash.slice(50, 58), 16)

function rnd(mn, mx) {
  __randomSeed ^= __randomSeed << 13
  __randomSeed ^= __randomSeed >> 17
  __randomSeed ^= __randomSeed << 5
  const out = (((__randomSeed < 0) ? ~__randomSeed + 1 : __randomSeed) % 1000) / 1000
  if (mx != null) return mn + out * (mx - mn)
  else if (mn != null) return out * mn
  else return out
}

function hshrnd(h) {
  const str = tokenData.hash.slice(2 + h*2, 4 + h*2)
  return parseInt(str, 16) / 255
}

const prb = x => rnd() < x

const posOrNeg = () => prb(0.5) ? 1 : -1

const sample = (a) => a[int(rnd(a.length))]
const hfix = h => (h + 360) % 360
const noop = () => {}

function drawCircle (points, getXY) {
  beginShape()
  curveVertex(...getXY(-1))
  for (let p = 0; p <= points + 1; p++) {
    MISPRINT_LATHE_MALFUNCTION && rotate(0.1)
    curveVertex(...getXY(p))
  }
  endShape()
}


const getXYRotation = (deg, radius, cx=0, cy=0) => [
  sin(deg) * radius + cx,
  cos(deg) * radius + cy,
]


const drawShape = (points, getXY, graphic=window) => {

  graphic.beginShape()
  graphic.curveVertex(...getXY(-1))
  times(points+2, p => {
    graphic.curveVertex(...handleMalfunction(getXY(p), graphic))
  })
  graphic.endShape()
}

function times(t, fn) {
  for (let i = 0; i < t; i++) fn(i)
}



function rosetteWithBackground(x, y, r, r2=0, params={}) {
  if (IS_VINTAGE) r = r*0.75
  if (IS_DECO) params = {...params, fillC: ROSETTE_FILL_C, strokeMod: 6}
  const p = IS_VINTAGE
    ? genVintageRosetteParams(params)
    : genRosetteParams(params)


  if (params.skipBg) {}
  else {
    const bgFn = IS_VINTAGE ? vintageRosette : dollarRosetteBg
    bgFn(x, y, r, r2, {
      ...p,
      strokeC: ROSETTE_FILL_C,
      fillC: ROSETTE_FILL_C,
      strokeMod: 6
    })
  }


  getRosetteStyleFn()(x,y, r, params.holeR || r2, {...p, strokeC: ROSETTE_STROKE_C, innerC: false })
}

const getRosetteStyleFn = () =>
  MISPRINT_HETERO_ROSETTES ? sample([dollarRosette, dollarEchoRosette, dollarCheckeredRosette, dollarLineRosette, vintageRosette, ]) :
  ['NUMISMATIC', 'DECO'].includes(ROSETTE_STYLE) ? dollarRosette :
  ROSETTE_STYLE === 'ECHO'? dollarEchoRosette :
  ROSETTE_STYLE === 'DIGITAL' ? dollarCheckeredRosette :
  ROSETTE_STYLE === 'LINE' ? dollarLineRosette :
  ROSETTE_STYLE === 'DENOMINATION' ? denominationRosette :
  IS_VINTAGE ? vintageRosette :
  noop


function decoRosette() {
  rosetteWithBackground(0,0, 90, 0, genRosetteParams({
    // innerC: ACCENT_C,
    fillC: ROSETTE_FILL_C,
    strokeMod: 6
  }))
}

function dollarRosette(x_, y_, maxRad=200, minRad=100, params={}, graphic=window) {
  graphic.push()
  params.strokeC && graphic.stroke(params.strokeC)
  params.fillC && graphic.fill(params.fillC)
  const strokeMod = params.strokeMod || 1

  const c0Points = params.points

  const border = createRosetteBorder(x_, y_, c0Points, params.c1, params.c2, params.r1, params.r2)

  // border
  for (let off=0; off<6; off++) {
    graphic.strokeWeight(((params.strokeW || 0.7) + maxRad/150 - 1) * strokeMod * STROKE_MOD)
    drawShape(c0Points, p => {
      const [ox, oy] = border(maxRad, p, off/3)
      const [ix, iy] = border(maxRad*0.95, p, off/3)

      return p % 2 === 0 ? [ix, iy] : [ox, oy]
    }, graphic)
  }

  let topRad = maxRad
  let bottomRad = maxRad * 0.75
  let i = 0

  while (bottomRad >= minRad && i < 20) {
    graphic.strokeWeight(((params.strokeW || 1) + topRad/150 - 1) * STROKE_MOD)
    // awesome misprint
    for (let off=0; off<6; off++) {
      drawShape(c0Points, p => {
        const [ox, oy] = border(topRad, p, off/3)
        const [ix, iy] = border(bottomRad, p, off/3)

        return p % 2 === 0 ? [ix, iy] : [ox, oy]
      }, graphic)
    }

    topRad = bottomRad * 1.045
    if (topRad < 10) {
      bottomRad = 0
    }
    else if (bottomRad - bottomRad*0.75 < 10) {
      bottomRad = topRad - 10
    } else {
      bottomRad = bottomRad*0.75

    }

    i++
  }

  graphic.pop()
}



function dollarRosetteBg(x, y, r, r2, params) {
  if (ROSETTE_STYLE === 'NUMISMATIC') {
    dollarRosette(x, y, r, r2, {
      ...params,
      strokeMod: 10
    })
  }

  dollarEchoRosette(x, y, r, r2, params, true)
}


function dollarEchoRosette(x_=0, y_=0, maxRad=200, minRad=100, params={}, bg=false) {
  push()
  params.strokeC && stroke(params.strokeC)
  bg && strokeWeight(2)
  params.strokeW && strokeWeight(params.strokeW)

  const border = createRosetteBorder(x_, y_, params.points, params.c1, params.c2, params.r1, params.r2)
  const r = params.rDiff || (bg ? 1 : 5)
  for (let rad = minRad; rad <= maxRad; rad += r) {
    !bg && !params.ignoreShrink && strokeWeight(rad*params.strokeW/130)
    params.innerC && params.outterC && stroke(lerpColor(
      params.innerC,
      params.outterC,
      (rad - minRad)/(maxRad - minRad)
    ))

    drawCircle(params.points, p => {
      return handleMalfunction(border(rad, p))
    })
  }
  pop()
}



function dollarLineRosette(x_=0, y_=0, maxRad=200, minRad=100, params={}) {
  push()
  params.strokeC && stroke(params.strokeC)
  params.strokeW && strokeWeight(params.strokeW)

  const c0Points = params.points/2

  const border = createRosetteBorder(x_, y_, c0Points, params.c1, params.c2, params.r1, params.r2)

  for (let l=0; l < c0Points; l += 0.2) {
    const [ox, oy] = handleMalfunction(border(maxRad, l))
    const [ix, iy] = handleMalfunction(border(minRad, l))
    line(ix, iy, ox, oy)
  }
  pop()
}

function dollarCheckeredRosette(x_=0, y_=0,maxRad=200, minRad=100, params={}) {
  dollarLineRosette(x_, y_, maxRad, minRad, params)
  dollarEchoRosette(x_, y_, maxRad, minRad, params)
}

//?
// function dollarDottedRosette(x_=0, y_=0,maxRad=200, minRad=100, params={}) {
//   dollarEchoRosette(x_, y_, maxRad, minRad, { ...params, strokeC: DARK_C, strokeW: 1.5})
//   dollarLineRosette(x_, y_, maxRad, minRad, params)
// }







function vintageRosette(x_=0, y_=0, radius0=90, _=0, params={}) {
  push()
  params.strokeC && stroke(params.strokeC)
  params.fillC && fill(params.fillC)
  params.strokeW && strokeWeight(params.strokeW)

  const radius1 = radius0 / (params.r1)
  const radius2 = radius0 / (params.r2)

  //// for more of a pattern:
  // const r2 = radius / 3

  //// for more of a border:
  // const r3 = radius / 15

  //// dynamic
  // randomSeed(seed)
  // const _x = map(mouseX, 0, W, 1, 20)
  // const _y = map(mouseY, 0, H, 1, 20)
  // const r2 = radius / _x
  // const r3 = radius / _y

  const c0Points = params.points
  const c1Points = c0Points/params.c1
  const c2Points = c0Points/params.c2

  drawShape(c0Points, p => {
    const angle0 = (p/c0Points) * TWO_PI
    const angle1 = (p/c1Points) * TWO_PI
    const angle2 = (p/c2Points) * TWO_PI

    const xy = getXYRotation(
      angle0,
      radius0,
      x_, y_
    )
    const [x1, y1] = getXYRotation(
      angle1,
      radius1,
      xy[0], xy[1]
    )

    return getXYRotation(
      angle2,
      radius2,
      x1, y1
    )

    //// asymetric:
    // return getXYRotation(
    //   angle2/90,
    //   r3,
    //   x2, y2
    // )
    // return [x0, y0]
  })
  pop()
}


const denominationRosette = (x_=0, y_=0, maxRad=200, minRad=0, params={}) => {
  push()
  params.strokeC && stroke(params.strokeC)
  params.strokeW && strokeWeight(params.strokeW)

  const c0Points = params.points

  const border = createRosetteBorder(x_, y_, c0Points, params.c1, params.c2, params.r1, params.r2)

  for (let l=0; l < c0Points; l += 0.5) {
    const [x, y] = border(maxRad, l)
    drawStrAdj(DENOMINATION, x, y, 0.1, ROSETTE_STROKE_C)
  }
  pop()
}


const genParams = o => IS_VINTAGE
  ? genVintageRosetteParams(o)
  : genRosetteParams(o)

const genVintageRosetteParams = (o) => ({
  c1: int(rnd(1, 13)) * posOrNeg(),
  c2: int(rnd(170, 192)) * posOrNeg(),
  r1: MISPRINT_ROSETTE_PARAMS_EXCEEDED ? rnd(1,4) : 9,
  r2: MISPRINT_ROSETTE_PARAMS_EXCEEDED ? rnd(6, 12): 5,
  strokeC: ROSETTE_STROKE_C,
  points: 360,
  ...o
})

const genRosetteParams = (o) => ({
  c1: int(rnd(1, MISPRINT_ROSETTE_PARAMS_EXCEEDED ? 25 : 16)) * posOrNeg(),
  c2: int(rnd(1, MISPRINT_ROSETTE_PARAMS_EXCEEDED ? 40 : 13)) * posOrNeg(),
  r1: MISPRINT_ROSETTE_PARAMS_EXCEEDED ? rnd(4, 10) : rnd(10, 20),
  r2: MISPRINT_ROSETTE_PARAMS_EXCEEDED ? rnd(4, 10) : rnd(10, 20),
  points: 70,
  ...o
})



const createRosetteBorder = (x_, y_, c0Points, c1, c2, rad1Adj, rad2Adj) => {
  const c1Points = c0Points/c1
  const c2Points = c0Points/c2
  return (rad, p, offset=0, r1a=null, r2a=null) => {
    const angle0 = (p + offset)/c0Points
    const angle1 = (p + offset)/c1Points
    const angle2 = (p + offset)/c2Points

    const r1 = r1a || 1/rad1Adj
    const r2 = r2a || 1/rad2Adj
    const r0 = 1 - r1 - r2

    const [x0, y0] = getXYRotation(
      angle0 * TWO_PI,
      rad * r0,
      x_, y_
    )
    const [x1, y1] = getXYRotation(
      angle1 * TWO_PI,
      rad * r1,
      x0, y0
    )

    return getXYRotation(
      angle2 * TWO_PI,
      rad * r2,
      x1, y1
    )
  }
}
function drawBgPattern() {
  switch (BG_PATTERN) {
    case 0: byteBg(); break
    case 1: chainLinkBg(); break
    case 2: labrynthBg(); break
    case 3: pennyPincherBg(); break
    case 4: fabricBg(); break
    case 5: cyclesBg(); break
    case 6: mainframeBg(); break
    case 7: arrowBg(); break
    case 8: denominationTexture(); break
  }
}

function getBG() {
  const r = rnd()

  if (prb(IS_CRYPTO ? 0.125 : 0.01)) return 0
  else if (r < 0.125) return 1
  else if (r < 0.25) return 2
  else if (r < 0.375) return 3
  else if (r < 0.5) return 4
  else if (r < 0.625) return 5
  else if (r < 0.75) return 6
  else if (r < 0.875) return 7
  else return 8
}

function squigTexture() {
  push()
  noFill()

  strokeWeight(rnd(0.1, 0.5))
  const squigs = 40

  for (let i=0; i<squigs; i++) {
    stroke(
      IS_BULLION
      ? BRIGHT_LIGHT_C
      : prb(0.75) ? DARK_C : ACCENT_C
    )
    const x = rnd(-W/2, W/2)
    const y = rnd(-H/2, H/2)

    const x1 = x + rnd(-25, 25)
    const x2 = x1 + rnd(-25, 25)
    const x3 = x2 + rnd(-25, 25)
    const y1 = y + rnd(-25, 25)
    const y2 = y1 + rnd(-25, 25)
    const y3 = y2 + rnd(-25, 25)

    beginShape()
    curveVertex(
      x + rnd(-20, 20),
      y + rnd(-20, 20),
    )
    curveVertex(x, y)
    curveVertex(
      x1,
      y1,
    )
    curveVertex(
      x2,
      y2,
    )
    curveVertex(
      x3,
      y3,
    )
    endShape()
  }
  pop()
}

function pointTexture() {
  push()
  for (let x = -W/2; x < W/2; x += 5)
  for (let y = -H/2; y < H/2; y += 5) {
    strokeWeight(rnd(1,2))
    stroke(color(HUE, 26, 25, rnd(0,40)))
    point(x + rnd(-5, 5), y + rnd(-5, 5))
  }
  pop()
}

function stippleTexture() {
  push()
  for (let x = -W/2; x < W/2; x += 5)
  for (let y = -H/2; y < H/2; y += 5) {
    strokeWeight(1)
    stroke(STIPLE_C)
    point(x+2, y+2)
  }
  pop()
}

function denominationTexture() {
  push()
  strokeWeight(1)
  for (let x = -W/2; x < W/2; x += 20)
  for (let y = -H/2; y < H/2; y += 20) {
    const s = rnd(0.01, 0.15)

    const straight = prb(0.3)
    const xOffset = straight ? 0 : rnd(-10, 10)
    const yOffset = straight ? 0 : rnd(-10, 10)

    drawStr(getDenominationDisplay(), x + xOffset+10, y + yOffset+10, s, DARK_C)
  }
  pop()
}


function labrynthBg() {
  push()
  stroke(DARK_C)
  strokeWeight(0.5)
  const size = 10

  for (let x = -W/2; x < W/2; x += size)
  for (let y = -H/2; y < H/2; y += size) {
    if (prb(0.5)) {
      line(x, y, x + size, y + size)
    } else {
      line(x+size, y, x, y + size)
    }
  }
  pop()
}


function pennyPincherBg() {
  push()
  const size = 100
  noFill()
  strokeWeight(0.5)

  const w = 30
  const h = 15

  const showCircle = HIGHLIGHT || prb(0.5)

  for (let y = 0, i = 0; y <= H+5; y += h, i++) {
    const y_ = y - H/2
    beginShape()
    curveVertex(-w-W/2, y_-h/2)
    for (let x = 0; x < W/w + 2; x++) {
      const yAdj = i % 2 === 0
        ? (x % 2 === 0 ? h/2 : -h/2)
        : (x % 2 === 0 ? -h/2 : h/2)

      curveVertex(x*w - W/2, y_ + yAdj)
      if (showCircle) {
        fill(BRIGHT_LIGHT_C)
        circle(x*w - W/2, y_ + yAdj, 4)
        noFill()
      }
    }
    endShape()

  }
  pop()
}

function fabricBg() {
  push()
  const size = 100
  noFill()
  strokeWeight(0.5)

  for (let x = 0; x < W; x += size)
  for (let y = 0; y < H; y += size) {
    if (
      (y/size % 2 === 0) && (x/size % 2 === 0) ||
      (y/size % 2 === 1) && (x/size % 2 === 1)
    ) {
      for (let y_ = 0; y_ < size; y_+=4) {
        line(
          x - W/2,
          y_ + y + 2 - H/2,
          x + size - W/2,
          y_ + y + 2 - H/2
        )
      }
    } else {
      for (let x_ = 0; x_ < size; x_+=4) {
        line(
          x_ + x + 2 - W/2,
          y - H/2,
          x_ + x + 2 - W/2,
          y + size - H/2
        )
      }
    }
  }
  pop()
}


function cyclesBg() {
  push()
  const size = 100
  noFill()
  strokeWeight(0.5)

  const w = 30
  const h = 15
  const n = 100

  for (let y = -5; y < H+8; y += H/n) {
    const y_ = y - H/2
    beginShape()
    curveVertex(-w-W/2, y_-h/2)
    for (let x = 0; x < W/w + 2; x++) {
      const yAdj = x % 2 === 0 ? h/2 : -h/2
      curveVertex(x*w - W/2, y_ + yAdj)
    }
    endShape()

  }
  pop()
}

// function bg15() {
//   push()
//   noFill()
//   stroke(DARK_C)
//   strokeWeight(0.5)
//   for (let i = 0; i < 100; i++) {
//     rect(rnd(-W/2, W/2), rnd(-H/2, H/2), W/2, H/2)
//   }
//   pop()
// }

function mainframeBg() {
  push()
  strokeWeight(0.35)
  HIGHLIGHT && fill(LIGHT_ACCENT_C)
  stroke(LIGHTENED_DARK_C)

  const size = 10

  for (let x = 0; x < W; x += size)
  for (let y = 0; y < H; y += size) {
    const x_ = x - W/2
    const y_ = y - H/2
    if (prb(0.5)) {
      line(x_, y_, x_ + size, y_ + size)
      const c = rnd()
      if (c < 0.15) circle(x_, y_, 4)
      else if (c < 0.3) circle(x_ + size, y_ + size, 4)
    } else {
      line(x_+size*2, y_, x_, y_ + size*2)
      const c = rnd()
      if (c < 0.15) circle(x_+size*2, y_, 4)
      else if (c < 0.3) circle(x_, y_ + size*2, 4)
    }
  }
  pop()
}

function arrowBg() {
  push()
  strokeWeight(1)
  stroke(LIGHTENED_DARK_C)
  for (
    let x = -W/2 - H/2;
    x < H/2 + W/2;
    x += 5
  ) {
    line(x, -H/2, H/2 + x, 0)
    line(H/2+x, 0, x, H/2)
  }
  pop()
}

function chainLinkBg() {
  push()
  const size = 10
  strokeWeight(0.35)
  stroke(LIGHTENED_DARK_C)

  for (let x = -W/2; x < W/2+1; x += size)
  for (let y = -H/2; y < H/2+1; y += size) {
    circle(x, y, size+4)
  }
  pop()
}

function byteBg() {
  push()
  const px = int(rnd(2, 5))
  for (let x = 0; x < W; x+=px)
  for (let y = 0; y < H; y+=px) {
    fill (lerpColor(LIGHT_C, DARK_C, rnd(0.75)))
    noStroke()
    rect(W/2-x-px, H/2-y-px, px, px)
  }
  pop()
}



function rosetteCornerBg(corners=[2, 4]) {
  push()
  const rFn = IS_VINTAGE ? dollarRosette : getRosetteStyleFn()
  const p = genRosetteParams({ strokeC: DARK_C, strokeW: 0.35 })
  const r = rnd(0, W/4)
  corners.forEach(c => rFn(CORNERS[c][0], CORNERS[c][1], W/2, r, p))
  pop()
}

// function bg10() {
//   const compression = int(rnd(1, 11))
//   drawBorderGraphic(() => {
//     times(12, (i) => {
//       __borderGraphic.strokeWeight(1 - i/12)
//       border7(i*17 - 5, compression)
//     })
//   })
// }

function bg11() {
  rosetteWithBackground(0,0, W, 0)
}






function randomBorder() {
  const borderSeed = rnd()
  if (borderSeed < 0.02) return denominationBorder()

  const vintageBorderProb = IS_VINTAGE ? 0.5 : 0.25
  drawBorderGraphic(() => {
    if (borderSeed < vintageBorderProb) {
      const vintageBorderSeed = rnd()
      const degAdj = posOrNeg() * (vintageBorderSeed < 0.75 ? 2 : 3)
      const params = vintageBorderParams({ degAdj })
      const padding = 8 + params.radius

      vintageBorder(padding, params)
      prb(0.25) && vintageBorder(padding, vintageBorderParams({ degAdj: degAdj * -1 }))
    }

    else if (borderSeed < 0.55) {
      curveCornerBorders(60)
    }

    else if (borderSeed < 0.8) {
      darkRosetteBorder(-10, prb(0.7))
    }


    else if (borderSeed < 0.85) {
      border1(10, int(rnd(20, 200)))
    }

    else if (borderSeed < 0.9) {
      dottedBorder(20)
    }

    else {
      border7(20, int(rnd(1, 7)), posOrNeg())
    }

  })
}



const getXYBorder = (p, points, padding) => {
  const wPoints = int( points * W_H_RATIO / (2 * (W_H_RATIO+1)) )
  const hPoints = int(points/2 - wPoints)
  const xSize = (W - 2*padding) / wPoints
  const ySize = (H - 2*padding) / hPoints

  const top = -H/2 + padding
  const bottom = H/2 - padding
  const left = -W/2 + padding
  const right = W/2 - padding

  const c1 = wPoints
  const c2 = wPoints + hPoints
  const c3 = wPoints*2 + hPoints
  const c4 = wPoints*2 + hPoints*2

  if (p < c1) {
    return [
      left + p*xSize,
      top
    ]
  } else if (p < c2) {
    return [
      right,
      top + (p - c1)*ySize
    ]
  } else if (p < c3) {
    return [
      right - (p - c2)*xSize,
      bottom
    ]
  } else if (p < c4) {
    return [
      left,
      bottom - (p - c3)*ySize
    ]
  } else {
    return [
      left + (p-c4)*xSize,
      top
    ]
  }
}

function drawBorderGraphic(borderFn) {
  push()

  __borderGraphic.translate(W/2, H/2)
  __borderGraphic.noFill()
  __borderGraphic.stroke(DARK_C)
  borderFn()
  image(__borderGraphic,-W / 2,-H / 2)
  pop()
}

function border1(padding, points) {
  for (let off=0; off<2; off+=0.5) {
    drawShape(points, p => {
      const [ox, oy] = getXYBorder(p + off, points, padding)
      const [ix, iy] = getXYBorder(p + off, points, padding+20)

      return p % 2 === 0 ? [ix, iy] : [ox, oy]
    }, __borderGraphic)
  }
}


function dottedBorder(padding=10) {
  __borderGraphic.strokeWeight(1*STROKE_MOD)
  const cRad = 3
  const adjW = W - 2*padding
  const adjH = H - 2*padding
  const adjPrm = (adjW + adjH) * 2
  const points = adjPrm/cRad

  times(points, p => {
    const [x,y] = getXYBorder(p, points, padding+cRad)
    __borderGraphic.circle(x, y, cRad*2)
  })
  drawShape(points, p => getXYBorder(p, points, padding), __borderGraphic)
  drawShape(points, p => getXYBorder(p, points, padding+(cRad*2)), __borderGraphic)
}


function vintageBorderParams(o) {
  const radius = rnd(15, 31)
  const offsetAmt = (
    abs(o.degAdj) === 2 ? rnd(3, 26) : rnd(1, 13)
  )

  return {
    radius,
    degAdj: o.degAdj,
    offsetAmt,
  }
}

function vintageBorder(padding, params) {
  const points = 66

  const radius = params.radius // 15-30
  const degAdj = params.degAdj //1,2,3,4,-1,-2,-3,-4
  const offsetAmt = 1/params.offsetAmt //3 - 25
  __borderGraphic.strokeWeight(0.6*STROKE_MOD)
  for (let off=0; off<2; off+=offsetAmt) {
    drawShape(points+1, p => {
      const [ox, oy] = getXYBorder(p +off, points, padding)
      return getXYRotation(
        ((p+off)/degAdj) * TWO_PI,
        radius,
        ox, oy
      )
    }, __borderGraphic)
  }
}



// direction 0.5/-0.5 looks cool
function getCurvedXYBorder(p, points, padding, direction=1) {
  // const points = W/5
  // 2 - 10 * posOrNeg() == normal looking
  // 20 strange
  // 50 whacky
  const radius = 5
  // 10,15 == realistic
  //


  const [ox, oy] = getXYBorder(p, points, padding)
  return getXYRotation(
    (p/radius*direction) * TWO_PI,
    radius,
    ox, oy
  )
}

function border7(padding=20, compression=4, d=1) {
  const points = compression*50

  if (IS_DECO) {
    __borderGraphic.fill(ROSETTE_FILL_C)
    __borderGraphic.stroke(ROSETTE_STROKE_C)
  }

  if (['NUMISMATIC', 'VINTAGE', 'DECO'].includes(ROSETTE_STYLE))
  for (let off=0; off<2; off+=0.3333) {
    drawShape(points, p => {
      const [ox, oy] = getCurvedXYBorder(p + off, points, padding, d)
      const [ix, iy] = getCurvedXYBorder(p + off, points, padding+22, d)

      return p % 2 === 0 ? [ix, iy] : [ox, oy]
    }, __borderGraphic)
  }

  if (['ECHO', 'DIGITAL'].includes(ROSETTE_STYLE))
  for (let off=0; off<25; off+=5) {
    drawShape(points, p => getCurvedXYBorder(p, points, padding+off), __borderGraphic, d)
  }

  if (['LINE', 'DIGITAL'].includes(ROSETTE_STYLE))
  for (let p=0; p < points; p += 0.2) {
    const [ox, oy] = getCurvedXYBorder(p, points, padding, d)
    const [ix, iy] = getCurvedXYBorder(p, points, padding+22, d)
    __borderGraphic.line(ox, oy, ix, iy)
  }

  if (IS_DECO) {
    const innerBoarder = i => drawShape(points, p => getCurvedXYBorder(p, points, padding+i, d), __borderGraphic)
    innerBoarder(19)
    __borderGraphic.erase()
    innerBoarder(20)
    __borderGraphic.noErase()
  }

}


function darkRosetteBorder(padding=-10, sides=true) {
  const compression = int(rnd(1, 7))

  if (HIGHLIGHT) {
    __borderGraphic.push()
    times(100, i => {
      __borderGraphic.stroke(lerpColor(ROSETTE_STROKE_C, ROSETTE_FILL_C, (i+75)/150))
      __borderGraphic.rectMode(CENTER)
      __borderGraphic.rect(0, 0, W-i, H-i)
    })
    __borderGraphic.pop()
  } else __borderGraphic.background(ROSETTE_FILL_C)

  __borderGraphic.stroke(ROSETTE_STROKE_C)
  __borderGraphic.strokeWeight(1.1*STROKE_MOD - compression/12)
  const direction = posOrNeg()

  const d = IS_DECO ? 5 : 0
  const extraPadding = ['ECHO', 'DIGITAL'].includes(ROSETTE_STYLE) ? 6 : 0
  border7(padding+2+d, compression, direction)
  border7(padding+19+extraPadding+d, compression, direction)
  border7(padding+36+extraPadding*2+d, compression, direction)

  const p = padding+(sides ? 35 : 55)

  __borderGraphic.stroke(DARK_C)
  __borderGraphic.erase()
  __borderGraphic.fill(0)
  sides
    ? __borderGraphic.rect(p-W/2, p-H/2, W-2*p, H-2*p)
    : __borderGraphic.rect(-W/2, p-H/2, W, H-2*p)


  __borderGraphic.noErase()
  __borderGraphic.noFill()

  if (sides) {
    __borderGraphic.rect(p-W/2, p-H/2, W-2*p, H-2*p)
    dottedBorder(p + 5)
  } else {
    __borderGraphic.rect(-W/2, p-H/2, W, H-2*p)
  }
}




function denominationBorder(padding=10) {
  const adjW = W - 2*padding
  const adjH = H - 2*padding
  const adjPrm = (adjW + adjH) * 2
  const points = 80
  const denomination = getDenominationDisplay()
  times(points, p => {
    const [x,y] = getXYBorder(p, points, padding)
    drawStrAdj(denomination, x, y, 0.1, DARK_C)
  })

}



function curveCornerBorders(weight) {
  const top = -H/2
  const bottom = H/2
  const left = -W/2
  const right = W/2
  const rad = weight/1.5

  const weightAdj = rnd(1,5)
  const lines = int(rnd(4, 11))


  __borderGraphic.stroke(DARK_C)
  for (let i = 0; i < lines; i++) {
    if (i % 2 !== 0 || i === lines-1) __borderGraphic.erase()
    __borderGraphic.fill(DARK_C)
    __borderGraphic.strokeWeight(weight*STROKE_MOD -(i* weightAdj))
    __borderGraphic.line(left, top, right, top)
    __borderGraphic.line(right, top, right, bottom)
    __borderGraphic.line(right, bottom, left, bottom)
    __borderGraphic.line(left, bottom, left, top)

    __borderGraphic.circle(left+rad, top+rad, rad)
    __borderGraphic.circle(left+rad, bottom-rad, rad)
    __borderGraphic.circle(right-rad, top+rad, rad)
    __borderGraphic.circle(right-rad, bottom-rad, rad)
    if (i % 2 !== 0 || i === lines-1) __borderGraphic.noErase()
  }

}








function signature(x, y, charSize, invert) {
  if (COUNTERFEIT) return
  push()
  noFill()
  strokeWeight(1.5)
  const chars = 8
  const xVar = 0.1
  const yVar = 0.75
  const xstart = x - charSize*chars
  const ystart = y + charSize/2
  let x0 = xstart
  let y0 = ystart

  const points = [
    [x0 - rnd(charSize), y0 - rnd(charSize)],
    [x0, y0]
  ]


  times(chars, letter => {
    const up = prb(0.75)
    const x1 = x0 + charSize*(1+xVar*(up ? -7 : 7))/2
    const y1 = y0 + (up
      ? prb(0.85) ? charSize*rnd(0, 0.3) : charSize*rnd(1, 1.5)
      : -1*(prb(0.5) ? charSize*rnd(0, 0.3) : charSize*rnd(1, 1.5))
    )

    const x2 = x0 + charSize*rnd(1-xVar, 1+xVar)
    const y2 = y0 + charSize*rnd(-0.1, 0.1)
    points.push([x1, y1])
    points.push([x2, y2])
    x0 = x2
    y0 = y2
  })

  points.push([x0 + rnd(charSize), y0 + rnd(charSize)])

  invert ? stroke(DARK_C) : stroke(LIGHT_C)
  beginShape()
  points.forEach(([x, y]) => curveVertex(x+1, y+1))
  endShape()


  invert ? stroke(ACCENT_C) : stroke(DARK_C)
  beginShape()
  points.forEach(([x, y]) => curveVertex(x, y))
  endShape()

  pop()
}

let uniqNum = (n) => {
  let r = rnd()+''
  return r[2] !== n ? r[2] : uniqNum(n)
}
let numStr = (n=2) => rnd().toFixed(3).slice(2,2+n)

function genSerialNumber() {
  let num = ""
  const digits = n => times(n, _ => num += numStr())
  // REPEATER
  if (COOL_SERIAL_NUM === 0) {
    digits(2)
    num = num + num
  }
  // RADAR
  else if (COOL_SERIAL_NUM === 1) {
    digits(2)
    num = num + num.split('').reverse().join('')
  }
  // INCREASING
  else if (COOL_SERIAL_NUM === 2) {
    digits(4)
    num = num.split('').sort().join('')
  }
  // DECREASING
  else if (COOL_SERIAL_NUM === 3) {
    digits(4)
    num = num.split('').sort().reverse().join('')
  }
  // LOW
  else if (COOL_SERIAL_NUM === 4) {
    num = "00000" + numStr(3)
  }
  // HIGH
  else if (COOL_SERIAL_NUM === 5) {
    num = "99999" + numStr(3)
  }
  // BINARY
  else if (COOL_SERIAL_NUM === 6) {
    const n1 = uniqNum('0')
    times(8, _ => num += sample(['0', n1]))
  }
  else
    digits(4)

  return num
}

function serialNumber(x, y) {
  if (COUNTERFEIT) return
  push()
  const sNumber = genSerialNumber()
  fill(LIGHT_C)
  stroke(DARK_C)
  rect(x, y, STAR_NOTE ? 72 : 60, 20)
  drawStr(sNumber, x+30,y+10, 0.125, DARK_C, ACCENT_C)
  if (STAR_NOTE) {
    fill(ACCENT_C)
    stroke(ACCENT_C)
    drawShape(10, i =>  getXYRotation(i*TWO_PI/10, i % 2 === 0 ? 2.5 : 6, x+63, y+ 10))
  }
  pop()
}


const __onlyRotate = prb(0.5)
function handleMalfunction([x, y], g=window) {
  if (MISPRINT_LATHE_MALFUNCTION) {
    g.rotate(0.1)
    return [
      x + (__onlyRotate ? 0 : rnd(-10, 10)),
      y + (__onlyRotate ? 0 : rnd(-10, 10)),
    ]
  } else return [x,y]
}

const holoWidth = 20
function drawHolo(x) {
  push()
  strokeWeight(2)
  const dashed = prb(0.3)
  const w = holoWidth/2
  for (let y = 0; y < H; y++) {
    stroke(
      lerpColor(
        color(hue(ACCENT_C), saturation(ACCENT_C), lightness(ACCENT_C), 50),
        color(hue(BRIGHT_DARK_C), saturation(BRIGHT_DARK_C), lightness(BRIGHT_DARK_C), 50),
        y/H
      )
    )

    dashed && int(y/50) % 3 === 0 ? noop() : line(x-w, y+T,x+w, y+T)
  }
  pop()
}




































let __canvas, __borderGraphic, MISPRINT_LATHE_MALFUNCTION, MISPRINT_ROSETTE_PARAMS_EXCEEDED
let ellapsed = 0
let IS_DECO, IS_VINTAGE
GRAPHIC_RESOLUTION = 4
let W, H, W_H_RATIO
let STROKE_MOD = 1
IS_BULLION=false
IS_SILVER=false
IS_CRYPTO=false
COLOR_SCHEME='FIAT'
HIGHLIGHT=false
COUNTERFEIT=false

const SERIAL_NUMBER = tokenData.tokenId



function setup() {

  let textHeight

  if (window.innerWidth >=700) {
    textHeight = window.innerHeight
  } else {

    textHeight = document.getElementById('overlay-container').clientHeight + 210
  }

  __canvas = createCanvas(window.innerWidth, max(window.innerHeight, textHeight))

  SCALE = 1
  W = width
  H = height
  W_H_RATIO = W/H

  noLoop()
  __borderGraphic = createGraphics(W,H)
  const currentPixelDensity = __borderGraphic.pixelDensity() || 2
  __borderGraphic.pixelDensity(currentPixelDensity*GRAPHIC_RESOLUTION)
  colorMode(HSB, 360, 100, 100, 100)


  HUE = int(rnd(0,360))
  DARK_C = color(HUE, 26, 25)
  LIGHT_C = color(hfix(HUE-72), 6, 91)
  LIGHT_GRADIENT_C = color(hfix(max(HUE-72, 0)), 6, 91)
  LIGHTENED_DARK_C = color(HUE, 16, 55)
  ACCENT_C = color(hfix(HUE-145), 80, 64)
  LIGHT_ACCENT_C = color(hfix(HUE-145), 55, 64, 30)
  BRIGHT_LIGHT_C = color(max(HUE-10, 0), 80, 54)
  BRIGHT_DARK_C = BRIGHT_LIGHT_C

  VIBRANT_GRADIENT = prb(0.05)
  const rosetteStyleSeed = hshrnd(5)
  if (rosetteStyleSeed < 0.0625){
    ROSETTE_STYLE = 'DECO'
    IS_DECO = true
  }
  else if (rosetteStyleSeed < 0.6)
    ROSETTE_STYLE = 'NUMISMATIC'
  else if (rosetteStyleSeed < 0.8) {
    ROSETTE_STYLE = 'VINTAGE'
    IS_VINTAGE = true
  }
  else if (rosetteStyleSeed < 0.86)
    ROSETTE_STYLE = 'ECHO'
  else if (rosetteStyleSeed < 0.96)
    ROSETTE_STYLE = 'DIGITAL'
  else if (rosetteStyleSeed < 0.9825)
    ROSETTE_STYLE = 'LINE'
  else
    ROSETTE_STYLE = 'DENOMINATION'

  const reverseRosetteColors = prb(0.5) || IS_BULLION
  const lightC = IS_SILVER ? BRIGHT_LIGHT_C : LIGHT_GRADIENT_C
  const darkC = HIGHLIGHT && !IS_DECO && !IS_VINTAGE && !IS_BULLION ? BRIGHT_DARK_C : DARK_C
  ROSETTE_FILL_C = IS_VINTAGE || reverseRosetteColors ? lightC : darkC
  ROSETTE_STROKE_C = IS_VINTAGE || reverseRosetteColors ? darkC : lightC

  document.body.style.color = darkC.toString()
  document.body.style.backgroundColor = lightC.toString()

  HIGHLIGHT = !IS_VINTAGE && prb(0.125)
}


function draw() {
  scale(SCALE)
  translate(W/2, H/2)
  background(0)
  drawTexture()

  _randomBorder()


  if (window.innerWidth >=700) {
    const infoY = height/2 - 125
    signature(
      -40,
      infoY,
      30,
    )

    emblem(250, infoY+5)
  } else {

    const infoY = height/2 - 230
    signature(
      90,
      infoY,
      20,
    )

    emblem(0, infoY+100)

  }




}

function drawTexture() {
  push()
  const direction = posOrNeg()
  const diag = rnd(0, 100)
  if (!IS_BULLION) strokeWeight(2)
  for (let i = -diag; i <= W+diag; i++) {
    const x = direction === 1 ? i-W/2 : W/2-i

    stroke(lerpColor(
      LIGHT_C,
      VIBRANT_GRADIENT || IS_BULLION || HIGHLIGHT ? BRIGHT_LIGHT_C : DARK_C,
      VIBRANT_GRADIENT || IS_BULLION || (IS_CRYPTO&&HIGHLIGHT) ? i/W : i/(W*5)
    ))
    line(x+diag, -H/2, x, H/2)
  }
  pop()

  if (COLOR_SCHEME === 'FIAT') pointTexture()
  if (IS_CRYPTO && BG_TYPE !== 'STANDARD') stippleTexture()
  if (!IS_CRYPTO) squigTexture()
}



function emblem(x, y) {
  push()
  noFill()
  const c1 = int(rnd(3, 11)) * posOrNeg()
  const p = genRosetteParams({
    strokeC: ACCENT_C,
    strokeW: 1,
    rDiff: 2,
    ignoreShrink: true,
    c1,
    c2: (c1 + 5) * posOrNeg()
  })


  dollarEchoRosette(x,y, 40, 0, p)
  pop()
}


function _randomBorder() {
  const borderSeed = rnd()
  if (borderSeed <= 0.015) return

  const vintageBorderProb = IS_VINTAGE ? 0.5 : 0.25
  drawBorderGraphic(() => {
    if (borderSeed < vintageBorderProb) {
      const vintageBorderSeed = rnd()
      const degAdj = posOrNeg() * (vintageBorderSeed < 0.75 ? 2 : 3)
      const params = vintageBorderParams({ degAdj })
      const padding = 8 + params.radius

      vintageBorder(padding, params)
      prb(0.25) && vintageBorder(padding, vintageBorderParams({ degAdj: degAdj * -1 }))
    }

    else if (borderSeed < 0.55) {
      curveCornerBorders(60)
    }

    else if (borderSeed < 0.8) {
      darkRosetteBorder(-10, prb(0.7))
    }


    else if (borderSeed < 0.85) {
      border1(10, int(rnd(20, 200)))
    }

    else if (borderSeed < 0.9) {
      dottedBorder(20)
    }

    else {
      border7(20, int(rnd(1, 7)), posOrNeg())
    }

  })
}