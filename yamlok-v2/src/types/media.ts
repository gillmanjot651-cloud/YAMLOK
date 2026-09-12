export type ImageCategory = 'Thumbnail' | 'Cinematic' | 'Graphic';

export interface MediaImage {
  id:       string;
  src:      string;
  alt:      string;
  category?: ImageCategory;
}

export interface VideoYT {
  id:    string;
  type:  'youtube';
  title: string;
}

export interface VideoDirect {
  type:  'direct';
  src:   string;
  title: string;
  thumb?: string;
}

export type MediaVideo = VideoYT | VideoDirect;

export interface HeroData {
  badge:       string;
  description: string;
  roles:       string[];
  heroBg:      string;
}

export interface AboutData {
  bio:        string;
  skills:     string[];
  extraLines: string[];
}

export interface SocialLink {
  label: string;
  title: string;
  href:  string;
}

export interface ContactData {
  email:       string;
  discord:     string;
  tagline:     string;
  graphicMin:  string;
  graphicMax:  string;
  videoMin:    string;
  videoMax:    string;
  socials:     SocialLink[];
}

export interface MediaData {
  hero?:     HeroData;
  about?:    AboutData;
  contact?:  ContactData;
  images:    MediaImage[];
  videos:    MediaVideo[];
}
