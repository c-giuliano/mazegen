import { Maze } from "./Maze.js"
import { MazeVisualiser } from "./MazeVisualizer.js"

const canvas = document.createElement('canvas')

const maze = new Maze()
const maze_visualiser = new MazeVisualiser(canvas, maze.board_w, maze.board_h)

document.body.appendChild(canvas)
maze.generate(() => {maze_visualiser.draw(maze.board)})
maze_visualiser.draw(maze.board)
