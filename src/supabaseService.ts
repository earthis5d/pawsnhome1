import { supabase } from './supabase';
import { Pet, Shelter } from './types';

export const fetchShelters = async (): Promise<Shelter[]> => {
  const { data, error } = await supabase
    .from('shelters')
    .select('*');

  if (error) {
    console.error('Error fetching shelters:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    email: item.email,
    whatsapp: item.whatsapp,
    location: item.location,
    description: item.description,
    logo: item.logo_url,
  }));
};

export const fetchPets = async (): Promise<Pet[]> => {
  const { data, error } = await supabase
    .from('pets')
    .select('*');

  if (error) {
    console.error('Error fetching pets:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    shelterId: item.shelter_id,
    name: item.name,
    type: item.type,
    breed: item.breed,
    age: item.age,
    gender: item.gender,
    size: item.size,
    description: item.description,
    images: item.images,
    status: item.status,
    createdAt: item.created_at,
  }));
};

export const sendMessage = async (message: {
  petId: string;
  shelterId: string;
  userName: string;
  userEmail: string;
  message: string;
}) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      pet_id: message.petId,
      shelter_id: message.shelterId,
      user_name: message.userName,
      user_email: message.userEmail,
      message: message.message,
    }]);

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
};

export const getShelterByEmail = async (email: string): Promise<Shelter | null> => {
  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching shelter by email:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    location: data.location,
    description: data.description,
    logo: data.logo_url,
  };
};

export const getShelterById = async (id: string): Promise<Shelter | null> => {
  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching shelter by id:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    location: data.location,
    description: data.description,
    logo: data.logo_url,
  };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signUp = async (email: string, password: string, shelterData: Omit<Shelter, 'id' | 'email'>) => {
  console.log('Supabase Auth SignUp starting...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Supabase Auth Error:', authError);
    throw authError;
  }

  console.log('Supabase Auth Success, user ID:', authData.user?.id);

  if (authData.user) {
    console.log('Inserting shelter record into database...');
    const { error: dbError } = await supabase
      .from('shelters')
      .insert([{
        id: authData.user.id,
        email,
        name: shelterData.name,
        whatsapp: shelterData.whatsapp,
        location: shelterData.location,
        description: shelterData.description,
        logo_url: shelterData.logo,
      }]);

    if (dbError) {
      console.error('Supabase DB Error (shelters insert):', dbError);
      throw dbError;
    }
    console.log('Shelter record inserted successfully.');
  }

  return authData;
};

export const uploadPetPhoto = async (file: File, shelterId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${shelterId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('pet-photos')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('pet-photos')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const addPet = async (pet: Omit<Pet, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('pets')
    .insert([{
      shelter_id: pet.shelterId,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      size: pet.size,
      description: pet.description,
      images: pet.images,
      status: pet.status,
    }])
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    shelterId: data.shelter_id,
    name: data.name,
    type: data.type,
    breed: data.breed,
    age: data.age,
    gender: data.gender,
    size: data.size,
    description: data.description,
    images: data.images,
    status: data.status,
    createdAt: data.created_at,
  };
};

export const updatePet = async (id: string, pet: Partial<Pet>) => {
  const updateData: any = {};
  if (pet.name) updateData.name = pet.name;
  if (pet.type) updateData.type = pet.type;
  if (pet.breed) updateData.breed = pet.breed;
  if (pet.age) updateData.age = pet.age;
  if (pet.gender) updateData.gender = pet.gender;
  if (pet.size) updateData.size = pet.size;
  if (pet.description) updateData.description = pet.description;
  if (pet.images) updateData.images = pet.images;
  if (pet.status) updateData.status = pet.status;

  const { data, error } = await supabase
    .from('pets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    shelterId: data.shelter_id,
    name: data.name,
    type: data.type,
    breed: data.breed,
    age: data.age,
    gender: data.gender,
    size: data.size,
    description: data.description,
    images: data.images,
    status: data.status,
    createdAt: data.created_at,
  };
};

export const deletePet = async (id: string) => {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
