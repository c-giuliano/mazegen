import './seedrandom.min.js'
import {
    nth_bit_of_flags_cleared,
    nth_bit_of_flags_on,
    get_nth_bit_of_flags,
    flag_places
} from './bitwise_helpers.js'

const rng = new Math.seedrandom('mazegen')

export class Maze {
    // This will become a 2D array representing the maze after "init_maze()" is run
    board = []
    replay_nodes = []

    board_w = 500
    board_h = 500

    // Horizontal offset from the top left corner of the maze
    start_col = Math.floor(rng() * this.board_h)

    // Horizontal offset from the bottom left corner of the maze
    end_col = Math.floor(rng() * this.board_h)

    // Path that stores the solution
    solution_path = []

    static possible_direction_array_from([curr_flags], [,next_mask] = [,0]) {
        const possible_directions = []

        // Next node is not yet visited
        if (!next_mask) {
            for (const [dir, n] of Object.entries(flag_places)) {
                if (get_nth_bit_of_flags(curr_flags, n)) {
                    possible_directions.push(dir)
                }
            }
        }

        return possible_directions
    }

    static opposite_direction(path) {
        return {up: 'down', down: 'up', left: 'right', right: 'left'}[path]
    }

    constructor() {
        this.init_maze()
    }

    init_maze() {
        let V_EDGE_TYPE = 0
        let H_EDGE_TYPE = 0
        let node_value = 0

        for (let y = 0; y < this.board_h; ++y) {
            this.board[y] = []

            if (y <= 0) V_EDGE_TYPE = 'up'
            else if (y >= this.board_h - 1) V_EDGE_TYPE = 'down'
            else V_EDGE_TYPE = 'none'

            for (let x = 0; x < this.board_w; ++x) {
                if (x <= 0) H_EDGE_TYPE = 'left'
                else if (x >= this.board_w - 1) H_EDGE_TYPE = 'right'
                else H_EDGE_TYPE = 'none'

                node_value = parseInt('1111', 2)

                if (V_EDGE_TYPE !== 'none')
                    node_value = nth_bit_of_flags_cleared(
                        node_value,
                        flag_places[V_EDGE_TYPE]
                    )
                if (H_EDGE_TYPE !== 'none')
                    node_value = nth_bit_of_flags_cleared(
                        node_value,
                        flag_places[H_EDGE_TYPE]
                    )

                this.board[y][x] = [node_value, parseInt('0000', 2)]
            }
        }
    }

    set_node_masks(curr, next, chosen_direction) {
        const [curr_x, curr_y] = curr
        const [next_x, next_y] = next

        // Current node mask
        this.board[curr_y][curr_x][1] = nth_bit_of_flags_on(
            this.board[curr_y][curr_x][1],
            flag_places[chosen_direction]
        )

        // Next node mask
        this.board[next_y][next_x][1] = nth_bit_of_flags_on(
            this.board[next_y][next_x][1],
            flag_places[this.constructor.opposite_direction(chosen_direction)]
        )
    }

    generate() {
        const stack = [[this.start_col, 0]]
        let [curr_x, curr_y] = stack[stack.length - 1]

        while (stack.length) {
            this.replay_nodes.push([curr_x, curr_y])
            const possible_directions = this.constructor.possible_direction_array_from(this.board[curr_y][curr_x])

            // Backtrack to last node with unexplored neighbors
            if (!possible_directions.length) {
                [curr_x, curr_y] = stack.pop()
                continue
            }

            const directions = {
                up: [curr_x, curr_y - 1],
                down: [curr_x, curr_y + 1],
                left: [curr_x - 1, curr_y],
                right: [curr_x + 1, curr_y],
            }

            // Choosing a random node to move to from all possible surrounding nodes
            const chosen_direction = possible_directions[Math.floor(rng() * possible_directions.length)]
            const [next_x, next_y] = directions[chosen_direction]

            // Checking whether the next node is visited or not based on whether its mask has been changed from zero or not
            const next_already_visited = !!this.board[next_y][next_x][1]

            // Current node flags
            this.board[curr_y][curr_x][0] = nth_bit_of_flags_cleared(
                this.board[curr_y][curr_x][0],
                flag_places[chosen_direction]
            )

            // If next hasn't been visited yet, we're going to prepare to move to it
            if (!next_already_visited) {
                this.set_node_masks([curr_x, curr_y], [next_x, next_y], chosen_direction)
                curr_x = next_x
                curr_y = next_y
            }

            // const X_IS_EVEN = !(curr_y % 2),
            //       Y_IS_EVEN = !(curr_x % 2)

            // if (Y_IS_EVEN) {
            //     this.board[curr_y][curr_x][1] = nth_bit_of_flags_on(
            //         this.board[curr_y][curr_x][1],
            //         flag_places.down
            //     )
            // } else {
            //     this.board[curr_y][curr_x][1] = nth_bit_of_flags_on(
            //         this.board[curr_y][curr_x][1],
            //         flag_places.up
            //     )
            // }

            // if (X_IS_EVEN) {
            //     this.board[curr_y][curr_x][1] = nth_bit_of_flags_on(
            //         this.board[curr_y][curr_x][1],
            //         flag_places.left
            //     )
            // } else {
            //     this.board[curr_y][curr_x][1] = nth_bit_of_flags_on(
            //         this.board[curr_y][curr_x][1],
            //         flag_places.right
            //     )
            // }

            // Top
            if (curr_y <= 0 && curr_x === this.start_col) {
                this.board[curr_y][curr_x][0] = nth_bit_of_flags_cleared(
                    this.board[curr_y][curr_x][0],
                    flag_places.up
                )
                this.board[curr_y][curr_x][1] = nth_bit_of_flags_on(
                    this.board[curr_y][curr_x][1],
                    flag_places.up
                )
            }

            // Bottom
            if (curr_y >= this.board_h - 1 && curr_x === this.end_col) {
                this.board[curr_y][curr_x][0] = nth_bit_of_flags_cleared(
                    this.board[curr_y][curr_x][0],
                    flag_places.down
                )
                this.board[curr_y][curr_x][1] = nth_bit_of_flags_on(
                    this.board[curr_y][curr_x][1],
                    flag_places.down
                )
            }

            // Pushing the next position to the stack
            stack.push([next_x, next_y])
        }

        console.log(this.replay_nodes)
    }
}
