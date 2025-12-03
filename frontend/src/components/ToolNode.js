import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ToolNode = ({ tool, position, onClick, onDragEnd, isSelected, onDragStart, onDrag }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    console.log('🟢 Drag started:', tool.title);
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };

  const handleDrag = (event, info) => {
    console.log('🔵 Dragging:', tool.title, 'offset:', info.offset);
    if (onDrag) {
      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;
      onDrag({ x: newX, y: newY });
    }
  };

  const handleDragEnd = (event, info) => {
    console.log('🔴 Drag ended:', tool.title, 'offset:', info.offset);
    
    // Check if this was actually a drag or just a click
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    const wasDragged = dragDistance > 10; // 10px threshold
    
    console.log('Drag distance:', dragDistance, 'Was dragged:', wasDragged);
    
    if (wasDragged) {
      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;
      console.log('📍 Updating position to:', { x: newX, y: newY });
      onDragEnd({ x: newX, y: newY });
    } else {
      console.log('👆 Was just a click, not a drag');
    }
    
    // Small delay to prevent click from firing after drag
    setTimeout(() => {
      setIsDragging(false);
    }, wasDragged ? 150 : 0);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    console.log('🖱️ Node click attempted. isDragging:', isDragging);
    if (!isDragging && onClick) {
      console.log('✅ Node clicked - opening sidebar:', tool.title);
      onClick(tool);
    } else {
      console.log('❌ Click blocked - was dragging');
    }
  };

  return (
    <motion.div
      data-testid={`tool-node-${tool.id}`}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={false}
      dragTransition={{ power: 0, timeConstant: 0 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      initial={{ 
        x: position.x - 28, 
        y: position.y - 28 
      }}
      animate={{ 
        x: position.x - 28, 
        y: position.y - 28 
      }}
      style={{ 
        position: 'absolute',
        width: '56px',
        height: '56px',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        zIndex: isDragging ? 50 : 10
      }}
      whileDrag={{ 
        scale: 1.15,
        rotate: 5,
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.6)',
        cursor: 'grabbing'
      }}
      whileHover={{ scale: 1.1 }}
      className={isSelected ? 'glow-pulse' : ''}
      title={tool.title}
    >
            {/* Node Container - Bubble Design */}
            <div className="w-full h-full rounded-full flex items-center justify-center group relative overflow-hidden
                          bg-gradient-to-br from-white/20 via-white/10 to-transparent
                          dark:from-white/15 dark:via-white/8 dark:to-transparent
                          backdrop-blur-xl border-2 border-white/30 dark:border-white/20
                          shadow-[0_8px_32px_0_rgba(139,92,246,0.25)]
                          hover:shadow-[0_12px_48px_0_rgba(139,92,246,0.4)]
                          hover:border-white/40
                          transition-all duration-300">
              
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40" />
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-center w-full h-full p-1.5">
                {tool.favicon ? (
                  <>
                    <img 
                      src={tool.favicon} 
                      alt={tool.title}
                      className="w-8 h-8 rounded object-contain drop-shadow-lg"
                      style={{ display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.fallback-icon');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="fallback-icon hidden w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xl font-bold text-white drop-shadow-lg">{tool.title.charAt(0).toUpperCase()}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl font-bold text-white drop-shadow-lg">{tool.title.charAt(0).toUpperCase()}</span>
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
  );
};

export default ToolNode;
