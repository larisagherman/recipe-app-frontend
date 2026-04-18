export interface ChatMessageRequest {
  recipeId: number;
  isGenerated:boolean;
  userId: string;
  message: string;

}

export interface ChatMessageResponse {
  message: string;
  recipeId: number;
  type: 'ai' | 'system' | 'hint' | 'user';
  timestamp?: string;
}

export interface ChatState {
  messages: ChatMessageResponse[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

