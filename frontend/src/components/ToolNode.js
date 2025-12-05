import React, { useState, useCallback, memo } from 'react';
import { motion, useMotionValue } from 'framer-motion';

// Memoized ToolNode for better performance with many nodes
const ToolNode = memo(({ tool, position, onClick, onDragEnd, isSelected, onDragStart, onDrag }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion values for smooth drag - prevents animate from fighting with drag
  const x = useMotionValue(position.x - 28);
  const y = useMotionValue(position.y - 28);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    if (onDragStart) onDragStart();
  }, [onDragStart]);

  const handleDrag = useCallback((event, info) => {
    if (onDrag) {
      const currentX = position.x + info.offset.x;
      const currentY = position.y + info.offset.y;
      onDrag({ x: currentX, y: currentY });
    }
  }, [onDrag, position.x, position.y]);

  const handleDragEnd = useCallback((event, info) => {
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    const wasDragged = dragDistance > 10;
    
    if (wasDragged) {
      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;
      onDragEnd({ x: newX, y: newY });
    }
    
    // Reset position after drag (will animate back if not moved to new category)
    x.set(position.x - 28);
    y.set(position.y - 28);
    
    setTimeout(() => {
      setIsDragging(false);
    }, wasDragged ? 150 : 0);
  }, [position.x, position.y, onDragEnd, x, y]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (!isDragging && onClick) {
      onClick(tool);
    }
  }, [isDragging, onClick, tool]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
    const fallback = e.target.parentElement.querySelector('.fallback-icon');
    if (fallback) fallback.style.display = 'flex';
  }, []);

  // Update motion values when position prop changes
  React.useEffect(() => {
    if (!isDragging) {
      x.set(position.x - 28);
      y.set(position.y - 28);
    }
  }, [position.x, position.y, isDragging, x, y]);

  return (
    <motion.div
      data-testid={`tool-node-${tool.id}`}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={{ 
        x,
        y,
        position: 'absolute',
        width: '56px',
        height: '56px',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        zIndex: isDragging ? 100 : 10
      }}
      animate={{
        scale: isDragging ? 1.25 : 1,
        rotate: isDragging ? 10 : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 25 },
        rotate: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      whileHover={{ 
        scale: 1.1,
      }}
      className={isSelected ? 'glow-pulse' : ''}
      title={tool.title}
    >
      {/* Drag glow effect layer */}
      <motion.div
        className="absolute inset-[-12px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 70%)',
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: isDragging ? 1 : 0,
          scale: isDragging ? 1.5 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Pulsing rings when dragging */}
      {isDragging && (
        <>
          <motion.div
            className="absolute inset-[-6px] rounded-full border-2 border-violet-400 pointer-events-none"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute inset-[-4px] rounded-full border-2 border-cyan-400 pointer-events-none"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3
            }}
          />
        </>
      )}
      
      {/* Node Container - Bubble Design */}
      <motion.div 
        className={`w-full h-full rounded-full flex items-center justify-center group relative overflow-hidden
                    bg-gradient-to-br from-white/20 via-white/10 to-transparent
                    dark:from-white/15 dark:via-white/8 dark:to-transparent
                    backdrop-blur-xl border-2 
                    hover:border-white/40
                    transition-colors duration-300`}
        animate={{
          borderColor: isDragging ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.3)',
          boxShadow: isDragging 
            ? '0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.4), 0 20px 40px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(139, 92, 246, 0.25)',
        }}
        transition={{ duration: 0.2 }}
      >
        
        {/* Inner glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 via-violet-400/20 to-cyan-500/30"
          animate={{
            opacity: isDragging ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Shine effect */}
        <div className={`absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent 
                        ${isDragging ? 'opacity-70' : 'opacity-40'} transition-opacity duration-200`} />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full h-full p-1.5">
          {tool.favicon ? (
            <>
              <img 
                src={tool.favicon} 
                alt={tool.title}
                className="w-8 h-8 rounded object-contain drop-shadow-lg"
                style={{ display: 'block' }}
                onError={handleImageError}
                loading="lazy"
                draggable={false}
              />
              <div className="fallback-icon hidden w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl font-bold text-white drop-shadow-lg">
                  {tool.title?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            </>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/40 to-cyan-500/40 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl font-bold text-white drop-shadow-lg">
                {tool.title?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
        
        {/* Favorite indicator */}
        {tool.favorite && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs z-20 shadow-md">
            ⭐
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});

// Display name for React DevTools
ToolNode.displayName = 'ToolNode';

export default ToolNode;
