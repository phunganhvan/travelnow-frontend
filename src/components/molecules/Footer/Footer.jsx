import React from 'react';
import { Facebook, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="app-container grid gap-10 py-10 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="text-sm font-bold">T</span>
            </div>
            <span className="text-base font-semibold text-slate-900">
              TravelNow
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Đối tác tin cậy cho những chuyến đi đáng nhớ. Đặt phòng, vé
            máy bay và trải nghiệm một cách an tâm.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-slate-900">Công ty</h4>
          <ul className="space-y-1 text-slate-500">
            <li>Về chúng tôi</li>
            <li>Tuyển dụng</li>
            <li>Báo chí</li>
            <li>Blog</li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-slate-900">Hỗ trợ</h4>
          <ul className="space-y-1 text-slate-500">
            <li>Trung tâm trợ giúp</li>
            <li>Điều khoản dịch vụ</li>
            <li>Chính sách bảo mật</li>
            <li>Liên hệ</li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-slate-900">
            Theo dõi chúng tôi
          </h4>
          <div className="flex gap-3">
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4">
        <div className="app-container text-center text-xs text-slate-400">
          © 2025 TravelNow Inc. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
};

export default Footer;