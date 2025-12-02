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
              scale: isSelected ? 1.2 : 1,
              x: position.x - 32,
              y: position.y - 32
            }}
            whileHover={{ scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`absolute w-16 h-16 cursor-pointer z-10 ${
              isSelected ? 'glow-pulse' : ''
            }`}
            style={{ touchAction: 'none' }}
          >
            {/* Node Container */}
            <div className="w-full h-full rounded-xl glass flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow group">
              {tool.favicon ? (
                <img 
                  src={tool.favicon} 
                  alt={tool.title}
                  className="w-10 h-10 rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center ${tool.favicon ? 'hidden' : 'flex'}`}>
                <span className="text-2xl">{tool.title.charAt(0).toUpperCase()}</span>
              </div>
              
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
