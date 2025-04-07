export const COLORS = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#4CAF50',
  primaryDark: '#45a049',
  foreground: '#333333',
  destructive: '#dc3545',
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999'
  },
  border: '#e0e0e0',
  accent: {
    blue: '#2196F3',
    green: '#4CAF50',
    red: '#f44336',
    yellow: '#ffc107'
  }
} as const;

export const STYLES = {
  shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  borderRadius: '0.5rem'
} as const;

export const card: {
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  boxShadow: string;
  padding: string;
} = {
  backgroundColor: COLORS.surface,
  borderColor: COLORS.border,
  borderRadius: '1rem',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  padding: '1.5rem'
};

export const input: {
  backgroundColor: string;
  borderColor: string;
  color: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  transition: string;
} = {
  backgroundColor: COLORS.surface,
  borderColor: COLORS.border,
  color: COLORS.text.primary,
  borderRadius: '0.5rem',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  transition: 'all 0.2s'
};

export const button: {
  primary: {
    backgroundColor: string;
    color: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: string;
    transition: string;
  }
} = {
  primary: {
    backgroundColor: COLORS.primary,
    color: COLORS.surface,
    borderRadius: '0.5rem',
    padding: '1rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  }
};

export const icon: {
  primary: {
    color: string;
  };
  secondary: {
    color: string;
  };
  tertiary: {
    color: string;
  }
} = {
  primary: {
    color: COLORS.primary
  },
  secondary: {
    color: COLORS.text.secondary
  },
  tertiary: {
    color: COLORS.text.tertiary
  }
}; 