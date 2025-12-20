import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../atoms/Button/Button';
import TextInput from '../../atoms/inputs/TextInput';
import DateInput from '../../atoms/inputs/DateInput';
import HeroSearchTabs from '../HeroSearchTabs/HeroSearchTabs';

/**
 * Form tìm kiếm chính ở hero.
 * Dùng react-hook-form để quản lý state.
 */
const HeroSearchForm = () => {
  const [activeTab, setActiveTab] = useState('hotel');
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    watch,
    register,
    formState: { errors }
  } = useForm({
    defaultValues: {
      destination: '',
      checkIn: '',
      checkOut: '',
      activityDate: '',
      adults: 2,
      children: 0
    }
  });

  const checkInWatch = watch('checkIn');
  const isActivity = activeTab === 'activity';

  const onSubmit = (values) => {
    if (isActivity && !values.activityDate) {
      toast.error('Vui lòng chọn ngày đi');
      return;
    }

    const adults = Number(values.adults ?? 0);
    const children = Number(values.children ?? 0);
    const guestsLabel = `${adults} người lớn, ${children} trẻ em`;

    const params = new URLSearchParams();
    if (values.destination) params.set('destination', values.destination);
    if (isActivity) {
      if (values.activityDate) params.set('checkIn', values.activityDate);
      params.set('type', 'activity');
    } else {
      if (values.checkIn) params.set('checkIn', values.checkIn);
      if (values.checkOut) params.set('checkOut', values.checkOut);
      params.set('type', 'hotel');
    }

    params.set('adults', String(adults));
    params.set('children', String(children));
    params.set('guests', guestsLabel);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="mt-6 w-full max-w-5xl rounded-2xl bg-white p-4 shadow-card sm:mt-8 sm:p-6 lg:mt-10 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <HeroSearchTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 lg:flex-row lg:items-end"
      >
        {isActivity ? (
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
            {/* Destination */}
            <Controller
              name="destination"
              control={control}
              rules={{ required: 'Vui lòng nhập điểm đến' }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Điểm đến"
                  placeholder="Bạn muốn đi đâu?"
                  icon={MapPin}
                  error={fieldState.error}
                  {...field}
                />
              )}
            />

            {/* Ngày đi */}
            <Controller
              name="activityDate"
              control={control}
              render={({ field, fieldState }) => (
                <DateInput
                  label="Ngày đi"
                  error={fieldState.error}
                  {...field}
                />
              )}
            />
            {/* Guests flexible */}
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm md:col-span-2">
              <span className="text-xs font-medium text-slate-600">Số khách</span>
              <div className="mt-2 flex gap-3">
                <div className="flex flex-1 flex-col gap-1 text-xs">
                  <span className="text-slate-500">Người lớn</span>
                  <input
                    type="number"
                    min={1}
                    className="h-9 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    {...register('adults', {
                      valueAsNumber: true,
                      min: { value: 1, message: 'Ít nhất 1 người lớn' }
                    })}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 text-xs">
                  <span className="text-slate-500">Trẻ em</span>
                  <input
                    type="number"
                    min={0}
                    className="h-9 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    {...register('children', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Không được âm' }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            {/* Destination */}
            <Controller
              name="destination"
              control={control}
              rules={{ required: 'Vui lòng nhập điểm đến' }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Điểm đến"
                  placeholder="Bạn muốn đi đâu?"
                  icon={MapPin}
                  error={fieldState.error}
                  {...field}
                />
              )}
            />

            {/* Check-in */}
            <Controller
              name="checkIn"
              control={control}
              rules={{ required: 'Vui lòng chọn ngày nhận phòng' }}
              render={({ field, fieldState }) => (
                <DateInput
                  label="Nhận phòng"
                  error={fieldState.error || errors.checkIn}
                  {...field}
                />
              )}
            />

            {/* Check-out */}
            <Controller
              name="checkOut"
              control={control}
              rules={{
                required: 'Vui lòng chọn ngày trả phòng',
                validate: (value, formValues) => {
                  if (formValues.checkIn && value < formValues.checkIn) {
                    return 'Ngày trả phòng phải sau hoặc bằng ngày nhận phòng';
                  }
                  return true;
                }
              }}
              render={({ field, fieldState }) => (
                <DateInput
                  label="Trả phòng"
                  min={checkInWatch || undefined}
                  error={fieldState.error}
                  {...field}
                />
              )}
            />

            {/* Guests flexible */}
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm md:col-span-3">
              <span className="text-xs font-medium text-slate-600">Số khách</span>
              <div className="mt-2 flex gap-3">
                <div className="flex flex-1 flex-col gap-1 text-xs">
                  <span className="text-slate-500">Người lớn</span>
                  <input
                    type="number"
                    min={1}
                    className="h-9 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    {...register('adults', {
                      valueAsNumber: true,
                      min: { value: 1, message: 'Ít nhất 1 người lớn' }
                    })}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 text-xs">
                  <span className="text-slate-500">Trẻ em</span>
                  <input
                    type="number"
                    min={0}
                    className="h-9 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    {...register('children', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Không được âm' }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex w-full justify-end lg:w-auto">
          <Button
            type="submit"
            size="lg"
            className="w-full lg:w-auto"
          >
            Tìm kiếm
          </Button>
        </div>
      </form>
    </section>
  );
};

export default HeroSearchForm;