import { countries } from '@/app/data/countries';
import { Circle, HelpCircle } from 'lucide-react';

export const tourTypes = [
  {
    value: 'dayTour',
    label: 'Day Tour',
    icon: HelpCircle
  },
  {
    value: 'global',
    label: 'Global',
    icon: Circle
  }
];

export const countryList = countries.map((country) => ({
  value: country.name,
  label: country.name
}));

export const tourStatus = [
  {
    value: 'published',
    label: 'Published'
  },
  {
    value: 'unpublished',
    label: 'Unpublished'
  }
];
