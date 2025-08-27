import { useState, useEffect } from "react";
import { SIZE_OF_BOARD, WIN_STREAK } from "@/consts"

import { TCellValue, THistory, TUseWinner } from "@/types"

const useWinner = (actualHistory:THistory):TUseWinner => {
	const [winner, setWinner] = useState<TCellValue>(null)
	const [winnerStreak, setWinnerStreak] = useState<Array<number>>([])

	useEffect(() => {
		const prevPlayer = actualHistory[actualHistory.length - 1].isXNext ? "O" : "X"  
		const board = actualHistory[actualHistory.length - 1].board

		console.log(`🔍 Vérification victoire pour ${prevPlayer}`)

		// Vérifier toutes les positions du plateau
		for (let row = 0; row < SIZE_OF_BOARD; row++) {
			for (let col = 0; col < SIZE_OF_BOARD; col++) {
				const index = row * SIZE_OF_BOARD + col
				
				if (board[index] === prevPlayer) {
					// Vérifier horizontal
					const horizontalStreak = checkDirection(board, row, col, 0, 1, prevPlayer)
					if (horizontalStreak.length >= WIN_STREAK) {
						console.log(`🏆 VICTOIRE HORIZONTALE ${prevPlayer} à la position (${row}, ${col}), streak:`, horizontalStreak)
						setWinner(prevPlayer)
						setWinnerStreak(horizontalStreak)
						return
					}

					// Vérifier vertical
					const verticalStreak = checkDirection(board, row, col, 1, 0, prevPlayer)
					if (verticalStreak.length >= WIN_STREAK) {
						console.log(`🏆 VICTOIRE VERTICALE ${prevPlayer} à la position (${row}, ${col}), streak:`, verticalStreak)
						setWinner(prevPlayer)
						setWinnerStreak(verticalStreak)
						return
					}

					// Vérifier diagonale principale (bas-droite)
					const mainDiagonalStreak = checkDirection(board, row, col, 1, 1, prevPlayer)
					if (mainDiagonalStreak.length >= WIN_STREAK) {
						console.log(`🏆 VICTOIRE DIAGONALE PRINCIPALE ${prevPlayer} à la position (${row}, ${col}), streak:`, mainDiagonalStreak)
						setWinner(prevPlayer)
						setWinnerStreak(mainDiagonalStreak)
						return
					}

					// Vérifier diagonale secondaire (bas-gauche)
					const secondaryDiagonalStreak = checkDirection(board, row, col, 1, -1, prevPlayer)
					if (secondaryDiagonalStreak.length >= WIN_STREAK) {
						console.log(`🏆 VICTOIRE DIAGONALE SECONDAIRE ${prevPlayer} à la position (${row}, ${col}), streak:`, secondaryDiagonalStreak)
						setWinner(prevPlayer)
						setWinnerStreak(secondaryDiagonalStreak)
						return
					}
				}
			}
		}

		// Aucun gagnant trouvé
		setWinner(null)
		setWinnerStreak([])
	}, [actualHistory[actualHistory.length - 1].board])

	return { winner, winnerStreak }
}

const checkDirection = (board: Array<TCellValue>, startRow: number, startCol: number, deltaRow: number, deltaCol: number, player: TCellValue): Array<number> => {
	const streak = []
	
	// Vérifier dans la direction positive (incluant la position de départ)
	for (let i = 0; i < WIN_STREAK; i++) {
		const row = startRow + deltaRow * i
		const col = startCol + deltaCol * i
		
		// Vérifier les limites du plateau
		if (row < 0 || row >= SIZE_OF_BOARD || col < 0 || col >= SIZE_OF_BOARD) {
			break
		}
		
		const index = row * SIZE_OF_BOARD + col
		if (board[index] === player) {
			streak.push(index)
		} else {
			break
		}
	}
	
	// Vérifier dans la direction négative (sans inclure la position de départ car déjà comptée)
	for (let i = 1; i < WIN_STREAK; i++) {
		const row = startRow - deltaRow * i
		const col = startCol - deltaCol * i
		
		// Vérifier les limites du plateau
		if (row < 0 || row >= SIZE_OF_BOARD || col < 0 || col >= SIZE_OF_BOARD) {
			break
		}
		
		const index = row * SIZE_OF_BOARD + col
		if (board[index] === player) {
			streak.unshift(index)
		} else {
			break
		}
	}
	
	// Retourner seulement si on a exactement 5 symboles consécutifs
	if (streak.length >= WIN_STREAK) {
		console.log(`✅ Streak trouvé: longueur ${streak.length}, positions:`, streak)
		return streak.slice(0, WIN_STREAK)
	}
	
	return []
}

export default useWinner
