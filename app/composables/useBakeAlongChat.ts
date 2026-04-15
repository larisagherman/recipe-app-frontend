import { reactive } from 'vue';
import { Client, type IMessage } from '@stomp/stompjs';
import type { ChatMessageRequest, ChatMessageResponse, ChatState } from '~/types/chatMessage';
import SockJS from 'sockjs-client';

export const useBakeAlongChat = (recipeId: number, userId: string) => {
  let stompClient: Client | null = null;

  const state = reactive<ChatState>({
    messages: [],
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const connect = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        stompClient = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          connectHeaders:{
            userId: userId,
          },
          onConnect: () => {
            console.log('✅ STOMP Connected successfully');
            state.isConnected = true;
            state.error = null;

            // Subscribe to user's private queue
            stompClient?.subscribe(
              `/user/queue/chat-${recipeId}`,
              (message: IMessage) => {
                try {
                  console.log('📨 Message received:', message.body);
                  const rawResponse = JSON.parse(message.body);
                  console.log('📨 Parsed response:', rawResponse);
                  
                  // Map backend response to frontend format
                  const response: ChatMessageResponse = {
                    message: rawResponse.content || rawResponse.message || '',
                    recipeId,
                    type: (rawResponse.sender || rawResponse.type || 'ai') as 'ai' | 'system' | 'hint' | 'user',
                    timestamp: rawResponse.timestamp || new Date().toISOString(),
                  };
                  
                  console.log('✅ Mapped response:', response);
                  state.messages.push(response);
                  state.isLoading = false;
                } catch (e) {
                  console.error('❌ Error parsing chat message:', e);
                  state.isLoading = false;
                }
              },
              { id: `sub-${userId}-chat` }
            );

            resolve(true);
          },
          onStompError: (frame) => {
            console.error('❌ STOMP error:', frame);
            state.error = 'Connection error occurred';
            state.isConnected = false;
            resolve(false);
          },
          onDisconnect: () => {
            console.log('🔌 Disconnected');
            state.isConnected = false;
          },
        });

        stompClient.activate();
      } catch (error) {
        console.error('❌ WebSocket connection error:', error);
        state.error = error instanceof Error ? error.message : 'Failed to connect';
        state.isConnected = false;
        resolve(false);
      }
    });
  };

  const disconnect = () => {
    if (stompClient && stompClient.connected) {
      stompClient.deactivate();
      state.isConnected = false;
    }
  };

  const sendMessage = async (message: string) => {
    if (!stompClient || !stompClient.connected) {
      state.error = 'Not connected to chat server';
      console.error('❌ Cannot send - not connected');
      return;
    }

    state.isLoading = true;
    state.error = null;

    try {
      // Add user message to the chat
      const userMessage: ChatMessageResponse = {
        message,
        recipeId,
        type: 'user',
        timestamp: new Date().toISOString(),
      };
      state.messages.push(userMessage);

      // Send to server
      const request: ChatMessageRequest = {
        recipeId,
        userId,
        message,
      };

      console.log('📤 Sending message to /app/chat.send:', request);
      console.log('🔍 Current userId for response routing:', userId);
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      state.error = error instanceof Error ? error.message : 'Failed to send message';
      state.isLoading = false;
    }
  };

  const clearMessages = () => {
    state.messages = [];
    state.error = null;
  };

  return {
    state,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  };
};


