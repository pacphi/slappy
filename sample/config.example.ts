// config.example.ts
// Copy this to config.ts and customize for your needs

export interface NameTagConfig {
  // Font settings
  fonts: {
    line1: {
      size: string // e.g., "32pt"
      weight: string // e.g., "bold"
      family?: string // e.g., "Arial, sans-serif"
    }
    line2: {
      size: string // e.g., "18pt"
      weight?: string // e.g., "normal"
      family?: string
    }
    line3: {
      size: string
      weight?: string
      family?: string
    }
  }

  // Layout settings
  layout: {
    labelWidth: string // e.g., "4in"
    labelHeight: string // e.g., "2in"
    columns: number // e.g., 2
    rows: number // e.g., 5
    padding: string // e.g., "0.25in"
  }

  // Page settings
  page: {
    size: string // e.g., "letter"
    margin: string // e.g., "0.5in"
  }

  // Style settings
  style: {
    showBorders: boolean // Show dashed borders for alignment
    backgroundColor?: string
    textColor?: string
    line1Color?: string // Different color for line 1
  }
}

// Default configuration for TownStix US-10
export const defaultConfig: NameTagConfig = {
  fonts: {
    line1: {
      size: '32pt',
      weight: 'bold',
      family: 'Arial, Helvetica, sans-serif',
    },
    line2: {
      size: '18pt',
      weight: 'normal',
      family: 'Arial, Helvetica, sans-serif',
    },
    line3: {
      size: '18pt',
      weight: 'normal',
      family: 'Arial, Helvetica, sans-serif',
    },
  },
  layout: {
    labelWidth: '4in',
    labelHeight: '2in',
    columns: 2,
    rows: 5,
    padding: '0.25in',
  },
  page: {
    size: 'letter',
    margin: '0.5in',
  },
  style: {
    showBorders: true,
    backgroundColor: 'transparent',
  },
}

// Example: Conference badges with company logos
export const conferenceBadgeConfig: NameTagConfig = {
  fonts: {
    line1: {
      size: '28pt',
      weight: 'bold',
      family: "'Helvetica Neue', Arial, sans-serif",
    },
    line2: {
      size: '16pt',
      weight: '300',
      family: "'Helvetica Neue', Arial, sans-serif",
    },
    line3: {
      size: '14pt',
      weight: '300',
      family: "'Helvetica Neue', Arial, sans-serif",
    },
  },
  layout: {
    labelWidth: '4in',
    labelHeight: '2in',
    columns: 2,
    rows: 5,
    padding: '0.3in',
  },
  page: {
    size: 'letter',
    margin: '0.5in',
  },
  style: {
    showBorders: false,
    backgroundColor: '#f8f9fa',
    line1Color: '#003366',
  },
}

// Example: Choir name tags with decorative styling
export const choirConfig: NameTagConfig = {
  fonts: {
    line1: {
      size: '32pt',
      weight: 'bold',
      family: "'Georgia', 'Times New Roman', serif",
    },
    line2: {
      size: '20pt',
      weight: 'normal',
      family: "'Georgia', 'Times New Roman', serif",
    },
    line3: {
      size: '16pt',
      weight: 'italic',
      family: "'Georgia', 'Times New Roman', serif",
    },
  },
  layout: {
    labelWidth: '4in',
    labelHeight: '2in',
    columns: 2,
    rows: 5,
    padding: '0.25in',
  },
  page: {
    size: 'letter',
    margin: '0.5in',
  },
  style: {
    showBorders: true,
    backgroundColor: 'white',
    line1Color: '#8B4513',
  },
}
