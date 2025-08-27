// Script de débogage pour TicTacToe
console.log('🔍 Débogage du jeu TicTacToe...');

// Fonction pour surveiller les changements d'état
function debugState() {
  console.log('📊 État actuel du jeu:');
  
  // Vérifier si les composants sont chargés
  const gameContainer = document.querySelector('[class*="game"]');
  console.log('- Container du jeu:', gameContainer);
  
  // Vérifier le panneau de paris
  const bettingPanel = document.querySelector('[class*="betting"]');
  console.log('- Panneau de paris:', bettingPanel);
  
  // Vérifier le plateau de jeu
  const gameBoard = document.querySelector('[class*="board"]');
  console.log('- Plateau de jeu:', gameBoard);
  
  // Vérifier les messages dans la console
  console.log('- Messages de communication:', window.communicationService?.getBalance());
}

// Fonction pour forcer l'affichage du jeu
function forceShowGame() {
  console.log('🎮 Forcer l\'affichage du jeu...');
  
  // Simuler un pari placé
  if (window.communicationService) {
    window.communicationService.placeBet(1000);
  }
  
  // Déclencher un événement personnalisé
  window.dispatchEvent(new CustomEvent('forceGameDisplay'));
}

// Fonction pour tester la communication
function testCommunication() {
  console.log('📡 Test de communication...');
  
  if (window.parent && window.parent !== window) {
    // Envoyer un message de test
    window.parent.postMessage({
      type: 'TEST_GAME_DISPLAY',
      data: { test: true }
    }, '*');
    
    console.log('✅ Message de test envoyé');
  }
}

// Exposer les fonctions de débogage
window.debugTicTacToe = {
  debugState,
  forceShowGame,
  testCommunication,
  runAll: () => {
    console.log('🚀 Lancement de tous les tests de débogage...');
    debugState();
    setTimeout(testCommunication, 1000);
    setTimeout(forceShowGame, 2000);
  }
};

console.log('📋 Fonctions de débogage disponibles:');
console.log('- debugTicTacToe.debugState()');
console.log('- debugTicTacToe.forceShowGame()');
console.log('- debugTicTacToe.testCommunication()');
console.log('- debugTicTacToe.runAll()');

// Surveiller les changements d'état
setInterval(debugState, 5000);
