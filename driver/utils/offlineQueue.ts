import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from '@/configs/api';

// Queue storage key
const OFFLINE_QUEUE_KEY = 'offline_action_queue';

// Action types
export enum ActionType {
  UPDATE_LOCATION = 'UPDATE_LOCATION',
  UPDATE_STATUS = 'UPDATE_STATUS',
  COMPLETE_RIDE = 'COMPLETE_RIDE',
}

// Action interface
export interface QueuedAction {
  id: string;
  type: ActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
}

/**
 * Offline Queue utility for handling actions when offline
 */
const offlineQueue = {
  /**
   * Add an action to the queue
   * @param type Action type
   * @param payload Action payload
   */
  async addToQueue(type: ActionType, payload: any): Promise<void> {
    try {
      // Generate a unique ID for this action
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const action: QueuedAction = {
        id,
        type,
        payload,
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      // Get current queue
      const queue = await this.getQueue();
      
      // Add new action to queue
      queue.push(action);
      
      // Save updated queue
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      
      console.log(`Added action to offline queue: ${type}`);
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  },
  
  /**
   * Get the current queue
   */
  async getQueue(): Promise<QueuedAction[]> {
    try {
      const queueString = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  },
  
  /**
   * Process all actions in the queue
   */
  async processQueue(): Promise<void> {
    try {
      // Check if we're online
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('Cannot process queue: device is offline');
        return;
      }
      
      // Get current queue
      const queue = await this.getQueue();
      
      if (queue.length === 0) {
        return;
      }
      
      console.log(`Processing offline queue: ${queue.length} items`);
      
      // Process each action
      const remainingActions: QueuedAction[] = [];
      
      for (const action of queue) {
        try {
          await this.executeAction(action);
        } catch (error) {
          console.error(`Error processing action ${action.type}:`, error);
          
          // Increment retry count and keep in queue if under max retries
          if (action.retryCount < 3) {
            remainingActions.push({
              ...action,
              retryCount: action.retryCount + 1,
            });
          } else {
            console.log(`Dropping action ${action.id} after max retries`);
          }
        }
      }
      
      // Update queue with remaining actions
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingActions));
      
      console.log(`Queue processing complete. ${queue.length - remainingActions.length} actions processed, ${remainingActions.length} remaining`);
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  },
  
  /**
   * Execute a specific action
   * @param action The action to execute
   */
  async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case ActionType.UPDATE_LOCATION:
        await api.post('/driver/update-location', action.payload);
        break;
        
      case ActionType.UPDATE_STATUS:
        await api.post('/driver/update-status', action.payload);
        break;
        
      case ActionType.COMPLETE_RIDE:
        await api.post(`/driver/complete-ride/${action.payload.rideId}`, action.payload.data);
        break;
        
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  },
  
  /**
   * Clear the entire queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.log('Offline queue cleared');
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  },
  
  /**
   * Setup network listeners to process queue when coming online
   */
  setupNetworkListeners(): () => void {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('Device is online, processing offline queue');
        this.processQueue();
      }
    });
    
    return unsubscribe;
  },
};

export default offlineQueue;