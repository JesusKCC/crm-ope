import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { PerfilUsuario, RolUsuario } from '../types/crm.types';

export const PERFILES_MOCK: Record<RolUsuario, PerfilUsuario> = {
  comercial: {
    id: 'usr-comercial-001',
    auth_id: 'auth-comercial-001',
    nombre_completo: 'Lic. Carlos Valdivia',
    correo: 'carlos.valdivia@retailcorp.com',
    rol: 'comercial',
    local_id: 'loc-001',
    contratista_id: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ingeniero: {
    id: 'usr-ingeniero-001',
    auth_id: 'auth-ingeniero-001',
    nombre_completo: 'Ing. Alejandro Morales',
    correo: 'alejandro.morales@retailcorp.com',
    rol: 'ingeniero',
    local_id: null,
    contratista_id: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  gerente_tienda: {
    id: 'usr-gerente-001',
    auth_id: 'auth-gerente-001',
    nombre_completo: 'María Fernanda Ruiz',
    correo: 'maria.ruiz@tiendasur.com',
    rol: 'gerente_tienda',
    local_id: 'loc-002',
    contratista_id: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  proveedor: {
    id: 'usr-proveedor-001',
    auth_id: 'auth-proveedor-001',
    nombre_completo: 'Ing. Roberto Mendoza (Obras Express)',
    correo: 'contacto@obrasexpress.com',
    rol: 'proveedor',
    local_id: null,
    contratista_id: 'cont-001',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  supervisor: {
    id: 'usr-supervisor-001',
    auth_id: 'auth-supervisor-001',
    nombre_completo: 'Arq. Lucía Benavides',
    correo: 'lucia.benavides@retailcorp.com',
    rol: 'supervisor',
    local_id: null,
    contratista_id: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  finanzas: {
    id: 'usr-finanzas-001',
    auth_id: 'auth-finanzas-001',
    nombre_completo: 'Econ. Sergio Pinedo',
    correo: 'sergio.pinedo@retailcorp.com',
    rol: 'finanzas',
    local_id: null,
    contratista_id: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: 'usr-admin-001',
    auth_id: 'auth-admin-001',
    nombre_completo: 'Administrador General CRM',
    correo: 'admin.crm@retailcorp.com',
    rol: 'admin',
    local_id: null,
    contratista_id: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: PerfilUsuario | null;
  rolActivo: RolUsuario;
  loading: boolean;
  cambiarRolSimulado: (nuevoRol: RolUsuario) => void;
  signInConCredenciales: (correo: string, contrasena: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  modoDesarrollo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PerfilUsuario | null>(PERFILES_MOCK.ingeniero);
  const [rolActivo, setRolActivo] = useState<RolUsuario>('ingeniero');
  const [loading, setLoading] = useState<boolean>(true);
  const [modoDesarrollo, setModoDesarrollo] = useState<boolean>(true);

  const fetchProfileReal = useCallback(async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuario')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error || !data) {
        console.warn('No se encontró perfil real en DB, usando mock:', error?.message);
        setProfile(PERFILES_MOCK.ingeniero);
        setRolActivo('ingeniero');
      } else {
        const perfilEncontrado = data as unknown as PerfilUsuario;
        setProfile(perfilEncontrado);
        setRolActivo(perfilEncontrado.rol);
        setModoDesarrollo(false);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setProfile(PERFILES_MOCK.ingeniero);
      setRolActivo('ingeniero');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProfile(PERFILES_MOCK.ingeniero);
      setRolActivo('ingeniero');
      setModoDesarrollo(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfileReal(currentSession.user.id);
      } else {
        setProfile(PERFILES_MOCK.ingeniero);
        setRolActivo('ingeniero');
        setLoading(false);
      }
    });

    const { data: authData } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfileReal(currentSession.user.id);
      } else {
        setProfile(PERFILES_MOCK.ingeniero);
        setRolActivo('ingeniero');
        setLoading(false);
      }
    });

    return () => {
      authData.subscription.unsubscribe();
    };
  }, [fetchProfileReal]);

  const cambiarRolSimulado = (nuevoRol: RolUsuario) => {
    setRolActivo(nuevoRol);
    const mockSeleccionado = PERFILES_MOCK[nuevoRol];
    setProfile(mockSeleccionado);
  };

  const signInConCredenciales = async (correo: string, contrasena: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      const rolEncontrado = (Object.keys(PERFILES_MOCK) as RolUsuario[]).find(
        (r) => PERFILES_MOCK[r].correo.toLowerCase() === correo.toLowerCase()
      ) || 'ingeniero';
      cambiarRolSimulado(rolEncontrado);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(PERFILES_MOCK.ingeniero);
    setRolActivo('ingeniero');
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      rolActivo,
      loading,
      cambiarRolSimulado,
      signInConCredenciales,
      signOut,
      modoDesarrollo,
    }),
    [session, user, profile, rolActivo, loading, modoDesarrollo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
