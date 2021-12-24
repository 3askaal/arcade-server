import { times, sampleSize } from 'lodash'
import randomColor from 'randomcolor'

export const generatePlayers = (players: any, blocks: number) => {
  const topLeftPosition = { x: 0, y: 0 }
  const topRightPosition = { x: blocks, y: 0 }
  const bottomLeftPosition = { x: 0, y: blocks }
  const bottomRightPosition = { x: blocks, y: blocks }
  const positions = [topLeftPosition, topRightPosition, bottomLeftPosition, bottomRightPosition]

  const colors = ['red', 'green', 'blue', 'purple', 'pink']
  const randomColors = sampleSize(colors, players.length)

  return players.map((player: any, index: number) => ({
    ...player,
    index,
    ...positions[index],
    ...players.length === 2 && {
      ...index === 0 && topLeftPosition,
      ...index === 1 && bottomRightPosition,
    },
    color: randomColor({ luminosity: 'dark', hue: randomColors[index]}),
    health: 100,
  }))
}

export const generateGrid = (blocks: number) => {
  let newGrid: any = {}
  const amountBricksForUnevenCube = (blocks * blocks) + blocks + blocks + 1

  times(amountBricksForUnevenCube, (i) => {
    const y = (i - (i % (blocks + 1))) / (blocks + 1)
    const x = i % (blocks + 1)

    newGrid[`${x}/${y}`] = { x, y }
  })

  newGrid = generateStones(newGrid)
  newGrid = generateBricks(newGrid, blocks)

  return newGrid
}

export const generateStones = (grid: any) => {
  let newGrid = { ...grid }

  Object.values(grid).forEach((block: any) => {
    const { x, y } = block

    if (y % 2 && x % 2) {
      newGrid = { ...newGrid, [`${x}/${y}`]: { ...newGrid[`${x}/${y}`], stone: true }}
      return true
    }

    return false
  })

  return newGrid
}

export const generateBricks = (grid: any, blocks: number) => {
  let newGrid = { ...grid }

  const freeSpaces = Object.values(grid).filter((block: any) => {
    const { x, y } = block

    const isEvenUneven = x % 2 === 1 && y % 2 === 0
    const isUnevenEven = x % 2 === 0 && y % 2 === 1
    const isBothUneven = x % 1 === 0 && y % 2 === 0

    if (isEvenUneven || isUnevenEven || isBothUneven) {
      const isTopLeftPosition = y < 3 && x < 3
      const isTopRightPosition = y < 3 && x > (blocks - 3)
      const isBottomLeftPosition = y > (blocks - 3) && x < 3
      const isBottomRightPosition = y > (blocks - 3) && x > (blocks - 3)

      const isPosition = isTopLeftPosition || isTopRightPosition || isBottomLeftPosition || isBottomRightPosition

      if (!isPosition) {
        return true
      }
    }

    return false
  })

  const newBricks = sampleSize(freeSpaces, (60 / 100) * freeSpaces.length)

  newBricks.forEach(({x, y}: any) => {
    newGrid = { ...newGrid, [`${x}/${y}`]: { ...newGrid[`${x}/${y}`], brick: true }}
  })

  return newGrid
}
