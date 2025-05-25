
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    hover: string;
  };
}

export const themes: Theme[] = [
  {
    name: 'קלאסי כחול',
    colors: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'bg-gray-100 hover:bg-gray-200',
      accent: 'bg-blue-50',
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-300',
      hover: 'hover:bg-blue-50'
    }
  },
  {
    name: 'ירוק מודרני',
    colors: {
      primary: 'bg-green-600 hover:bg-green-700',
      secondary: 'bg-emerald-100 hover:bg-emerald-200',
      accent: 'bg-green-50',
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-emerald-300',
      hover: 'hover:bg-green-50'
    }
  },
  {
    name: 'סגול יוקרתי',
    colors: {
      primary: 'bg-purple-600 hover:bg-purple-700',
      secondary: 'bg-purple-100 hover:bg-purple-200',
      accent: 'bg-purple-50',
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-50'
    }
  },
  {
    name: 'כהה אלגנטי',
    colors: {
      primary: 'bg-gray-800 hover:bg-gray-900',
      secondary: 'bg-gray-700 hover:bg-gray-600',
      accent: 'bg-gray-100',
      background: 'bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-400',
      hover: 'hover:bg-gray-100'
    }
  }
];
