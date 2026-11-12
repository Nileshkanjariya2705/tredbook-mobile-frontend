import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../context/AuthContext';

export interface ThreadItem {
  id: string;
  type: string;
  title: string;
  avatar?: string | null;
  peerUserId?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  stories: Array<{
    id: string;
    mediaUrl: string;
    caption?: string;
    createdAt: string;
  }>;
}

export const SocialScreen: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [threadsRes, storiesRes] = await Promise.all([
        api.get('/chat/threads'),
        api.get('/chat/stories'),
      ]);
      setThreads(threadsRes.data);
      setStories(storiesRes.data);
    } catch {
      // Fail safely
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePostStory = () => {
    Alert.prompt
      ? Alert.prompt(
          'Post 24h Story',
          'Enter text or deal announcement to broadcast to your customers for 24 hours:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Publish',
              onPress: async (caption) => {
                if (!caption) return;
                try {
                  await api.post('/chat/stories', {
                    mediaUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
                    caption,
                  });
                  loadData();
                  Alert.alert('Story Live', 'Your commercial story is now active for 24 hours.');
                } catch (e: any) {
                  Alert.alert('Error', e.response?.data?.message || 'Could not publish story.');
                }
              },
            },
          ],
        )
      : Alert.alert(
          'Post 24h Story',
          'Publishing commercial story: "Festive Season 22K Gold Bangles Now in Stock!"',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Publish Deal',
              onPress: async () => {
                await api.post('/chat/stories', {
                  mediaUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
                  caption: 'Festive Season 22K Gold Bangles Now in Stock!',
                });
                loadData();
                Alert.alert('Story Live', 'Your commercial story is now active for 24 hours.');
              },
            },
          ],
        );
  };

  const handleStartNewChat = () => {
    Alert.prompt
      ? Alert.prompt('Start New Chat', 'Enter the User ID of the customer or merchant:', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Chat',
            onPress: async (peerId) => {
              if (!peerId) return;
              try {
                const res = await api.post('/chat/threads/direct', { peerUserId: peerId });
                setSelectedThread({
                  id: res.data.id,
                  type: 'direct',
                  title: `User #${peerId}`,
                  unreadCount: 0,
                });
              } catch (e: any) {
                Alert.alert('Error', e.response?.data?.message || 'Could not open chat.');
              }
            },
          },
        ])
      : Alert.alert('Start New Chat', 'Quickly connect with nearby verified merchants or customers via search.');
  };

  if (selectedThread) {
    return (
      <ChatThreadScreen
        threadId={selectedThread.id}
        threadTitle={selectedThread.title}
        onBack={() => {
          setSelectedThread(null);
          loadData();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* 24h Ephemeral Stories Bar (PRD Section 7 & FN-CHAT-08) */}
      <View style={styles.storiesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
          {/* Add My Story */}
          <TouchableOpacity style={styles.storyCircleWrapper} onPress={handleCreatePostStory}>
            <View style={[styles.storyCircle, styles.addStoryCircle]}>
              <Text style={styles.addStoryPlus}>+</Text>
            </View>
            <Text style={styles.storyName}>Your Story</Text>
          </TouchableOpacity>

          {/* Peer Stories */}
          {stories.map((s) => (
            <TouchableOpacity
              key={s.userId}
              style={styles.storyCircleWrapper}
              onPress={() =>
                Alert.alert(
                  `${s.userName}'s Story`,
                  s.stories.map((st) => `• ${st.caption || 'Deal image'}`).join('\n\n'),
                )
              }
            >
              <View style={[styles.storyCircle, styles.activeStoryCircle]}>
                <Text style={styles.storyAvatarText}>
                  {s.userName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {s.userName.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conversations List Header */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listTitle}>Messages & Enquiries</Text>
        <TouchableOpacity style={styles.newChatBtn} onPress={handleStartNewChat}>
          <Text style={styles.newChatBtnText}>+ New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#1E3A8A" />
        </View>
      ) : threads.length === 0 ? (
        <View style={styles.emptyInbox}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No Active Conversations</Text>
          <Text style={styles.emptySubtitle}>
            Connect directly with verified local businesses, request quotes, and receive instant digital GST invoices.
          </Text>
          <TouchableOpacity style={styles.startFirstChatBtn} onPress={handleStartNewChat}>
            <Text style={styles.startFirstChatBtnText}>Start a Conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.threadItem} onPress={() => setSelectedThread(item)}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.title.slice(0, 2).toUpperCase()}</Text>
              </View>

              <View style={styles.threadInfo}>
                <View style={styles.threadTopRow}>
                  <Text style={styles.threadTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.lastMessageAt && (
                    <Text style={styles.threadTime}>
                      {new Date(item.lastMessageAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  )}
                </View>

                <View style={styles.threadBottomRow}>
                  <Text style={styles.lastSnippet} numberOfLines={1}>
                    {item.lastMessageText || 'Tap to start conversation'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  storiesSection: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  storiesScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  storyCircleWrapper: {
    alignItems: 'center',
    width: 68,
  },
  storyCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  addStoryCircle: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  addStoryPlus: {
    fontSize: 26,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  activeStoryCircle: {
    backgroundColor: '#1E3A8A',
    borderWidth: 2.5,
    borderColor: '#2563EB',
  },
  storyAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  storyName: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  newChatBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newChatBtnText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyInbox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startFirstChatBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  startFirstChatBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  threadInfo: {
    flex: 1,
  },
  threadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  threadTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  threadBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSnippet: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
