import React, { useState, useEffect } from 'react';
import styles from './BalanceDisplay.module.sass';
import communicationService from '../../services/communication';

const BalanceDisplay: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const storageKey = '4win_platform_balance';

  // Charge la balance depuis localStorage
  const loadBalanceFromStorage = (): number | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        return typeof data.balance === 'number' ? data.balance : null;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du solde:', error);
    }
    return null;
  };

  useEffect(() => {
    // Écoute les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.balance !== balance) {
            setBalance(data.balance);
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation du solde:', error);
        }
      }
    };

    // Vérifie la connexion
    const checkConnection = () => {
      setIsConnected(communicationService.isConnectedToParent());
    };

    // Met à jour le solde initial
    setBalance(communicationService.getBalance());

    // Charge le solde depuis localStorage au démarrage
    const storedBalance = loadBalanceFromStorage();
    if (storedBalance !== null) {
      setBalance(storedBalance);
    }

    // Écoute les changements de localStorage
    window.addEventListener('storage', handleStorageChange);

    // Vérifie périodiquement la connexion
    const connectionInterval = setInterval(checkConnection, 3000);

    // Synchronise le solde périodiquement
    const balanceInterval = setInterval(() => {
      // Synchronise avec CommunicationService
      const serviceBalance = communicationService.getBalance();
      if (serviceBalance !== balance) {
        setBalance(serviceBalance);
      }

      // Synchronise avec localStorage
      const storedBalance = loadBalanceFromStorage();
      if (storedBalance !== null && storedBalance !== balance) {
        setBalance(storedBalance);
      }
    }, 2000);

    return () => {
      clearInterval(connectionInterval);
      clearInterval(balanceInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [balance, storageKey]);

  return (
    <div className={styles.balanceDisplay}>
      <div className={styles.balanceInfo}>
        <span className={styles.balanceLabel}>Solde:</span>
        <span className={styles.balanceAmount}>{balance.toFixed(0)} FCFA</span>
      </div>
      <div className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
        <div className={styles.connectionDot}></div>
        <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
      </div>
    </div>
  );
};

export default BalanceDisplay;
