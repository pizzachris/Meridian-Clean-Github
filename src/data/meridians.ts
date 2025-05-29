interface MeridianInfo {
  name: string;
  color: string;
  points: string[];
}

export const meridianColors: Record<string, MeridianInfo> = {
  LU: {
    name: 'Lung',
    color: '#FF4C4C',
    points: ['LU1', 'LU2', 'LU3', 'LU4', 'LU5', 'LU6', 'LU7', 'LU8', 'LU9', 'LU10', 'LU11']
  },
  LI: {
    name: 'Large Intestine',
    color: '#4C84FF',
    points: ['LI1', 'LI2', 'LI3', 'LI4', 'LI5', 'LI6', 'LI7', 'LI8', 'LI9', 'LI10', 'LI11', 'LI12', 'LI13', 'LI14', 'LI15', 'LI16', 'LI17', 'LI18', 'LI19', 'LI20']
  },
  ST: {
    name: 'Stomach',
    color: '#FFD700',
    points: ['ST1', 'ST2', 'ST3', 'ST4', 'ST5', 'ST6', 'ST7', 'ST8', 'ST9', 'ST10', 'ST11', 'ST12', 'ST13', 'ST14', 'ST15', 'ST16', 'ST17', 'ST18', 'ST19', 'ST20', 'ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'ST26', 'ST27', 'ST28', 'ST29', 'ST30', 'ST31', 'ST32', 'ST33', 'ST34', 'ST35', 'ST36', 'ST37', 'ST38', 'ST39', 'ST40', 'ST41', 'ST42', 'ST43', 'ST44', 'ST45']
  },
  SP: {
    name: 'Spleen',
    color: '#9C27B0',
    points: ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP7', 'SP8', 'SP9', 'SP10', 'SP11', 'SP12', 'SP13', 'SP14', 'SP15', 'SP16', 'SP17', 'SP18', 'SP19', 'SP20', 'SP21']
  },
  HT: {
    name: 'Heart',
    color: '#E91E63',
    points: ['HT1', 'HT2', 'HT3', 'HT4', 'HT5', 'HT6', 'HT7', 'HT8', 'HT9']
  },
  SI: {
    name: 'Small Intestine',
    color: '#4CAF50',
    points: ['SI1', 'SI2', 'SI3', 'SI4', 'SI5', 'SI6', 'SI7', 'SI8', 'SI9', 'SI10', 'SI11', 'SI12', 'SI13', 'SI14', 'SI15', 'SI16', 'SI17', 'SI18', 'SI19']
  },
  BL: {
    name: 'Bladder',
    color: '#009688',
    points: ['BL1', 'BL2', 'BL3', 'BL4', 'BL5', 'BL6', 'BL7', 'BL8', 'BL9', 'BL10', 'BL11', 'BL12', 'BL13', 'BL14', 'BL15', 'BL16', 'BL17', 'BL18', 'BL19', 'BL20', 'BL21', 'BL22', 'BL23', 'BL24', 'BL25', 'BL26', 'BL27', 'BL28', 'BL29', 'BL30', 'BL31', 'BL32', 'BL33', 'BL34', 'BL35', 'BL36', 'BL37', 'BL38', 'BL39', 'BL40', 'BL41', 'BL42', 'BL43', 'BL44', 'BL45', 'BL46', 'BL47', 'BL48', 'BL49', 'BL50', 'BL51', 'BL52', 'BL53', 'BL54', 'BL55', 'BL56', 'BL57', 'BL58', 'BL59', 'BL60', 'BL61', 'BL62', 'BL63', 'BL64', 'BL65', 'BL66', 'BL67']
  },
  KI: {
    name: 'Kidney',
    color: '#2196F3',
    points: ['KI1', 'KI2', 'KI3', 'KI4', 'KI5', 'KI6', 'KI7', 'KI8', 'KI9', 'KI10', 'KI11', 'KI12', 'KI13', 'KI14', 'KI15', 'KI16', 'KI17', 'KI18', 'KI19', 'KI20', 'KI21', 'KI22', 'KI23', 'KI24', 'KI25', 'KI26', 'KI27']
  },
  PC: {
    name: 'Pericardium',
    color: '#FF5722',
    points: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6', 'PC7', 'PC8', 'PC9']
  },
  TE: {
    name: 'Triple Energizer',
    color: '#795548',
    points: ['TE1', 'TE2', 'TE3', 'TE4', 'TE5', 'TE6', 'TE7', 'TE8', 'TE9', 'TE10', 'TE11', 'TE12', 'TE13', 'TE14', 'TE15', 'TE16', 'TE17', 'TE18', 'TE19', 'TE20', 'TE21', 'TE22', 'TE23']
  },
  GB: {
    name: 'Gallbladder',
    color: '#8BC34A',
    points: ['GB1', 'GB2', 'GB3', 'GB4', 'GB5', 'GB6', 'GB7', 'GB8', 'GB9', 'GB10', 'GB11', 'GB12', 'GB13', 'GB14', 'GB15', 'GB16', 'GB17', 'GB18', 'GB19', 'GB20', 'GB21', 'GB22', 'GB23', 'GB24', 'GB25', 'GB26', 'GB27', 'GB28', 'GB29', 'GB30', 'GB31', 'GB32', 'GB33', 'GB34', 'GB35', 'GB36', 'GB37', 'GB38', 'GB39', 'GB40', 'GB41', 'GB42', 'GB43', 'GB44']
  },
  LV: {
    name: 'Liver',
    color: '#673AB7',
    points: ['LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10', 'LV11', 'LV12', 'LV13', 'LV14']
  },
  DU: {
    name: 'Governing Vessel',
    color: '#FFC107',
    points: ['DU1', 'DU2', 'DU3', 'DU4', 'DU5', 'DU6', 'DU7', 'DU8', 'DU9', 'DU10', 'DU11', 'DU12', 'DU13', 'DU14', 'DU15', 'DU16', 'DU17', 'DU18', 'DU19', 'DU20', 'DU21', 'DU22', 'DU23', 'DU24', 'DU25', 'DU26', 'DU27', 'DU28']
  },
  REN: {
    name: 'Conception Vessel',
    color: '#00BCD4',
    points: ['REN1', 'REN2', 'REN3', 'REN4', 'REN5', 'REN6', 'REN7', 'REN8', 'REN9', 'REN10', 'REN11', 'REN12', 'REN13', 'REN14', 'REN15', 'REN16', 'REN17', 'REN18', 'REN19', 'REN20', 'REN21', 'REN22', 'REN23', 'REN24']
  }
};
