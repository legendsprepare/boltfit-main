import { useState, useEffect } from 'react';
import {
  supabase,
  Friendship,
  UserActivity,
  ActivityLike,
  Profile,
} from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface FriendWithProfile {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  profile: Profile;
}

export interface ActivityWithProfile {
  id: string;
  user_id: string;
  activity_type:
    | 'workout'
    | 'achievement'
    | 'streak'
    | 'joined'
    | 'personal_record';
  activity_data: {
    action: string;
    username: string;
    [key: string]: any;
  };
  created_at: string;
  profile: Profile;
  likes: ActivityLike[];
  isLiked: boolean;
}

export function useSocial() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [activities, setActivities] = useState<ActivityWithProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadActivities();
      loadLeaderboard();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(
          `
          *,
          requester:profiles!friendships_requester_id_fkey(*),
          addressee:profiles!friendships_addressee_id_fkey(*)
        `
        )
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading friends:', error);
      } else {
        const friendsWithProfiles =
          data?.map((friendship: any) => ({
            ...friendship,
            profile:
              friendship.requester_id === user.id
                ? friendship.addressee
                : friendship.requester,
          })) || [];
        setFriends(friendsWithProfiles);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!user) return;

    try {
      // Get activities from self and friends
      const { data, error } = await supabase
        .from('user_activities')
        .select(
          `
          *,
          profile:profiles(*),
          likes:activity_likes(*)
        `
        )
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading activities:', error);
      } else {
        const activitiesWithLikes =
          data?.map((activity: any) => ({
            ...activity,
            likes: activity.likes || [],
            isLiked:
              activity.likes?.some((like: any) => like.user_id === user.id) ||
              false,
          })) || [];
        setActivities(activitiesWithLikes);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadLeaderboard = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading leaderboard:', error);
      } else {
        setLeaderboard(data || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending',
      })
      .select()
      .single();

    if (!error) {
      await loadFriends();
    }

    return { data, error };
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .single();

    if (!error) {
      await loadFriends();
    }

    return { data, error };
  };

  const removeFriend = async (friendshipId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (!error) {
      await loadFriends();
    }

    return { error };
  };

  const toggleLike = async (activityId: string) => {
    if (!user) return;

    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    if (activity.isLiked) {
      // Remove like
      const { error } = await supabase
        .from('activity_likes')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user.id);

      if (!error) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  isLiked: false,
                  likes: a.likes.filter((l) => l.user_id !== user.id),
                }
              : a
          )
        );
      }
    } else {
      // Add like
      const { error } = await supabase.from('activity_likes').insert({
        activity_id: activityId,
        user_id: user.id,
      });

      if (!error) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  isLiked: true,
                  likes: [
                    ...a.likes,
                    {
                      id: 'temp-' + Date.now(),
                      user_id: user.id,
                      activity_id: activityId,
                      created_at: new Date().toISOString(),
                    },
                  ],
                }
              : a
          )
        );
      }
    }
  };

  const createActivity = async (
    activityType:
      | 'workout'
      | 'achievement'
      | 'streak'
      | 'joined'
      | 'personal_record',
    activityData: any
  ) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData,
      })
      .select()
      .single();

    if (!error) {
      await loadActivities();
    }

    return { data, error };
  };

  const searchUsers = async (query: string) => {
    if (!user || !query) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return {
    friends,
    activities,
    leaderboard,
    loading,
    loadFriends,
    loadActivities,
    loadLeaderboard,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    toggleLike,
    createActivity,
    searchUsers,
  };
}
