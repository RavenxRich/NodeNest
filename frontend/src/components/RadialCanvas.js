import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ToolNode from './ToolNode';
import { useStorage } from '../contexts/StorageContext';

const RadialCanvas = ({ tools, onToolClick, onToolMove, selectedTool, setSelectedTool }) => {
  const { categories } = useStorage();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredRingIndex, setHoveredRingIndex] = useState(null);
  const [draggedTool, setDraggedTool] = useState(null);
  const [ghostPosition, setGhostPosition] = useState(null);

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

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Calculate ring radiuses to fit all rings on screen
  // Keep original 43px ring spacing, nodes will be 38px to fit within rings
  const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.48; // Max 48% of smallest dimension
  const totalCategories = categories.length;
  const ringSpacing = maxRadius / totalCategories;
  const ringRadiuses = categories.map((_, idx) => ringSpacing * (idx + 1));

  // Distribute tools across their category rings
  const toolsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = tools.filter(t => t.category_id === category.id);
    return acc;
  }, {});

  // Calculate positions for tools if not already set
  const getToolPosition = (tool, categoryIndex) => {
    if (tool.position && tool.position.angle !== undefined && tool.position.radius !== undefined) {
      // Use existing position
      const angle = tool.position.angle;
      const radius = tool.position.radius;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    }

    // Calculate new position
    const categoryTools = toolsByCategory[tool.category_id] || [];
    const toolIndex = categoryTools.findIndex(t => t.id === tool.id);
    const totalInCategory = categoryTools.length;
    
    // Distribute tools evenly around the ring
    // Add category index offset so different categories don't overlap
    const baseAngle = (categoryIndex * Math.PI / 4); // Offset each category by 45 degrees
    const toolAngle = (toolIndex / Math.max(totalInCategory, 1)) * 2 * Math.PI;
    const angle = baseAngle + toolAngle;
    const radius = ringRadiuses[categoryIndex] || ringRadiuses[0];

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  return (
    <div className="relative w-full h-full overflow-hidden" data-testid="radial-canvas">
      {/* SVG Rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {categories.map((category, idx) => {
            const radius = ringRadiuses[idx];
            const pathId = `ring-path-${category.id}`;
            return (
              <path
                key={pathId}
                id={pathId}
                d={`M ${centerX - radius}, ${centerY} a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
                fill="none"
              />
            );
          })}
        </defs>
        
        {categories.map((category, idx) => {
          const radius = ringRadiuses[idx];
          const pathId = `ring-path-${category.id}`;
          const isHovered = isDragging && hoveredRingIndex === idx;
          return (
            <g key={category.id}>
              {/* Ring circle */}
              <motion.circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={category.color}
                strokeWidth={isHovered ? "4" : "2"}
                strokeOpacity={isHovered ? "0.8" : "0.45"}
                strokeDasharray="10 5"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  strokeWidth: isHovered ? 4 : 2,
                  strokeOpacity: isHovered ? 0.8 : 0.45
                }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
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
                <textPath href={`#${pathId}`} startOffset="25%">
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
        <defs>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </radialGradient>
        </defs>
      </svg>

      {/* Tool Nodes */}
      {categories.map((category, categoryIndex) => {
        const categoryTools = toolsByCategory[category.id] || [];
        return categoryTools.map((tool, toolIdx) => {
          const position = getToolPosition(tool, categoryIndex);
          return (
            <ToolNode
              key={tool.id}
              tool={tool}
              position={position}
              onClick={() => onToolClick(tool)}
              onDragStart={() => setIsDragging(true)}
              onDrag={(dragPosition) => {
                // Calculate which ring is closest during drag
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
                
                setHoveredRingIndex(closestRingIndex);
              }}
              onDragEnd={(newPosition) => {
                setIsDragging(false);
                setHoveredRingIndex(null);
                onToolMove(tool.id, newPosition, ringRadiuses, categories);
              }}
              isSelected={selectedTool?.id === tool.id}
            />
          );
        });
      })}
    </div>
  );
};

export default RadialCanvas;
