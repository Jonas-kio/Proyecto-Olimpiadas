/* eslint-disable react/prop-types */


const Button = ({ 
  children, 
  onClick, 
  icon, 
  variant = 'primary', 
  className = '',
  type = 'button'
}) => {
  let buttonClassName = '';
  
  switch (variant) {
    case 'primary':
      buttonClassName = 'add-button';
      break;
    case 'cancel':
      buttonClassName = 'btn-cancel';
      break;
    case 'save':
      buttonClassName = 'btn-save';
      break;
    default:
      buttonClassName = 'add-button';
  }
  
  return (
    <button 
      type={type}
      className={`${buttonClassName} ${className}`} 
      onClick={onClick}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;