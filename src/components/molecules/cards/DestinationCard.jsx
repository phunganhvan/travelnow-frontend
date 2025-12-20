import React from 'react';

const DestinationCard = ({ name, imageUrl }) => {
  return (
    <article className="group overflow-hidden rounded-2xl bg-slate-900/5 shadow-card transition-transform hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 w-full">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <h3 className="absolute bottom-4 left-4 text-lg font-semibold text-white drop-shadow">
          {name}
        </h3>
      </div>
    </article>
  );
};

export default DestinationCard;