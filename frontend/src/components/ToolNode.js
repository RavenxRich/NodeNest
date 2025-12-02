import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const ToolNode = ({ tool, position, onClick, onDragEnd, isSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;
    onDragEnd({ x: newX, y: newY });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            data-testid={`tool-node-${tool.id}`}
            drag
            dragMomentum={false}
            dragElastic={0}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            onClick={!isDragging ? onClick : undefined}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: isSelected ? 1.3 : 1,
              x: position.x - 56,
              y: position.y - 56
            }}
            whileHover={{ scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`absolute w-28 h-28 cursor-pointer z-10 ${
              isSelected ? 'glow-pulse' : ''
            }`}
            style={{ touchAction: 'none' }}
          >
            {/* Node Container - Bubble Design */}
            <div className="w-full h-full rounded-full flex items-center justify-center group relative overflow-hidden
                          bg-gradient-to-br from-white/20 via-white/10 to-transparent
                          dark:from-white/15 dark:via-white/8 dark:to-transparent
                          backdrop-blur-xl border-2 border-white/30 dark:border-white/20
                          shadow-[0_8px_32px_0_rgba(139,92,246,0.25)]
                          hover:shadow-[0_12px_48px_0_rgba(139,92,246,0.4)]
                          hover:border-white/40 hover:scale-105
                          transition-all duration-300">
              
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40" />
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
                {tool.favicon ? (
                  <>
                    <img 
                      src={tool.favicon} 
                      alt={tool.title}
                      className="w-16 h-16 rounded-lg object-contain drop-shadow-lg"
                      style={{ display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.fallback-icon');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="fallback-icon hidden w-16 h-16 rounded-lg bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-4xl font-bold text-white drop-shadow-lg">{tool.title.charAt(0).toUpperCase()}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-4xl font-bold text-white drop-shadow-lg">{tool.title.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              
              {/* Favorite indicator */}
              {tool.favorite && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs z-20">
                  ⭐
                </div>
              )}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-sm space-y-1">
            <p className="font-semibold">{tool.title}</p>
            {tool.description && (
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
              <span>🔗 {tool.click_count || 0} clicks</span>
              {tool.last_used && (
                <span>• Last used: {new Date(tool.last_used).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolNode;
