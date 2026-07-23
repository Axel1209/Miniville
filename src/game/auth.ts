export interface UserStats {
  games: number;
  wins: number;
}

export interface UserProfile {
  id: string;
  username: string;
  passwordHash: string; // Simple hash / stored key for local persistence
  createdAt: string;
  stats: {
    solo: UserStats;
    group: UserStats;
  };
}

const STORAGE_USERS_KEY = 'miniville_registered_users';
const STORAGE_CURRENT_USER_KEY = 'miniville_current_user_id';

// Helper to hash password locally
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
};

export const getRegisteredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse registered users', e);
    return [];
  }
};

export const saveRegisteredUsers = (users: UserProfile[]): void => {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered users', e);
  }
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const currentId = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!currentId) return null;
    const users = getRegisteredUsers();
    return users.find((u) => u.id === currentId) || null;
  } catch (e) {
    return null;
  }
};

export const setCurrentUser = (user: UserProfile | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, user.id);
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
};

export const registerUser = (
  username: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } => {
  const trimmed = username.trim();
  if (!trimmed) {
    return { success: false, message: "L'identifiant ne peut pas être vide." };
  }
  if (password.length < 3) {
    return { success: false, message: 'Le mot de passe doit contenir au moins 3 caractères.' };
  }

  const users = getRegisteredUsers();
  const existing = users.find(
    (u) => u.username.toLowerCase() === trimmed.toLowerCase()
  );

  if (existing) {
    return { success: false, message: 'Cet identifiant est déjà utilisé.' };
  }

  const newUser: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    username: trimmed,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    stats: {
      solo: { games: 0, wins: 0 },
      group: { games: 0, wins: 0 },
    },
  };

  users.push(newUser);
  saveRegisteredUsers(users);
  setCurrentUser(newUser);

  return { success: true, message: 'Compte créé avec succès !', user: newUser };
};

export const loginUser = (
  username: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } => {
  const trimmed = username.trim();
  if (!trimmed) {
    return { success: false, message: "Veuillez entrer votre identifiant." };
  }

  const users = getRegisteredUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === trimmed.toLowerCase()
  );

  if (!user) {
    return { success: false, message: 'Identifiant inconnu.' };
  }

  if (user.passwordHash !== hashPassword(password)) {
    return { success: false, message: 'Mot de passe incorrect.' };
  }

  setCurrentUser(user);
  return { success: true, message: 'Connexion réussie !', user };
};

export const logoutUser = (): void => {
  setCurrentUser(null);
};

export const recordGameResult = (
  players: { name: string; isAI: boolean }[],
  winnerName: string,
  isGroupMode: boolean
): void => {
  const users = getRegisteredUsers();
  if (users.length === 0) return;

  let hasChanges = false;

  players.forEach((p) => {
    // Only registered players get their statistics updated
    if (p.isAI) return;

    const user = users.find(
      (u) => u.username.toLowerCase() === p.name.trim().toLowerCase()
    );

    if (user) {
      hasChanges = true;
      const targetStats = isGroupMode ? user.stats.group : user.stats.solo;
      targetStats.games += 1;

      if (p.name.trim().toLowerCase() === winnerName.trim().toLowerCase()) {
        targetStats.wins += 1;
      }
    }
  });

  if (hasChanges) {
    saveRegisteredUsers(users);
  }
};
