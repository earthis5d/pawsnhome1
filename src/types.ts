export type PetType = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';

export interface Shelter {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  location: string;
  description: string;
  logo?: string;
}

export interface Pet {
  id: string;
  shelterId: string;
  name: string;
  type: PetType;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  description: string;
  images: string[];
  status: 'available' | 'pending' | 'adopted';
  createdAt: string;
}

export interface Message {
  id: string;
  petId: string;
  shelterId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: string;
}
