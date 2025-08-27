import {useState, Suspense, lazy} from "react"

import {
	START_GAME,
	IMG_NEW_GAME,
	IMG_HELP,
	IMG_HISTORY
} from "@/consts"

import { GameMessage } from "@/components/index"

import { TCellValue, TGameBoard, THistory } from "@types/index"

import styles from "./index.module.sass"


const History = lazy(() => import("../History/index"))
const Help = lazy(() => import("../Help/index"))

type TProps = {
	winner: TCellValue
	currentBoard: TGameBoard
	currentPlayer: Boolean | TCellValue
	history: THistory
	updateCurrentBoard: (position: number) => void
	updateHistory: (h: THistory) => void
	setGameID: (id: number) => void
	setPause: (isPause: Boolean) => void
}

const Header: React.FC<TProps> = ({
	winner,
	currentBoard,
	currentPlayer,
	history,
	updateCurrentBoard,
	updateHistory,
	setGameID,
	setPause
}):JSX.Element => {
	const [isShowHistory, updateDisplayingHistory] = useState<Boolean>(false)
	const [isShowHelp, updateDisplayingHelp] = useState<Boolean>(false)

	const startNewGame = () => {
		// En mode paris, on ne peut pas démarrer une partie sans parier
		// Ce bouton redirige vers le panneau de paris
		window.location.reload()
	}

	const showHistory = () => {
		isShowHelp && updateDisplayingHelp(prev => !prev)
		updateDisplayingHistory(prev => !prev)
	}
	const showHelp = (desiredState?: Boolean) => {
		isShowHistory && updateDisplayingHistory(prev => !prev)
		updateDisplayingHelp(prev => desiredState ?? !prev)
	}

	return (
		<div className={styles.header}>
			<GameMessage
				winner={winner}
				currentBoard={currentBoard}
				currentPlayer={currentPlayer}
			/>

			<div className={styles.gameButtons}>
				<div
					className={styles.headerElement}
					title="Nouvelle partie (mode paris)"
					onClick={() => {startNewGame()}} >
					<img src={IMG_NEW_GAME} alt="" />
				</div>

				<div
					className={`${styles.headerElement} ${isShowHelp ? styles.occupied : ""}`}
					title="Aide"
					onClick={() => {showHelp()}}>
					<img src={IMG_HELP} alt="" />
				</div>
				
				<div
					className={`${styles.headerElement} ${isShowHistory ? styles.occupied : ""}`}
					title="Historique"
					onClick={showHistory}>
					<img src={IMG_HISTORY} alt="" />
				</div>

				{
					isShowHistory
					&& (
						<Suspense fallback="">
							<History
								showHistory={showHistory}
								historyLength={history.length}
								updateCurrentBoard={updateCurrentBoard}
							/>
						</Suspense>
					)
				}
				{
					isShowHelp
					&& (
						<Suspense fallback="">
							<Help
								showHelp={showHelp}
								isShowHelp={isShowHelp}
							/>
						</Suspense>
					)
				}
			</div>
		</div>)
}

export default Header

