export type TCategory = {
  id: string;
  parentID: string | null;
  name: string;
  url: string;
};

export type TGroupJSON = {
  group: TCategory;
  categories: categoryJSON[];
};
type categoryJSON = {
  category: TCategory;
  subCategories: TCategory[];
};

export type TFeaturedCategory = {
  id: string;
  categoryID: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: TCategory;
};

export type TNavbarItem = {
  name: string;
  link: string;
};
