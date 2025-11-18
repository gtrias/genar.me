/**
 * LiveStore Client
 * Event-sourced database client for tracking user interactions and state
 * 
 * Note: This is a simplified implementation. For production, you would use
 * the actual LiveStore library. This provides the interface and basic
 * localStorage-based implementation as a fallback.
 */

export interface Event {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface CommandExecutedEvent extends Event {
  type: 'command_executed';
  data: {
    cmd: string;
    args: string[];
    cwd: string;
    exit_code: number;
    duration_ms?: number;
  };
}

export interface FileCreatedEvent extends Event {
  type: 'file_created';
  data: {
    path: string;
    size: number;
  };
}

export interface FileModifiedEvent extends Event {
  type: 'file_modified';
  data: {
    path: string;
  };
}

export interface FileDeletedEvent extends Event {
  type: 'file_deleted';
  data: {
    path: string;
  };
}

export interface DirectoryChangedEvent extends Event {
  type: 'directory_changed';
  data: {
    from: string;
    to: string;
  };
}

export interface AchievementEarnedEvent extends Event {
  type: 'achievement_earned';
  data: {
    id: string;
    name: string;
  };
}

export interface SessionStartedEvent extends Event {
  type: 'session_started';
  data: {
    user_agent: string;
  };
}

export interface SessionEndedEvent extends Event {
  type: 'session_ended';
  data: {
    duration: number;
  };
}

export type AnyEvent = 
  | CommandExecutedEvent
  | FileCreatedEvent
  | FileModifiedEvent
  | FileDeletedEvent
  | DirectoryChangedEvent
  | AchievementEarnedEvent
  | SessionStartedEvent
  | SessionEndedEvent;

export interface UserProgress {
  total_commands: number;
  unique_commands: string[];
  files_created: number;
  files_modified: number;
  achievements: Achievement[];
  first_visit: number | null;
  last_visit: number | null;
  total_sessions: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earned_at: number | null;
  category: string;
}

export class LiveStoreClient {
  private events: AnyEvent[] = [];
  private initialized: boolean = false;
  private readonly STORAGE_KEY = 'genar-terminal-events';
  private readonly PROGRESS_KEY = 'genar-terminal-progress';

  /**
   * Initialize LiveStore client
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Load events from storage
    this.loadEvents();
    
    // Log session start
    await this.logEvent({
      type: 'session_started',
      data: {
        user_agent: navigator.userAgent
      }
    });

    this.initialized = true;
  }

  /**
   * Log an event
   */
  async logEvent(event: Omit<AnyEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: AnyEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    } as AnyEvent;

    this.events.push(fullEvent);
    this.saveEvents();

    // Update materialized views
    this.updateProgress(fullEvent);
  }

  /**
   * Get all events
   */
  getEvents(): AnyEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType<T extends AnyEvent>(type: string): T[] {
    return this.events.filter(e => e.type === type) as T[];
  }

  /**
   * Get user progress (materialized view)
   */
  getUserProgress(): UserProgress {
    const stored = localStorage.getItem(this.PROGRESS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through to default
      }
    }

    // Calculate from events if not stored
    return this.calculateProgress();
  }

  /**
   * Get command history with metadata
   */
  getCommandHistory(): CommandExecutedEvent[] {
    return this.getEventsByType<CommandExecutedEvent>('command_executed');
  }

  /**
   * Get achievements
   */
  getAchievements(): Achievement[] {
    const progress = this.getUserProgress();
    return progress.achievements;
  }

  /**
   * Check if achievement is earned
   */
  hasAchievement(id: string): boolean {
    const achievements = this.getAchievements();
    const achievement = achievements.find(a => a.id === id);
    return achievement?.earned ?? false;
  }

  /**
   * Earn an achievement
   */
  async earnAchievement(id: string, name: string, description: string, category: string = 'general'): Promise<void> {
    if (this.hasAchievement(id)) {
      return; // Already earned
    }

    await this.logEvent({
      type: 'achievement_earned',
      data: { id, name }
    });
  }

  /**
   * Save events to storage
   */
  private saveEvents(): void {
    try {
      // Keep only last 10000 events to prevent storage bloat
      const eventsToSave = this.events.slice(-10000);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  }

  /**
   * Load events from storage
   */
  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      this.events = [];
    }
  }

  /**
   * Calculate user progress from events
   */
  private calculateProgress(): UserProgress {
    const commandEvents = this.getEventsByType<CommandExecutedEvent>('command_executed');
    const fileCreatedEvents = this.getEventsByType<FileCreatedEvent>('file_created');
    const fileModifiedEvents = this.getEventsByType<FileModifiedEvent>('file_modified');
    const achievementEvents = this.getEventsByType<AchievementEarnedEvent>('achievement_earned');
    const sessionEvents = this.getEventsByType<SessionStartedEvent>('session_started');

    const uniqueCommands = new Set(commandEvents.map(e => e.data.cmd));
    const timestamps = this.events.map(e => e.timestamp).filter(t => t > 0);

    // Create a set of earned achievement IDs from events (to avoid recursion)
    const earnedAchievementIds = new Set(achievementEvents.map(e => e.data.id));

    const achievements: Achievement[] = [
      {
        id: 'first_command',
        name: 'First Command',
        description: 'Run your first command',
        earned: earnedAchievementIds.has('first_command') || commandEvents.length > 0,
        earned_at: commandEvents.length > 0 ? commandEvents[0]?.timestamp || null : null,
        category: 'general'
      },
      {
        id: 'explorer',
        name: 'Explorer',
        description: 'Visit 10 different directories',
        earned: earnedAchievementIds.has('explorer'),
        earned_at: earnedAchievementIds.has('explorer') 
          ? achievementEvents.find(e => e.data.id === 'explorer')?.timestamp || null 
          : null,
        category: 'filesystem'
      },
      {
        id: 'reader',
        name: 'Reader',
        description: 'Read 5 different files',
        earned: earnedAchievementIds.has('reader'),
        earned_at: earnedAchievementIds.has('reader')
          ? achievementEvents.find(e => e.data.id === 'reader')?.timestamp || null
          : null,
        category: 'filesystem'
      },
      {
        id: 'creator',
        name: 'Creator',
        description: 'Create your first file',
        earned: earnedAchievementIds.has('creator') || fileCreatedEvents.length > 0,
        earned_at: fileCreatedEvents.length > 0 ? fileCreatedEvents[0]?.timestamp || null : null,
        category: 'filesystem'
      },
      {
        id: 'rtfm',
        name: 'RTFM',
        description: 'Read the help documentation',
        earned: earnedAchievementIds.has('rtfm') || commandEvents.some(e => e.data.cmd === 'help'),
        earned_at: commandEvents.find(e => e.data.cmd === 'help')?.timestamp || null,
        category: 'general'
      },
      {
        id: 'power_user',
        name: 'Power User',
        description: 'Run 100 commands',
        earned: earnedAchievementIds.has('power_user') || commandEvents.length >= 100,
        earned_at: commandEvents.length >= 100 
          ? (achievementEvents.find(e => e.data.id === 'power_user')?.timestamp || Date.now())
          : null,
        category: 'general'
      }
    ];

    // Update earned achievements from events
    achievementEvents.forEach(event => {
      const achievement = achievements.find(a => a.id === event.data.id);
      if (achievement) {
        achievement.earned = true;
        achievement.earned_at = event.timestamp;
      }
    });

    const progress: UserProgress = {
      total_commands: commandEvents.length,
      unique_commands: Array.from(uniqueCommands),
      files_created: fileCreatedEvents.length,
      files_modified: fileModifiedEvents.length,
      achievements,
      first_visit: timestamps.length > 0 ? Math.min(...timestamps) : null,
      last_visit: timestamps.length > 0 ? Math.max(...timestamps) : null,
      total_sessions: sessionEvents.length
    };

    // Save progress
    try {
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }

    return progress;
  }

  /**
   * Update progress when new event is logged
   */
  private updateProgress(event: AnyEvent): void {
    const progress = this.getUserProgress();
    
    if (event.type === 'command_executed') {
      progress.total_commands++;
      const cmd = (event as CommandExecutedEvent).data.cmd;
      if (!progress.unique_commands.includes(cmd)) {
        progress.unique_commands.push(cmd);
      }
    } else if (event.type === 'file_created') {
      progress.files_created++;
    } else if (event.type === 'file_modified') {
      progress.files_modified++;
    } else if (event.type === 'session_started') {
      progress.total_sessions++;
      if (!progress.first_visit) {
        progress.first_visit = event.timestamp;
      }
      progress.last_visit = event.timestamp;
    }

    // Recalculate achievements
    const newProgress = this.calculateProgress();
    progress.achievements = newProgress.achievements;
  }

  /**
   * Generate unique ID for events
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.events = [];
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
  }
}

