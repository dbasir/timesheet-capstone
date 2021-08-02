
 const isEmpty = (value) => {
  if (value === '') return true;
  return false;
};
  module.exports = isEmpty;

  const inRange = (value) => {
    if(value > 0 && value <= 5) return value;
    return false;
  };

module.exports = inRange;



const checkIfEmpty = (value) => {
  if (isEmpty(value.trim())) {
    return false; 
  } else {
    return true;
  }
};
module.exports = checkIfEmpty;