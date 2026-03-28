/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Heart, MapPin, MessageCircle, LogIn, Plus, LogOut, ChevronRight, Filter, X, Menu, Mail, Camera, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PETS, MOCK_SHELTERS } from './mockData';
import { Pet, Shelter, PetType } from './types';
import { cn } from './lib/utils';
import { 
  fetchPets, 
  fetchShelters, 
  sendMessage, 
  getShelterByEmail, 
  signIn, 
  signOut, 
  getCurrentUser, 
  getShelterById, 
  signUp,
  addPet,
  updatePet,
  deletePet,
  uploadPetPhoto
} from './supabaseService';
import { supabase } from './supabase';

// --- Components ---

const StatusMessage = ({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) => {
  if (!message) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl mb-6 text-sm font-medium",
        type === 'success' ? "bg-green-50 text-green-700 border border-green-100" :
        type === 'error' ? "bg-red-50 text-red-700 border border-red-100" :
        "bg-blue-50 text-blue-700 border border-blue-100"
      )}
    >
      {message}
    </motion.div>
  );
};

const Navbar = ({ shelter, onLogout, favoriteCount }: { shelter: Shelter | null; onLogout: () => void; favoriteCount: number }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-zinc-900">寵物有家</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">尋找毛孩</Link>
            <Link to="/favorites" className="relative text-sm font-medium text-zinc-600 hover:text-primary transition-colors flex items-center">
              我的收藏
              {favoriteCount > 0 && (
                <span className="ml-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </Link>
            {shelter ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">管理後台</Link>
                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>登出</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-4 py-2 border border-primary text-sm font-medium rounded-full text-primary hover:bg-primary hover:text-white transition-all"
              >
                <LogIn className="w-4 h-4 mr-2" />
                收容所登入
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-zinc-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-purple-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              <Link to="/" className="block text-lg font-medium text-zinc-900" onClick={() => setIsMenuOpen(false)}>尋找毛孩</Link>
              <Link to="/favorites" className="block text-lg font-medium text-zinc-900" onClick={() => setIsMenuOpen(false)}>我的收藏</Link>
              {shelter ? (
                <>
                  <Link to="/dashboard" className="block text-lg font-medium text-zinc-900" onClick={() => setIsMenuOpen(false)}>管理後台</Link>
                  <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block text-lg font-medium text-red-600">登出</button>
                </>
              ) : (
                <Link to="/login" className="block text-lg font-medium text-zinc-900" onClick={() => setIsMenuOpen(false)}>收容所登入</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface PetCardProps {
  pet: Pet;
  shelter?: Shelter;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, shelter, isFavorite = false, onToggleFavorite = (_id: string) => {} }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group bg-white rounded-3xl overflow-hidden border border-purple-50 shadow-sm hover:shadow-xl transition-all duration-300"
  >
    <div className="relative aspect-[4/5] overflow-hidden">
      <Link to={`/pet/${pet.id}`}>
        <img 
          src={pet.images[0]} 
          alt={pet.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
          {pet.type === 'dog' ? '狗狗' : pet.type === 'cat' ? '貓咪' : pet.type === 'rabbit' ? '兔子' : pet.type === 'bird' ? '鳥類' : '其他'}
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(pet.id);
          }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg",
            isFavorite ? "bg-primary text-white" : "bg-white/90 text-zinc-400 hover:text-primary"
          )}
        >
          <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
        </button>
      </div>
    </div>
    <Link to={`/pet/${pet.id}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-serif font-bold text-zinc-900">{pet.name}</h3>
          <span className="text-xs font-medium text-zinc-400">{pet.age}</span>
        </div>
        <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{pet.breed} • {pet.gender === 'male' ? '公' : '母'}</p>
        <div className="flex items-center text-xs text-zinc-400">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{shelter?.location || '未知地點'}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// --- Pages ---

const HomePage = ({ pets, shelters, favorites, onToggleFavorite }: { pets: Pet[]; shelters: Shelter[]; favorites: string[]; onToggleFavorite: (id: string) => void }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PetType | 'all'>('all');

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const matchesSearch = pet.name.toLowerCase().includes(search.toLowerCase()) || 
                            pet.breed.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || pet.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [pets, search, typeFilter]);

  return (
    <div className="min-h-screen bg-[#fdfaff]">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-zinc-900 mb-6 leading-tight"
          >
            遇見你的 <br />
            <span className="italic text-primary">最佳夥伴</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-600 mb-10 max-w-2xl mx-auto"
          >
            連結溫暖的家與收容所的毛孩。今天就開啟你的領養之旅。
          </motion.p>

          {/* Search & Filter */}
          <div className="max-w-2xl mx-auto bg-white p-2 rounded-full shadow-xl border border-purple-50 flex items-center">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-zinc-400 mr-2" />
              <input 
                type="text" 
                placeholder="搜尋品種或名字..." 
                className="w-full bg-transparent border-none focus:ring-0 text-zinc-900 placeholder-zinc-400 py-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="h-8 w-px bg-zinc-200 hidden sm:block" />
            <select 
              className="bg-transparent border-none focus:ring-0 text-zinc-600 text-sm px-6 hidden sm:block cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">所有毛孩</option>
              <option value="dog">狗狗</option>
              <option value="cat">貓咪</option>
              <option value="rabbit">兔子</option>
              <option value="bird">鳥類</option>
              <option value="other">其他</option>
            </select>
            <button className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-hover transition-colors">
              搜尋
            </button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Pet Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-zinc-900">待領養毛孩</h2>
            <p className="text-zinc-500 mt-1">共有 {filteredPets.length} 隻毛孩正在尋找新家</p>
          </div>
          <div className="flex space-x-2">
            {[
              { id: 'all', label: '全部' },
              { id: 'dog', label: '狗狗' },
              { id: 'cat', label: '貓咪' },
              { id: 'rabbit', label: '兔子' },
              { id: 'other', label: '其他' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id as any)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  typeFilter === type.id 
                    ? "bg-primary text-white" 
                    : "bg-white text-zinc-400 hover:bg-purple-50"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPets.map(pet => (
            <PetCard 
              key={pet.id} 
              pet={pet} 
              isFavorite={favorites.includes(pet.id)}
              onToggleFavorite={onToggleFavorite}
              shelter={shelters.find(s => s.id === pet.shelterId)} 
            />
          ))}
        </div>

        {filteredPets.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-400 text-lg italic">找不到符合條件的毛孩。</p>
          </div>
        )}
      </section>
    </div>
  );
};

const FavoritesPage = ({ pets, shelters, favorites, onToggleFavorite }: { pets: Pet[]; shelters: Shelter[]; favorites: string[]; onToggleFavorite: (id: string) => void }) => {
  const favoritePets = pets.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-[#fdfaff] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-4">我的收藏</h1>
          <p className="text-lg text-zinc-500">您感興趣的毛孩們都在這裡</p>
        </div>

        {favoritePets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favoritePets.map(pet => (
              <PetCard 
                key={pet.id} 
                pet={pet} 
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                shelter={shelters.find(s => s.id === pet.shelterId)} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border border-purple-50 shadow-sm">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-zinc-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-4">目前沒有收藏</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              在探索頁面看到喜歡的毛孩，點擊愛心按鈕即可將牠們加入收藏清單。
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg"
            >
              去逛逛毛孩
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const ShelterProfilePage = ({ pets, shelters, favorites, onToggleFavorite }: { pets: Pet[]; shelters: Shelter[]; favorites: string[]; onToggleFavorite: (id: string) => void }) => {
  const { id } = useParams();
  const shelter = shelters.find(s => s.id === id);
  const shelterPets = pets.filter(p => p.shelterId === id);

  if (!shelter) return <div className="p-20 text-center">找不到收容所</div>;

  return (
    <div className="min-h-screen bg-[#fdfaff]">
      {/* 收容所頂部橫幅 */}
      <section className="bg-white border-b border-purple-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <motion.img 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={shelter.logo} 
              className="w-40 h-40 rounded-[40px] object-cover border-4 border-purple-50 shadow-2xl" 
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-4">{shelter.name}</h1>
              <div className="flex items-center justify-center md:justify-start text-zinc-500 mb-6 space-x-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <span>{shelter.location}</span>
                </div>
                <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                <div className="font-bold text-primary">{shelterPets.length} 隻毛孩待領養</div>
              </div>
              <p className="text-lg text-zinc-600 max-w-2xl italic leading-relaxed">
                "{shelter.description}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 聯絡資訊與毛孩列表 */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* 左側聯絡欄 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-purple-100 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">聯絡資訊</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase">WhatsApp</p>
                  <p className="text-zinc-900 font-medium">{shelter.whatsapp}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase">電子郵件</p>
                  <p className="text-zinc-900 font-medium break-all">{shelter.email}</p>
                </div>
              </div>
            </div>
            <a 
              href={`https://wa.me/${shelter.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>立即諮詢</span>
            </a>
          </div>
        </div>

        {/* 右側毛孩列表 */}
        <div className="lg:col-span-3">
          <h2 className="text-3xl font-serif font-bold text-zinc-900 mb-8">我們正在尋找新家的毛孩</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {shelterPets.map(pet => (
              <PetCard 
                key={pet.id} 
                pet={pet} 
                shelter={shelter} 
                isFavorite={favorites.includes(pet.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const PetDetailPage = ({ pets, shelters, favorites, onToggleFavorite }: { pets: Pet[]; shelters: Shelter[]; favorites: string[]; onToggleFavorite: (id: string) => void }) => {
  const { id } = useParams();
  const pet = pets.find(p => p.id === id);
  const shelter = shelters.find(s => s.id === pet?.shelterId);
  const [messageSent, setMessageSent] = useState(false);
  const isFavorite = pet ? favorites.includes(pet.id) : false;

  if (!pet || !shelter) return <div className="p-20 text-center">找不到毛孩資料</div>;

  const whatsappUrl = `https://wa.me/${shelter.whatsapp}?text=您好，我對領養 ${pet.name} 很感興趣！`;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userName = formData.get('userName') as string;
    const userEmail = formData.get('userEmail') as string;
    const userMessage = formData.get('message') as string;

    try {
      await sendMessage({
        petId: pet.id,
        shelterId: shelter.id,
        userName,
        userEmail,
        message: userMessage,
      });
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 5000);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      alert('發送失敗，請稍後再試。');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/5] rounded-[40px] overflow-hidden bg-purple-50 shadow-2xl"
          >
            <img 
              src={pet.images[0]} 
              alt={pet.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => onToggleFavorite(pet.id)}
              className={cn(
                "absolute top-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                isFavorite ? "bg-primary text-white" : "bg-white/90 text-zinc-400 hover:text-primary"
              )}
            >
              <Heart className={cn("w-7 h-7", isFavorite && "fill-current")} />
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4">
              <span>{pet.type === 'dog' ? '狗狗' : pet.type === 'cat' ? '貓咪' : pet.type === 'rabbit' ? '兔子' : pet.type === 'bird' ? '鳥類' : '其他'}</span>
              <ChevronRight className="w-4 h-4" />
              <span>{pet.breed}</span>
            </div>
            <h1 className="text-6xl font-serif font-bold text-zinc-900 mb-4">{pet.name}</h1>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-purple-50 rounded-full text-sm font-medium text-primary">{pet.age}</span>
              <span className="px-4 py-2 bg-purple-50 rounded-full text-sm font-medium text-primary">{pet.gender === 'male' ? '公' : '母'}</span>
              <span className="px-4 py-2 bg-purple-50 rounded-full text-sm font-medium text-primary">{pet.size === 'large' ? '大型' : pet.size === 'medium' ? '中型' : '小型'}</span>
            </div>
          </div>

          <div className="prose prose-zinc mb-12">
            <h3 className="text-xl font-serif font-bold mb-4">關於 {pet.name}</h3>
            <p className="text-zinc-600 leading-relaxed text-lg italic">
              "{pet.description}"
            </p>
          </div>

          {/* Shelter Info & Contact */}
          <div className="bg-purple-50/50 p-8 rounded-[32px] border border-purple-100">
            <Link to={`/shelter/${shelter.id}`} className="flex items-center mb-6 group">
              <img 
                src={shelter.logo} 
                className="w-12 h-12 rounded-full mr-4 object-cover group-hover:scale-110 transition-transform" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{shelter.name}</h4>
                <p className="text-xs text-zinc-500">{shelter.location}</p>
              </div>
            </Link>
            
            <div className="space-y-4">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg w-full"
              >
                <MessageCircle className="w-5 h-5" />
                <span>透過 WhatsApp 聯繫</span>
              </a>
              
              <div className="pt-6 border-t border-purple-100">
                <h5 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-widest text-center">或留言給收容所</h5>
                {messageSent ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium text-center"
                  >
                    訊息已成功送出！收容所將會盡快與您聯繫。
                  </motion.div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <input 
                      name="userName"
                      type="text" 
                      placeholder="您的姓名" 
                      required
                      className="w-full bg-white border-purple-100 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary" 
                    />
                    <input 
                      name="userEmail"
                      type="email" 
                      placeholder="您的電子郵件" 
                      required
                      className="w-full bg-white border-purple-100 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary" 
                    />
                    <textarea 
                      name="message"
                      placeholder="您的訊息..." 
                      required
                      rows={3}
                      className="w-full bg-white border-purple-100 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"
                    ></textarea>
                    <button className="w-full bg-white border border-primary text-primary py-3 rounded-xl font-bold hover:bg-purple-50 transition-all">
                      送出訊息
                    </button>
                  </form>
                )}
              </div>

              <Link 
                to={`/shelter/${shelter.id}`}
                className="block text-center text-sm font-bold text-zinc-400 hover:text-primary transition-colors pt-4"
              >
                查看收容所簡介
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const isStripeKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.startsWith('sb_publishable_');
console.log(`[${new Date().toISOString()}] Supabase Config Check:`);
console.log('- Key (full):', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('- Key starts with:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 15) + '...');
console.log('- isStripeKey:', isStripeKey);
console.log('- URL:', import.meta.env.VITE_SUPABASE_URL);

const ShelterLoginPage = ({ onLogin }: { onLogin: (s: Shelter) => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStripeKey) {
      console.warn('Supabase key check failed (Stripe key detected), but proceeding anyway...');
      setStatus({ message: '警告：偵測到可能的 Supabase 金鑰設定錯誤。如果登入失敗，請檢查環境變數。', type: 'info' });
    }
    setLoading(true);
    setStatus(null);
    console.log('Login attempt for:', email);
    try {
      console.log('Calling signIn...');
      const signInData = await signIn(email, password);
      console.log('SignIn successful:', signInData);
      
      const user = signInData.user;
      console.log('User from signIn:', user);
      
      if (user) {
        console.log('Fetching shelter data for user ID:', user.id);
        const shelter = await getShelterById(user.id);
        console.log('Shelter data fetched:', shelter);
        
        if (shelter) {
          console.log('Login successful, setting shelter and navigating...');
          onLogin(shelter);
          navigate('/dashboard');
        } else {
          console.warn('User found in Auth but no shelter record in database.');
          setStatus({ message: '找不到對應的收容所資料，請確認您的帳號是否已註冊，或聯繫管理員。', type: 'error' });
        }
      } else {
        console.warn('SignIn succeeded but user is null.');
        setStatus({ message: '登入失敗，請確認您的帳號已驗證。', type: 'error' });
      }
    } catch (error: any) {
      console.error('Detailed Login error:', error);
      let friendlyMessage = error.message || '請檢查電子郵件與密碼。';
      
      if (error.message?.includes('Invalid login credentials')) {
        friendlyMessage = '電子郵件或密碼錯誤，請重新輸入或先註冊帳號。';
      } else if (error.message?.includes('Email not confirmed')) {
        friendlyMessage = '您的電子郵件尚未驗證，請檢查您的收件匣。';
      } else if (error.message?.includes('rate limit exceeded')) {
        friendlyMessage = '登入請求過於頻繁，請稍候幾分鐘再試。';
      }
      
      setStatus({ message: '登入失敗：' + friendlyMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaff] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-xl border border-purple-50"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900">收容所登入</h1>
          <p className="text-zinc-500 mt-2">管理您的刊登資料與訊息</p>
        </div>

        {status && <StatusMessage message={status.message} type={status.type} />}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">電子郵件</label>
            <input 
              type="email" 
              required
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="shelter@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">密碼</label>
            <input 
              type="password" 
              required
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        <div className="flex flex-col space-y-4">
          <button 
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const { data, error } = await supabase.from('shelters').select('count', { count: 'exact', head: true });
                if (error) throw error;
                setStatus({ message: `連線成功！資料庫中有 ${data?.length || 0} 個收容所。`, type: 'success' });
              } catch (error: any) {
                console.error('Connection test failed:', error);
                setStatus({ message: '連線失敗：' + (error.message || '請檢查您的網路或 Supabase 設定。'), type: 'error' });
              } finally {
                setLoading(false);
              }
            }}
            className="text-xs text-primary hover:underline"
          >
            測試資料庫連線
          </button>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-3xl font-bold hover:bg-primary-hover transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>登入管理後台</span>
            )}
          </button>
        </div>
          
          <button 
            type="button"
            onClick={() => {
              onLogin(MOCK_SHELTERS[0]);
              navigate('/dashboard');
            }}
            className="w-full bg-zinc-100 text-zinc-600 py-4 rounded-3xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center space-x-2"
          >
            <span>使用測試帳號登入 (Demo)</span>
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-zinc-400">
          還沒有帳號嗎？ <Link to="/register" className="text-primary font-bold">註冊您的收容所</Link>
        </div>
      </motion.div>
    </div>
  );
};

const ShelterRegisterPage = ({ onRegister }: { onRegister: (s: Shelter) => void }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    whatsapp: '',
    location: '',
    description: '',
    logo: 'https://picsum.photos/seed/new-shelter/200/200'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleRegister triggered');
    if (isStripeKey) {
      console.warn('Supabase key check failed (Stripe key detected) in handleRegister, but proceeding anyway...');
      setStatus({ message: '警告：偵測到可能的 Supabase 金鑰設定錯誤。如果註冊失敗，請檢查環境變數。', type: 'info' });
    }
    setLoading(true);
    setStatus(null);
    console.log('Starting registration for:', formData.email);
    try {
      const { email, password, ...shelterData } = formData;
      const result = await signUp(email, password, shelterData);
      console.log('SignUp result:', result);
      
      if (result.user && !result.session) {
        console.log('Registration successful, but email confirmation required.');
        setStatus({ message: '註冊成功！請檢查您的電子郵件以驗證帳號，驗證後即可登入。', type: 'success' });
        // Don't navigate away immediately so they can read the message
        return;
      }

      console.log('Checking current user...');
      const user = await getCurrentUser();
      console.log('Current user:', user);
      if (user) {
        console.log('Fetching shelter data for:', user.id);
        const shelter = await getShelterById(user.id);
        console.log('Shelter data:', shelter);
        if (shelter) {
          onRegister(shelter);
          setStatus({ message: '註冊成功！已自動為您登入。', type: 'success' });
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          console.warn('User found but no shelter record in database.');
          setStatus({ message: '註冊成功，但無法獲取收容所資料，請嘗試重新登入。', type: 'error' });
        }
      } else {
        console.warn('SignUp succeeded but getCurrentUser returned null.');
        setStatus({ message: '註冊成功！請嘗試登入。', type: 'success' });
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let friendlyMessage = error.message || '請檢查您的輸入。';
      if (error.message?.includes('rate limit exceeded')) {
        friendlyMessage = '請求過於頻繁，請稍候幾分鐘再試，或檢查您的電子郵件驗證信。';
      }
      setStatus({ message: '註冊失敗：' + friendlyMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaff] py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white p-10 rounded-[40px] shadow-xl border border-purple-50"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900">註冊收容所</h1>
          <p className="text-zinc-500 mt-2">加入「寵物有家」，為更多毛孩尋找溫暖的歸宿</p>
        </div>

        {status && <StatusMessage message={status.message} type={status.type} />}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">收容所名稱</label>
            <input 
              type="text" 
              required
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="例如：快樂爪印收容所"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">電子郵件</label>
            <input 
              type="email" 
              required
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="contact@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">密碼</label>
            <input 
              type="password" 
              required
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">WhatsApp</label>
            <input 
              type="text" 
              required
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="例如：0912345678"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">地點</label>
            <input 
              type="text" 
              required
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="例如：台北市大安區"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">收容所簡介</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
              placeholder="請簡短介紹您的收容所使命..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-3xl font-bold hover:bg-primary-hover transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>立即註冊</span>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm text-zinc-400">
          已經有帳號了？ <Link to="/login" className="text-primary font-bold">登入後台</Link>
        </div>
      </motion.div>
    </div>
  );
};
const PetForm = ({ 
  shelterId, 
  pet, 
  onSave, 
  onCancel 
}: { 
  shelterId: string; 
  pet?: Pet; 
  onSave: (pet: Pet) => void; 
  onCancel: () => void; 
}) => {
  const [loading, setLoading] = useState(false);
  console.log('PetForm initialized with shelterId:', shelterId);
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    type: pet?.type || 'dog' as PetType,
    breed: pet?.breed || '',
    age: pet?.age || '',
    gender: pet?.gender || 'male' as 'male' | 'female',
    size: pet?.size || 'medium' as 'small' | 'medium' | 'large',
    description: pet?.description || '',
    images: pet?.images || [] as string[],
    status: pet?.status || 'available' as 'available' | 'adopted',
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if we are in Demo Mode (mock shelter ID)
    if (shelterId.startsWith('shelter-')) {
      console.log('Demo Mode detected, using mock upload');
      setLoading(true);
      try {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUrl = `https://picsum.photos/seed/${Math.random()}/800/800`;
        setFormData(prev => ({ ...prev, images: [...prev.images, mockUrl] }));
        return;
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    try {
      const url = await uploadPetPhoto(file, shelterId);
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (error: any) {
      console.error('Photo upload failed:', error);
      let errorMessage = '照片上傳失敗';
      if (error.message === 'The resource was not found' || error.message?.includes('bucket')) {
        errorMessage = '上傳失敗：儲存空間 (Bucket) "pet-photos" 尚未建立。請在 Supabase 控制台建立此儲存空間並設為公開。';
      } else if (error.status === 403 || error.message?.includes('403')) {
        errorMessage = '上傳失敗：權限不足。請確保您已登入，且儲存空間已設定正確的 RLS 政策。';
      } else if (error.message) {
        errorMessage = `上傳失敗：${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check for Demo Mode (mock shelter ID)
      if (shelterId.startsWith('shelter-')) {
        console.log('Demo Mode: Simulating pet save');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPet: Pet = {
          ...formData,
          id: pet?.id || `pet-${Math.random().toString(36).substring(2, 9)}`,
          shelterId,
          createdAt: pet?.createdAt || new Date().toISOString(),
          status: formData.status as any // Ensure correct type
        };
        onSave(mockPet);
        return;
      }

      if (pet) {
        const updated = await updatePet(pet.id, formData);
        onSave(updated);
      } else {
        const added = await addPet({ ...formData, shelterId });
        onSave(added);
      }
    } catch (error: any) {
      console.error('Failed to save pet:', error);
      let errorMessage = '儲存失敗';
      if (error.message?.includes('violates foreign key constraint')) {
        errorMessage = '儲存失敗：收容所 ID 不存在。請確保您已正確登入。';
      } else if (error.message) {
        errorMessage = `儲存失敗：${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-serif font-bold text-zinc-900">
            {pet ? '編輯毛孩資料' : '新增毛孩刊登'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">名字</label>
              <input 
                type="text" 
                required
                className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">種類</label>
              <select 
                className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as PetType })}
              >
                <option value="dog">狗狗</option>
                <option value="cat">貓貓</option>
                <option value="rabbit">兔子</option>
                <option value="bird">鳥類</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">品種</label>
              <input 
                type="text" 
                required
                className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
                value={formData.breed}
                onChange={e => setFormData({ ...formData, breed: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">年齡</label>
              <input 
                type="text" 
                required
                className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
                placeholder="例如：2歲"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">性別</label>
              <select 
                className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              >
                <option value="male">男生</option>
                <option value="female">女生</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">簡介</label>
              <textarea 
                required
                rows={4}
                className="w-full bg-purple-50/50 border-purple-100 rounded-2xl px-4 py-4 focus:ring-primary focus:border-primary transition-all"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">照片</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img src={url} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-purple-100 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-all">
                  <Camera className="w-6 h-6 text-zinc-400 mb-2" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">上傳照片</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4 sticky bottom-0 bg-white pb-2">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 px-8 py-4 rounded-2xl font-bold text-zinc-400 hover:bg-zinc-50 transition-all"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>儲存刊登</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const ShelterDashboard = ({ shelter, pets, setPets }: { shelter: Shelter; pets: Pet[]; setPets: any }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | undefined>(undefined);
  const shelterPets = pets.filter(p => p.shelterId === shelter.id);

  const handleDelete = async (id: string) => {
    if (window.confirm('您確定要刪除此刊登嗎？')) {
      try {
        await deletePet(id);
        setPets(pets.filter(p => p.id !== id));
      } catch (error) {
        alert('刪除失敗');
      }
    }
  };

  const handleSave = (savedPet: Pet) => {
    if (editingPet) {
      setPets(pets.map(p => p.id === savedPet.id ? savedPet : p));
    } else {
      setPets([savedPet, ...pets]);
    }
    setIsFormOpen(false);
    setEditingPet(undefined);
  };

  return (
    <div className="min-h-screen bg-[#fdfaff] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zinc-900">歡迎回來，{shelter.name}</h1>
            <p className="text-zinc-500 mt-2">您目前有 {shelterPets.length} 個活躍的刊登</p>
          </div>
          <button 
            onClick={() => {
              setEditingPet(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>新增毛孩</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shelterPets.map(pet => (
            <div key={pet.id} className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm flex space-x-4">
              <img 
                src={pet.images[0]} 
                className="w-24 h-24 rounded-2xl object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-zinc-900">{pet.name}</h3>
                <p className="text-sm text-zinc-500 mb-4">{pet.breed}</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => {
                      setEditingPet(pet);
                      setIsFormOpen(true);
                    }}
                    className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>編輯</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(pet.id)}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>刪除</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  pet.status === 'available' ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                )}>
                  {pet.status === 'available' ? '待領養' : '已領養'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <PetForm 
              shelterId={shelter.id} 
              pet={editingPet}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingPet(undefined);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [currentShelter, setCurrentShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pet_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to parse favorites from localStorage:', error);
      return [];
    }
  });
  const loadingRef = React.useRef(true);

  useEffect(() => {
    localStorage.setItem('pet_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('Starting to load data from Supabase...');
      
      // Add a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        if (loadingRef.current) {
          console.warn('Data loading timed out, falling back to mock data.');
          setPets(MOCK_PETS);
          setShelters(MOCK_SHELTERS);
          setLoading(false);
          loadingRef.current = false;
        }
      }, 5000);

      try {
        const [dbPets, dbShelters] = await Promise.all([
          fetchPets().catch(err => {
            console.error('fetchPets failed:', err);
            return [];
          }),
          fetchShelters().catch(err => {
            console.error('fetchShelters failed:', err);
            return [];
          })
        ]);

        console.log(`Loaded ${dbPets.length} pets and ${dbShelters.length} shelters.`);

        if (dbPets.length > 0) {
          setPets(dbPets);
        } else {
          setPets(MOCK_PETS);
        }

        if (dbShelters.length > 0) {
          setShelters(dbShelters);
        } else {
          setShelters(MOCK_SHELTERS);
        }

        // Check for existing session
        console.log('Checking for existing session...');
        const user = await getCurrentUser().catch(err => {
          console.error('getCurrentUser failed:', err);
          return null;
        });
        
        if (user) {
          console.log('User found:', user.id);
          const shelter = await getShelterById(user.id).catch(err => {
            console.error('getShelterById failed:', err);
            return null;
          });
          if (shelter) {
            setCurrentShelter(shelter);
          }
        }
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
        setPets(MOCK_PETS);
        setShelters(MOCK_SHELTERS);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        loadingRef.current = false;
        console.log('Data loading finished.');
      }
    };

    loadData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const shelter = await getShelterById(session.user.id);
        if (shelter) {
          setCurrentShelter(shelter);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentShelter(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    console.log('Logout initiated...');
    try {
      await signOut();
      console.log('Supabase signOut successful');
    } catch (error) {
      console.error('Logout failed in Supabase:', error);
    } finally {
      setCurrentShelter(null);
      console.log('Local shelter state cleared');
      navigate('/');
      console.log('Navigated to home page');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaff]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 font-serif italic">正在尋找毛孩們...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-zinc-900 selection:bg-purple-200">
      <Navbar 
        shelter={currentShelter} 
        onLogout={handleLogout} 
        favoriteCount={favorites.length}
      />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage pets={pets} shelters={shelters} favorites={favorites} onToggleFavorite={toggleFavorite} />} />
          <Route path="/favorites" element={<FavoritesPage pets={pets} shelters={shelters} favorites={favorites} onToggleFavorite={toggleFavorite} />} />
          <Route path="/pet/:id" element={<PetDetailPage pets={pets} shelters={shelters} favorites={favorites} onToggleFavorite={toggleFavorite} />} />
          <Route path="/login" element={<ShelterLoginPage onLogin={setCurrentShelter} />} />
          <Route path="/register" element={<ShelterRegisterPage onRegister={setCurrentShelter} />} />
          <Route 
            path="/dashboard" 
            element={
              currentShelter ? (
                <ShelterDashboard shelter={currentShelter} pets={pets} setPets={setPets} />
              ) : (
                <ShelterLoginPage onLogin={setCurrentShelter} />
              )
            } 
          />
          <Route path="/shelter/:id" element={<ShelterProfilePage pets={pets} shelters={shelters} favorites={favorites} onToggleFavorite={toggleFavorite} />} />
        </Routes>
      </main>

      <footer className="bg-zinc-900 text-zinc-400 py-12 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Heart className="text-zinc-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-lg font-serif font-bold text-white">寵物有家</span>
          </div>
          <div className="flex space-x-8 text-sm">
            <Link to="/" className="hover:text-white transition-colors">尋找毛孩</Link>
            <Link to="/login" className="hover:text-white transition-colors">收容所登入</Link>
            <a href="#" className="hover:text-white transition-colors">隱私權政策</a>
          </div>
          <p className="text-xs">© 2026 寵物有家. 保留所有權利。</p>
        </div>
      </footer>
    </div>
  );
}
