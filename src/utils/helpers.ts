import { format, parse, isAfter, isBefore } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return format(d, 'MMM dd, yyyy');
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return format(d, 'MMM dd, yyyy HH:mm');
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return format(d, 'HH:mm');
};

/**
 * Check if election is currently active
 */
export const isElectionActive = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  return isAfter(now, start) && isBefore(now, end);
};

/**
 * Check if election is scheduled to start
 */
export const isElectionScheduled = (startTime: string): boolean => {
  const now = new Date();
  const start = new Date(startTime);

  return isAfter(start, now);
};

/**
 * Check if election has ended
 */
export const isElectionEnded = (endTime: string): boolean => {
  const now = new Date();
  const end = new Date(endTime);

  return isAfter(now, end);
};

/**
 * Calculate time remaining
 */
export const getTimeRemaining = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
};

/**
 * Validate official university email strictly
 * Pattern: 20[Year]a[CourseCode][f/gf]@kab.ac.ug
 * Example: 2024abc123f@kab.ac.ug
 */
export const isValidEmailDomain = (email: string): boolean => {
  const studentEmailRegex = /^20\d{2}a[a-z0-9]+(f|gf)@kab\.ac\.ug$/i;
  return studentEmailRegex.test(email.trim());
};

/**
 * Extract domain from email
 */
export const getEmailDomain = (email: string): string => {
  return email.substring(email.lastIndexOf('@'));
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

/**
 * Format candidate name
 */
export const formatCandidateName = (name: string): string => {
  return name.trim();
};

/**
 * Truncate text
 */
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate consistent voter ID from email (anonymized)
 * Using simple hash to ensure same email always generates same ID
 */
export const generateVoterId = (email: string): string => {
  let hash = 0;
  const str = email.toLowerCase();

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `voter_${Math.abs(hash).toString(16).padStart(8, '0')}`;
};

/**
 * Format bytes
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Convert file to base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validate file type
 */
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Validate file size (in MB)
 */
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};
