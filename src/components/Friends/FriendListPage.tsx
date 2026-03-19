import { useState, useCallback } from 'react';
import {
  useFriendsList,
  usePendingRequests,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useSendFriendRequest,
  useSearchFriendsUsers,
  useUnfriend,
} from '../../hooks/useFriendsQuery';
import { useFriendsStore } from '../../utils/friends.store';
import type {
  FriendUserInfo,
  PendingRequestItem,
  SearchFriendUser,
} from '../../types/friend.types';

type Tab = 'friends' | 'pending';

// ─── Utility: tạo chữ cái đầu cho avatar fallback ────────────────────────────
const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const AVATAR_COLORS = [
  '#5B6AD0', '#D05B8A', '#5BA8D0', '#5BD0A0',
  '#D0925B', '#8A5BD0', '#5BD05B', '#D05B5B',
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const normalizeId = (id: string | number) => Number(id);

// ─── Avatar component ─────────────────────────────────────────────────────────
const Avatar = ({ src, name, id, size = 44 }: { src?: string; name: string; id: number; size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    overflow: 'hidden', background: avatarColor(id),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.35, fontWeight: 600, color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
  }}>
    {src
      ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      : getInitials(name)}
  </div>
);

// ─── Styles as a <style> tag injected once ────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@500;600&display=swap');

    .flp-root {
      font-family: 'DM Sans', sans-serif;
      background: #F5F4F0;
      min-height: 100vh;
      color: #1A1A1A;
    }

    .flp-inner {
      max-width: 680px;
      margin: 0 auto;
      padding: 32px 20px 80px;
    }

    .flp-heading {
      font-family: 'Sora', sans-serif;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: -0.5px;
      margin: 0 0 28px;
      color: #111;
    }

    .flp-search-wrap {
      position: relative;
      margin-bottom: 24px;
    }
    .flp-search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.4;
      pointer-events: none;
    }
    .flp-search {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border: 1.5px solid #E2E0D8;
      border-radius: 12px;
      background: #fff;
      font-size: 14px;
      font-family: 'DM Sans', sans-serif;
      color: #1A1A1A;
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }
    .flp-search:focus { border-color: #5B6AD0; }
    .flp-search::placeholder { color: #AEACA4; }

    .flp-tabs {
      display: flex;
      gap: 4px;
      background: #ECEAE3;
      padding: 4px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .flp-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: 9px;
      border: none;
      background: transparent;
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      color: #7A7870;
      cursor: pointer;
      transition: all 0.15s;
    }
    .flp-tab.active {
      background: #fff;
      color: #1A1A1A;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .flp-badge {
      background: #D05B8A;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      padding: 0 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .flp-section-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #AEACA4;
      margin: 0 0 12px;
    }

    .flp-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }

    .flp-card {
      background: #fff;
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      border: 1px solid #ECEAE3;
      transition: box-shadow 0.15s;
      animation: flp-fadein 0.2s ease both;
    }
    .flp-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

    @keyframes flp-fadein {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .flp-info { flex: 1; min-width: 0; }
    .flp-name {
      font-size: 14.5px;
      font-weight: 600;
      color: #111;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 0 2px;
    }
    .flp-sub {
      font-size: 12.5px;
      color: #9A9890;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .flp-actions { display: flex; gap: 7px; flex-shrink: 0; }

    .flp-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1.5px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .flp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .flp-btn-primary {
      background: #5B6AD0;
      color: #fff;
      border-color: #5B6AD0;
    }
    .flp-btn-primary:hover:not(:disabled) { background: #4A58C0; }

    .flp-btn-success {
      background: #18A06A;
      color: #fff;
      border-color: #18A06A;
    }
    .flp-btn-success:hover:not(:disabled) { background: #148F5E; }

    .flp-btn-ghost {
      background: transparent;
      color: #7A7870;
      border-color: #DDDBD3;
    }
    .flp-btn-ghost:hover:not(:disabled) { background: #F5F4F0; color: #444; }

    .flp-btn-danger {
      background: transparent;
      color: #C94040;
      border-color: #EDCACA;
    }
    .flp-btn-danger:hover:not(:disabled) { background: #FDF0F0; }

    .flp-status-pill {
      font-size: 11.5px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .flp-status-pending  { background: #FEF3C7; color: #92700A; }
    .flp-status-friends  { background: #D1FAE5; color: #065F46; }
    .flp-status-none     { display: none; }

    .flp-empty {
      text-align: center;
      padding: 60px 20px;
      color: #AEACA4;
    }
    .flp-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
    .flp-empty-text { font-size: 14px; }

    .flp-loading {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .flp-skeleton {
      background: #ECEAE3;
      border-radius: 14px;
      height: 74px;
      animation: flp-pulse 1.4s ease-in-out infinite;
    }
    @keyframes flp-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }

    .flp-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 20px;
    }
    .flp-page-info { font-size: 13px; color: #9A9890; }

    .flp-error {
      background: #FDF0F0;
      border: 1px solid #EDCACA;
      border-radius: 12px;
      padding: 16px 20px;
      color: #C94040;
      font-size: 14px;
      text-align: center;
    }
  `}</style>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="flp-loading">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flp-skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
    ))}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flp-empty">
    <div className="flp-empty-icon">{icon}</div>
    <p className="flp-empty-text">{text}</p>
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) => {
  if (total <= 1) return null;
  return (
    <div className="flp-pagination">
      <button className="flp-btn flp-btn-ghost" disabled={current === 1} onClick={() => onChange(current - 1)}>← Trước</button>
      <span className="flp-page-info">{current} / {total}</span>
      <button className="flp-btn flp-btn-ghost" disabled={current === total} onClick={() => onChange(current + 1)}>Sau →</button>
    </div>
  );
};

// ─── Friends Tab ──────────────────────────────────────────────────────────────
interface FriendsTabProps {
  data: FriendUserInfo[];
  isLoading: boolean;
  isError: boolean;
  onUnfriend: (id: number) => void;
  unfriendingId?: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const FriendsTab = ({ data, isLoading, isError, onUnfriend, unfriendingId, currentPage, totalPages, onPageChange }: FriendsTabProps) => {
  if (isLoading) return <SkeletonList />;
  if (isError) return <div className="flp-error">Có lỗi xảy ra. Vui lòng thử lại.</div>;
  if (data.length === 0) return <EmptyState icon="👥" text="Chưa có bạn bè nào." />;

  return (
    <>
      <p className="flp-section-label">{data.length > 0 ? `${data.length} người` : ''}</p>
      <ul className="flp-list">
        {data.map((friend, i) => (
          <li key={friend.id} className="flp-card" style={{ animationDelay: `${i * 0.04}s` }}>
            <Avatar src={friend.image} name={friend.name} id={friend.id} />
            <div className="flp-info">
              <p className="flp-name">{friend.name}</p>
              <p className="flp-sub">{friend.email}</p>
            </div>
            <div className="flp-actions">
              <button
                className="flp-btn flp-btn-danger"
                onClick={() => onUnfriend(normalizeId(friend.id))}
                disabled={unfriendingId === friend.id}
              >
                {unfriendingId === friend.id ? 'Đang hủy...' : 'Hủy kết bạn'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
    </>
  );
};

// ─── Pending Tab ──────────────────────────────────────────────────────────────
interface PendingTabProps {
  data: PendingRequestItem[];
  isLoading: boolean;
  onAccept: (senderId: number) => void;
  onDecline: (senderId: number) => void;
  acceptingId?: number;
  decliningId?: number;
}

const PendingTab = ({ data, isLoading, onAccept, onDecline, acceptingId, decliningId }: PendingTabProps) => {
  if (isLoading) return <SkeletonList count={4} />;
  if (data.length === 0) return <EmptyState icon="✉️" text="Không có lời mời kết bạn nào." />;

  return (
    <>
      <p className="flp-section-label">Đang chờ phản hồi của bạn</p>
      <ul className="flp-list">
        {data.map((req, i) => (
          <li key={req.id} className="flp-card" style={{ animationDelay: `${i * 0.04}s` }}>
            <Avatar src={req.sender.image} name={req.sender.name} id={req.sender.id} />
            <div className="flp-info">
              <p className="flp-name">{req.sender.name}</p>
              <p className="flp-sub">{req.sender.email}</p>
            </div>
            <div className="flp-actions">
              <button
                className="flp-btn flp-btn-success"
                onClick={() => onAccept(normalizeId(req.sender.id))}
                disabled={acceptingId === req.sender.id || decliningId === req.sender.id}
              >
                {acceptingId === req.sender.id ? 'Đang xử lý...' : 'Đồng ý'}
              </button>
              <button
                className="flp-btn flp-btn-ghost"
                onClick={() => onDecline(normalizeId(req.sender.id))}
                disabled={decliningId === req.sender.id || acceptingId === req.sender.id}
              >
                {decliningId === req.sender.id ? '...' : 'Từ chối'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

// ─── Search Users Tab ─────────────────────────────────────────────────────────
interface SearchUsersTabProps {
  data: SearchFriendUser[];
  isLoading: boolean;
  onSendRequest: (targetUserId: number) => void;
  sendingId?: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SearchUsersTab = ({ data, isLoading, onSendRequest, sendingId, currentPage, totalPages, onPageChange }: SearchUsersTabProps) => {
  if (isLoading) return <SkeletonList count={4} />;
  if (data.length === 0) return <EmptyState icon="🔍" text="Không tìm thấy người dùng phù hợp." />;

  return (
    <>
      <p className="flp-section-label">Kết quả tìm kiếm</p>
      <ul className="flp-list">
        {data.map((user, i) => {
          const targetUserId = normalizeId(user.id);
          const isSending = sendingId === targetUserId;
          const canSend = user.friendship.canSendRequest && Number.isFinite(targetUserId);
          const isFriend = !user.friendship.canSendRequest && user.friendship?.status === 'accepted';
          const isPending = !user.friendship.canSendRequest && user.friendship?.status === 'pending';

          return (
            <li key={user.id} className="flp-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <Avatar src={user.image ?? ''} name={user.name} id={targetUserId} />
              <div className="flp-info">
                <p className="flp-name">{user.name}</p>
                <p className="flp-sub">{user.email}</p>
              </div>
              <div className="flp-actions">
                {isFriend && (
                  <span className="flp-status-pill flp-status-friends">Bạn bè</span>
                )}
                {isPending && (
                  <span className="flp-status-pill flp-status-pending">Đã gửi</span>
                )}
                {canSend && (
                  <button
                    className="flp-btn flp-btn-primary"
                    onClick={() => onSendRequest(targetUserId)}
                    disabled={isSending}
                  >
                    {isSending ? 'Đang gửi...' : '+ Kết bạn'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const FriendListPage = () => {
  const [tab, setTab] = useState<Tab>('friends');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { pendingCount, markRequestsSeen } = useFriendsStore();

  const { data: friendsData, isLoading: loadingFriends, isError: errorFriends } =
    useFriendsList({ query: search, current: page, pageSize: 10 });

  const { data: pendingData, isLoading: loadingPending } =
    usePendingRequests({ current: 1, pageSize: 20 });

  const { data: searchedUsersData, isLoading: loadingSearchedUsers } =
    useSearchFriendsUsers({ query: search, current: page, pageSize: 10 });

  const acceptMutation = useAcceptFriendRequest();
  const cancelMutation = useCancelFriendRequest();
  const sendRequestMutation = useSendFriendRequest();
  const unfriendMutation = useUnfriend();

  const handleTabChange = useCallback((newTab: Tab) => {
    setTab(newTab);
    setSearch('');
    setPage(1);
    if (newTab === 'pending') markRequestsSeen();
  }, [markRequestsSeen]);

  const hasSearchQuery = search.trim().length > 0;

  return (
    <div className="flp-root">
      <Styles />
      <div className="flp-inner">
        <h1 className="flp-heading">Bạn bè</h1>

        {/* Search bar — luôn hiển thị ở tab friends */}
        {tab === 'friends' && (
          <div className="flp-search-wrap">
            <svg className="flp-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#1A1A1A" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="flp-search"
              type="text"
              placeholder={hasSearchQuery ? 'Tìm người dùng...' : 'Tìm bạn bè hoặc người dùng...'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flp-tabs">
          <button
            className={`flp-tab${tab === 'friends' ? ' active' : ''}`}
            onClick={() => handleTabChange('friends')}
          >
            Bạn bè
            {friendsData && !hasSearchQuery && (
              <span style={{ fontSize: 12, color: '#AEACA4', fontWeight: 400 }}>
                {friendsData.total}
              </span>
            )}
          </button>
          <button
            className={`flp-tab${tab === 'pending' ? ' active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            Lời mời
            {pendingCount > 0 && <span className="flp-badge">{pendingCount}</span>}
          </button>
        </div>

        {/* Content */}
        {tab === 'friends' && (
          hasSearchQuery ? (
            <SearchUsersTab
              data={searchedUsersData?.result ?? []}
              isLoading={loadingSearchedUsers}
              onSendRequest={(id) => sendRequestMutation.mutate(id)}
              sendingId={sendRequestMutation.variables}
              currentPage={page}
              totalPages={searchedUsersData?.totalPage ?? 1}
              onPageChange={setPage}
            />
          ) : (
            <FriendsTab
              data={friendsData?.result ?? []}
              isLoading={loadingFriends}
              isError={errorFriends}
              onUnfriend={(id) => {
                if (window.confirm('Bạn có chắc muốn hủy kết bạn?')) {
                  unfriendMutation.mutate(id);
                }
              }}
              unfriendingId={unfriendMutation.variables}
              currentPage={page}
              totalPages={friendsData?.totalPage ?? 1}
              onPageChange={setPage}
            />
          )
        )}

        {tab === 'pending' && (
          <PendingTab
            data={pendingData?.result ?? []}
            isLoading={loadingPending}
            onAccept={(id) => acceptMutation.mutate(id)}
            onDecline={(id) => cancelMutation.mutate(id)}
            acceptingId={acceptMutation.variables}
            decliningId={cancelMutation.variables}
          />
        )}
      </div>
    </div>
  );
};