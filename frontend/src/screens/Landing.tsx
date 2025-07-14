import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import chessboardImage from '../assets/chessboard.png';

export const Landing = () => {
  const stats = {
    gamesToday: '18,448,311',
    playingNow: '219,413',
  };
  const navigate=useNavigate();
  const [mode, setMode] = useState<null | 'create' | 'join'>(null);
  const [roomId, setRoomId] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [error, setError] = useState('');

  // Generate a random room ID (same as backend)
  const generateRoomId = () => Math.random().toString(36).substr(2, 8);

  const handleCreate = () => {
    const newId = generateRoomId();
    setCreatedRoomId(newId);
    setMode('create');
  };

  const handleJoin = () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID.');
      return;
    }
    setError('');
    navigate(`/game?roomId=${roomId.trim()}`);
  };

  const handleStartCreated = () => {
    navigate(`/game?roomId=${createdRoomId}`, { state: { created: true } });
  };

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

              {/* Room Selection UI */}
              <div className="pt-6 flex flex-col items-center gap-4">
                {!mode && (
                  <>
                    <button
                      onClick={handleCreate}
                      className="w-64 mb-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl px-8 py-4 rounded-2xl shadow-2xl border-2 border-green-400 hover:border-green-300 transition-all duration-300"
                    >
                      Create Game
                    </button>
                    <button
                      onClick={() => setMode('join')}
                      className="w-64 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-2xl shadow-2xl border-2 border-blue-400 hover:border-blue-300 transition-all duration-300"
                    >
                      Join Game
                    </button>
                  </>
                )}
                {mode === 'create' && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="text-lg text-gray-200">Share this Room ID with your friend:</div>
                    <div className="text-2xl font-mono bg-gray-900 text-green-400 px-6 py-2 rounded-lg border border-green-500 select-all">{createdRoomId}</div>
                    <button
                      onClick={handleStartCreated}
                      className="mt-4 w-48 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                    >
                      Start Game
                    </button>
                    <button
                      onClick={() => { setMode(null); setCreatedRoomId(''); }}
                      className="mt-2 text-sm text-gray-400 hover:underline"
                    >Back</button>
                  </div>
                )}
                {mode === 'join' && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <input
                      className="w-64 px-4 py-2 rounded-lg border border-blue-400 text-white-900 text-lg focus:outline-none focus:ring"
                      type="text"
                      placeholder="Enter Room ID"
                      value={roomId}
                      onChange={e => setRoomId(e.target.value)}
                    />
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                    <button
                      onClick={handleJoin}
                      className="w-48 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
                    >
                      Join Game
                    </button>
                    <button
                      onClick={() => { setMode(null); setRoomId(''); setError(''); }}
                      className="mt-2 text-sm text-gray-400 hover:underline"
                    >Back</button>
                  </div>
                )}
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