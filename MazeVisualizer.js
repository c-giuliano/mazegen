import { get_nth_bit_of_flags, flag_places } from "./bitwise_helpers.js"

export class MazeVisualiser {
    canv
    ctx
    unit_size = 14
    board_w = 0
    board_h = 0

    constructor(canvas_elem, board_w, board_h) {
        this.canv = canvas_elem
        this.canv.width = this.unit_size * board_w
        this.canv.height = this.unit_size * board_h
        this.ctx = canvas_elem.getContext('2d')
        this.board_w = board_w
        this.board_h = board_h
    }

    _draw_line(start, end) {
        this.ctx.beginPath()
        this.ctx.moveTo(...start)
        this.ctx.lineTo(...end)
        this.ctx.stroke()
    }

    _draw_path_segment([flags, mask], [x, y]) {
        const masked_flags = flags | mask

        const Y_IS_EVEN = !(y % 2),
              Y_IS_ODD = y % 2,
              X_IS_EVEN = !(x % 2),
              X_IS_ODD = x % 2

        const MAZE_LEFT_EDGE = x <= 0,
              MAZE_RIGHT_EDGE = x >= this.board_w - 1,
              MAZE_TOP_EDGE = y <= 0,
              MAZE_BOTTOM_EDGE = y >= this.board_h - 1

        const W_BORDER = (
            MAZE_LEFT_EDGE
                ? !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.left
                )
                : Y_IS_ODD && !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.left
                )
        )

        const E_BORDER = (
            MAZE_RIGHT_EDGE
                ? !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.right
                )
                : Y_IS_EVEN && !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.right
                )
        )

        const N_BORDER = (
            MAZE_TOP_EDGE
                ? !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.up
                )
                : X_IS_ODD && !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.up
                )
        )

        const S_BORDER = (
            MAZE_BOTTOM_EDGE
                ? !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.down
                )
                : X_IS_EVEN && !get_nth_bit_of_flags(
                    masked_flags,
                    flag_places.down
                )
        )

        const LEFT = x * this.unit_size - 0.5
        const RIGHT = x * this.unit_size + this.unit_size - 0.5
        const TOP = y * this.unit_size - 0.5
        const BOTTOM = y * this.unit_size + this.unit_size - 0.5

        this.ctx.strokeStyle = `hsl(${Math.sqrt(x * x + y * y) / Math.max(this.board_w, this.board_h) * 180}, 100%, 50%)`

        if (N_BORDER) this._draw_line([LEFT, TOP], [RIGHT, TOP])
        if (S_BORDER) this._draw_line([LEFT, BOTTOM], [RIGHT, BOTTOM])
        if (E_BORDER) this._draw_line([RIGHT, TOP], [RIGHT, BOTTOM])
        if (W_BORDER) this._draw_line([LEFT, TOP], [LEFT, BOTTOM])
    }

    draw = (board) => {
        this.ctx.fillStyle = '#000'
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height)
        this.ctx.lineWidth = 2
        this.ctx.translate(0.5, 0.5)
        for (let y = 0; y < board.length; ++y) {
            for (let x = 0; x < board[y].length; ++x) {
                this._draw_path_segment(board[y][x], [x, y])
            }
        }
        this.ctx.translate(-0.5, -0.5)
    }

    replay = () => {

    }
}
