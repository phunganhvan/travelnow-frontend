import React from 'react';
import { Gift } from 'lucide-react';
import Badge from '../../atoms/Badge/Badge';
import Button from '../../atoms/Button/Button';

const OfferCard = ({
  tagColor = 'green',
  tagLabel,
  title,
  description,
  ctaLabel,
  imageUrl,
  floatingIcon
}) => {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="relative h-44 w-full">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4">
          <Badge color={tagColor}>{tagLabel}</Badge>
        </div>
        {floatingIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg">
              <Gift size={18} />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <h3 className="text-base font-semibold text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-600">{description}</p>
        <div className="mt-auto pt-1">
          <Button
            variant="primary"
            size="md"
            className="w-full rounded-xl"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default OfferCard;