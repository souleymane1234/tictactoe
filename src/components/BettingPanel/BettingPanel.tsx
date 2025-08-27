import React, { useState, useEffect } from 'react';
import styles from './BettingPanel.module.sass';
import communicationService from '../../services/communication';

interface BettingPanelProps {
  onBetPlaced: (amount: number) => void;
  isGameActive: boolean;
}

const BettingPanel: React.FC<BettingPanelProps> = ({ onBetPlaced, isGameActive }) => {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [isPlacingBet, setIsPlacingBet] = useState<boolean>(false);
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [balance, setBalance] = useState<number>(communicationService.getBalance());

  // Écouter les réponses de mise et les mises à jour du solde
  useEffect(() => {
    const handleBetPlaced = (amount: number) => {
      setCurrentBet(amount);
      onBetPlaced(amount);
      setIsPlacingBet(false);
      console.log('Mise acceptée:', amount);
    };

    const handleBetRejected = (reason: string) => {
      setIsPlacingBet(false);
      if (reason === 'insufficient_balance') {
        setError('Solde insuffisant pour cette mise');
      } else {
        setError('Erreur lors du placement de la mise');
      }
      console.log('Mise rejetée:', reason);
    };

    const handleBalanceUpdate = (newBalance: number) => {
      setBalance(newBalance);
      console.log('TicTacToe - Balance mise à jour:', newBalance);
    };

    communicationService.on('betPlaced', handleBetPlaced);
    communicationService.on('betRejected', handleBetRejected);
    communicationService.on('balanceUpdate', handleBalanceUpdate);

    return () => {
      communicationService.off('betPlaced', handleBetPlaced);
      communicationService.off('betRejected', handleBetRejected);
      communicationService.off('balanceUpdate', handleBalanceUpdate);
    };
  }, [onBetPlaced]);
  const betIncrements = [500, 1000, 2000, 5000, 7500, 10000];

  const handleBetChange = (amount: number) => {
    setBetAmount(amount);
    setError('');
  };

  const handlePlaceBet = async () => {
    console.log('🎯 handlePlaceBet appelé avec:', betAmount);
    
    if (betAmount <= 0) {
      setError('Montant de mise invalide');
      return;
    }

    setIsPlacingBet(true);
    setError('');

    try {
      const success = communicationService.placeBet(betAmount);
      console.log('📤 Demande de mise envoyée, succès:', success);
      
      // Si la demande est envoyée avec succès, on peut déjà déclencher le jeu
      // (la validation se fera côté plateforme)
      if (success) {
        console.log('✅ Mise envoyée, déclenchement du jeu...');
        onBetPlaced(betAmount);
      }
    } catch (err) {
      console.error('❌ Erreur lors du placement de la mise:', err);
      setError('Erreur lors du placement de la mise');
      setIsPlacingBet(false);
    }
  };

  const handleQuickBet = (amount: number) => {
    handleBetChange(amount);
  };

  return (
    <div className={styles.bettingPanel}>
      <div className={styles.panelHeader}>
        <h3>Parier</h3>
        <div className={styles.balanceInfo}>
          <span>Solde: {balance.toFixed(0)} FCFA</span>
        </div>
      </div>

      <div className={styles.betSection}>
        <div className={styles.betAmount}>
          <label>Montant de la mise:</label>
          <div className={styles.amountInput}>
            <span className={styles.currency}>FCFA</span>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => handleBetChange(Number(e.target.value))}
              min="500"
              max={balance}
              step="100"
              disabled={isGameActive || isPlacingBet}
            />
          </div>
        </div>

        <div className={styles.quickBets}>
          <label>Mises rapides:</label>
          <div className={styles.quickBetButtons}>
            {betIncrements.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickBet(amount)}
                disabled={isGameActive || isPlacingBet || amount > balance}
                className={`${styles.quickBetButton} ${betAmount === amount ? styles.active : ''}`}
              >
                {amount} FCFA
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.betActions}>
          <button
            onClick={handlePlaceBet}
            disabled={isGameActive || isPlacingBet || betAmount <= 0 || betAmount > balance}
            className={styles.placeBetButton}
          >
            {isPlacingBet ? 'Placement...' : 'Placer la mise'}
          </button>
        </div>

        {currentBet > 0 && (
          <div className={styles.currentBet}>
            <span>Mise actuelle: {currentBet.toFixed(0)} FCFA</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingPanel;
