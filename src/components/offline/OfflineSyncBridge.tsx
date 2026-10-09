import React from 'react';

import {
  useOfflineSync,
} from '../../hooks/useOfflineSync';


const OfflineSyncBridge = () => {
  useOfflineSync();

  return null;
};


export default OfflineSyncBridge;