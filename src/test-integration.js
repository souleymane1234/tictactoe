// Script de test pour l'intégration TicTacToe
console.log('🧪 Test d\'intégration TicTacToe avec la plateforme 4win');

// Test de communication
function testCommunication() {
  console.log('📡 Test de communication...');
  
  // Simuler un message de la plateforme parent
  const testMessage = {
    type: 'BALANCE_UPDATE',
    data: { balance: 15000 }
  };
  
  // Déclencher l'événement message
  window.postMessage(testMessage, '*');
  
  console.log('✅ Test de communication terminé');
}

// Test de diagnostic
function diagnoseBalance() {
  console.log('🔍 Diagnostic du solde...');
  console.log('- Solde actuel:', window.communicationService?.getBalance());
  console.log('- Connexion:', window.communicationService?.isConnectedToParent());
  console.log('- Parent window:', window.parent !== window);
  
  // Demander le solde
  if (window.communicationService) {
    window.communicationService.syncBalance();
  }
  
  console.log('✅ Diagnostic terminé');
}

// Test de placement de mise
function testBetPlacement() {
  console.log('💰 Test de placement de mise...');
  
  // Simuler une demande de mise
  const betMessage = {
    type: 'PLACE_BET',
    data: { amount: 1000 }
  };
  
  // Envoyer à la plateforme parent
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(betMessage, '*');
    console.log('📤 Demande de mise envoyée: 1000 FCFA');
  }
  
  console.log('✅ Test de placement de mise terminé');
}

// Test de synchronisation du solde
function testBalanceSync() {
  console.log('🔄 Test de synchronisation du solde...');
  
  // Demander le solde actuel
  const balanceMessage = {
    type: 'REQUEST_BALANCE'
  };
  
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(balanceMessage, '*');
    console.log('📤 Demande de solde envoyée');
  }
  
  console.log('✅ Test de synchronisation terminé');
}

// Exporter les fonctions de test
window.testTicTacToeIntegration = {
  testCommunication,
  testBetPlacement,
  testBalanceSync,
  diagnoseBalance,
  runAllTests: () => {
    console.log('🚀 Lancement de tous les tests...');
    diagnoseBalance();
    setTimeout(testCommunication, 1000);
    setTimeout(testBetPlacement, 2000);
    setTimeout(testBalanceSync, 3000);
    console.log('✅ Tous les tests lancés');
  }
};

console.log('📋 Tests disponibles:');
console.log('- testTicTacToeIntegration.diagnoseBalance()');
console.log('- testTicTacToeIntegration.testCommunication()');
console.log('- testTicTacToeIntegration.testBetPlacement()');
console.log('- testTicTacToeIntegration.testBalanceSync()');
console.log('- testTicTacToeIntegration.runAllTests()');
