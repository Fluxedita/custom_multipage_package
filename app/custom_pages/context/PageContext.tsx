import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Section } from '../types/sections';

interface PageState {
  sections: Section[];
  isDirty: boolean;
  isSaving: boolean;
  isEditMode: boolean;
  isTTSEnabled: boolean;
}

type PageAction =
  | { type: 'SET_SECTIONS'; payload: Section[] }
  | { type: 'UPDATE_SECTION'; payload: { index: number; section: Section } }
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'REMOVE_SECTION'; payload: number }
  | { type: 'MOVE_SECTION'; payload: { index: number; direction: 'up' | 'down' } }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SET_TTS_ENABLED'; payload: boolean };

const initialState: PageState = {
  sections: [],
  isDirty: false,
  isSaving: false,
  isEditMode: false,
  isTTSEnabled: false,
};

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
    case 'UPDATE_SECTION':
      const newSections = [...state.sections];
      newSections[action.payload.index] = action.payload.section;
      return { ...state, sections: newSections, isDirty: true };
    case 'ADD_SECTION':
      return {
        ...state,
        sections: [...state.sections, action.payload],
        isDirty: true,
      };
    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((_, i) => i !== action.payload),
        isDirty: true,
      };
    case 'MOVE_SECTION':
      const { index, direction } = action.payload;
      const sections = [...state.sections];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex >= 0 && newIndex < sections.length) {
        [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
        return { ...state, sections, isDirty: true };
      }
      return state;
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_EDIT_MODE':
      return { ...state, isEditMode: action.payload };
    case 'SET_TTS_ENABLED':
      return { ...state, isTTSEnabled: action.payload };
    default:
      return state;
  }
}

interface PageContextType {
  state: PageState;
  dispatch: React.Dispatch<PageAction>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pageReducer, initialState);

  return (
    <PageContext.Provider value={{ state, dispatch }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
} 