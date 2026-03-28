import { Pet, Shelter } from './types';

export const MOCK_SHELTERS: Shelter[] = [
  {
    id: 'shelter-1',
    name: '快樂爪印收容所',
    email: 'contact@happypaws.org',
    whatsapp: '1234567890',
    location: '台北市大安區',
    description: '我們是一家致力於為流浪貓狗尋找溫暖家庭的非營利組織。',
    logo: 'https://picsum.photos/seed/shelter1/200/200'
  },
  {
    id: 'shelter-2',
    name: '毛孩之家',
    email: 'info@whiskerswings.com',
    whatsapp: '0987654321',
    location: '新北市板橋區',
    description: '專注於幼貓救援與小型鳥類復育。',
    logo: 'https://picsum.photos/seed/shelter2/200/200'
  }
];

export const MOCK_PETS: Pet[] = [
  {
    id: 'pet-1',
    shelterId: 'shelter-1',
    name: '阿福',
    type: 'dog',
    breed: '黃金獵犬',
    age: '2 歲',
    gender: 'male',
    size: 'large',
    description: '阿福是一隻非常友善且活力充沛的狗狗，喜歡玩接球和長途散步。他對小孩和其他狗狗都非常有耐心。',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800'],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pet-2',
    shelterId: 'shelter-1',
    name: '露娜',
    type: 'cat',
    breed: '暹羅貓',
    age: '6 個月',
    gender: 'female',
    size: 'small',
    description: '露娜是一隻甜美且愛說話的小貓，正在尋找一個安靜的家，在那裡她可以得到很多的抱抱。',
    images: ['https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800'],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pet-3',
    shelterId: 'shelter-2',
    name: '小奧利',
    type: 'rabbit',
    breed: '荷蘭垂耳兔',
    age: '1 歲',
    gender: 'male',
    size: 'small',
    description: '小奧利是一隻冷靜的兔子，喜歡新鮮蔬菜和溫柔的摸摸。',
    images: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800'],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pet-4',
    shelterId: 'shelter-2',
    name: '皮皮',
    type: 'bird',
    breed: '玄鳳鸚鵡',
    age: '3 歲',
    gender: 'female',
    size: 'small',
    description: '皮皮是一隻聰明的鸚鵡，會吹口哨，喜歡待在人的肩膀上。',
    images: ['https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=800'],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pet-5',
    shelterId: 'shelter-1',
    name: '小刺',
    type: 'other',
    breed: '非洲迷你刺蝟',
    age: '1.5 歲',
    gender: 'male',
    size: 'small',
    description: '小刺是一隻害羞但可愛的刺蝟，晚上很活躍，喜歡吃蟲子。',
    images: ['https://images.unsplash.com/photo-1559734840-f9509ee5677f?auto=format&fit=crop&q=80&w=800'],
    status: 'available',
    createdAt: new Date().toISOString()
  }
];
