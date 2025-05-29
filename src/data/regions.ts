import { RegionDataMap } from '../types/bodymap';

export const regionData: RegionDataMap = {
  head: {
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
      { id: "GB20", top: "20%", left: "25%" },
      { id: "LU3", top: "35%", left: "78%" },
      { id: "LI20", top: "55%", left: "42%" },
      { id: "DU26", top: "72%", left: "58%" }
    ]
  },  arms: {
    title: "ARMS",
    image: "/images/regions/arms.png",
    backImage: "/images/regions/arms-back.png",
    area: {
      top: "20%",
      left: "25%",
      width: "50%",
      height: "30%"
    },
    points: [
      { id: "LI11", top: "40%", left: "30%" },
      { id: "PC6", top: "60%", left: "50%" }
    ]
  },  trunk: {
    title: "TRUNK",
    image: "/images/regions/trunk.png",
    backImage: "/images/regions/trunk-back.png",
    area: {
      top: "20%",
      left: "30%",
      width: "40%",
      height: "35%"
    },
    points: [
      { id: "CV17", top: "45%", left: "50%" },
      { id: "SP21", top: "40%", left: "65%" }
    ]
  },  legs: {
    title: "LEGS",
    image: "/images/regions/legs.png",
    backImage: "/images/regions/legs-back.png",
    area: {
      top: "55%",
      left: "35%",
      width: "30%",
      height: "35%"
    },
    points: [
      { id: "ST36", top: "60%", left: "45%" },
      { id: "SP10", top: "50%", left: "60%" }
    ]
  },  feet: {
    title: "FEET",
    image: "/images/regions/feet.png",
    backImage: "/images/regions/feet-back.png",
    area: {
      top: "90%",
      left: "35%",
      width: "30%",
      height: "10%"
    },
    points: [
      { id: "KI1", top: "80%", left: "50%" },
      { id: "LV3", top: "70%", left: "40%" }
    ]
  }
};
