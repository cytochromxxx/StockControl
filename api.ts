
import { Kit, CategoryDef, HistoryEntry } from './types';

// Kategorie-Definitionen
let categories: CategoryDef[] = [
  { id: 'k', key: 'K', label: 'K-Serien', defaultThreshold: 2000 },
  { id: 'q', key: 'Q', label: 'Q-Serien', defaultThreshold: 2000 },
  { id: 's', key: 'S', label: 'S-Serien', defaultThreshold: 1000 },
  { id: 'si', key: 'Si', label: 'Si-Serien', defaultThreshold: 1000 },
  { id: 'enzyme', key: 'Enzyme', label: 'Enzyme/Taq', defaultThreshold: 1000 },
  { id: 'bacteria', key: 'Bacteria', label: 'Bakterien', defaultThreshold: 1000 }
];

const gid = () => 'h_' + Math.random().toString(36).substr(2, 9);

// Hilfsfunktion zum Parsen der Werte (entfernt " µl" und wandelt in Zahl um)
const parseVal = (val: string): number => {
  return parseFloat(val.replace(/[^\d.-]/g, ''));
};

let kits: Kit[] = [
  // --- K-SERIEN ---
  {
    id: "K1", name: "K1", category: "K", linkedProducts: "VGM Classic/OneStep/Advance", description: "Oligo",
    startVolume: 11000, currentVolume: 6166, criticalThreshold: 2000,
    history: [
      { id: gid(), date: "21.10.2025", amount: -275, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "16.10.2025", amount: -117, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "16.10.2025", amount: -780, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "02.09.2025", amount: -247, person: "HMA", comment: "Entnahme" },
      { id: gid(), date: "19.08.2025", amount: -170, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "14.08.2025", amount: -156, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "01.07.2025", amount: -195, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "04.06.2025", amount: -143, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "15.05.2025", amount: -715, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "29.04.2025", amount: -300, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "22.04.2025", amount: -10, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "22.04.2025", amount: -715, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "27.03.2025", amount: -400, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "06.03.2025", amount: -390, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "05.02.2025", amount: -59, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "22.01.2025", amount: -26, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: -137, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: 11000, person: "System", comment: "Ersteinrichtung" }
    ]
  },
  {
    id: "K2", name: "K2", category: "K", linkedProducts: "VGM Classic/OneStep/Advance", description: "Oligo",
    startVolume: 10450, currentVolume: 5556, criticalThreshold: 2000,
    history: [
      { id: gid(), date: "21.10.2025", amount: -275, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "16.10.2025", amount: -177, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "16.10.2025", amount: -780, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "02.09.2025", amount: -247, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "19.08.2025", amount: -170, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "14.08.2025", amount: -156, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "01.07.2025", amount: -195, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "04.06.2025", amount: -143, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "15.05.2025", amount: -715, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "29.04.2025", amount: -300, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "22.04.2025", amount: -10, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "22.04.2025", amount: -715, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "27.03.2025", amount: -400, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "06.03.2025", amount: -390, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "05.02.2025", amount: -59, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "22.01.2025", amount: -26, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: -137, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: 10450, person: "System", comment: "Ersteinrichtung" }
    ]
  },
  {
    id: "K13", name: "K13", category: "K", linkedProducts: "8er Streifen Sigma", description: "Oligo",
    startVolume: 2975, currentVolume: 1025, criticalThreshold: 1000,
    history: [
      { id: gid(), date: "27.01.2026", amount: -325, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "07.01.2026", amount: -425, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "12.08.2025", amount: -400, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "21.02.2025", amount: -400, person: "System", comment: "Entnahme" },
      { id: gid(), date: "17.12.2024", amount: -400, person: "System", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: 2975, person: "System", comment: "Ersteinrichtung" }
    ]
  },
  {
    id: "K14", name: "K14", category: "K", linkedProducts: "8er Streifen Sigma", description: "Oligo",
    startVolume: 12275, currentVolume: 10100, criticalThreshold: 2000,
    history: [
      { id: gid(), date: "27.01.2026", amount: -325, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "07.01.2026", amount: -425, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "12.08.2025", amount: -400, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: -225, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "07.04.2025", amount: 10000, person: "NR", comment: "Auffüllung" },
      { id: gid(), date: "21.02.2025", amount: -400, person: "System", comment: "Entnahme" },
      { id: gid(), date: "17.12.2024", amount: -400, person: "System", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: 2275, person: "System", comment: "Ersteinrichtung" }
    ]
  },
  {
    id: "K15", name: "K15", category: "K", linkedProducts: "8er Streifen Sigma", description: "Oligo",
    startVolume: 5185, currentVolume: 3810, criticalThreshold: 1000,
    history: [
      { id: gid(), date: "27.01.2026", amount: -195, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "07.01.2026", amount: -255, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "12.08.2025", amount: -240, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: -205, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "21.02.2025", amount: -240, person: "System", comment: "Entnahme" },
      { id: gid(), date: "17.12.2024", amount: -240, person: "System", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: 5185, person: "System", comment: "Ersteinrichtung" }
    ]
  },

  // --- Q-SERIEN ---
  {
    id: "Q15", name: "Q15", category: "Q", linkedProducts: "qPCR CC + Qiagen", description: "Oligo",
    startVolume: 17305, currentVolume: 11204, criticalThreshold: 2000,
    history: [
      { id: gid(), date: "04.02.2026", amount: -75, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "04.02.2026", amount: 10000, person: "CMZ", comment: "Auffüllung" },
      { id: gid(), date: "08.12.2025", amount: -2160, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "17.11.2025", amount: -98, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "06.10.2025", amount: -88, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "06.10.2025", amount: -75, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: -395, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "25.06.2025", amount: -336, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "27.05.2025", amount: -125, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "06.03.2025", amount: -2000, person: "System", comment: "Entnahme" },
      { id: gid(), date: "25.02.2025", amount: -15, person: "System", comment: "Entnahme" },
      { id: gid(), date: "24.02.2025", amount: -88, person: "System", comment: "Entnahme" },
      { id: gid(), date: "21.02.2025", amount: -88, person: "System", comment: "Entnahme" },
      { id: gid(), date: "21.02.2025", amount: -104, person: "System", comment: "Entnahme" },
      { id: gid(), date: "05.02.2025", amount: -91, person: "System", comment: "Entnahme" },
      { id: gid(), date: "27.01.2025", amount: -100, person: "System", comment: "Entnahme" },
      { id: gid(), date: "06.01.2025", amount: -176, person: "System", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: 7305, person: "System", comment: "Ersteinrichtung" }
    ]
  },

  // --- S-SERIEN ---
  {
    id: "S15", name: "S15", category: "S", linkedProducts: "Microsart AMP / ATMP / Research", description: "Oligo",
    startVolume: 6000, currentVolume: 2125, criticalThreshold: 1000,
    history: [
      { id: gid(), date: "09.02.2026", amount: -260, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "09.02.2026", amount: -300, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "12.01.2026", amount: -260, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "05.11.2025", amount: -300, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "21.10.2025", amount: -65, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "10.09.2025", amount: -300, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "27.08.2025", amount: -260, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "05.08.2025", amount: -65, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "22.07.2025", amount: -65, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: 2500, person: "SM", comment: "Auffüllung" },
      { id: gid(), date: "15.07.2025", amount: 700, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "09.07.2025", amount: -300, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "17.06.2025", amount: -736, person: "CMZ", comment: "Kontrolle" },
      { id: gid(), date: "12.06.2025", amount: -260, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "04.06.2025", amount: -65, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "29.04.2025", amount: -260, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "02.04.2025", amount: -312, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "12.03.2025", amount: -333, person: "System", comment: "Entnahme" },
      { id: gid(), date: "21.02.2025", amount: -65, person: "System", comment: "Entnahme" },
      { id: gid(), date: "13.02.2025", amount: 2500, person: "System", comment: "Auffüllung" },
      { id: gid(), date: "27.01.2025", amount: -247, person: "System", comment: "Entnahme" },
      { id: gid(), date: "16.01.2025", amount: -123, person: "System", comment: "Entnahme" },
      { id: gid(), date: "16.12.2024", amount: 1000, person: "System", comment: "Ersteinrichtung" }
    ]
  },

  // --- BAKTERIEN ---
  {
    id: "K3", name: "K3", category: "Bacteria", linkedProducts: "Onar Bacteria", description: "Oligo",
    startVolume: 4938, currentVolume: 4314, criticalThreshold: 1000,
    history: [
      { id: gid(), date: "17.09.2025", amount: -286, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: 138, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "12.06.2025", amount: -130, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "24.03.2025", amount: -182, person: "System", comment: "Entnahme" },
      { id: gid(), date: "04.03.2025", amount: -26, person: "System", comment: "Entnahme" },
      { id: gid(), date: "28.02.2025", amount: 4800, person: "System", comment: "Ersteinrichtung" }
    ]
  },
  {
    id: "Q18_Bac", name: "Q18", category: "Bacteria", linkedProducts: "Microsart ATMP / Research qBacteria", description: "Oligo",
    startVolume: 14190, currentVolume: 11103, criticalThreshold: 2000,
    history: [
      { id: gid(), date: "29.01.2026", amount: -42, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "09.12.2025", amount: -46, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "27.11.2025", amount: -15, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "25.11.2025", amount: -13, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "04.11.2025", amount: 10000, person: "CMZ", comment: "Auffüllung" },
      { id: gid(), date: "28.10.2025", amount: -78, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "23.09.2025", amount: -182, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "23.09.2025", amount: -700, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "17.09.2025", amount: -143, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "17.09.2025", amount: -78, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "21.07.2025", amount: -100, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "17.06.2025", amount: -312, person: "CMZ", comment: "Kontrolle" },
      { id: gid(), date: "16.06.2025", amount: -180, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "12.06.2025", amount: -65, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "15.05.2025", amount: -700, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "23.04.2025", amount: -95, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "14.04.2025", amount: -182, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "14.04.2025", amount: -10, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "09.04.2025", amount: -35, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "02.04.2025", amount: -20, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "24.03.2025", amount: -91, person: "System", comment: "Entnahme" },
      { id: gid(), date: "01.01.2025", amount: 4190, person: "System", comment: "Übertrag" }
    ]
  },
  {
    id: "PMA_50", name: "PMA 50 µM", category: "Bacteria", linkedProducts: "Bacteria Kits", description: "Arbeitslösung",
    startVolume: 11050, currentVolume: 4050, criticalThreshold: 1000,
    history: [
      { id: gid(), date: "23.09.2025", amount: -1400, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "23.09.2025", amount: 5200, person: "SM", comment: "Nachfüllung" },
      { id: gid(), date: "17.09.2025", amount: -550, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "17.09.2025", amount: -600, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: -465, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "12.06.2025", amount: -250, person: "Fh", comment: "Entnahme" },
      { id: gid(), date: "03.06.2025", amount: -110, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "14.04.2025", amount: -1400, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "14.04.2025", amount: -45, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "02.04.2025", amount: -670, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "31.03.2025", amount: -60, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "24.03.2025", amount: -350, person: "System", comment: "Entnahme" },
      { id: gid(), date: "20.03.2025", amount: -100, person: "System", comment: "Entnahme" },
      { id: gid(), date: "19.03.2025", amount: -800, person: "System", comment: "Entnahme" },
      { id: gid(), date: "19.03.2025", amount: 5000, person: "System", comment: "Auffüllung" },
      { id: gid(), date: "11.03.2025", amount: 650, person: "System", comment: "Ersteinrichtung" }
    ]
  },

  // --- ENZYME / TAQ ---
  {
    id: "SuperHot_30", name: "SuperHot Taq", category: "Enzyme", linkedProducts: "30 U/µl", description: "Bioron",
    startVolume: 7666, currentVolume: 2313, criticalThreshold: 1000,
    history: [
      { id: gid(), date: "04.02.2026", amount: -173, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "27.01.2026", amount: -280, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "17.11.2025", amount: -467, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "17.11.2025", amount: -260, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "17.11.2025", amount: 3333, person: "CMZ", comment: "Auffüllung" },
      { id: gid(), date: "10.11.2025", amount: -957, person: "FH", comment: "Korrektur" },
      { id: gid(), date: "27.10.2025", amount: -1633, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "16.10.2025", amount: -234, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "06.10.2025", amount: -87, person: "HMa", comment: "Entnahme" },
      { id: gid(), date: "25.09.2025", amount: -350, person: "HMA", comment: "Entnahme" },
      { id: gid(), date: "02.09.2025", amount: -412, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "14.08.2025", amount: -260, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "12.08.2025", amount: 3333, person: "CMZ", comment: "Auffüllung" },
      { id: gid(), date: "06.08.2025", amount: -540, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: -432, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "01.07.2025", amount: -1400, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "01.07.2025", amount: -325, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "04.06.2025", amount: -238, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "14.04.2025", amount: -195, person: "Hma", comment: "Entnahme" },
      { id: gid(), date: "14.04.2025", amount: -5, person: "CMZ", comment: "Entnahme" },
      { id: gid(), date: "09.04.2025", amount: -350, person: "System", comment: "Entnahme" },
      { id: gid(), date: "09.04.2025", amount: 3333, person: "CMZ", comment: "Auffüllung" },
      { id: gid(), date: "24.03.2025", amount: -88, person: "System", comment: "Entnahme" },
      { id: gid(), date: "20.03.2025", amount: 1000, person: "CMZ", comment: "Ersteinrichtung" }
    ]
  },
  {
    id: "SuperHot_5", name: "SuperHot Taq", category: "Enzyme", linkedProducts: "5 U/µl", description: "Bioron",
    startVolume: 20900, currentVolume: 5399, criticalThreshold: 1000,
    history: [
      { id: gid(), date: "23.01.2026", amount: -2700, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "23.01.2026", amount: -2222, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "16.01.2026", amount: 10000, person: "CMZ", comment: "Auffüllung" },
      { id: gid(), date: "14.11.2025", amount: -1600, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "27.10.2025", amount: 900, person: "SM", comment: "Korrektur" },
      { id: gid(), date: "20.10.2025", amount: -1900, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "29.08.2025", amount: -2079, person: "HMA", comment: "Entnahme" },
      { id: gid(), date: "15.07.2025", amount: -1075, person: "CMZ", comment: "Korrektur" },
      { id: gid(), date: "02.06.2025", amount: -3025, person: "SM", comment: "Entnahme" },
      { id: gid(), date: "02.06.2025", amount: -600, person: "FH", comment: "Entnahme" },
      { id: gid(), date: "14.04.2025", amount: -300, person: "NR", comment: "Entnahme" },
      { id: gid(), date: "05.03.2025", amount: 10000, person: "CMZ", comment: "Ersteinrichtung" }
    ]
  }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const kitApi = {
  async getKits(): Promise<Kit[]> {
    await sleep(200);
    return [...kits];
  },

  async getCategories(): Promise<CategoryDef[]> {
    await sleep(100);
    return [...categories];
  },

  async createKit(kit: Omit<Kit, 'id' | 'history'>): Promise<Kit> {
    await sleep(300);
    const newKit: Kit = {
      ...kit,
      id: kit.name.replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000),
      history: [{
        id: gid(),
        date: new Date().toLocaleDateString('de-DE'),
        amount: kit.currentVolume,
        person: 'System',
        comment: 'Ersteinrichtung'
      }]
    };
    kits = [...kits, newKit];
    return newKit;
  },

  async updateKit(id: string, updates: Partial<Kit>): Promise<Kit> {
    await sleep(300);
    const idx = kits.findIndex(k => k.id === id);
    if (idx === -1) throw new Error("Eintrag nicht gefunden");
    kits[idx] = { ...kits[idx], ...updates };
    return kits[idx];
  },

  async removeKit(id: string): Promise<void> {
    await sleep(300);
    kits = kits.filter(k => k.id !== id);
  },

  async withdraw(id: string, payload: Omit<HistoryEntry, 'id'>): Promise<Kit> {
    await sleep(400);
    const idx = kits.findIndex(k => k.id === id);
    if (idx === -1) throw new Error("Eintrag nicht gefunden");
    const amount = -Math.abs(payload.amount);
    if (kits[idx].currentVolume + amount < 0) throw new Error("Unzureichendes Volumen");

    const entry: HistoryEntry = { ...payload, id: gid(), amount };
    kits[idx] = { ...kits[idx], currentVolume: kits[idx].currentVolume + amount, history: [entry, ...kits[idx].history] };
    return kits[idx];
  },

  async refill(id: string, payload: Omit<HistoryEntry, 'id'>): Promise<Kit> {
    await sleep(400);
    const idx = kits.findIndex(k => k.id === id);
    if (idx === -1) throw new Error("Eintrag nicht gefunden");
    const amount = Math.abs(payload.amount);

    const entry: HistoryEntry = { ...payload, id: gid(), amount };
    kits[idx] = { ...kits[idx], currentVolume: kits[idx].currentVolume + amount, history: [entry, ...kits[idx].history] };
    return kits[idx];
  }
};
