import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Send,
  Zap,
  MessageCircle,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { geminiWorkoutGenerator } from '@/lib/gemini';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'message' | 'workout_modified' | 'error' | 'system';
  workoutData?: any; // For workout modification messages
}

interface BoltChatProps {
  visible: boolean;
  onClose: () => void;
  currentWorkout?: any;
  onWorkoutModified?: (modifiedWorkout: any) => void;
}

export default function BoltChat({
  visible,
  onClose,
  currentWorkout,
  onWorkoutModified,
}: BoltChatProps) {
  const { profile, loadOnboardingData, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load user data when component mounts
  useEffect(() => {
    if (visible && user) {
      loadUserData();
      // Add welcome message
      if (messages.length === 0) {
        setMessages([
          {
            id: '1',
            text: `Hey ${
              profile?.username || 'Lightning Warrior'
            }! 💪 I'm Bolt, your AI fitness coach. I can help you modify your workout, answer fitness questions, or provide motivation. What would you like to do?`,
            isUser: false,
            timestamp: new Date(),
            type: 'message',
          },
        ]);
      }
    }
  }, [visible, user, profile]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const { data } = await loadOnboardingData();
      setOnboardingData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'message',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Check if this is a workout modification request
    const isWorkoutModification = checkIfWorkoutModification(userMessage.text);

    try {
      let botResponse: string;
      let systemMessage: ChatMessage | null = null;

      if (isWorkoutModification && currentWorkout) {
        // Handle workout modification
        const modifiedWorkout = await handleWorkoutModification(
          userMessage.text
        );
        if (modifiedWorkout) {
          botResponse = `Great! I've modified your workout based on your request. Here's what changed:\n\n`;

          // Add specific changes description
          const changes = getWorkoutChanges(currentWorkout, modifiedWorkout);
          botResponse += formatWorkoutChanges(changes);

          botResponse += `\n\nYour updated workout is ready! The changes have been applied automatically. 💪⚡`;

          // Create system message for workout modification
          systemMessage = {
            id: (Date.now() + 1).toString(),
            text: 'Workout successfully modified!',
            isUser: false,
            timestamp: new Date(),
            type: 'workout_modified',
            workoutData: modifiedWorkout,
          };

          // Notify parent component
          if (onWorkoutModified) {
            onWorkoutModified(modifiedWorkout);
          }
        } else {
          botResponse = `I had trouble modifying your workout with that request. Could you be more specific? For example:\n\n• "Replace bench press with push-ups"\n• "Add more chest exercises"\n• "Make the workout easier"\n• "Increase the reps for squats"`;
        }
      } else {
        // Regular chat message
        const context = {
          userProfile: profile,
          currentWorkout,
          onboardingData,
        };

        const chatHistory = messages.slice(-5); // Last 5 messages for context

        botResponse = await geminiWorkoutGenerator.sendMessage(
          userMessage.text,
          context,
          chatHistory
        );

        // Format the response
        botResponse = formatBotResponse(botResponse);
      }

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'message',
      };

      setMessages((prev) => {
        const newMessages = [...prev, botMessage];
        if (systemMessage) {
          newMessages.push(systemMessage);
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again! 🔧",
        isUser: false,
        timestamp: new Date(),
        type: 'error',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const checkIfWorkoutModification = (message: string): boolean => {
    const modificationKeywords = [
      'change',
      'replace',
      'modify',
      'swap',
      'substitute',
      'add',
      'remove',
      'increase',
      'decrease',
      'easier',
      'harder',
      'more',
      'less',
      'different',
      'instead of',
      'rather than',
      'without',
      'skip',
    ];

    const exerciseKeywords = [
      'exercise',
      'workout',
      'reps',
      'sets',
      'weight',
      'bench press',
      'squats',
      'deadlift',
      'curl',
      'push',
      'pull',
      'cardio',
      'strength',
    ];

    const lowerMessage = message.toLowerCase();

    const hasModificationKeyword = modificationKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    const hasExerciseKeyword = exerciseKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    return hasModificationKeyword && hasExerciseKeyword;
  };

  const handleWorkoutModification = async (userRequest: string) => {
    if (!currentWorkout) return null;

    try {
      const context = {
        userProfile: profile,
        currentWorkout,
        onboardingData,
      };

      const modifiedWorkout = await geminiWorkoutGenerator.modifyWorkout(
        currentWorkout,
        userRequest,
        context
      );

      return modifiedWorkout;
    } catch (error) {
      console.error('Error modifying workout:', error);
      return null;
    }
  };

  const getWorkoutChanges = (original: any, modified: any) => {
    const changes = [];

    // Check for exercise changes
    const originalExercises = original.exercises.map((e: any) => e.name);
    const modifiedExercises = modified.exercises.map((e: any) => e.name);

    // Added exercises
    const addedExercises = modifiedExercises.filter(
      (name: string) => !originalExercises.includes(name)
    );

    // Removed exercises
    const removedExercises = originalExercises.filter(
      (name: string) => !modifiedExercises.includes(name)
    );

    if (addedExercises.length > 0) {
      changes.push(`➕ Added: ${addedExercises.join(', ')}`);
    }

    if (removedExercises.length > 0) {
      changes.push(`➖ Removed: ${removedExercises.join(', ')}`);
    }

    // Check for parameter changes (sets, reps, weight)
    modified.exercises.forEach((modExercise: any) => {
      const originalExercise = original.exercises.find(
        (e: any) => e.name === modExercise.name
      );
      if (originalExercise) {
        if (originalExercise.sets !== modExercise.sets) {
          changes.push(
            `🔄 ${modExercise.name}: ${originalExercise.sets} → ${modExercise.sets} sets`
          );
        }
        if (originalExercise.reps !== modExercise.reps) {
          changes.push(
            `🔄 ${modExercise.name}: ${originalExercise.reps} → ${modExercise.reps} reps`
          );
        }
        if (originalExercise.weight !== modExercise.weight) {
          changes.push(
            `🔄 ${modExercise.name}: ${originalExercise.weight || 0} → ${
              modExercise.weight || 0
            } lbs`
          );
        }
      }
    });

    return changes;
  };

  const formatWorkoutChanges = (changes: string[]): string => {
    if (changes.length === 0) {
      return '✨ Made some optimizations to your workout!';
    }

    return changes.join('\n');
  };

  const formatBotResponse = (response: string): string => {
    // Clean up the response and add better formatting
    let formatted = response.trim();

    // Remove any extra whitespace and line breaks
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Add emojis for better engagement if they're missing
    if (!formatted.match(/[💪⚡🔥🎯✨🚀]/)) {
      if (
        formatted.toLowerCase().includes('great') ||
        formatted.toLowerCase().includes('awesome')
      ) {
        formatted = '💪 ' + formatted;
      } else if (formatted.toLowerCase().includes('workout')) {
        formatted = '⚡ ' + formatted;
      } else {
        formatted = '🎯 ' + formatted;
      }
    }

    return formatted;
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: 'welcome',
                text: `Chat cleared! I'm here to help with your workout. What would you like to do? 💪`,
                isUser: false,
                timestamp: new Date(),
                type: 'message',
              },
            ]);
          },
        },
      ]
    );
  };

  const quickQuestions = [
    'Make this workout easier',
    'Add more chest exercises',
    'Replace bench press with push-ups',
    'Increase the difficulty',
    'How do I do this exercise?',
    'Why this muscle group?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      {!message.isUser && (
        <View
          style={[
            styles.avatarContainer,
            message.type === 'workout_modified'
              ? styles.successAvatar
              : message.type === 'error'
              ? styles.errorAvatar
              : styles.botAvatar,
          ]}
        >
          {message.type === 'workout_modified' ? (
            <CheckCircle size={16} color="#10B981" />
          ) : message.type === 'error' ? (
            <AlertCircle size={16} color="#EF4444" />
          ) : (
            <Zap size={16} color="#6B46C1" />
          )}
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.botBubble,
          message.type === 'workout_modified' && styles.successBubble,
          message.type === 'error' && styles.errorBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.botText,
          ]}
        >
          {message.text}
        </Text>
        <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
          style={styles.background}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Zap size={20} color="#6B46C1" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Bolt AI Coach</Text>
                <Text style={styles.headerSubtitle}>
                  {isTyping ? 'Bolt is thinking...' : 'Ready to help! ⚡'}
                </Text>
              </View>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={clearChat}>
                <RefreshCw size={20} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
            {isTyping && (
              <View style={styles.loadingContainer}>
                <View style={styles.botAvatar}>
                  <ActivityIndicator size="small" color="#6B46C1" />
                </View>
                <View style={styles.loadingBubble}>
                  <Text style={styles.loadingText}>Bolt is thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Questions */}
          {messages.length <= 2 && !isTyping && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Quick suggestions:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickQuestionsScroll}
              >
                {quickQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickQuestionBubble}
                    onPress={() => handleQuickQuestion(question)}
                  >
                    <Text style={styles.quickQuestionText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            <View style={styles.inputArea}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Bolt anything about your workout..."
                placeholderTextColor="#64748B"
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() && !isTyping
                    ? styles.sendButtonActive
                    : styles.sendButtonInactive,
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isTyping}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  successAvatar: {
    backgroundColor: '#10B981' + '20',
  },
  errorAvatar: {
    backgroundColor: '#EF4444' + '20',
  },
  botAvatar: {
    backgroundColor: '#6B46C1' + '20',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#6B46C1',
    borderBottomRightRadius: 4,
    marginLeft: 40,
  },
  botBubble: {
    backgroundColor: '#1A1A2E',
    borderBottomLeftRadius: 4,
  },
  successBubble: {
    backgroundColor: '#10B981' + '10',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  errorBubble: {
    backgroundColor: '#EF4444' + '10',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    color: '#64748B',
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  quickQuestionsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  quickQuestionBubble: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34, // Increased to account for safe area and ensure visibility
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#6B46C1',
  },
  sendButtonInactive: {
    backgroundColor: '#374151',
  },
});
