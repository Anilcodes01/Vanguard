import React from "react";
import { Code, Mail, Users, MessageCircle } from "lucide-react";

const CodePlatformIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-green-500"
  >
    <path
      d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z"
      fill="currentColor"
    />
  </svg>
);

export default function Footer() {
  return (
    <footer className="relative text-gray-600 overflow-hidden w-full bg-white border-t border-gray-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-green-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        {/* Brand Section - Full Width on Mobile */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-3 group cursor-pointer mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-all duration-300 group-hover:scale-110">
              <CodePlatformIcon />
            </div>
            <span className="text-gray-900 text-2xl font-bold group-hover:text-green-600 transition-colors duration-300">
              Adapt
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm mb-6 max-w-md">
            Empowering developers to build, test, and deploy applications
            faster and more efficiently than ever before.
          </p>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Stay updated
            </p>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors duration-300"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid - 2 Columns on Mobile, 3 on Tablet, 4 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12">
          {/* Product Section */}
          <div>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
              Product
              <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-r from-green-500 to-transparent"></div>
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
              Company
              <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-r from-green-500 to-transparent"></div>
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Press Kit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
              Legal
              <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-r from-green-500 to-transparent"></div>
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-500 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
              Follow Us
              <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-r from-green-500 to-transparent"></div>
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="group p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/10"
              >
                <Code className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
              </a>
              <a
                href="#"
                className="group p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/10"
              >
                <Mail className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
              </a>
              <a
                href="#"
                className="group p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/10"
              >
                <Users className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
              </a>
              <a
                href="#"
                className="group p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/10"
              >
                <MessageCircle className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 mt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © 2025 Adapt. All rights reserved.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-gray-500">
              <a
                href="#"
                className="hover:text-green-600 transition-colors duration-200"
              >
                Status
              </a>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <a
                href="#"
                className="hover:text-green-600 transition-colors duration-200"
              >
                Changelog
              </a>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-600">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}