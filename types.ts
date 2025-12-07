export interface Slide4Summary {
  title: string;
  insight: string;
  headers: string[]; // e.g. ["8月", "9月", "10月"]
  metrics: {
    label: string;
    values: (string | number)[];
  }[];
}

export interface Slide5PageRanking {
  insight: string;
  ranking: {
    rank: number;
    url: string;
    views: number;
  }[];
}

export interface Slide7VideoRanking {
  insight: string;
  ranking: {
    rank: number;
    title: string;
    views: number;
  }[];
}

export interface Slide10Engagement {
  insight: string;
  metrics: {
    avg_session_duration_multiplier: string; // e.g. "2.9"
    pv_per_user_multiplier: string;
    return_rate_multiplier: string;
    session_pv_multiplier: string;
  };
  table_rows: {
    metric_name: string;
    viewer_value: string;
    non_viewer_value: string;
    multiplier: string;
  }[];
}

export interface Slide11Conversion {
  insight: string;
  viewer_cvr: string;
  non_viewer_cvr: string;
  multiplier: string; // e.g. "9.1"
  table_data: {
    total_users_viewer: number;
    total_users_non_viewer: number;
    cv_users_viewer: number;
    cv_users_non_viewer: number;
  }
}

export interface ReportData {
  slide_4_summary: Slide4Summary;
  slide_5_page_ranking: Slide5PageRanking;
  slide_7_video_ranking: Slide7VideoRanking;
  slide_10_engagement: Slide10Engagement;
  slide_11_conversion: Slide11Conversion;
}

export enum AppState {
  IDLE,
  ANALYZING,
  REVIEW,
  GENERATING_PPTX
}