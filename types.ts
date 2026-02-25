export interface NavItem {
  label: string;
  href: string;
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  isPopular?: boolean;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  category: string;
}
