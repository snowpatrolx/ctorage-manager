export interface Item {
  id?: number;
  name: string;
  categoryId?: number;
  locationId?: number;
  quantity: number;
  notes: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Location {
  id?: number;
  name: string;
  parentId?: number;
  level: number;
  createdAt: Date;
}

export interface LocationWithChildren extends Location {
  children: LocationWithChildren[];
}

export interface ExportItem {
  名称: string;
  分类: string;
  位置: string;
  数量: number;
  备注: string;
  创建时间: string;
}
