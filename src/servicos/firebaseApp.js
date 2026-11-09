
import { getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCn3rFHPSAImr9YW3-dRXb7xA3ZowcnN-s',
  authDomain: 'colo-de-deus-missao-sp.firebaseapp.com',
  projectId: 'colo-de-deus-missao-sp',
  storageBucket: 'colo-de-deus-missao-sp.firebasestorage.app',
  messagingSenderId: '513731427663',
  appId: '1:513731427663:web:df2bff25a8d87af150193a',
};

export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
