// lib/api/clientApi.ts

import { api } from "./api";
import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

interface CreateNoteData {
  title: string;
  content: string;
  tag: NoteTag;
}

interface AuthData {
  email: string;
  password: string;
}

interface UpdateUserData {
  username: string;
}

export const fetchNotes = async (
  search: string,
  page: number,
  tag?: string,
): Promise<FetchNotesResponse> => {
  const params: {
    search: string;
    page: number;
    perPage: number;
    tag?: string;
  } = {
    search,
    page,
    perPage: 12,
  };

  if (tag && tag !== "all") {
    params.tag = tag;
  }

  const { data } = await api.get<FetchNotesResponse>("/notes", {
    params,
  });

  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
};

export const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  const { data } = await api.post<Note>("/notes", noteData);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await api.delete<Note>(`/notes/${id}`);
  return data;
};

export const register = async (credentials: AuthData): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", credentials);

  return data;
};

export const login = async (credentials: AuthData): Promise<User> => {
  const { data } = await api.post<User>("/auth/login", credentials);

  return data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const checkSession = async (): Promise<User | null> => {
  const { data } = await api.get<User | null>("/auth/session");

  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>("/users/me");

  return data;
};

export const updateMe = async (userData: UpdateUserData): Promise<User> => {
  const { data } = await api.patch<User>("/users/me", userData);

  return data;
};
