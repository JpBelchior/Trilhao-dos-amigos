import React from "react";
const StatCard = ({ icon: Icon, value, label, color = "green" }) => {
  // Definir classes de cor
  const getColorClasses = () => {
    switch (color) {
      case "yellow":
        return {
          border: "border-yellow-400/30 hover:border-yellow-400/60",
          icon: "text-yellow-400",
          value: "text-yellow-400",
        };
      case "white":
        return {
          border: "border-green-400/30 hover:border-green-400/60",
          icon: "text-green-400",
          value: "text-white",
        };
      default: // green
        return {
          border: "border-green-400/30 hover:border-green-400/60",
          icon: "text-green-400",
          value: "text-green-400",
        };
    }
  };
  const classes = getColorClasses();
  return (
    <div
      className={`bg-black/40 backdrop-blur-lg rounded-2xl p-6 border ${classes.border} text-center transition-all`}
    >
      <Icon className={`mx-auto ${classes.icon} mb-2`} size={32} />
      <div className={`text-3xl font-black ${classes.value} mb-1`}>{value}</div>
      <div className="text-gray-300 text-sm">{label}</div>
    </div>
  );
};
export default StatCard;
