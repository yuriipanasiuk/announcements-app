export type AnnouncementCategory = 'sale' | 'buy' | 'rent' | 'services';

export type createAnnouncementType = {
  title: string;
  description: string;
  price: number;
  category: AnnouncementCategory;
};

export type updateAnnouncementType = Partial<createAnnouncementType>;
