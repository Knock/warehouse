export const COLORS = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#4CAF50',
  primaryDark: '#45a049',
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999'
  },
  border: {
    light: '#e0e0e0',
    medium: '#d0d0d0'
  },
  accent: {
    green: '#4CAF50',
    blue: '#2196F3',
    orange: '#FF9800',
    red: '#F44336'
  }
} as const;

export const STYLES = {
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border.light,
    borderRadius: '1rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem'
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border.medium,
    color: COLORS.text.primary,
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    transition: 'all 0.2s'
  },
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.surface,
      borderRadius: '0.5rem',
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.2s'
    }
  },
  icon: {
    primary: {
      color: COLORS.primary
    },
    secondary: {
      color: COLORS.text.secondary
    },
    tertiary: {
      color: COLORS.text.tertiary
    }
  }
} as const; 