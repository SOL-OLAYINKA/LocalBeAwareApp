export interface Database {
  public: {
    Tables: {
      cycle_entries: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          type: 'period' | 'ovulation';
          flow_intensity: 'light' | 'medium' | 'heavy' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables['cycle_entries']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables['cycle_entries']['Insert']>;
      };
      cycle_preferences: {
        Row: {
          id: string;
          user_id: string;
          average_cycle_length: number;
          notify_period_reminder: boolean;
          notify_ovulation_reminder: boolean;
          notify_log_reminder: boolean;
          notification_sound_period: string;
          notification_sound_ovulation: string;
          notification_sound_log: string;
          notification_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables['cycle_preferences']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables['cycle_preferences']['Insert']>;
      };
    };
  };
}