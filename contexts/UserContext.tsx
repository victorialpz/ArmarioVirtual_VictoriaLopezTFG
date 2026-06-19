import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UserContextType = {
  fotoPerfil: string | null;
  refreshAvatar: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  fotoPerfil: null,
  refreshAvatar: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  const refreshAvatar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFotoPerfil(null); return; }

    const { data } = await supabase
      .from('usuarios')
      .select('foto_perfil')
      .eq('id', user.id)
      .single();

    setFotoPerfil(data?.foto_perfil ? `${data.foto_perfil}?t=${Date.now()}` : null);
  }, []);

  useEffect(() => {
    refreshAvatar();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN')  refreshAvatar();
      if (event === 'SIGNED_OUT') setFotoPerfil(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ fotoPerfil, refreshAvatar }}>
      {children}
    </UserContext.Provider>
  );
}
