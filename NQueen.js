function NQueen(n) {
    let res = []
    let map = []

    function validAt(row) {
        for (let i = 0; i < row; i++) if (map[i] === map[row] || Math.abs(map[i] - map[row]) === Math.abs(i - row)) return false
        return true
    }
    function fillAt(row) {
        if (row >= n) return res.push(Array.from(map))
        for (let x = 0; x < n; x++) {
            map[row] = x
            validAt(row) && fillAt(row + 1)
        }
    }

    fillAt(0)
    return res
}
