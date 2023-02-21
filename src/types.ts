export interface PsGamePrice {
    id?: string;
    discounted_price?: number | null;
    discounted_price_ps_plus?: number | null;
    discounted_percent?: number | null;
    discounted_percent_ps_plus?: number | null;
    created_at?: Date;
    updated_at?: Date;
    start_at?: Date | null;
    end_at?: Date | null;
    ps_game_id?: number;
    base_price?: number;
    is_available?: boolean | null;
}

export interface PsGame {
  id?: string;
  title?: string;
  item_type?: string | null;
  description?: string | null;
  store_region?: string | null;
  platform_ps_5?: boolean;
  platform_ps_4?: boolean;
  platform_ps_3?: boolean;
  platform_vita?: boolean;
  platform_psp?: boolean;
  store_guid?: string | null;
  release_date?: Date | null;
  genres?: string | null;
  developer?: string | null;
  cheats_url?: string | null;
  screen_lang_options?: string | null;
  voice_lang_options?: string | null;
  meta_critic_url?: string | null;
  rating_ps?: {
    score?: number | null;
    count?: number | null;
  } | null;
  rating_mc_user_score?: {
    score?: number | null;
    count?: number | null;
  } | null;
  rating_mc_score?: {
    score?: number | null;
    count?: number | null;
  } | null;
  whats_inside?: string | null;
  compatibilities?: string | null;
  content_rating?: string | null;
  content_rating_description?: string | null;
  currency?: string | null;
  price_full?: string | null;
  price_discount?: string | null;
  price_discount_ps_plus_extra?: string | null;
  price_discount_percent?: string | null;
  price_discount_percent_ps_plus_extra?: string | null;
  is_ps_plus_extra_included?: string | null;
  is_ea_play_included?: string | null;
  price_discount_end_at?: string | null;
  img_bg?: string | null;
  img_cover?: string | null;
  raw_ps_deals?: string | null;
  short_description?: string | null;
  compatibility_by_platform_json?: object | null;
  media_json?: object | null;
  created_at?: Date;
  updated_at?: Date;
  published_at?: Date;
  locale?: string;
  raw_ps_deals_json?: string | null; // tmp
  game_in_other_regions_json?: string | null; // tmp
  content_rating_json?: string | null; // tmp
};

export enum PsGameQueueTopic {
  PRICE_UPDATE = "PRICE_UPDATE",
  ADD_GAME = "ADD_GAME",
}

export enum PsGameQueueStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface PsGameQueue {
  id?: string;
  store_guid: string;
  store_region: string;
  topic: PsGameQueueTopic;
  status?: PsGameQueueStatus;
  message?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by_id?: string;
  updated_by_id?: string;
}