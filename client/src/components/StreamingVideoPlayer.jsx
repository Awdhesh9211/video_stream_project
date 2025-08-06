import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Wifi, WifiOff, Settings } from 'lucide-react';

const StreamingVideoPlayer = ({videoPath}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState([]);
  const [networkStatus, setNetworkStatus] = useState('good');
  const [loadProgress, setLoadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide controls on mobile
  useEffect(() => {
    if (isMobile && showControls) {
      const timer = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying, isMobile]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    const updateBuffer = () => {
      const buffered = video.buffered;
      const ranges = [];
      for (let i = 0; i < buffered.length; i++) {
        ranges.push({
          start: buffered.start(i),
          end: buffered.end(i)
        });
      }
      setBufferedRanges(ranges);
      
      if (duration > 0) {
        const totalBuffered = ranges.reduce((total, range) => total + (range.end - range.start), 0);
        setLoadProgress((totalBuffered / duration) * 100);
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      setNetworkStatus('slow');
    };
    
    const handleCanPlay = () => {
      setIsBuffering(false);
      setNetworkStatus('good');
    };
    
    const handleError = () => {
      setIsBuffering(false);
      setNetworkStatus('error');
    };

    const handleLoadStart = () => setIsBuffering(true);
    const handleLoadedData = () => setIsBuffering(false);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('progress', updateBuffer);
    video.addEventListener('ended', () => setIsPlaying(false));
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('progress', updateBuffer);
      video.removeEventListener('ended', () => setIsPlaying(false));
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [duration]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        setNetworkStatus('error');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    const isBuffered = bufferedRanges.some(range => 
      newTime >= range.start && newTime <= range.end
    );
    
    if (!isBuffered) {
      setIsBuffering(true);
      setNetworkStatus('slow');
    }
    
    video.currentTime = newTime;
  };

  const handleTouchSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const pos = (touch.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    video.currentTime = Math.max(0, Math.min(duration, newTime));
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    
    const isBuffered = bufferedRanges.some(range => 
      newTime >= range.start && newTime <= range.end
    );
    
    if (!isBuffered) {
      setIsBuffering(true);
    }
    
    video.currentTime = newTime;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        // Fallback for iOS Safari
        if (videoRef.current.webkitEnterFullscreen) {
          videoRef.current.webkitEnterFullscreen();
        }
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleVideoClick = () => {
    if (isMobile) {
      setShowControls(!showControls);
    } else {
      togglePlay();
    }
  };

  const handleVideoTouch = (e) => {
    const currentTime = Date.now();
    if (currentTime - touchStartTime < 300) {
      // Double tap to seek
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.changedTouches[0];
      const pos = touch.clientX - rect.left;
      const centerX = rect.width / 2;
      
      if (pos < centerX) {
        skipTime(-10);
      } else {
        skipTime(10);
      }
    }
    setTouchStartTime(currentTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getNetworkIcon = () => {
    switch (networkStatus) {
      case 'slow': return <WifiOff size={isMobile ? 10 : 12} className="text-yellow-400" />;
      case 'error': return <WifiOff size={isMobile ? 10 : 12} className="text-red-400" />;
      default: return <Wifi size={isMobile ? 10 : 12} className="text-green-400" />;
    }
  };

  const getNetworkText = () => {
    switch (networkStatus) {
      case 'slow': return 'Buffering...';
      case 'error': return 'Error';
      default: return 'Live';
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex flex-col gap-4 items-center justify-center p-2 sm:p-5">
        <div
          className="text-white text-2xl sm:text-3xl font-bold mb-4"
          style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}  

        >
          Streaming Video Player

        </div>
      <div 
        ref={containerRef}
        className={`relative w-full bg-black/20 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 ${
          isFullscreen 
            ? 'max-w-none h-screen rounded-none' 
            : 'max-w-4xl h-48 sm:h-64 md:h-80 lg:h-96'
        }`}
        onMouseEnter={() => !isMobile && setShowControls(true)}
        onMouseLeave={() => !isMobile && setShowControls(false)}
        onMouseMove={() => !isMobile && setShowControls(true)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          // src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          src={videoPath}
          className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
          onClick={handleVideoClick}
          onTouchStart={() => setTouchStartTime(Date.now())}
          onTouchEnd={handleVideoTouch}
          preload="metadata"
          playsInline
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        
        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-2">
              <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin`}></div>
              <span className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'}`}>Buffering...</span>
            </div>
          </div>
        )}
        
        {/* Network Status Indicator */}
        <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-3 right-3'} flex items-center space-x-1 sm:space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1`}>
          {getNetworkIcon()}
          <span className={`text-white/80 font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {getNetworkText()}
          </span>
        </div>
        
        {/* Mobile Tap Indicators */}
        {isMobile && (
          <>
            <div 
              className="absolute left-0 top-0 w-1/3 h-full flex items-center justify-center opacity-0 active:opacity-40 transition-opacity bg-white pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                skipTime(-10);
              }}
            >
              <SkipBack size={24} className="text-white" />
            </div>
            <div 
              className="absolute right-0 top-0 w-1/3 h-full flex items-center justify-center opacity-0 active:opacity-40 transition-opacity bg-white pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                skipTime(10);
              }}
            >
              <SkipForward size={24} className="text-white" />
            </div>
          </>
        )}
        
        {/* Custom Controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 transition-all duration-300 ${
            showControls || isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Bar Row */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-white text-xs">
              <span className="min-w-8 text-center font-mono">
                {formatTime(currentTime)}
              </span>
              
              <div className="flex-1 relative">
                {/* Background Track */}
                <div className="h-1.5 bg-white/20 rounded-full" />
                
                {/* Buffered Ranges */}
                {bufferedRanges.map((range, index) => (
                  <div
                    key={index}
                    className="absolute top-0 h-1.5 bg-white/40 rounded-full"
                    style={{
                      left: `${(range.start / duration) * 100}%`,
                      width: `${((range.end - range.start) / duration) * 100}%`,
                    }}
                  />
                ))}
                
                {/* Progress Bar */}
                <div 
                  className="absolute top-0 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-150"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                />
                
                {/* Seek Handle */}
                {!isMobile && (
                  <div 
                    className="absolute top-1/2 w-3 h-3 bg-white rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{ left: `${(currentTime / duration) * 100 || 0}%`, marginLeft: '-6px' }}
                  />
                )}
                
                {/* Click/Touch Handler */}
                <div 
                  className="absolute inset-0 cursor-pointer group -my-2"
                  onClick={handleSeek}
                  onTouchStart={handleTouchSeek}
                  role="slider"
                  aria-label="Video progress"
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  aria-valuenow={currentTime}
                />
              </div>
              
              <span className="min-w-8 text-center font-mono">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                disabled={networkStatus === 'error'}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause size={16} className="text-white" />
                ) : (
                  <Play size={16} className="text-white ml-0.5" />
                )}
              </button>
              
              {!isMobile && (
                <>
                  <button
                    onClick={() => skipTime(-10)}
                    disabled={networkStatus === 'error'}
                    className="text-white/80 hover:text-white transition-colors p-1 disabled:opacity-50"
                    title="Back 10s"
                    aria-label="Skip back 10 seconds"
                  >
                    <SkipBack size={16} />
                  </button>
                  
                  <button
                    onClick={() => skipTime(10)}
                    disabled={networkStatus === 'error'}
                    className="text-white/80 hover:text-white transition-colors p-1 disabled:opacity-50"
                    title="Forward 10s"
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {/* Volume Controls */}
              <div className="relative flex items-center space-x-2">
                <button
                  onClick={isMobile ? toggleMute : () => setShowVolumeSlider(!showVolumeSlider)}
                  onMouseEnter={() => !isMobile && setShowVolumeSlider(true)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                
                {/* Volume Slider - Desktop only */}
                {!isMobile && (showVolumeSlider || showControls) && (
                  <div 
                    className="flex items-center space-x-2"
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                      aria-label="Volume"
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {networkStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center p-4">
              <WifiOff size={isMobile ? 20 : 24} className="text-red-400 mx-auto mb-2" />
              <p className={`text-white/80 ${isMobile ? 'text-sm' : 'text-base'} mb-3`}>Stream Error</p>
              <button 
                onClick={() => videoRef.current?.load()}
                className={`px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-colors ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}
              >
                Retry Stream
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        @media (max-width: 768px) {
          input[type="range"]::-webkit-slider-thumb {
            width: 14px;
            height: 14px;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
};


export default StreamingVideoPlayer;