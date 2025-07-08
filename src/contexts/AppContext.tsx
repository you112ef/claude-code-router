import React, {createContext, useContext, useReducer, ReactNode} from 'react';

// أنواع البيانات
export interface Provider {
  name: string;
  api_base_url: string;
  api_key: string;
  models: string[];
}

export interface Config {
  log: boolean;
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODEL: string;
  Providers: Provider[];
  Router: {
    background: string;
    think: string;
    longContext: string;
  };
  usePlugins: string[];
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'warning';
}

export interface AppState {
  config: Config;
  serviceStatus: {
    isRunning: boolean;
    port: number;
    error?: string;
  };
  logs: LogEntry[];
  selectedProvider: string;
  localAI: {
    isEnabled: boolean;
    modelPath: string;
    isLoading: boolean;
  };
}

// الأفعال
type AppAction =
  | {type: 'SET_CONFIG'; payload: Config}
  | {type: 'UPDATE_SERVICE_STATUS'; payload: AppState['serviceStatus']}
  | {type: 'ADD_LOG'; payload: LogEntry}
  | {type: 'CLEAR_LOGS'}
  | {type: 'SET_SELECTED_PROVIDER'; payload: string}
  | {type: 'SET_LOCAL_AI'; payload: Partial<AppState['localAI']>}
  | {type: 'ADD_PROVIDER'; payload: Provider}
  | {type: 'UPDATE_PROVIDER'; payload: {index: number; provider: Provider}}
  | {type: 'REMOVE_PROVIDER'; payload: number};

// الحالة الافتراضية
const initialState: AppState = {
  config: {
    log: true,
    OPENAI_API_KEY: '',
    OPENAI_BASE_URL: '',
    OPENAI_MODEL: '',
    Providers: [],
    Router: {
      background: '',
      think: '',
      longContext: '',
    },
    usePlugins: [],
  },
  serviceStatus: {
    isRunning: false,
    port: 3456,
  },
  logs: [],
  selectedProvider: 'default',
  localAI: {
    isEnabled: false,
    modelPath: '',
    isLoading: false,
  },
};

// المخفض (Reducer)
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
      };

    case 'UPDATE_SERVICE_STATUS':
      return {
        ...state,
        serviceStatus: action.payload,
      };

    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.payload, ...state.logs].slice(0, 1000), // الاحتفاظ بآخر 1000 سجل
      };

    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: [],
      };

    case 'SET_SELECTED_PROVIDER':
      return {
        ...state,
        selectedProvider: action.payload,
      };

    case 'SET_LOCAL_AI':
      return {
        ...state,
        localAI: {
          ...state.localAI,
          ...action.payload,
        },
      };

    case 'ADD_PROVIDER':
      return {
        ...state,
        config: {
          ...state.config,
          Providers: [...state.config.Providers, action.payload],
        },
      };

    case 'UPDATE_PROVIDER':
      return {
        ...state,
        config: {
          ...state.config,
          Providers: state.config.Providers.map((provider, index) =>
            index === action.payload.index ? action.payload.provider : provider,
          ),
        },
      };

    case 'REMOVE_PROVIDER':
      return {
        ...state,
        config: {
          ...state.config,
          Providers: state.config.Providers.filter(
            (_, index) => index !== action.payload,
          ),
        },
      };

    default:
      return state;
  }
}

// السياق
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

// مزود السياق
export function AppProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{state, dispatch}}>
      {children}
    </AppContext.Provider>
  );
}

// Hook لاستخدام السياق
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}