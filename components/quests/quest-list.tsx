'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { QuestCard, Quest } from './quest-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Plus, SortAsc, SortDesc } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface QuestListProps {
  quests: Quest[];
  showCreateButton?: boolean;
  onQuestComplete?: (questId: string) => void;
  onQuestPause?: (questId: string) => void;
  onQuestResume?: (questId: string) => void;
  onQuestDelete?: (questId: string) => void;
}

type SortOption = 'created' | 'deadline' | 'difficulty' | 'progress' | 'xp';
type SortDirection = 'asc' | 'desc';

export function QuestList({ 
  quests, 
  showCreateButton = true,
  onQuestComplete,
  onQuestPause,
  onQuestResume,
  onQuestDelete
}: QuestListProps) {
  const { t } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const categories = [
    { value: 'all', label: t('quests.filters.allCategories') },
    { value: 'health', label: t('quests.categories.health'), icon: '🏃‍♂️' },
    { value: 'career', label: t('quests.categories.career'), icon: '💼' },
    { value: 'learning', label: t('quests.categories.learning'), icon: '📚' },
    { value: 'social', label: t('quests.categories.social'), icon: '👥' },
    { value: 'financial', label: t('quests.categories.financial'), icon: '💰' },
    { value: 'personal', label: t('quests.categories.personal'), icon: '🌟' }
  ];

  const difficulties = [
    { value: 'all', label: t('quests.filters.allDifficulties') },
    { value: '1', label: t('quests.difficulty.easy') },
    { value: '2', label: t('quests.difficulty.medium') },
    { value: '3', label: t('quests.difficulty.hard') },
    { value: '4', label: t('quests.difficulty.expert') },
    { value: '5', label: t('quests.difficulty.legendary') }
  ];

  const sortOptions = [
    { value: 'created', label: t('quests.sort.created') },
    { value: 'deadline', label: t('quests.sort.deadline') },
    { value: 'difficulty', label: t('quests.sort.difficulty') },
    { value: 'progress', label: t('quests.sort.progress') },
    { value: 'xp', label: t('quests.sort.xpReward') }
  ];

  const filteredAndSortedQuests = useMemo(() => {
    let filtered = quests.filter(quest => {
      const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || quest.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || quest.difficulty.toString() === difficultyFilter;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort quests
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'created':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'deadline':
          aValue = a.deadline || new Date('2099-12-31');
          bValue = b.deadline || new Date('2099-12-31');
          break;
        case 'difficulty':
          aValue = a.difficulty;
          bValue = b.difficulty;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'xp':
          aValue = a.xpReward;
          bValue = b.xpReward;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [quests, searchTerm, categoryFilter, difficultyFilter, sortBy, sortDirection]);

  const activeFiltersCount = [
    searchTerm !== '',
    categoryFilter !== 'all',
    difficultyFilter !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
  };

  if (quests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-6xl opacity-20">🎯</div>
          <h3 className="text-lg font-medium mb-2">
            {t('quests.empty.title')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t('quests.empty.description')}
          </p>
          {showCreateButton && (
            <Link href="/quests/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('quests.create.title')}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('quests.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <span className="flex items-center gap-2">
                    {category.icon && <span>{category.icon}</span>}
                    {category.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                {t('quests.sort.sortBy')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    if (sortBy === option.value) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(option.value as SortOption);
                      setSortDirection('desc');
                    }
                  }}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {sortBy === option.value && (
                    sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('quests.filters.clear')} ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('quests.filters.search')}: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
          
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('quests.filters.category')}: {categories.find(c => c.value === categoryFilter)?.label}
              <button onClick={() => setCategoryFilter('all')} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
          
          {difficultyFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('quests.filters.difficulty')}: {difficulties.find(d => d.value === difficultyFilter)?.label}
              <button onClick={() => setDifficultyFilter('all')} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedQuests.length === quests.length 
          ? t('quests.results.total', { count: quests.length })
          : t('quests.results.filtered', { filtered: filteredAndSortedQuests.length, total: quests.length })
        }
      </div>

      {/* Quest Grid */}
      {filteredAndSortedQuests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-6xl opacity-20">🔍</div>
            <h3 className="text-lg font-medium mb-2">
              {t('quests.noResults.title')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('quests.noResults.description')}
            </p>
            <Button variant="outline" onClick={clearFilters}>
              {t('quests.filters.clearAll')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onQuestComplete}
              onPause={onQuestPause}
              onResume={onQuestResume}
              onDelete={onQuestDelete}
            />
          ))}
        </div>
      )}

      {/* Create Quest Button (Mobile) */}
      {showCreateButton && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Link href="/quests/create">
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}