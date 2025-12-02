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
            {/* Node Container */}
            <div className="w-full h-full rounded-xl glass flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow group bg-slate-900/50 dark:bg-slate-800/50 border border-white/10">
              {tool.favicon ? (
                <>
                  <img 
                    src={tool.favicon} 
                    alt={tool.title}
                    className="w-10 h-10 rounded-lg object-contain"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.fallback-icon');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="fallback-icon hidden w-10 h-10 rounded-lg bg-violet-500/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{tool.title.charAt(0).toUpperCase()}</span>
                  </div>
                </>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-violet-500/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{tool.title.charAt(0).toUpperCase()}</span>
                </div>
              )}
              
              {/* Favorite indicator */}
              {tool.favorite && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
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
