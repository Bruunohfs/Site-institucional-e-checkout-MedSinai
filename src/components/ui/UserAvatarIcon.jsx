// src/components/ui/UserAvatarIcon.jsx
export const UserAvatarIcon = ({ className = "w-12 h-12" }) => (
  <div className={`${className} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="60%" // O ícone ocupará 60% do círculo
      height="60%"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="text-gray-400 dark:text-gray-500"
    >
      <path d="M18 20a6 6 0 0 0-12 0" />
      <circle cx="12" cy="10" r="4" />
    </svg>
  </div>
 );
