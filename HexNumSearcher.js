{
    let mapDir = [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
    ]
    let mapTurn = {
        w: 0,
        e: 1,
        d: 2,
        // s: 3,
        a: 4,
        q: 5,
    }
    let mapOp = {
        a: x => x * 2,
        d: x => x / 2,
        e: x => x + 10,
        q: x => x + 5,
        w: x => x + 1,
    }

    let Route = function (noInit) {
        if (noInit) return
        this.visited = new Set()
        this.headX = 0
        this.headY = 0
        this.dir = 0
        this.path = ''
        this.valid = true
        this.move('w', 1)
    }
    Route.prototype = {
        move(step, init) {
            if (!init) this.dir = (this.dir + mapTurn[step]) % 6
            let [sx, sy] = mapDir[this.dir]
            let oldX = this.headX,
                oldY = this.headY
            this.headX += sx
            this.headY += sy
            let edge =
                sx > 0 || (sx === 0 && sy > 0)
                    ? `${oldX},${oldY}-${this.headX},${this.headY}`
                    : `${this.headX},${this.headY}-${oldX},${oldY}`
            if (this.visited.has(edge)) this.valid = false
            else this.visited.add(edge)
            if (!init) this.path += step
            return this
        },
        copy() {
            let newR = new Route(true)
            Object.assign(newR, this)
            newR.visited = new Set(newR.visited)
            return newR
        },
        toString() {
            return `_${this.path}`
        },
        moveSeq(steps) {
            for (let s of steps) this.move(s)
            return this
        },
    }

    let Node = function (value, target, route) {
        this.value = value
        this.target = target
        this.delta = Math.abs(value - target)
        this.route = route
    }
    Node.prototype = {
        next: function* () {
            for (let dir in mapOp) {
                let nr = this.route.copy().move(dir)
                if (!nr.valid) continue
                yield new Node(mapOp[dir](this.value), this.target, nr)
            }
        },
        toString() {
            return `${this.value}${this.route}`
        },
        score_astar() {
            return this.delta * 0.3 + this.route.path.length
        },
    }
    Node.sorter = (a, b) => b.score_astar() - a.score_astar()

    let pathP0 = new Route().moveSeq('aqaa'),
        pathN0 = new Route().moveSeq('dedd')

    this.searchRoute = (target, tolerance, maxStep) => {
        if (tolerance === undefined) tolerance = 0.01
        if (maxStep === undefined) maxStep = 10000
        let negate = target < 0
        target = Math.abs(target)

        let tracked = {}
        let pool = [new Node(0, target, negate ? pathN0 : pathP0)]
        for (let _ = 0; _ < maxStep; _++) {
            if (!pool) break
            pool.sort(Node.sorter)
            let node = pool.pop()
            for (let sub of node.next()) {
                if (sub.delta <= tolerance) return sub
                if (sub.value in tracked) {
                    let cmp = tracked[sub.value]
                    if (cmp.route.path.length < sub.route.path.length) continue
                }
                tracked[sub.value] = sub
                pool.push(sub)
            }
        }

        let best = null,
            bestVal = target
        for (let k in tracked) {
            let val = Math.abs(k - target)
            if (val < bestVal) {
                bestVal = val
                best = tracked[k]
            }
        }
        return best
    }
}
