import React from "react";

const UserInfo = ({ user }) => {
  const name = user?.name || "Unknown";
  const profile = user?.profile || "https://th.bing.com/th?q=Gmail+H+Default+Profile+Pic&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247"
  return (
    <>
    <div className="flex items-center space-x-2 p-2 rounded-md bg-black-900 text-white">
      <img
        src={profile}
        alt={name}
        className="w-6 h-6 rounded-full object-cover"
      />
      <span className="text-lg">{name}</span>
    </div>
    </>
  );
};

export default UserInfo;
