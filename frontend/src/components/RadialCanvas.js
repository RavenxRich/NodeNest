import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import ToolNode from './ToolNode';
import { useStorage } from '../contexts/StorageContext';

const RadialCanvas = memo(({ tools, onToolClick, onToolMove, selectedTool, setSelectedTool }) => {
  const { categories } = useStorage();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredRingIndex, setHoveredRingIndex] = useState(null);
  const [ghostPosition, setGhostPosition] = useState(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 80 // Account for header
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Memoized center coordinates
  const centerX = useMemo(() => dimensions.width / 2, [dimensions.width]);
  const centerY = useMemo(() => dimensions.height / 2, [dimensions.height]);

  // Memoized ring calculations
  const ringRadiuses = useMemo(() => {
    const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.48;
    const totalCategories = categories.length;
    const ringSpacing = maxRadius / totalCategories;
    return categories.map((_, idx) => ringSpacing * (idx + 1));
  }, [dimensions.width, dimensions.height, categories.length]);

  // Memoized tools grouped by category
  const toolsByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = tools.filter(t => t.category_id === category.id);
      return acc;
    }, {});
  }, [categories, tools]);

  // Calculate position for a tool
  const getToolPosition = useCallback((tool, categoryIndex) => {
    if (tool.position?.angle !== undefined && tool.position?.radius !== undefined) {
      return {
        x: centerX + tool.position.radius * Math.cos(tool.position.angle),
        y: centerY + tool.position.radius * Math.sin(tool.position.angle)
      };
    }

    const categoryTools = toolsByCategory[tool.category_id] || [];
    const toolIndex = categoryTools.findIndex(t => t.id === tool.id);
    const totalInCategory = categoryTools.length;
    
    const baseAngle = (categoryIndex * Math.PI / 4);
    const toolAngle = (toolIndex / Math.max(totalInCategory, 1)) * 2 * Math.PI;
    const angle = baseAngle + toolAngle;
    const radius = ringRadiuses[categoryIndex] || ringRadiuses[0];

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }, [centerX, centerY, toolsByCategory, ringRadiuses]);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag movement
  const handleDrag = useCallback((dragPosition) => {
    const dx = dragPosition.x - centerX;
    const dy = dragPosition.y - centerY;
    const dragRadius = Math.sqrt(dx * dx + dy * dy);
    
    let closestRingIndex = 0;
    let minDistance = Math.abs(dragRadius - ringRadiuses[0]);
    
    for (let i = 1; i < ringRadiuses.length; i++) {
      const distance = Math.abs(dragRadius - ringRadiuses[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestRingIndex = i;
      }
    }
    
    const angle = Math.atan2(dy, dx);
    const snappedRadius = ringRadiuses[closestRingIndex];
    const ghostX = centerX + snappedRadius * Math.cos(angle);
    const ghostY = centerY + snappedRadius * Math.sin(angle);
    
    setHoveredRingIndex(closestRingIndex);
    setGhostPosition({ x: ghostX, y: ghostY });
  }, [centerX, centerY, ringRadiuses]);

  // Handle drag end
  const handleDragEnd = useCallback((toolId, newPosition) => {
    setIsDragging(false);
    setHoveredRingIndex(null);
    setGhostPosition(null);
    onToolMove(toolId, newPosition, ringRadiuses, categories);
  }, [onToolMove, ringRadiuses, categories]);

  // Memoized SVG ring paths
  const ringPaths = useMemo(() => 
    categories.map((category, idx) => {
      const radius = ringRadiuses[idx];
      return {
        id: `ring-path-${category.id}`,
        d: `M ${centerX - radius}, ${centerY} a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`,
        radius,
        category
      };
    }), [categories, ringRadiuses, centerX, centerY]);

  return (
    <div className="relative w-full h-full" data-testid="radial-canvas">
      {/* SVG Rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {ringPaths.map(({ id, d }) => (
            <path key={id} id={id} d={d} fill="none" />
          ))}
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {ringPaths.map(({ id, radius, category }, idx) => {
          const isHovered = isDragging && hoveredRingIndex === idx;
          return (
            <g key={category.id}>
              {/* Glow effect for hovered ring */}
              {isHovered && (
                <motion.circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke={category.color}
                  strokeWidth="12"
                  strokeOpacity="0.3"
                  filter="url(#glow)"
                  initial={{ strokeOpacity: 0 }}
                  animate={{ strokeOpacity: 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              {/* Ring circle */}
              <motion.circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={category.color}
                strokeWidth={isHovered ? "6" : "2"}
                strokeOpacity={isHovered ? "1.0" : "0.45"}
                strokeDasharray={isHovered ? "0" : "10 5"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  strokeWidth: isHovered ? 6 : 2,
                  strokeOpacity: isHovered ? 1.0 : 0.45,
                  strokeDasharray: isHovered ? "0" : "10 5"
                }}
                transition={{ duration: 0.2 }}
              />
              {/* Category label on curved path */}
              <motion.text
                fill={category.color}
                fontSize="13"
                fontWeight="700"
                className="font-sans uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
              >
                <textPath href={`#${id}`} startOffset="25%">
                  {category.name}
                </textPath>
              </motion.text>
            </g>
          );
        })}
        
        {/* Center point */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="url(#centerGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        />
        
        {/* Ghost preview when dragging */}
        {isDragging && ghostPosition && hoveredRingIndex !== null && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <circle
              cx={ghostPosition.x}
              cy={ghostPosition.y}
              r="28"
              fill={categories[hoveredRingIndex]?.color || '#8B5CF6'}
              opacity="0.3"
              filter="url(#glow)"
            />
            <circle
              cx={ghostPosition.x}
              cy={ghostPosition.y}
              r="28"
              fill="none"
              stroke={categories[hoveredRingIndex]?.color || '#8B5CF6'}
              strokeWidth="3"
              strokeDasharray="5 5"
              opacity="0.8"
            />
            <motion.circle
              cx={ghostPosition.x}
              cy={ghostPosition.y}
              r="28"
              fill="none"
              stroke={categories[hoveredRingIndex]?.color || '#8B5CF6'}
              strokeWidth="2"
              opacity="0.4"
              animate={{ 
                r: [28, 36, 28],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.g>
        )}
      </svg>

      {/* Tool Nodes */}
      {categories.map((category, categoryIndex) => {
        const categoryTools = toolsByCategory[category.id] || [];
        return categoryTools.map((tool) => {
          const position = getToolPosition(tool, categoryIndex);
          return (
            <ToolNode
              key={tool.id}
              tool={tool}
              position={position}
              onClick={() => onToolClick(tool)}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={(newPosition) => handleDragEnd(tool.id, newPosition)}
              isSelected={selectedTool?.id === tool.id}
            />
          );
        });
      })}
    </div>
  );
});

RadialCanvas.displayName = 'RadialCanvas';

export default RadialCanvas;
