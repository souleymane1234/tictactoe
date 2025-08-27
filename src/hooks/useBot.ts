import { useState, useEffect } from "react";

import { useCurrentBoard } from "./index.js"

import { TUseCurrentBoard, THistory } from "@types/index"

import { getNextMoveOfBot } from "@services/index.js"

const useBot = (currentHistory:THistory, gameID:number) => {
	const [ isPause, setPause ] = useState<Boolean>(true) // Commencer en pause

	// Le bot commence toujours (mode paris uniquement)
	// isXNext: true signifie que c'est le tour de X (bot)
	const isBotMovesFirst = true

	const [ isBotMoveNext, setIsBotMoveNext ] = useState<Boolean>(isBotMovesFirst)

	const [ moveOfBot, setMoveOfBot ] = useState<number>(NaN)
	const { currentBoard }: TUseCurrentBoard = useCurrentBoard(currentHistory)

	const makeMove = () => setIsBotMoveNext(prev => !prev)

	const directlyMakeMove = () => {
		if (isPause || !isBotMoveNext) return

		// Le bot joue automatiquement quand c'est son tour
		const botMove = getNextMoveOfBot(currentBoard)
		setMoveOfBot(botMove)
	}

	// Fonction vide car le bot commence toujours
	const updateIsBotMovesFirst = () => {}

	const startingGame = () => {
		setIsBotMoveNext(isBotMovesFirst)
		// Le bot doit jouer immédiatement au début de la partie
		if (!isPause && isBotMovesFirst) {
			directlyMakeMove()
		}
	}

	useEffect (() => {
		if (currentHistory.length === 1) {
			startingGame()
		} else {
			makeMove()
		}
	}, [currentBoard, gameID])

	useEffect(() => {
		directlyMakeMove()
	}, [isBotMoveNext])

	useEffect(() => {
		if (isPause) {
			setIsBotMoveNext(false)
		} else {
			// Quand la pause se termine, le bot doit jouer immédiatement
			setIsBotMoveNext(isBotMovesFirst)
		}
	}, [isPause])

	return {
		moveOfBot,
		setPause
	}
}

export default useBot