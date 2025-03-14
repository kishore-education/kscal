import { registerRootComponent } from 'expo';
import { initDatabase } from './DatabaseService';

import App from './App';

// Initialize the database on app startup
(async () => {
  try {
    await initDatabase();
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
})();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
