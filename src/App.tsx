import { useState, useEffect } from "react";
import { useBot, useCurrentBoard, useHistory, useWinner } from "@hooks/index"

import styles from "./App.module.sass"

import { Header, GameBoard, BettingPanel } from "@components/index"

import { TUseHistory, TUseCurrentBoard, TUseWinner, TUseBot } from "@types/index"

import { moveHandler, communicationService } from "@services/index"

const App:React.FC = ():JSX.Element => {
	const { history, updateHistory }:TUseHistory = useHistory()
	const [ gameID, setGameID ] = useState<number>(Date.now())
	const { currentBoard, updateCurrentBoard }:TUseCurrentBoard = useCurrentBoard(history)
	const { winner, winnerStreak }:TUseWinner = useWinner(history)
	const [ hasPlacedBet, setHasPlacedBet ] = useState<boolean>(false)
	const [ currentBet, setCurrentBet ] = useState<number>(0)
	const [ showGameOver, setShowGameOver ] = useState<boolean>(false)
	const {
		moveOfBot,
		setPause
	}:TUseBot = useBot(history, gameID)

	useEffect(() => {
		moveHandler(moveOfBot, currentBoard, winner, updateHistory)
	}, [moveOfBot])
	
	useEffect(() => {
		if (winner) {
			setPause(true)
			if (winner === 'O') {
				// Le joueur gagne (O)
				const winAmount = currentBet * 2;
				communicationService.onGameEnd('win', winAmount);
				console.log('Joueur gagne! Gain:', winAmount);
			} else if (winner === 'X') {
				// Le bot gagne (X) - le joueur perd sa mise
				communicationService.onGameEnd('lose', currentBet);
				console.log('Bot gagne! Perte:', currentBet);
			}
			
			// Afficher le panel de fin après 2 secondes
			const timer = setTimeout(() => {
				setShowGameOver(true)
			}, 2000)
			
			return () => clearTimeout(timer)
		} else {
			setShowGameOver(false)
		}
	}, [winner, currentBet])
	
	// Initialiser la communication au démarrage
	useEffect(() => {
		communicationService.onGameStart();
	}, [])

	const handleBetPlaced = (amount: number) => {
		console.log('🎯 handleBetPlaced appelé avec:', amount);
		setCurrentBet(amount);
		setHasPlacedBet(true);
		setPause(false); // Activer le bot pour qu'il commence
		console.log('✅ Pari placé et jeu activé:', amount);
		console.log('📊 État après pari:', { hasPlacedBet: true, currentBet: amount, isPause: false });
	};

	const handleNewGame = () => {
		// Retour au panneau de paris pour une nouvelle partie
		setHasPlacedBet(false);
		setCurrentBet(0);
		setShowGameOver(false);
		updateHistory([{ board: new Array(225).fill(null), isXNext: true }]);
		setGameID(Date.now());
		setPause(false);
	};

	const isGameActive = hasPlacedBet && !winner;

	return (
		<div className={styles.game}>
			{console.log('🎮 Rendu du jeu - hasPlacedBet:', hasPlacedBet, 'currentBet:', currentBet)}
			{!hasPlacedBet ? (
				<div className={styles.bettingContainer}>
					<BettingPanel 
						onBetPlaced={handleBetPlaced}
						isGameActive={false}
					/>
				</div>
			) : (
				<>
					<Header
						winner={winner}
						currentBoard={currentBoard.board}
						currentPlayer={currentBoard.isXNext}
						updateHistory={updateHistory}
						setGameID={setGameID}
						setPause={setPause}
						history={history}
						updateCurrentBoard={updateCurrentBoard}
					/>
				
					<GameBoard
						currentBoard={currentBoard}
						updateHistory={updateHistory}
						winner={winner}
						winnerStreak={winnerStreak}
					/>

					{showGameOver && winner && ( // Game Over screen
						<div className={styles.gameOver}>
							<div className={styles.gameOverContent}>
								<h2>Partie terminée!</h2>
								<p>Mise: {currentBet.toFixed(0)} FCFA</p>
								{winner === 'O' ? (
									<div className={styles.winResult}>
										<p>🎉 Vous avez gagné!</p>
										<p>Gain: {(currentBet * 2).toFixed(0)} FCFA</p>
									</div>
								) : (
									<div className={styles.loseResult}>
										<p>😔 Le bot a gagné</p>
										<p>Perte: {currentBet.toFixed(0)} FCFA</p>
									</div>
								)}
								<button onClick={handleNewGame} className={styles.newGameButton}>
									Nouvelle partie maintenat
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>)
}

export default App