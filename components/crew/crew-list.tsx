'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { CrewCard } from './crew-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Users, 
  Crown,
  Globe,
  Lock,
  SortAsc
} from 'lucide-react';
import type { Crew } from '@/types';

interface CrewListProps {
  crews: Crew[];
  loading?: boolean;
  showJoinButton?: boolean;
  onCrewJoin?: (crewId: string) => void;
  onCrewLeave?: (crewId: string) => void;
}

const CREW_TYPES = [
  { value: 'all', label: 'All Types', icon: '🎯' },
  { value: 'fitness', label: 'Fitness & Health', icon: '💪' },
  { value: 'productivity', label: 'Productivity', icon: '⚡' },
  { value: 'learning', label: 'Learning & Growth', icon: '📚' },
  { value: 'creative', label: 'Creative Projects', icon: '🎨' },
  { value: 'social', label: 'Social Impact', icon: '🌍' },
  { value: 'general', label: 'General Purpose', icon: '🎯' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'members', label: 'Most Members' },
  { value: 'activity', label: 'Most Active' },
  { value: 'xp', label: 'Highest XP' },
  { value: 'name', label: 'Name A-Z' }
];

export function CrewList({ 
  crews, 
  loading = false, 
  showJoinButton = false,
  onCrewJoin,
  onCrewLeave
}: CrewListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [privacyFilter, setPrivacyFilter] = useState('all'); // all, public, private
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, full

  const filteredAndSortedCrews = useMemo(() => {
    let filtered = crews.filter(crew => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = crew.name.toLowerCase().includes(query);
        const matchesDescription = crew.description?.toLowerCase().includes(query);
        const matchesTags = crew.tags?.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'all' && crew.type !== selectedType) {
        return false;
      }

      // Privacy filter
      if (privacyFilter !== 'all') {
        if (privacyFilter === 'public' && crew.isPrivate) return false;
        if (privacyFilter === 'private' && !crew.isPrivate) return false;
      }

      // Availability filter
      if (availabilityFilter !== 'all') {
        const isFull = (crew.memberCount || 0) >= (crew.maxMembers || 5);
        if (availabilityFilter === 'available' && isFull) return false;
        if (availabilityFilter === 'full' && !isFull) return false;
      }

      return true;
    });

    // Sort crews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'members':
          return (b.memberCount || 0) - (a.memberCount || 0);
        case 'activity':
          const aActivity = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
          const bActivity = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
          return bActivity - aActivity;
        case 'xp':
          return (b.totalXP || 0) - (a.totalXP || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [crews, searchQuery, selectedType, sortBy, privacyFilter, availabilityFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (privacyFilter !== 'all') count++;
    if (availabilityFilter !== 'all') count++;
    return count;
  }, [selectedType, privacyFilter, availabilityFilter]);

  const clearFilters = () => {
    setSelectedType('all');
    setPrivacyFilter('all');
    setAvailabilityFilter('all');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('Search crews by name, description, or tags...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREW_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{t(type.label)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {t('Filters')}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {t('{{count}} crews found', { count: filteredAndSortedCrews.length })}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('Privacy')}</label>
                <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Crews')}</SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {t('Public Only')}
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {t('Private Only')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('Availability')}</label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Crews')}</SelectItem>
                    <SelectItem value="available">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('Available to Join')}
                      </div>
                    </SelectItem>
                    <SelectItem value="full">{t('Full Crews')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters} size="sm">
                {t('Clear All Filters')}
              </Button>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {(activeFiltersCount > 0 || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="gap-1">
                <Search className="h-3 w-3" />
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {CREW_TYPES.find(t => t.value === selectedType)?.icon}
                {t(CREW_TYPES.find(t => t.value === selectedType)?.label || '')}
                <button
                  onClick={() => setSelectedType('all')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Crew Grid */}
      {filteredAndSortedCrews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCrews.map((crew) => (
            <CrewCard
              key={crew.id}
              crew={crew}
              showJoinButton={showJoinButton}
              onJoin={onCrewJoin}
              onLeave={onCrewLeave}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery || activeFiltersCount > 0
              ? t('No crews match your criteria')
              : t('No crews available')
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || activeFiltersCount > 0
              ? t('Try adjusting your search or filters')
              : t('Be the first to create a crew for your community')
            }
          </p>
          {(searchQuery || activeFiltersCount > 0) && (
            <Button variant="outline" onClick={clearFilters}>
              {t('Clear Filters')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}