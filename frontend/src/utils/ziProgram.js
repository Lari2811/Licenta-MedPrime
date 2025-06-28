export const ziuaCorecta = (zi) => {
  const zileMap = {
    luni: "Luni",
    marti: "Marți",
    miercuri: "Miercuri",
    joi: "Joi",
    vineri: "Vineri",
    sambata: "Sâmbătă",
    duminica: "Duminică",
  };

  const ziLower = zi.toLowerCase();
  return zileMap[ziLower] || zi.charAt(0).toUpperCase() + zi.slice(1);
};