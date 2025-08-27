import React from 'react';
import styles from './index.module.sass';

import { Cell } from "@components/index"

import { TCellValue, TBoardData, THistory } from '@types/index'

import { moveHandler as onMove } from "@services/index"

type TProps = {
    winner: TCellValue
    winnerStreak: ReadonlyArray<number>
    currentBoard: TBoardData
    updateHistory: (h:THistory) => void
};

const GameBoard: React.FC<TProps> = ({currentBoard, updateHistory, winner, winnerStreak}):JSX.Element => {
	const moveHandler = (position: number) => () => {
		// Le joueur ne peut jouer que si c'est son tour (O) et qu'il n'y a pas de gagnant
		// En mode paris, le jeu ne peut être joué que si un pari a été placé
		if (currentBoard.isXNext || winner) return
		onMove(position, currentBoard, winner, updateHistory)
	}

	return (
		<div className={styles.gameBoard}>
			{
				currentBoard.board.map((anotherCellOfBoard, position) =>{
					return (
						<Cell
							key={position}
							value={anotherCellOfBoard}
							moveHandler={moveHandler(position)}
							winnerStreak={winnerStreak}
							winner={winner}
							position={position}
						/>
					)
				})
			}
		</div>
	)
}

const areEqual = (prevProps: TProps, nextProps: TProps) => prevProps.currentBoard.board === nextProps.currentBoard.board

export default React.memo(GameBoard, areEqual)