/**
 * Service de communication pour TicTacToe avec la plateforme parent
 * Utilise postMessage et localStorage pour une synchronisation robuste
 */

interface CommunicationMessage {
  type: string;
  data?: any;
}

interface BalanceData {
  balance: number;
  timestamp: number;
  gameId?: string;
  platform?: string;
}

class CommunicationService {
  private balance: number = 10000; // Solde par défaut
  private isConnected: boolean = false;
  private currentBet: number = 0;
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.initializeCommunication();
  }

  /**
   * Initialise la communication avec la plateforme parent
   */
  private initializeCommunication(): void {
    // Écoute les messages de la plateforme parent
    window.addEventListener('message', this.handleParentMessage.bind(this));
    
    // Notifie la plateforme parent que le jeu est prêt
    this.sendToParent({
      type: 'GAME_READY',
      data: {
        gameId: 'tic-tac-toe',
        version: '1.0.0'
      }
    });
    
    // Demande le solde initial avec un délai pour s'assurer que la plateforme est prête
    setTimeout(() => {
      this.requestBalance();
    }, 1000);
    
    // Vérifie périodiquement la connexion et synchronise le solde
    setInterval(() => {
      this.sendToParent({ type: 'PING' });
      // Synchronise aussi le solde périodiquement
      this.requestBalance();
    }, 10000); // Vérification toutes les 10 secondes
  }

  /**
   * Gère les messages reçus de la plateforme parent
   */
  private handleParentMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    console.log('TicTacToe - Message reçu:', { type, data });

    switch (type) {
      case 'BALANCE_UPDATE':
        if (data && typeof data.balance === 'number') {
          console.log('TicTacToe - Mise à jour du solde:', data.balance);
          this.updateBalance(data.balance);
        }
        break;
        
      case 'PONG':
        this.isConnected = true;
        console.log('TicTacToe - Connexion confirmée');
        break;
        
      case 'BET_PLACED':
        if (data && typeof data.amount === 'number') {
          this.currentBet = data.amount;
          this.emit('betPlaced', data.amount);
          console.log('TicTacToe - Mise acceptée:', data.amount);
        }
        break;
        
      case 'BET_REJECTED':
        if (data && data.reason) {
          console.warn('TicTacToe - Mise rejetée:', data.reason);
          this.emit('betRejected', data.reason);
        } else {
          console.warn('TicTacToe - Mise rejetée: raison non spécifiée');
          this.emit('betRejected', 'unknown');
        }
        break;
        
      default:
        console.log('TicTacToe - Message non géré:', { type, data });
        break;
    }
  }



  /**
   * Envoie un message à la plateforme parent
   */
  public sendToParent(message: CommunicationMessage): void {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
        console.log('TicTacToe - Message envoyé à la plateforme:', message);
      } else {
        console.warn('TicTacToe - Impossible d\'envoyer le message: pas de parent window');
      }
    } catch (error) {
      console.error('TicTacToe - Erreur lors de l\'envoi du message:', error);
    }
  }

  /**
   * Demande le solde actuel à la plateforme parent
   */
  private requestBalance(): void {
    console.log('TicTacToe - Demande du solde à la plateforme...');
    this.sendToParent({
      type: 'REQUEST_BALANCE'
    });
  }



  /**
   * Met à jour le solde local
   */
  private updateBalance(newBalance: number): void {
    this.balance = newBalance;
    // Ne plus sauvegarder dans localStorage, la plateforme s'en charge
    console.log('TicTacToe - Solde mis à jour:', newBalance);
    this.emit('balanceUpdate', newBalance);
  }

  /**
   * Place une mise
   */
  public placeBet(amount: number): boolean {
    if (typeof amount !== 'number' || amount <= 0) {
      console.error('Montant de mise invalide:', amount);
      return false;
    }
    
    // Envoyer la demande de mise à la plateforme parent
    this.sendToParent({
      type: 'PLACE_BET',
      data: { amount }
    });
    
    // La validation se fait côté plateforme
    this.currentBet = amount;
    console.log('Demande de mise envoyée:', amount);
    return true;
  }

  /**
   * Notifie le début d'une partie
   */
  public onGameStart(): void {
    this.sendToParent({
      type: 'GAME_STARTED',
      data: { betAmount: this.currentBet }
    });
  }

  /**
   * Notifie la fin d'une partie
   */
  public onGameEnd(result: 'win' | 'lose' | 'draw', amount?: number): void {
    const eventData: any = {
      eventType: result,
      betAmount: this.currentBet,
      timestamp: Date.now()
    };

    if (result === 'win' && amount) {
      eventData.winAmount = amount;
      // Envoyer le gain à la plateforme parent
      this.sendToParent({
        type: 'GAME_WON',
        data: { amount }
      });
      console.log('Gain envoyé à la plateforme:', amount);
    } else if (result === 'lose') {
      eventData.loseAmount = this.currentBet;
      // Envoyer la perte à la plateforme parent
      this.sendToParent({
        type: 'GAME_LOST',
        data: { amount: this.currentBet }
      });
      console.log('Perte envoyée à la plateforme:', this.currentBet);
    }

    this.sendToParent({
      type: 'GAME_ENDED',
      data: eventData
    });
    
    // Réinitialiser la mise actuelle
    this.currentBet = 0;
  }

  /**
   * Notifie un gain
   */
  public onWin(amount: number): void {
    this.sendToParent({
      type: 'GAME_WON',
      data: { winAmount: amount }
    });
  }

  /**
   * Notifie une perte
   */
  public onLose(amount: number): void {
    this.sendToParent({
      type: 'GAME_LOST',
      data: { loseAmount: amount }
    });
  }

  /**
   * Obtient le solde actuel
   */
  public getBalance(): number {
    return this.balance;
  }

  /**
   * Obtient la mise actuelle
   */
  public getCurrentBet(): number {
    return this.currentBet;
  }

  /**
   * Vérifie si connecté à la plateforme parent
   */
  public isConnectedToParent(): boolean {
    return this.isConnected;
  }

  /**
   * Synchronise le solde avec la plateforme parent
   */
  public syncBalance(): void {
    this.requestBalance();
  }

  /**
   * Émet un événement
   */
  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Écoute un événement
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Arrête d'écouter un événement
   */
  public off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Force la synchronisation depuis la plateforme
   */
  public forceSync(): void {
    console.log('TicTacToe - Force sync depuis la plateforme...');
    this.requestBalance();
  }
}

// Instance singleton
const communicationService = new CommunicationService();

// Exposer globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).communicationService = communicationService;
}

export default communicationService;
