import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, TrendingUp, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Stats = () => {
  const navigate = useNavigate();
  const { tools, categories } = useStorage();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClicks = tools.reduce((sum, t) => sum + (t.click_count || 0), 0);
    const avgClicksPerTool = tools.length > 0 ? (totalClicks / tools.length).toFixed(1) : 0;
    
    // Most used tools
    const mostUsed = [...tools]
      .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
      .slice(0, 10);
    
    // Recently used
    const recentlyUsed = [...tools]
      .filter(t => t.last_used)
      .sort((a, b) => new Date(b.last_used) - new Date(a.last_used))
      .slice(0, 10);
    
    // Category distribution
    const categoryDist = categories.map(cat => ({
      name: cat.name,
      value: tools.filter(t => t.category_id === cat.id).length,
      color: cat.color
    })).filter(c => c.value > 0);
    
    // Favorites
    const favorites = tools.filter(t => t.favorite);
    
    // Never used
    const neverUsed = tools.filter(t => !t.click_count || t.click_count === 0);

    return {
      totalTools: tools.length,
      totalClicks,
      avgClicksPerTool,
      mostUsed,
      recentlyUsed,
      categoryDist,
      favorites,
      neverUsed
    };
  }, [tools, categories]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            data-testid="back-btn"
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold gradient-text mb-2">Usage Statistics</h1>
          <p className="text-muted-foreground mb-8">Insights into your tool usage patterns</p>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-testid="stats-overview">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Tools</CardDescription>
                <CardTitle className="text-3xl">{stats.totalTools}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Clicks</CardDescription>
                <CardTitle className="text-3xl">{stats.totalClicks}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg Clicks/Tool</CardDescription>
                <CardTitle className="text-3xl">{stats.avgClicksPerTool}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Favorites</CardDescription>
                <CardTitle className="text-3xl">{stats.favorites.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Most Used Tools */}
            <Card data-testid="most-used-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Most Used Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.mostUsed.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.mostUsed}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="click_count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No usage data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card data-testid="category-distribution-chart">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.categoryDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.categoryDist}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.categoryDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No tools added yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recently Used */}
          <Card data-testid="recently-used-list" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recently Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentlyUsed.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentlyUsed.map(tool => (
                    <div key={tool.id} className="flex items-center justify-between p-3 glass rounded-lg">
                      <div className="flex items-center gap-3">
                        {tool.favicon && (
                          <img src={tool.favicon} alt="" className="w-8 h-8 rounded-lg" />
                        )}
                        <div>
                          <p className="font-medium">{tool.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Last used: {new Date(tool.last_used).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{tool.click_count || 0} clicks</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No tools used yet</p>
              )}
            </CardContent>
          </Card>

          {/* Never Used */}
          {stats.neverUsed.length > 0 && (
            <Card data-testid="never-used-list">
              <CardHeader>
                <CardTitle>Never Used ({stats.neverUsed.length})</CardTitle>
                <CardDescription>Tools you haven't clicked yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {stats.neverUsed.map(tool => (
                    <div key={tool.id} className="flex items-center gap-2 px-3 py-2 glass rounded-lg">
                      {tool.favicon && (
                        <img src={tool.favicon} alt="" className="w-6 h-6 rounded" />
                      )}
                      <span className="text-sm">{tool.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Stats;
