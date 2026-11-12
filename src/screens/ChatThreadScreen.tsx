import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { TransactionCard } from '../components/TransactionCard';
import { useAuth } from '../context/AuthContext';
import { Palette, SoftShadow } from '../theme/colors';

interface MessageItem {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  isMe: boolean;
  type: string;
  body?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface ChatThreadScreenProps {
  threadId: string;
  threadTitle: string;
  onBack: () => void;
}

export const ChatThreadScreen: React.FC<ChatThreadScreenProps> = ({
  threadId,
  threadTitle,
  onBack,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let activeSocket: any = null;

    const initThread = async () => {
      setIsLoading(true);
      try {
        // Fetch message history
        const res = await api.get(`/chat/threads/${threadId}/messages`);
        setMessages(res.data);

        // Mark as read
        await api.post(`/chat/threads/${threadId}/read`);

        // Connect socket & join room
        activeSocket = await getSocket();
        activeSocket.emit('join_thread', { threadId, userId: user?.id });

        activeSocket.on('new_message', (newMsg: MessageItem) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, isMe: newMsg.senderId === user?.id }];
          });
          api.post(`/chat/threads/${threadId}/read`).catch(() => {});
        });
      } catch (err: any) {
        Alert.alert('Chat Error', err.response?.data?.message || 'Failed to load conversation.');
      } finally {
        setIsLoading(false);
      }
    };

    initThread();

    return () => {
      if (activeSocket) {
        activeSocket.emit('leave_thread', { threadId });
        activeSocket.off('new_message');
      }
    };
  }, [threadId, user?.id]);

  const handleSendMessage = async (type = 'text', metadata?: Record<string, any>, customBody?: string) => {
    const textToSend = customBody !== undefined ? customBody : inputText.trim();
    if (type === 'text' && !textToSend) return;

    setIsSending(true);
    try {
      const res = await api.post(`/chat/threads/${threadId}/messages`, {
        type,
        body: textToSend || undefined,
        metadata,
      });

      // Append locally if socket hasn't reflected yet
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.id)) return prev;
        return [...prev, { ...res.data, isMe: true }];
      });
      setInputText('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not deliver message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendInvoicePrompt = () => {
    Alert.alert(
      'Attach Commerce Card',
      'Select a commercial card to share directly in chat:',
      [
        {
          text: '🧾 GST Tax Invoice (₹8,500)',
          onPress: () =>
            handleSendMessage('invoice_card', {
              invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
              grandTotal: '8500.00',
              balanceDue: '8500.00',
              dueDate: '2026-11-25',
              status: 'UNPAID',
              upiPayUrl: 'upi://pay?pa=tredbook@icici&pn=TredBook&am=8500.00',
            }),
        },
        {
          text: '📋 Quotation (₹15,000)',
          onPress: () =>
            handleSendMessage('quotation_card', {
              quotationNumber: `QUOT-${Date.now().toString().slice(-4)}`,
              grandTotal: '15000.00',
            }),
        },
        {
          text: '🛡️ Warranty Certificate',
          onPress: () =>
            handleSendMessage('warranty_card', {
              productName: '22K Gold Hallmark Necklace',
              serialNumber: 'TB-HM-88492',
              expiryDate: 'Nov 2029',
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const renderMessageItem = ({ item }: { item: MessageItem }) => {
    return (
      <View style={[styles.bubbleWrapper, item.isMe ? styles.myBubbleWrapper : styles.peerBubbleWrapper]}>
        {!item.isMe && <Text style={styles.senderLabel}>{item.senderName}</Text>}
        <View style={[styles.bubble, item.isMe ? styles.myBubble : styles.peerBubble]}>
          {item.type === 'text' && <Text style={[styles.messageText, item.isMe && styles.myMessageText]}>{item.body}</Text>}
          {item.type !== 'text' && <TransactionCard type={item.type} metadata={item.metadata} />}
          <Text style={[styles.timestamp, item.isMe && styles.myTimestamp]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {item.isMe ? '✓✓' : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{threadTitle}</Text>
          <Text style={styles.headerStatus}>Live Communication • Active</Text>
        </View>
      </View>

      {/* Message Feed */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#0284C7" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input Composer */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={handleSendInvoicePrompt}>
          <Text style={styles.attachIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type message or share invoice..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage('text')} disabled={isSending}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  backButton: {
    paddingRight: 14,
  },
  backButtonText: {
    fontSize: 22,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.3,
  },
  headerStatus: {
    fontSize: 11,
    color: Palette.mintDark,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Palette.background,
  },
  bubbleWrapper: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  peerBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  senderLabel: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginBottom: 3,
    marginLeft: 6,
    fontWeight: '600',
  },
  bubble: {
    borderRadius: 18,
    padding: 13,
  },
  myBubble: {
    backgroundColor: Palette.primary,
    borderBottomRightRadius: 4,
  },
  peerBubble: {
    backgroundColor: Palette.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow.card,
  },
  messageText: {
    fontSize: 14,
    color: Palette.textPrimary,
    lineHeight: 20,
  },
  myMessageText: {
    color: Palette.primaryText,
  },
  timestamp: {
    fontSize: 10,
    color: Palette.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: Palette.mintLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachIcon: {
    fontSize: 22,
    color: Palette.lilacDark,
    fontWeight: '700',
    marginTop: -2,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    fontSize: 16,
    color: Palette.primaryText,
    fontWeight: '700',
  },
});
