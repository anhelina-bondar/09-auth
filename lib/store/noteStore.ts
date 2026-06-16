import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NoteTag } from "@/types/note";

const initialDraft = {
  title: "",
  content: "",
  tag: "Todo" as NoteTag,
};

interface NoteStore {
  draft: {
    title: string;
    content: string;
    tag: NoteTag;
  };
  setDraft: (
    draft: Partial<{
      title: string;
      content: string;
      tag: NoteTag;
    }>,
  ) => void;
  clearDraft: () => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      draft: initialDraft,

      setDraft: (newDraft) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...newDraft,
          },
        })),

      clearDraft: () =>
        set({
          draft: initialDraft,
        }),
    }),
    {
      name: "note-draft",

      partialize: (state) => ({
        draft: state.draft,
      }),
    },
  ),
);
