import React from 'react';
import {useNavigate} from 'react-router-dom';
import chessboardImage from '../assets/chessboard.png';

export const Landing = () => {
  const stats = {
    gamesToday: '18,448,311',
    playingNow: '219,413',
  };
  const navigate=useNavigate();
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white rotate-45"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border border-white rotate-12"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-white -rotate-12"></div>
        <div className="absolute bottom-40 right-40 w-12 h-12 border border-white rotate-45"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Chess Board Section */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src={chessboardImage}
                  alt="Chess Board"
                  className="w-96 h-96 lg:w-[480px] lg:h-[480px] object-contain rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300"
                />
                {/* Floating stats */}
                <div className="absolute -top-6 -right-6 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  Live!
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="text-center lg:text-left space-y-8">
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Play Chess Online
                </h1>
                <h2 className="text-3xl lg:text-5xl font-bold text-green-400">
                  on the #1 Site!
                </h2>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xl lg:text-2xl text-gray-300">
                    <span className="font-bold text-white text-2xl lg:text-3xl">{stats.gamesToday}</span> Games Today
                  </p>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-xl lg:text-2xl text-gray-300">
                    <span className="font-bold text-white text-2xl lg:text-3xl">{stats.playingNow}</span> Playing Now
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <button onClick={()=>{navigate("/game")}}className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400 hover:border-green-300">
                  <span className="relative z-10 flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                    </svg>
                    Play Online
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Additional Info */}
              <div className="pt-8 space-y-2 text-gray-400">
                <p className="text-lg">Play with someone at your level</p>
                <p className="text-sm">Free • No registration required • Instant matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
    </div>
  );
};