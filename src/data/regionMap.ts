import { RegionDataMap } from '../types/bodymap';

export const regionData: RegionDataMap = {  head: {
    title: "HEAD & NECK",
    image: "/images/regions/head-neck.png",
    backImage: "/images/regions/head-neck-back.png",
    area: {
      top: "5%",
      left: "35%",
      width: "30%",
      height: "15%"
    },
    points: [
      // Front view points
      { id: "GV24", top: "15%", left: "50%", view: "front" },
      { id: "GB14", top: "20%", left: "35%", view: "front" },
      { id: "BL2", top: "22%", left: "45%", view: "front" },
      { id: "ST2", top: "30%", left: "42%", view: "front" },
      { id: "SI18", top: "35%", left: "35%", view: "front" },
      { id: "ST6", top: "40%", left: "32%", view: "front" },
      { id: "ST9", top: "55%", left: "38%", view: "front" },
      { id: "LI20", top: "32%", left: "42%", view: "front" },
      { id: "GV26", top: "38%", left: "50%", view: "front" },
      { id: "CV24", top: "42%", left: "50%", view: "front" },
      { id: "CV23", top: "50%", left: "50%", view: "front" },
      // Back view points
      { id: "GB20", top: "58%", left: "35%", view: "back" },
      { id: "BL10", top: "60%", left: "50%", view: "back" },
      { id: "GV16", top: "62%", left: "50%", view: "back" },
      { id: "GV15", top: "65%", left: "50%", view: "back" },
      { id: "SI15", top: "68%", left: "40%", view: "back" },
      { id: "SI16", top: "62%", left: "38%", view: "back" },
      { id: "TB17", top: "45%", left: "32%", view: "back" }
    ]
  },  arms: {
    title: "ARMS",
    image: "/images/regions/arms.png",
    backImage: "/images/regions/arms-back.png",
    area: {
      top: "20%",
      left: "15%",
      width: "70%",
      height: "30%"
    },
    points: [
      // Front view points
      { id: "LU5", top: "35%", left: "25%", view: "front" },
      { id: "PC3", top: "35%", left: "28%", view: "front" },
      { id: "HT3", top: "35%", left: "30%", view: "front" },
      { id: "LI11", top: "35%", left: "75%", view: "front" },
      { id: "LU6", top: "45%", left: "25%", view: "front" },
      { id: "PC6", top: "55%", left: "27%", view: "front" },
      { id: "HT7", top: "65%", left: "28%", view: "front" },
      { id: "LU9", top: "65%", left: "25%", view: "front" },
      { id: "PC8", top: "70%", left: "27%", view: "front" },
      // Back view points
      { id: "SI8", top: "35%", left: "25%", view: "back" },
      { id: "TB10", top: "40%", left: "75%", view: "back" },
      { id: "SI7", top: "45%", left: "25%", view: "back" },
      { id: "TB5", top: "55%", left: "75%", view: "back" },
      { id: "SI3", top: "70%", left: "25%", view: "back" },
      { id: "TB3", top: "70%", left: "75%", view: "back" }
    ]
  },  trunk: {
    title: "TRUNK",
    image: "/images/regions/trunk.png",
    backImage: "/images/regions/trunk-back.png",
    area: {
      top: "20%",
      left: "30%",
      width: "40%",
      height: "30%"
    },
    points: [
      // Front view points - Upper
      { id: "CV22", top: "10%", left: "50%", view: "front" },
      { id: "CV17", top: "25%", left: "50%", view: "front" },
      { id: "KI23", top: "20%", left: "48%", view: "front" },
      { id: "ST13", top: "15%", left: "45%", view: "front" },
      { id: "KI25", top: "25%", left: "48%", view: "front" },
      // Front view points - Middle
      { id: "CV12", top: "40%", left: "50%", view: "front" },
      { id: "ST21", top: "40%", left: "45%", view: "front" },
      { id: "SP16", top: "45%", left: "45%", view: "front" },
      // Front view points - Lower
      { id: "CV6", top: "60%", left: "50%", view: "front" },
      { id: "ST25", top: "60%", left: "45%", view: "front" },
      { id: "CV4", top: "70%", left: "50%", view: "front" },
      // Back view points - Upper
      { id: "GV14", top: "10%", left: "50%", view: "back" },
      { id: "BL13", top: "20%", left: "45%", view: "back" },
      { id: "BL15", top: "25%", left: "45%", view: "back" },
      { id: "BL17", top: "30%", left: "45%", view: "back" },
      // Back view points - Lower
      { id: "GV4", top: "60%", left: "50%", view: "back" },
      { id: "BL23", top: "55%", left: "45%", view: "back" },
      { id: "BL25", top: "65%", left: "45%", view: "back" },
      { id: "BL27", top: "70%", left: "45%", view: "back" }
    ]
  },  legs: {
    title: "LEGS",
    image: "/images/regions/legs.png",
    backImage: "/images/regions/legs-back.png",
    area: {
      top: "50%",
      left: "30%",
      width: "40%",
      height: "35%"
    },
    points: [
      // Front view points - Upper
      { id: "ST31", top: "15%", left: "42%", view: "front" },
      { id: "SP11", top: "20%", left: "45%", view: "front" },
      { id: "ST32", top: "25%", left: "42%", view: "front" },
      // Front view points - Middle
      { id: "ST34", top: "35%", left: "42%", view: "front" },
      { id: "SP9", top: "40%", left: "45%", view: "front" },
      { id: "ST36", top: "45%", left: "42%", view: "front" },
      // Front view points - Lower
      { id: "ST37", top: "55%", left: "42%", view: "front" },
      { id: "SP6", top: "65%", left: "45%", view: "front" },
      { id: "ST41", top: "80%", left: "42%", view: "front" },
      // Back view points - Upper
      { id: "BL36", top: "15%", left: "45%", view: "back" },
      { id: "BL37", top: "25%", left: "45%", view: "back" },
      // Back view points - Middle
      { id: "BL40", top: "45%", left: "50%", view: "back" },
      { id: "BL56", top: "50%", left: "45%", view: "back" },
      // Back view points - Lower
      { id: "BL57", top: "60%", left: "45%", view: "back" },
      { id: "BL60", top: "80%", left: "45%", view: "back" }
    ]
  },  feet: {
    title: "FEET",
    image: "/images/regions/feet.png",
    backImage: "/images/regions/feet-back.png",
    area: {
      top: "85%",
      left: "35%",
      width: "30%",
      height: "15%"
    },
    points: [
      // Front view points
      { id: "SP3", top: "65%", left: "42%", view: "front" },
      { id: "LR3", top: "70%", left: "45%", view: "front" },
      { id: "ST44", top: "75%", left: "42%", view: "front" },
      { id: "SP2", top: "75%", left: "45%", view: "front" },
      { id: "ST45", top: "80%", left: "42%", view: "front" },
      // Back view points
      { id: "KI1", top: "75%", left: "50%", view: "back" },
      { id: "BL65", top: "70%", left: "45%", view: "back" },
      { id: "BL66", top: "75%", left: "45%", view: "back" },
      { id: "BL67", top: "80%", left: "45%", view: "back" }
    ]
  }
};
