const Card = ({ icon, color, value, text }) => {
    return (
      <div
        className={`border-2 border-${color}-400 flex items-center gap-4 p-4 bg-${color}-200`}
      >
        <div>{icon}</div>
        <div>
          <h5 className="font-semibold text-lg"> {value}</h5>
          <h6 className="text-md text-gray-700 font-medium">{text}</h6>
        </div>
      </div>
    );
  };
  
  export default Card;
  