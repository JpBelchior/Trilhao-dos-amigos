import React from "react";
const ActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  color = "green",
  badge = null,
}) => {
  // Definir classes de cor
  const getColorClasses = () => {
    switch (color) {
      case "yellow":
        return {
          border: "border-yellow-400/30 hover:border-yellow-400/60",
          icon: "text-yellow-400",
          badge: "bg-yellow-600/20 text-yellow-400",
        };
      default: // green
        return {
          border: "border-green-400/30 hover:border-green-400/60",
          icon: "text-green-400",
          badge: "bg-green-600/20 text-green-400",
        };
    }
  };
  const classes = getColorClasses();
  return (
    <div
      onClick={onClick}
      className={`bg-black/40 backdrop-blur-lg rounded-3xl p-8 border ${classes.border} transition-all cursor-pointer transform hover:scale-105`}
    >
      <Icon className={`${classes.icon} mb-4`} size={48} />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      {badge && (
        <div className={`${classes.badge} rounded-xl p-2 text-center`}>
          <span className="font-bold">{badge}</span>
        </div>
      )}
    </div>
  );
};
export default ActionCard;
