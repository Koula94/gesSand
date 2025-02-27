import { Provider } from 'your-framework';

export function Providers({ children }) {
  return (
    <Provider>
      {children}
    </Provider>
  );
} 