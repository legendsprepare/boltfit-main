import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  MessageCircle,
  Trophy,
  Heart,
  Share,
  Zap,
  UserPlus,
  RefreshCw,
  X,
  Search,
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';

export default function SocialScreen() {
  const { profile } = useAuth();
  const {
    friends,
    activities,
    leaderboard,
    loading,
    loadFriends,
    loadActivities,
    loadLeaderboard,
    toggleLike,
    searchUsers,
    sendFriendRequest,
  } = useSocial();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFriends(), loadActivities(), loadLeaderboard()]);
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return Zap;
      case 'achievement':
        return Trophy;
      case 'streak':
        return Heart;
      default:
        return Users;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(query.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: string, username: string) => {
    try {
      const { error } = await sendFriendRequest(userId);
      if (error) {
        Alert.alert('Error', 'Failed to send friend request');
      } else {
        Alert.alert('Success', `Friend request sent to ${username}!`);
        setSearchResults((prev) => prev.filter((user) => user.id !== userId));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const shareProgress = () => {
    Alert.alert('Share Progress', 'Share your fitness journey with friends!', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Share',
        onPress: () => Alert.alert('Success', 'Progress shared!'),
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={styles.loadingText}>Loading social feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Social</Text>
          <Text style={styles.headerSubtitle}>
            Connect with your fitness community
          </Text>
        </View>

        {/* Friends List */}
        <View style={styles.friendsSection}>
          <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends</Text>
            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={() => setShowAddFriendModal(true)}
            >
              <UserPlus size={20} color="#6B46C1" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.friendsScroll}
          >
            {friends.length === 0 ? (
              <View style={styles.noFriendsContainer}>
                <Text style={styles.noFriendsText}>No friends yet</Text>
                <Text style={styles.noFriendsSubtext}>
                  Connect with other fitness enthusiasts!
                </Text>
              </View>
            ) : (
              friends.map((friend) => (
                <TouchableOpacity key={friend.id} style={styles.friendCard}>
                <LinearGradient
                  colors={['#1A1A2E', '#0F0F23']}
                  style={styles.friendGradient}
                >
                  <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>
                        {getInitials(friend.profile.username || 'Anonymous')}
                      </Text>
                      <View style={styles.statusDot} />
                  </View>
                    <Text style={styles.friendName}>
                      {friend.profile.username || 'Anonymous'}
                    </Text>
                  <View style={styles.friendStreak}>
                    <Zap size={12} color="#F59E0B" />
                    <Text style={styles.friendStreakText}>
                        {friend.profile.current_streak}d
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
          <View style={styles.leaderboardCard}>
            <LinearGradient
              colors={['#1A1A2E', '#0F0F23']}
              style={styles.leaderboardGradient}
            >
              {leaderboard.length === 0 ? (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No leaderboard data yet</Text>
                </View>
              ) : (
                leaderboard.map((user, index) => (
                  <View key={user.id} style={styles.leaderboardItem}>
                  <View style={styles.leaderboardLeft}>
                      <Text style={styles.leaderboardRank}>#{index + 1}</Text>
                    <View
                      style={[
                        styles.leaderboardAvatar,
                          user.id === profile?.id
                          ? { backgroundColor: '#6B46C1' }
                          : { backgroundColor: '#475569' },
                      ]}
                    >
                      <Text style={styles.leaderboardAvatarText}>
                          {getInitials(user.username || 'Anonymous')}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.leaderboardName,
                          user.id === profile?.id
                          ? { color: '#6B46C1' }
                          : { color: '#FFFFFF' },
                      ]}
                    >
                        {user.id === profile?.id
                          ? 'You'
                          : user.username || 'Anonymous'}
                      </Text>
                    </View>
                    <Text style={styles.leaderboardPoints}>
                      {user.total_xp}
                    </Text>
                  </View>
                ))
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Activity Feed */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.length === 0 ? (
            <View style={styles.noActivitiesContainer}>
              <Text style={styles.noActivitiesText}>No recent activity</Text>
              <Text style={styles.noActivitiesSubtext}>
                Complete a workout to see activities here!
              </Text>
            </View>
          ) : (
            activities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityCard}>
              <LinearGradient
                colors={['#1A1A2E', '#0F0F23']}
                style={styles.activityGradient}
              >
                <View style={styles.activityContent}>
                  <View style={styles.activityLeft}>
                    <View style={styles.activityAvatar}>
                      <Text style={styles.activityAvatarText}>
                          {getInitials(
                            activity.profile.username || 'Anonymous'
                          )}
                      </Text>
                    </View>
                    <View style={styles.activityInfo}>
                        <Text style={styles.activityUser}>
                          {activity.profile.username || 'Anonymous'}
                        </Text>
                      <Text style={styles.activityAction}>
                          {activity.activity_data.action}
                        </Text>
                        <Text style={styles.activityTime}>
                          {formatTimeAgo(activity.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <View style={styles.activityIcon}>
                      {(() => {
                          const Icon = getActivityIcon(activity.activity_type);
                        return <Icon size={16} color="#6B46C1" />;
                      })()}
                    </View>
                    <TouchableOpacity
                      style={styles.likeButton}
                        onPress={() => toggleLike(activity.id)}
                    >
                      <Heart
                        size={16}
                          color={activity.isLiked ? '#EF4444' : '#64748B'}
                      />
                        {activity.likes.length > 0 && (
                          <Text style={styles.likeCount}>
                            {activity.likes.length}
                          </Text>
                        )}
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            ))
          )}
        </View>

        {/* Share Achievement */}
        <View style={styles.shareSection}>
          <TouchableOpacity style={styles.shareCard} onPress={shareProgress}>
            <LinearGradient
              colors={['#6B46C1', '#8B5CF6']}
              style={styles.shareGradient}
            >
              <View style={styles.shareContent}>
                <Share size={24} color="#FFFFFF" />
                <Text style={styles.shareTitle}>Share Your Progress</Text>
                <Text style={styles.shareSubtitle}>
                  Let your friends know about your achievements
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#0F0F23', '#1A1A2E']}
            style={styles.modalBackground}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Friends</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAddFriendModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by username..."
                  placeholderTextColor="#64748B"
                  value={searchQuery}
                  onChangeText={handleSearchUsers}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Search Results */}
            <View style={styles.searchResults}>
              {searchLoading ? (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="large" color="#6B46C1" />
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              ) : searchQuery.length < 2 ? (
                <View style={styles.searchEmptyContainer}>
                  <Text style={styles.searchEmptyText}>
                    Type at least 2 characters to search
                  </Text>
                </View>
              ) : searchResults.length === 0 ? (
                <View style={styles.searchEmptyContainer}>
                  <Text style={styles.searchEmptyText}>
                    No users found matching "{searchQuery}"
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.searchResultItem}>
                      <LinearGradient
                        colors={['#1A1A2E', '#0F0F23']}
                        style={styles.searchResultGradient}
                      >
                        <View style={styles.searchResultContent}>
                          <View style={styles.searchResultLeft}>
                            <View style={styles.searchResultAvatar}>
                              <Text style={styles.searchResultAvatarText}>
                                {getInitials(item.username || 'Anonymous')}
                              </Text>
                            </View>
                            <View style={styles.searchResultInfo}>
                              <Text style={styles.searchResultName}>
                                {item.username || 'Anonymous'}
                              </Text>
                              <Text style={styles.searchResultLevel}>
                                Level {item.level} • {item.total_xp} XP
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.sendRequestButton}
                            onPress={() =>
                              handleSendFriendRequest(item.id, item.username)
                            }
                          >
                            <LinearGradient
                              colors={['#6B46C1', '#8B5CF6']}
                              style={styles.sendRequestGradient}
                            >
                              <UserPlus size={16} color="#FFFFFF" />
                              <Text style={styles.sendRequestText}>Add</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  friendsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addFriendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  friendsScroll: {
    paddingLeft: 20,
  },
  noFriendsContainer: {
    width: 200,
    padding: 20,
    alignItems: 'center',
  },
  noFriendsText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noFriendsSubtext: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  friendCard: {
    marginRight: 12,
    width: 100,
  },
  friendGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  friendAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#0F0F23',
    backgroundColor: '#10B981',
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  friendStreak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendStreakText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: '600',
  },
  leaderboardSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  leaderboardCard: {
    marginBottom: 16,
  },
  leaderboardGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    width: 30,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  noActivitiesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noActivitiesText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noActivitiesSubtext: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  activityCard: {
    marginBottom: 12,
  },
  activityGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activityInfo: {
    flex: 1,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activityAction: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
  shareSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  shareCard: {
    marginBottom: 16,
  },
  shareGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  shareContent: {
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  shareSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  modalBackground: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 12,
  },
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  searchEmptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  searchResultItem: {
    marginBottom: 12,
  },
  searchResultGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchResultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  searchResultLevel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  sendRequestButton: {
    borderRadius: 8,
  },
  sendRequestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendRequestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});
